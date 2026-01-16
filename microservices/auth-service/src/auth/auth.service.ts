import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { PasswordService } from './password.service';
import { RegisterDto, LoginDto } from './dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private passwordService: PasswordService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async register(dto: RegisterDto, ip: string) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate password strength
    const passwordCheck = this.passwordService.validatePasswordStrength(dto.password);
    if (!passwordCheck.valid) {
      throw new BadRequestException(passwordCheck.errors.join('. '));
    }

    if (this.passwordService.isCommonPassword(dto.password)) {
      throw new BadRequestException('This password is too common. Please choose a stronger password.');
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // Generate email verification token
    const emailVerificationToken = this.tokenService.generateRandomToken();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        avatar: dto.avatar,
        emailVerificationToken: this.tokenService.hashToken(emailVerificationToken),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair(user);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: this.tokenService.hashToken(tokens.refreshToken),
        expiresAt: tokens.refreshTokenExpiresAt,
        ipAddress: ip,
      },
    });

    // Emit user created event
    this.kafkaClient.emit('user.created', {
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Emit email verification event
    this.kafkaClient.emit('email.send-verification', {
      userId: user.id,
      email: user.email,
      token: emailVerificationToken,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.accessTokenExpiresAt,
    };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const email = dto.email.toLowerCase();

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account is locked. Try again in ${minutesLeft} minutes.`);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isValidPassword = await this.passwordService.verifyPassword(dto.password, user.passwordHash);

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const updateData: any = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        throw new ForbiddenException(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`);
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
    });

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: this.tokenService.hashToken(tokens.refreshToken),
        expiresAt: tokens.refreshTokenExpiresAt,
        ipAddress: ip,
        deviceInfo: dto.deviceInfo,
      },
    });

    // Create session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        accessToken: this.tokenService.hashToken(tokens.accessToken),
        ipAddress: ip,
        userAgent,
        deviceInfo: dto.deviceInfo,
        expiresAt: tokens.accessTokenExpiresAt,
      },
    });

    // Emit login event
    this.kafkaClient.emit('user.logged-in', {
      userId: user.id,
      ip,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.accessTokenExpiresAt,
    };
  }

  async refreshToken(refreshToken: string, ip: string) {
    // Verify refresh token
    let payload;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check if refresh token exists and is not revoked
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (!storedToken.user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // Revoke old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const tokens = this.tokenService.generateTokenPair({
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      avatar: storedToken.user.avatar || undefined,
    });

    // Store new refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        token: this.tokenService.hashToken(tokens.refreshToken),
        expiresAt: tokens.refreshTokenExpiresAt,
        ipAddress: ip,
        deviceInfo: storedToken.deviceInfo,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.accessTokenExpiresAt,
    };
  }

  async logout(accessToken: string) {
    try {
      const payload = this.tokenService.verifyAccessToken(accessToken);
      const tokenHash = this.tokenService.hashToken(accessToken);

      // Invalidate session
      await this.prisma.session.updateMany({
        where: { accessToken: tokenHash },
        data: { isActive: false },
      });

      return { success: true, message: 'Logged out successfully' };
    } catch {
      // Even if token is invalid, consider logout successful
      return { success: true, message: 'Logged out successfully' };
    }
  }

  async logoutAllSessions(accessToken: string) {
    const payload = this.tokenService.verifyAccessToken(accessToken);

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: payload.sub },
      data: { isRevoked: true },
    });

    // Invalidate all sessions
    await this.prisma.session.updateMany({
      where: { userId: payload.sub },
      data: { isActive: false },
    });

    return { success: true, message: 'All sessions terminated' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists
    if (!user) {
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = this.tokenService.generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: this.tokenService.hashToken(resetToken),
        passwordResetExpires: expiresAt,
      },
    });

    // Emit password reset email event
    this.kafkaClient.emit('email.send-password-reset', {
      userId: user.id,
      email: user.email,
      token: resetToken,
      expiresAt,
    });

    return { success: true, message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.tokenService.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate password strength
    const passwordCheck = this.passwordService.validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new BadRequestException(passwordCheck.errors.join('. '));
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(newPassword);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Store password in history
    await this.prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash,
      },
    });

    // Revoke all refresh tokens (force re-login)
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    return { success: true, message: 'Password reset successfully' };
  }

  async changePassword(accessToken: string, currentPassword: string, newPassword: string) {
    const payload = this.tokenService.verifyAccessToken(accessToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await this.passwordService.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password strength
    const passwordCheck = this.passwordService.validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new BadRequestException(passwordCheck.errors.join('. '));
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Store password in history
    await this.prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash,
      },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.tokenService.hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: tokenHash },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { success: true, message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.isEmailVerified) {
      return { success: true, message: 'If the email exists and is not verified, a verification link has been sent' };
    }

    // Generate new verification token
    const emailVerificationToken = this.tokenService.generateRandomToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: this.tokenService.hashToken(emailVerificationToken),
      },
    });

    // Emit email verification event
    this.kafkaClient.emit('email.send-verification', {
      userId: user.id,
      email: user.email,
      token: emailVerificationToken,
    });

    return { success: true, message: 'If the email exists and is not verified, a verification link has been sent' };
  }

  async getCurrentUser(accessToken: string) {
    const payload = this.tokenService.verifyAccessToken(accessToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserSessions(accessToken: string) {
    const payload = this.tokenService.verifyAccessToken(accessToken);

    const sessions = await this.prisma.session.findMany({
      where: { userId: payload.sub, isActive: true },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        lastActivityAt: true,
        createdAt: true,
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    return sessions;
  }

  async validateToken(token: string) {
    try {
      const payload = this.tokenService.verifyAccessToken(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return { valid: false, error: 'User not found or inactive' };
      }

      return { valid: true, user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return user;
  }
}

import { Controller, Post, Body, Headers, Ip, Get, UnauthorizedException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.authService.register(dto, ip);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto, @Ip() ip: string) {
    return this.authService.refreshToken(dto.refreshToken, ip);
  }

  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.authService.logout(token);
  }

  @Post('logout-all')
  logoutAll(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.authService.logoutAllSessions(token);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  changePassword(
    @Headers('authorization') authHeader: string,
    @Body() dto: ChangePasswordDto
  ) {
    const token = this.extractToken(authHeader);
    return this.authService.changePassword(token, dto.currentPassword, dto.newPassword);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Get('me')
  getCurrentUser(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.authService.getCurrentUser(token);
  }

  @Get('sessions')
  getSessions(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.authService.getUserSessions(token);
  }

  // Kafka message handlers for inter-service communication
  @MessagePattern('auth.validate-token')
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern('auth.get-user')
  async getUser(@Payload() data: { userId: string }) {
    return this.authService.getUserById(data.userId);
  }

  private extractToken(authHeader: string): string {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No valid authorization header');
    }
    return authHeader.substring(7);
  }
}

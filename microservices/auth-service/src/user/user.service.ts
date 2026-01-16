import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { UpdateUserDto, QueryUsersDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async findAll(query: QueryUsersDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.isEmailVerified !== undefined) {
      where.isEmailVerified = query.isEmailVerified;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        isActive: true,
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

  async getMe(accessToken: string) {
    const payload = this.tokenService.verifyAccessToken(accessToken);
    return this.findOne(payload.sub);
  }

  async updateMe(accessToken: string, updateDto: UpdateUserDto) {
    const payload = this.tokenService.verifyAccessToken(accessToken);

    const user = await this.prisma.user.update({
      where: { id: payload.sub },
      data: updateDto,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        isActive: true,
        isEmailVerified: true,
        updatedAt: true,
      },
    });

    // Emit user updated event
    this.kafkaClient.emit('user.updated', {
      userId: user.id,
      changes: Object.keys(updateDto),
    });

    return user;
  }

  async deleteMe(accessToken: string) {
    const payload = this.tokenService.verifyAccessToken(accessToken);

    // Soft delete - deactivate account
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { isActive: false },
    });

    // Revoke all tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: payload.sub },
      data: { isRevoked: true },
    });

    // Emit user deleted event
    this.kafkaClient.emit('user.deleted', {
      userId: payload.sub,
    });

    return { success: true, message: 'Account deactivated' };
  }

  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Revoke all tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { isRevoked: true },
    });

    return { success: true };
  }

  async reactivate(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { success: true };
  }
}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { OrganizationModule } from './organization/organization.module';
import { MemberModule } from './member/member.module';
import { RoleModule } from './role/role.module';
import { InviteModule } from './invite/invite.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'organization-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'organization-producer-consumer',
          },
        },
      },
    ]),
    PrismaModule,
    AuthModule,
    OrganizationModule,
    MemberModule,
    RoleModule,
    InviteModule,
    BillingModule,
  ],
  providers: [
    // Apply JWT auth guard globally
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

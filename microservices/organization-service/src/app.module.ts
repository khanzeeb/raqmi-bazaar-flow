import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
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
    OrganizationModule,
    MemberModule,
    RoleModule,
    InviteModule,
    BillingModule,
  ],
})
export class AppModule {}

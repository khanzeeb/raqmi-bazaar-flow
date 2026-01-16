import { Module, Global } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  providers: [JwtService, JwtAuthGuard, PermissionsGuard],
  exports: [JwtService, JwtAuthGuard, PermissionsGuard],
})
export class AuthModule {}

import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 50)
  roleName: string;
}

export class AcceptInviteDto {
  @IsString()
  token: string;

  @IsString()
  userId: string;

  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  userAvatar?: string;
}

export class QueryInvitesDto {
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  email?: string;
}

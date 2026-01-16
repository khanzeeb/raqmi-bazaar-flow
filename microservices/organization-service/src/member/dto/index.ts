import { IsString, IsOptional, IsBoolean, IsEmail, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class AddMemberDto {
  @IsString()
  userId: string;

  @IsString()
  roleId: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 255)
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class QueryMembersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, Length, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRoleDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @Length(2, 100)
  displayName: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  displayNameAr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsNumber()
  @Min(0)
  @Max(99)
  hierarchyLevel: number;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class BulkUpdatePermissionsDto {
  @IsArray()
  updates: Array<{
    roleId: string;
    permissions: string[];
  }>;
}

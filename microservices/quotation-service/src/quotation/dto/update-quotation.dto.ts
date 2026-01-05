import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateQuotationDto } from './create-quotation.dto';
import { QuotationStatus } from '../entities/quotation.entity';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;
}

export class DeclineQuotationDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateStatusDto {
  @IsEnum(QuotationStatus)
  status: QuotationStatus;
}

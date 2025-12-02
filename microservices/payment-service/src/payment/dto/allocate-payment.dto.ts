import { IsString, IsNumber, IsEnum } from 'class-validator';

enum TargetType {
  INVOICE = 'invoice',
  ORDER = 'order',
}

export class AllocatePaymentDto {
  @IsString()
  paymentId: string;

  @IsEnum(TargetType)
  targetType: TargetType;

  @IsString()
  targetId: string;

  @IsNumber()
  amount: number;
}

import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsString()
  planId: string;

  @IsString()
  planName: string;

  @IsOptional()
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle?: 'MONTHLY' | 'YEARLY';

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  maxStorage?: number;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class CreateBillingHistoryDto {
  @IsString()
  invoiceNumber: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  periodStart: string;

  @IsString()
  periodEnd: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  invoiceUrl?: string;
}

export class QueryBillingHistoryDto {
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

export const AVAILABLE_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for getting started',
    features: ['Up to 3 team members', '1 GB storage', 'Basic reports'],
    price: { monthly: 0, yearly: 0 },
    limits: { maxUsers: 3, maxStorage: 1024 },
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    description: 'For small teams',
    features: ['Up to 10 team members', '10 GB storage', 'Advanced reports', 'Email support'],
    price: { monthly: 29, yearly: 290 },
    limits: { maxUsers: 10, maxStorage: 10240 },
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    description: 'For growing businesses',
    features: ['Up to 50 team members', '100 GB storage', 'Custom reports', 'Priority support', 'API access'],
    price: { monthly: 99, yearly: 990 },
    limits: { maxUsers: 50, maxStorage: 102400 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'For large organizations',
    features: ['Unlimited team members', 'Unlimited storage', 'Custom integrations', 'Dedicated support', 'SLA'],
    price: { monthly: 299, yearly: 2990 },
    limits: { maxUsers: 9999, maxStorage: 999999 },
  },
];

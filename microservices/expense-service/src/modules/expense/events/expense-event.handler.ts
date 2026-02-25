import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Injectable()
export class ExpenseEventHandler {
  @EventPattern('payment.completed')
  async onPaymentCompleted(@Payload() payload: any) {
    console.log(`[expense] payment.completed: ${payload?.payment_id}`);
    // Check if payment is for an expense and update status
  }
}

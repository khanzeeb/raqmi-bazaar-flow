/**
 * Expense Event Service
 * Handles expense-related domain events and saga participation
 */

import { 
  BaseEventService, 
  EventListenerConfig 
} from '../../shared/events/BaseEventService';
import { 
  SagaManager,
  createSagaManager
} from '../../shared/events/SagaManager';
import { 
  EventPayload,
  SagaStep,
  ExpenseCreatedPayload,
  ExpenseApprovedPayload,
  PaymentCreatedPayload
} from '../../shared/events/types';

export class ExpenseEventService extends BaseEventService {
  constructor() {
    super('expense-service');
  }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Listen for payment events
      { eventType: 'payment.completed', handler: this.handlePaymentCompleted },
    ];
  }

  // ============= Event Emitters =============

  emitExpenseCreated(payload: ExpenseCreatedPayload): void {
    this.emit('expense.created', payload);
  }

  emitExpenseUpdated(payload: { expense_id: string; changes: Record<string, any> }): void {
    this.emit('expense.updated', payload);
  }

  emitExpenseApproved(payload: ExpenseApprovedPayload): void {
    this.emit('expense.approved', payload);
  }

  emitExpenseRejected(payload: { expense_id: string; rejected_by?: string; reason?: string }): void {
    this.emit('expense.rejected', payload);
  }

  emitExpensePaid(payload: { expense_id: string; payment_id?: string; amount: number }): void {
    this.emit('expense.paid', payload);
  }

  // ============= Saga Operations =============

  /**
   * Create an expense approval saga for multi-step approval workflow
   */
  createApprovalSaga(): SagaManager {
    const saga = createSagaManager({
      name: 'expense-approval-saga',
      eventEmitter: this.eventEmitter,
    });

    // Step 1: Validate expense
    const validateStep: SagaStep<{ expense_id: string; approver_id: string }, { expense_id: string; valid: boolean; amount: number }> = {
      name: 'validate_expense',
      execute: async (input) => {
        // Would validate expense exists and is pending
        return { expense_id: input.expense_id, valid: true, amount: 100 };
      },
    };

    // Step 2: Check budget
    const checkBudgetStep: SagaStep<{ expense_id: string; valid: boolean; amount: number }, { expense_id: string; budget_available: boolean }> = {
      name: 'check_budget',
      execute: async (input) => {
        // Would check if department budget allows this expense
        return { expense_id: input.expense_id, budget_available: true };
      },
    };

    // Step 3: Approve expense
    const approveStep: SagaStep<{ expense_id: string; budget_available: boolean }, { expense_id: string; approved: boolean }> = {
      name: 'approve_expense',
      execute: async (input) => {
        if (!input.budget_available) {
          throw new Error('Budget not available');
        }
        return { expense_id: input.expense_id, approved: true };
      },
      compensate: async (_, output) => {
        // Would revert approval
        console.log(`[expense-service] Compensating approval for expense ${output.expense_id}`);
      },
    };

    return saga
      .addStep(validateStep)
      .addStep(checkBudgetStep)
      .addStep(approveStep);
  }

  /**
   * Create an expense payment saga
   */
  createPaymentSaga(): SagaManager {
    const saga = createSagaManager({
      name: 'expense-payment-saga',
      eventEmitter: this.eventEmitter,
    });

    // Step 1: Validate approved expense
    const validateStep: SagaStep<{ expense_id: string }, { expense_id: string; amount: number }> = {
      name: 'validate_approved',
      execute: async (input) => {
        // Would validate expense is approved
        return { expense_id: input.expense_id, amount: 100 };
      },
    };

    // Step 2: Process payment
    const paymentStep: SagaStep<{ expense_id: string; amount: number }, { expense_id: string; payment_id: string }> = {
      name: 'process_payment',
      execute: async (input) => {
        // Would create payment record
        return { expense_id: input.expense_id, payment_id: `pay-${Date.now()}` };
      },
      compensate: async (_, output) => {
        // Would void payment
        console.log(`[expense-service] Compensating payment ${output.payment_id}`);
      },
    };

    // Step 3: Update expense status
    const updateStep: SagaStep<{ expense_id: string; payment_id: string }, { expense_id: string; status: string }> = {
      name: 'update_status',
      execute: async (input) => {
        return { expense_id: input.expense_id, status: 'paid' };
      },
      compensate: async (_, output) => {
        console.log(`[expense-service] Reverting status for expense ${output.expense_id}`);
      },
    };

    return saga
      .addStep(validateStep)
      .addStep(paymentStep)
      .addStep(updateStep);
  }

  // ============= Event Handlers =============

  private async handlePaymentCompleted(payload: EventPayload<PaymentCreatedPayload>): Promise<void> {
    console.log(`[expense-service] Processing payment.completed: ${payload.data.payment_id}`);
    // Would check if payment is for an expense and update status
  }
}

// Singleton instance
export const expenseEventService = new ExpenseEventService();

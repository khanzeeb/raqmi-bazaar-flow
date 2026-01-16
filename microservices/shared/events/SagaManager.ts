/**
 * Saga Manager
 * Orchestrates multi-step distributed transactions with compensation logic
 */

import { 
  SagaStatus, 
  SagaStep, 
  SagaContext, 
  SagaResult,
  SagaStartedPayload,
  SagaStepCompletedPayload,
  SagaCompletedPayload,
  SagaFailedPayload 
} from './types';
import { ServiceEventEmitter, createEventEmitter } from './EventEmitter';

export interface SagaManagerOptions {
  name: string;
  correlationId?: string;
  eventEmitter?: ServiceEventEmitter;
  emitEvents?: boolean;
}

export class SagaManager {
  private context: SagaContext;
  private sagaName: string;
  private eventEmitter: ServiceEventEmitter;
  private emitEvents: boolean;

  constructor(options: SagaManagerOptions | string = 'unnamed-saga') {
    if (typeof options === 'string') {
      // Legacy support: just a correlation ID
      this.sagaName = 'unnamed-saga';
      this.context = this.initContext(options);
      this.eventEmitter = createEventEmitter();
      this.emitEvents = true;
    } else {
      this.sagaName = options.name;
      this.context = this.initContext(options.correlationId);
      this.eventEmitter = options.eventEmitter || createEventEmitter();
      this.emitEvents = options.emitEvents !== false;
    }
  }

  private initContext(correlationId?: string): SagaContext {
    return {
      correlationId: correlationId || this.generateCorrelationId(),
      status: SagaStatus.PENDING,
      currentStep: 0,
      steps: [],
      results: new Map(),
      errors: [],
      startedAt: new Date(),
    };
  }

  /**
   * Add a step to the saga
   */
  addStep<TInput, TOutput>(step: SagaStep<TInput, TOutput>): this {
    this.context.steps.push(step);
    return this;
  }

  /**
   * Execute the saga
   */
  async execute<T>(input: any): Promise<SagaResult<T>> {
    this.context.status = SagaStatus.RUNNING;

    // Emit saga started event
    if (this.emitEvents) {
      const startedPayload: SagaStartedPayload = {
        saga_name: this.sagaName,
        action: 'execute',
        steps: this.context.steps.map(s => s.name),
      };
      this.eventEmitter.emitEvent('saga.started', startedPayload, this.context.correlationId);
    }

    try {
      let currentInput = input;

      for (let i = 0; i < this.context.steps.length; i++) {
        this.context.currentStep = i;
        const step = this.context.steps[i];

        try {
          const result = await step.execute(currentInput);
          this.context.results.set(step.name, { input: currentInput, output: result });
          currentInput = result;

          // Emit step completed event
          if (this.emitEvents) {
            const stepPayload: SagaStepCompletedPayload = {
              saga_name: this.sagaName,
              step_name: step.name,
              step_index: i,
            };
            this.eventEmitter.emitEvent('saga.step.completed', stepPayload, this.context.correlationId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.context.errors.push(`Step "${step.name}" failed: ${errorMessage}`);

          // Emit step failed event
          if (this.emitEvents) {
            this.eventEmitter.emitEvent('saga.step.failed', {
              saga_name: this.sagaName,
              step_name: step.name,
              step_index: i,
              error: errorMessage,
            }, this.context.correlationId);
          }

          // Start compensation
          await this.compensate();

          // Emit saga failed event
          if (this.emitEvents) {
            const failedPayload: SagaFailedPayload = {
              saga_name: this.sagaName,
              action: 'execute',
              errors: this.context.errors,
              compensated: true,
              failed_step: step.name,
            };
            this.eventEmitter.emitEvent('saga.failed', failedPayload, this.context.correlationId);
          }

          return {
            success: false,
            errors: this.context.errors,
            compensated: true,
          };
        }
      }

      this.context.status = SagaStatus.COMPLETED;
      this.context.completedAt = new Date();

      // Emit saga completed event
      if (this.emitEvents) {
        const completedPayload: SagaCompletedPayload = {
          saga_name: this.sagaName,
          action: 'execute',
          result: currentInput,
        };
        this.eventEmitter.emitEvent('saga.completed', completedPayload, this.context.correlationId);
      }

      return {
        success: true,
        data: currentInput as T,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.context.errors.push(`Saga execution failed: ${errorMessage}`);
      this.context.status = SagaStatus.FAILED;

      // Emit saga failed event
      if (this.emitEvents) {
        const failedPayload: SagaFailedPayload = {
          saga_name: this.sagaName,
          action: 'execute',
          errors: this.context.errors,
          compensated: false,
        };
        this.eventEmitter.emitEvent('saga.failed', failedPayload, this.context.correlationId);
      }

      return {
        success: false,
        errors: this.context.errors,
      };
    }
  }

  /**
   * Compensate completed steps in reverse order
   */
  private async compensate(): Promise<void> {
    this.context.status = SagaStatus.COMPENSATING;

    // Emit compensating event
    if (this.emitEvents) {
      this.eventEmitter.emitEvent('saga.compensating', {
        saga_name: this.sagaName,
        steps_to_compensate: this.context.currentStep,
      }, this.context.correlationId);
    }

    // Compensate in reverse order
    for (let i = this.context.currentStep - 1; i >= 0; i--) {
      const step = this.context.steps[i];
      const stepData = this.context.results.get(step.name);

      if (step.compensate && stepData) {
        try {
          await step.compensate(stepData.input, stepData.output);
        } catch (compensateError) {
          const errorMessage = compensateError instanceof Error
            ? compensateError.message
            : String(compensateError);
          this.context.errors.push(`Compensation for "${step.name}" failed: ${errorMessage}`);
        }
      }
    }

    this.context.status = SagaStatus.FAILED;
    this.context.completedAt = new Date();
  }

  /**
   * Get the current saga context
   */
  getContext(): SagaContext {
    return { ...this.context };
  }

  /**
   * Get saga name
   */
  getName(): string {
    return this.sagaName;
  }

  /**
   * Get correlation ID
   */
  getCorrelationId(): string {
    return this.context.correlationId;
  }

  private generateCorrelationId(): string {
    return `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function
export function createSagaManager(options: SagaManagerOptions | string): SagaManager {
  return new SagaManager(options);
}

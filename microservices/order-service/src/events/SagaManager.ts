export enum SagaStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  COMPENSATING = 'compensating',
  FAILED = 'failed',
}

export interface SagaStep<TInput, TOutput> {
  name: string;
  execute: (input: TInput) => Promise<TOutput>;
  compensate?: (input: TInput, output: TOutput) => Promise<void>;
}

export interface SagaContext {
  correlationId: string;
  status: SagaStatus;
  currentStep: number;
  steps: SagaStep<any, any>[];
  results: Map<string, any>;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export interface SagaResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  compensated?: boolean;
}

export class SagaManager {
  private context: SagaContext;

  constructor(correlationId?: string) {
    this.context = {
      correlationId: correlationId || this.generateCorrelationId(),
      status: SagaStatus.PENDING,
      currentStep: 0,
      steps: [],
      results: new Map(),
      errors: [],
      startedAt: new Date(),
    };
  }

  addStep<TInput, TOutput>(step: SagaStep<TInput, TOutput>): this {
    this.context.steps.push(step);
    return this;
  }

  async execute<T>(input: any): Promise<SagaResult<T>> {
    this.context.status = SagaStatus.RUNNING;
    
    try {
      let currentInput = input;
      
      for (let i = 0; i < this.context.steps.length; i++) {
        this.context.currentStep = i;
        const step = this.context.steps[i];
        
        try {
          const result = await step.execute(currentInput);
          this.context.results.set(step.name, { input: currentInput, output: result });
          currentInput = result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.context.errors.push(`Step "${step.name}" failed: ${errorMessage}`);
          
          // Start compensation
          await this.compensate();
          
          return {
            success: false,
            errors: this.context.errors,
            compensated: true,
          };
        }
      }
      
      this.context.status = SagaStatus.COMPLETED;
      this.context.completedAt = new Date();
      
      return {
        success: true,
        data: currentInput as T,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.context.errors.push(`Saga execution failed: ${errorMessage}`);
      this.context.status = SagaStatus.FAILED;
      
      return {
        success: false,
        errors: this.context.errors,
      };
    }
  }

  private async compensate(): Promise<void> {
    this.context.status = SagaStatus.COMPENSATING;
    
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

  getContext(): SagaContext {
    return { ...this.context };
  }

  private generateCorrelationId(): string {
    return `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

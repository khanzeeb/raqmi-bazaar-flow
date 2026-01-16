/**
 * Unit Tests for SagaManager
 * Tests saga execution, compensation, and state management
 */

import { SagaManager, SagaStep, SagaStatus, SagaResult } from '../../events/SagaManager';

describe('SagaManager', () => {
  describe('initialization', () => {
    it('should initialize with PENDING status', () => {
      const saga = new SagaManager();
      const context = saga.getContext();

      expect(context.status).toBe(SagaStatus.PENDING);
      expect(context.currentStep).toBe(0);
      expect(context.steps).toHaveLength(0);
      expect(context.errors).toHaveLength(0);
    });

    it('should use provided correlationId', () => {
      const saga = new SagaManager('custom-correlation-id');
      const context = saga.getContext();

      expect(context.correlationId).toBe('custom-correlation-id');
    });

    it('should generate correlationId when not provided', () => {
      const saga = new SagaManager();
      const context = saga.getContext();

      expect(context.correlationId).toMatch(/^saga-\d+-[a-z0-9]+$/);
    });
  });

  describe('step management', () => {
    it('should add steps correctly', () => {
      const saga = new SagaManager();
      
      const step1: SagaStep<string, string> = {
        name: 'step1',
        execute: async (input) => input.toUpperCase(),
      };

      const step2: SagaStep<string, number> = {
        name: 'step2',
        execute: async (input) => input.length,
      };

      saga.addStep(step1).addStep(step2);
      
      const context = saga.getContext();
      expect(context.steps).toHaveLength(2);
      expect(context.steps[0].name).toBe('step1');
      expect(context.steps[1].name).toBe('step2');
    });

    it('should support method chaining', () => {
      const saga = new SagaManager();
      
      const result = saga
        .addStep({ name: 's1', execute: async () => 1 })
        .addStep({ name: 's2', execute: async () => 2 })
        .addStep({ name: 's3', execute: async () => 3 });

      expect(result).toBe(saga);
      expect(saga.getContext().steps).toHaveLength(3);
    });
  });

  describe('successful execution', () => {
    it('should execute all steps in order', async () => {
      const executionOrder: string[] = [];
      const saga = new SagaManager();

      saga
        .addStep({
          name: 'step1',
          execute: async (input: number) => {
            executionOrder.push('step1');
            return input + 1;
          },
        })
        .addStep({
          name: 'step2',
          execute: async (input: number) => {
            executionOrder.push('step2');
            return input * 2;
          },
        })
        .addStep({
          name: 'step3',
          execute: async (input: number) => {
            executionOrder.push('step3');
            return input + 10;
          },
        });

      const result = await saga.execute<number>(5);

      expect(executionOrder).toEqual(['step1', 'step2', 'step3']);
      expect(result.success).toBe(true);
      expect(result.data).toBe(22); // (5+1)*2+10 = 22
    });

    it('should set status to COMPLETED on success', async () => {
      const saga = new SagaManager();

      saga.addStep({
        name: 'simple',
        execute: async (input: string) => input,
      });

      await saga.execute<string>('test');
      const context = saga.getContext();

      expect(context.status).toBe(SagaStatus.COMPLETED);
      expect(context.completedAt).toBeDefined();
    });

    it('should store results for each step', async () => {
      const saga = new SagaManager();

      saga
        .addStep({
          name: 'double',
          execute: async (input: number) => input * 2,
        })
        .addStep({
          name: 'stringify',
          execute: async (input: number) => `Value: ${input}`,
        });

      await saga.execute<string>(5);
      const context = saga.getContext();

      expect(context.results.get('double')).toEqual({
        input: 5,
        output: 10,
      });
      expect(context.results.get('stringify')).toEqual({
        input: 10,
        output: 'Value: 10',
      });
    });
  });

  describe('failed execution with compensation', () => {
    it('should trigger compensation on step failure', async () => {
      const compensated: string[] = [];
      const saga = new SagaManager();

      saga
        .addStep({
          name: 'step1',
          execute: async () => 'result1',
          compensate: async () => {
            compensated.push('step1');
          },
        })
        .addStep({
          name: 'step2',
          execute: async () => 'result2',
          compensate: async () => {
            compensated.push('step2');
          },
        })
        .addStep({
          name: 'step3',
          execute: async () => {
            throw new Error('Step 3 failed');
          },
          compensate: async () => {
            compensated.push('step3');
          },
        });

      const result = await saga.execute<string>('input');

      expect(result.success).toBe(false);
      expect(result.compensated).toBe(true);
      // Compensation runs in reverse order, excluding failed step
      expect(compensated).toEqual(['step2', 'step1']);
    });

    it('should record error messages', async () => {
      const saga = new SagaManager();

      saga.addStep({
        name: 'failing',
        execute: async () => {
          throw new Error('Custom error message');
        },
      });

      const result = await saga.execute<void>('input');

      expect(result.errors).toContain('Step "failing" failed: Custom error message');
    });

    it('should set status to FAILED after compensation', async () => {
      const saga = new SagaManager();

      saga.addStep({
        name: 'failing',
        execute: async () => {
          throw new Error('Fail');
        },
      });

      await saga.execute<void>('input');
      const context = saga.getContext();

      expect(context.status).toBe(SagaStatus.FAILED);
      expect(context.completedAt).toBeDefined();
    });

    it('should handle compensation errors gracefully', async () => {
      const saga = new SagaManager();

      saga
        .addStep({
          name: 'step1',
          execute: async () => 'result',
          compensate: async () => {
            throw new Error('Compensation failed');
          },
        })
        .addStep({
          name: 'step2',
          execute: async () => {
            throw new Error('Step failed');
          },
        });

      const result = await saga.execute<void>('input');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Compensation for "step1" failed: Compensation failed');
    });

    it('should skip compensation for steps without compensate function', async () => {
      const compensated: string[] = [];
      const saga = new SagaManager();

      saga
        .addStep({
          name: 'step1',
          execute: async () => 'result1',
          // No compensate function
        })
        .addStep({
          name: 'step2',
          execute: async () => 'result2',
          compensate: async () => {
            compensated.push('step2');
          },
        })
        .addStep({
          name: 'step3',
          execute: async () => {
            throw new Error('Failed');
          },
        });

      await saga.execute<void>('input');

      expect(compensated).toEqual(['step2']);
    });
  });

  describe('edge cases', () => {
    it('should handle saga with no steps', async () => {
      const saga = new SagaManager();
      const result = await saga.execute<string>('input');

      expect(result.success).toBe(true);
      expect(result.data).toBe('input');
    });

    it('should handle first step failure (no compensation needed)', async () => {
      const compensated: string[] = [];
      const saga = new SagaManager();

      saga.addStep({
        name: 'first',
        execute: async () => {
          throw new Error('First step failed');
        },
        compensate: async () => {
          compensated.push('first');
        },
      });

      const result = await saga.execute<void>('input');

      expect(result.success).toBe(false);
      expect(result.compensated).toBe(true);
      // No compensation because no prior steps succeeded
      expect(compensated).toEqual([]);
    });

    it('should handle non-Error exceptions', async () => {
      const saga = new SagaManager();

      saga.addStep({
        name: 'failing',
        execute: async () => {
          throw 'String error';
        },
      });

      const result = await saga.execute<void>('input');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Step "failing" failed: String error');
    });

    it('should pass output from one step as input to next', async () => {
      const saga = new SagaManager();

      saga
        .addStep({
          name: 'createObject',
          execute: async (input: string) => ({ name: input }),
        })
        .addStep({
          name: 'addProperty',
          execute: async (input: { name: string }) => ({ ...input, id: 123 }),
        })
        .addStep({
          name: 'stringify',
          execute: async (input: { name: string; id: number }) => JSON.stringify(input),
        });

      const result = await saga.execute<string>('test');

      expect(result.success).toBe(true);
      expect(result.data).toBe('{"name":"test","id":123}');
    });
  });

  describe('context immutability', () => {
    it('should return a copy of context', () => {
      const saga = new SagaManager();
      const context1 = saga.getContext();
      const context2 = saga.getContext();

      expect(context1).not.toBe(context2);
      expect(context1).toEqual(context2);
    });
  });
});

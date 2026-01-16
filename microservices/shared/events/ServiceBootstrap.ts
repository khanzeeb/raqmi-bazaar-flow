/**
 * Service Bootstrap Helper
 * Simplifies integrating Kafka event bridge into microservices
 */

import { KafkaEventBridge, createServiceBridge } from './kafka';
import { ServiceEventEmitter, createEventEmitter } from './EventEmitter';

export interface ServiceBootstrapOptions {
  serviceName: string;
  enableKafka?: boolean;
  onKafkaError?: (error: Error) => void;
  onKafkaConnected?: () => void;
}

export interface ServiceBootstrapResult {
  eventEmitter: ServiceEventEmitter;
  kafkaBridge?: KafkaEventBridge;
  shutdown: () => Promise<void>;
  isKafkaConnected: () => boolean;
}

/**
 * Bootstrap a service with event infrastructure
 * Optionally connects to Kafka for cross-service communication
 */
export async function bootstrapService(options: ServiceBootstrapOptions): Promise<ServiceBootstrapResult> {
  const { serviceName, enableKafka = true, onKafkaError, onKafkaConnected } = options;

  // Create local event emitter
  const eventEmitter = createEventEmitter(serviceName);
  
  let kafkaBridge: KafkaEventBridge | undefined;
  let kafkaConnected = false;

  // Connect to Kafka if enabled
  if (enableKafka && process.env.KAFKA_ENABLED !== 'false') {
    kafkaBridge = createServiceBridge(serviceName) || undefined;

    if (kafkaBridge) {
      try {
        await kafkaBridge.connect();
        kafkaConnected = true;
        console.log(`[${serviceName}] Kafka bridge connected`);
        onKafkaConnected?.();
      } catch (error) {
        console.warn(`[${serviceName}] Kafka connection failed, running in local-only mode:`, error);
        onKafkaError?.(error as Error);
        // Continue without Kafka - service can still function locally
      }
    }
  }

  // Create shutdown handler
  const shutdown = async (): Promise<void> => {
    console.log(`[${serviceName}] Shutting down event infrastructure...`);
    
    if (kafkaBridge) {
      await kafkaBridge.disconnect();
    }
    
    eventEmitter.removeAllListeners();
    console.log(`[${serviceName}] Event infrastructure shut down`);
  };

  return {
    eventEmitter,
    kafkaBridge,
    shutdown,
    isKafkaConnected: () => kafkaConnected && (kafkaBridge?.isReady() ?? false),
  };
}

/**
 * Create a graceful shutdown handler for the process
 */
export function setupGracefulShutdown(
  shutdownFn: () => Promise<void>,
  serviceName: string
): void {
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`[${serviceName}] Received ${signal}, initiating graceful shutdown...`);
      
      try {
        await shutdownFn();
        console.log(`[${serviceName}] Graceful shutdown complete`);
        process.exit(0);
      } catch (error) {
        console.error(`[${serviceName}] Error during shutdown:`, error);
        process.exit(1);
      }
    });
  }

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error(`[${serviceName}] Uncaught exception:`, error);
    await shutdownFn();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason) => {
    console.error(`[${serviceName}] Unhandled rejection:`, reason);
    await shutdownFn();
    process.exit(1);
  });
}

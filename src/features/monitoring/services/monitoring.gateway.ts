/**
 * Monitoring API Gateway
 * Handles communication with the API Gateway monitoring endpoints
 */

import { apiGateway } from '@/lib/api/gateway';
import type { 
  AggregatedDashboard, 
  ServiceHealth, 
  AggregatedEvent, 
  EventMetrics, 
  EventFlowData,
  KafkaStatus 
} from '../types';

const MONITORING_BASE = '/monitoring';

class MonitoringGateway {
  /**
   * Get aggregated dashboard data
   */
  async getDashboard(): Promise<{ success: boolean; data?: AggregatedDashboard; error?: string }> {
    return apiGateway.get<AggregatedDashboard>(`${MONITORING_BASE}/dashboard`);
  }

  /**
   * Get health status of all services
   */
  async getServicesHealth(): Promise<{ success: boolean; data?: { services: ServiceHealth[] }; error?: string }> {
    return apiGateway.get<{ services: ServiceHealth[] }>(`${MONITORING_BASE}/health`);
  }

  /**
   * Get recent events with optional filtering
   */
  async getEvents(params?: { 
    service?: string; 
    eventType?: string; 
    limit?: number 
  }): Promise<{ success: boolean; data?: { events: AggregatedEvent[] }; error?: string }> {
    return apiGateway.get<{ events: AggregatedEvent[] }>(`${MONITORING_BASE}/events`, params);
  }

  /**
   * Get event metrics grouped by type
   */
  async getEventMetrics(): Promise<{ success: boolean; data?: { metrics: EventMetrics[] }; error?: string }> {
    return apiGateway.get<{ metrics: EventMetrics[] }>(`${MONITORING_BASE}/events/metrics`);
  }

  /**
   * Get event flow graph data for visualization
   */
  async getEventFlow(): Promise<{ success: boolean; data?: EventFlowData; error?: string }> {
    return apiGateway.get<EventFlowData>(`${MONITORING_BASE}/flow`);
  }

  /**
   * Get Kafka connectivity status across all services
   */
  async getKafkaStatus(): Promise<{ success: boolean; data?: KafkaStatus; error?: string }> {
    return apiGateway.get<KafkaStatus>(`${MONITORING_BASE}/kafka`);
  }

  /**
   * Get detailed metrics for a specific service
   */
  async getServiceDetails(serviceName: string): Promise<{ success: boolean; data?: ServiceHealth; error?: string }> {
    return apiGateway.get<ServiceHealth>(`${MONITORING_BASE}/services/${serviceName}`);
  }
}

export const monitoringGateway = new MonitoringGateway();

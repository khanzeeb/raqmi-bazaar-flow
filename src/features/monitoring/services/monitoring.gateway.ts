/**
 * Monitoring API Gateway
 * Handles communication with the API Gateway monitoring endpoints
 * Falls back to mock data when backend is unavailable
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
import { 
  generateMockDashboard, 
  generateMockEventMetrics, 
  generateMockKafkaStatus 
} from './mockData';

const MONITORING_BASE = '/monitoring';

// Check if we should use mock data (development without backend)
const USE_MOCK_DATA = true; // Set to false when backend is available

class MonitoringGateway {
  /**
   * Get aggregated dashboard data
   */
  async getDashboard(): Promise<{ success: boolean; data?: AggregatedDashboard; error?: string }> {
    if (USE_MOCK_DATA) {
      return { success: true, data: generateMockDashboard() };
    }
    return apiGateway.get<AggregatedDashboard>(`${MONITORING_BASE}/dashboard`);
  }

  /**
   * Get health status of all services
   */
  async getServicesHealth(): Promise<{ success: boolean; data?: { services: ServiceHealth[] }; error?: string }> {
    if (USE_MOCK_DATA) {
      const dashboard = generateMockDashboard();
      return { success: true, data: { services: dashboard.services } };
    }
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
    if (USE_MOCK_DATA) {
      const dashboard = generateMockDashboard();
      let events = dashboard.recentEvents;
      if (params?.service) {
        events = events.filter(e => e.service === params.service);
      }
      if (params?.eventType) {
        events = events.filter(e => e.eventType === params.eventType);
      }
      if (params?.limit) {
        events = events.slice(0, params.limit);
      }
      return { success: true, data: { events } };
    }
    return apiGateway.get<{ events: AggregatedEvent[] }>(`${MONITORING_BASE}/events`, params);
  }

  /**
   * Get event metrics grouped by type
   */
  async getEventMetrics(): Promise<{ success: boolean; data?: { metrics: EventMetrics[] }; error?: string }> {
    if (USE_MOCK_DATA) {
      return { success: true, data: { metrics: generateMockEventMetrics() } };
    }
    return apiGateway.get<{ metrics: EventMetrics[] }>(`${MONITORING_BASE}/events/metrics`);
  }

  /**
   * Get event flow graph data for visualization
   */
  async getEventFlow(): Promise<{ success: boolean; data?: EventFlowData; error?: string }> {
    if (USE_MOCK_DATA) {
      const dashboard = generateMockDashboard();
      return { success: true, data: dashboard.eventFlow };
    }
    return apiGateway.get<EventFlowData>(`${MONITORING_BASE}/flow`);
  }

  /**
   * Get Kafka connectivity status across all services
   */
  async getKafkaStatus(): Promise<{ success: boolean; data?: KafkaStatus; error?: string }> {
    if (USE_MOCK_DATA) {
      return { success: true, data: generateMockKafkaStatus() };
    }
    return apiGateway.get<KafkaStatus>(`${MONITORING_BASE}/kafka`);
  }

  /**
   * Get detailed metrics for a specific service
   */
  async getServiceDetails(serviceName: string): Promise<{ success: boolean; data?: ServiceHealth; error?: string }> {
    if (USE_MOCK_DATA) {
      const dashboard = generateMockDashboard();
      const service = dashboard.services.find(s => s.service === serviceName);
      if (service) {
        return { success: true, data: service };
      }
      return { success: false, error: 'Service not found' };
    }
    return apiGateway.get<ServiceHealth>(`${MONITORING_BASE}/services/${serviceName}`);
  }
}

export const monitoringGateway = new MonitoringGateway();

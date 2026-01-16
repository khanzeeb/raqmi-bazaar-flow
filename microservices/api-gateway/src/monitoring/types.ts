/**
 * Event Monitoring Dashboard Types
 */

export interface ServiceHealth {
  service: string;
  status: 'OK' | 'ERROR' | 'TIMEOUT';
  timestamp: string;
  events?: {
    subscriptions?: number;
    registered?: number;
    customer?: number;
    supplier?: number;
  };
  kafka?: {
    enabled?: boolean;
    connected?: boolean;
    stats?: BridgeStats;
  };
  responseTime: number;
  error?: string;
}

export interface BridgeStats {
  published: number;
  received: number;
  errors: number;
  lastPublished?: string;
  lastReceived?: string;
}

export interface ServiceEvents {
  service: string;
  subscriptions: Array<{ eventType: string }> | Record<string, Array<{ eventType: string }>>;
  history: EventHistoryItem[];
  kafka?: {
    connected?: boolean;
    stats?: BridgeStats;
  };
  error?: string;
}

export interface EventHistoryItem {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface AggregatedDashboard {
  timestamp: string;
  summary: {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    totalSubscriptions: number;
    totalEventsProcessed: number;
    kafkaConnected: number;
  };
  services: ServiceHealth[];
  eventFlow: EventFlowData;
  recentEvents: AggregatedEvent[];
}

export interface EventFlowData {
  nodes: EventFlowNode[];
  edges: EventFlowEdge[];
}

export interface EventFlowNode {
  id: string;
  label: string;
  type: 'service' | 'topic';
  status: 'healthy' | 'unhealthy' | 'unknown';
  metrics: {
    published: number;
    received: number;
    subscriptions: number;
  };
}

export interface EventFlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
}

export interface AggregatedEvent {
  id: string;
  service: string;
  eventType: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface EventMetrics {
  eventType: string;
  count: number;
  lastOccurrence: string;
  sources: string[];
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

export interface ServiceMetrics {
  service: string;
  uptime: number;
  eventsPublished: TimeSeriesDataPoint[];
  eventsReceived: TimeSeriesDataPoint[];
  errorRate: number;
  avgResponseTime: number;
}

export interface DashboardConfig {
  refreshInterval: number;
  historyLimit: number;
  timeRange: '1h' | '6h' | '24h' | '7d';
}

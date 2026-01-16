import axios, { AxiosError } from 'axios';
import {
  ServiceHealth,
  ServiceEvents,
  AggregatedDashboard,
  EventFlowData,
  EventFlowNode,
  EventFlowEdge,
  AggregatedEvent,
  EventMetrics,
  ServiceMetrics,
  TimeSeriesDataPoint,
} from './types';

interface ServiceConfig {
  name: string;
  url: string;
  healthEndpoint: string;
  eventsEndpoint: string;
}

const SERVICE_CONFIGS: ServiceConfig[] = [
  { name: 'product-service', url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'order-service', url: process.env.ORDER_SERVICE_URL || 'http://localhost:3002', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'customer-service', url: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'quotation-service', url: process.env.QUOTATION_SERVICE_URL || 'http://localhost:3004', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'purchase-service', url: process.env.PURCHASE_SERVICE_URL || 'http://localhost:3005', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'expense-service', url: process.env.EXPENSE_SERVICE_URL || 'http://localhost:3006', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'invoice-service', url: process.env.INVOICE_SERVICE_URL || 'http://localhost:3007', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'report-service', url: process.env.REPORT_SERVICE_URL || 'http://localhost:3008', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'pricing-service', url: process.env.PRICING_SERVICE_URL || 'http://localhost:3009', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'return-service', url: process.env.RETURN_SERVICE_URL || 'http://localhost:3010', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'inventory-service', url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3011', healthEndpoint: '/health', eventsEndpoint: '/events' },
  { name: 'settings-service', url: process.env.SETTINGS_SERVICE_URL || 'http://localhost:3012', healthEndpoint: '/health', eventsEndpoint: '/events' },
];

export class ServiceAggregator {
  private metricsHistory: Map<string, ServiceMetrics> = new Map();
  private eventBuffer: AggregatedEvent[] = [];
  private readonly maxEventBuffer = 1000;
  private readonly requestTimeout = 5000;

  /**
   * Fetch health status from a single service
   */
  async fetchServiceHealth(config: ServiceConfig): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${config.url}${config.healthEndpoint}`, {
        timeout: this.requestTimeout,
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        service: config.name,
        status: 'OK',
        timestamp: response.data.timestamp || new Date().toISOString(),
        events: response.data.events,
        kafka: response.data.kafka,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const axiosError = error as AxiosError;
      
      return {
        service: config.name,
        status: axiosError.code === 'ECONNABORTED' ? 'TIMEOUT' : 'ERROR',
        timestamp: new Date().toISOString(),
        responseTime,
        error: axiosError.message,
      };
    }
  }

  /**
   * Fetch events from a single service
   */
  async fetchServiceEvents(config: ServiceConfig): Promise<ServiceEvents> {
    try {
      const response = await axios.get(`${config.url}${config.eventsEndpoint}`, {
        timeout: this.requestTimeout,
      });
      
      return {
        service: config.name,
        subscriptions: response.data.subscriptions || [],
        history: response.data.history || [],
        kafka: response.data.kafka,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      
      return {
        service: config.name,
        subscriptions: [],
        history: [],
        error: axiosError.message,
      };
    }
  }

  /**
   * Fetch health from all services in parallel
   */
  async fetchAllServicesHealth(): Promise<ServiceHealth[]> {
    const healthPromises = SERVICE_CONFIGS.map(config => this.fetchServiceHealth(config));
    return Promise.all(healthPromises);
  }

  /**
   * Fetch events from all services in parallel
   */
  async fetchAllServicesEvents(): Promise<ServiceEvents[]> {
    const eventPromises = SERVICE_CONFIGS.map(config => this.fetchServiceEvents(config));
    return Promise.all(eventPromises);
  }

  /**
   * Build event flow graph for visualization
   */
  buildEventFlowGraph(services: ServiceHealth[], events: ServiceEvents[]): EventFlowData {
    const nodes: EventFlowNode[] = [];
    const edges: EventFlowEdge[] = [];
    const topicMap = new Map<string, Set<string>>();

    // Add service nodes
    services.forEach(service => {
      const serviceEvents = events.find(e => e.service === service.service);
      const subscriptions = this.countSubscriptions(serviceEvents?.subscriptions);
      
      nodes.push({
        id: service.service,
        label: service.service.replace('-service', ''),
        type: 'service',
        status: service.status === 'OK' ? 'healthy' : 'unhealthy',
        metrics: {
          published: service.kafka?.stats?.published || 0,
          received: service.kafka?.stats?.received || 0,
          subscriptions,
        },
      });

      // Track which topics each service subscribes to
      if (serviceEvents) {
        const eventTypes = this.extractEventTypes(serviceEvents.subscriptions);
        eventTypes.forEach(eventType => {
          if (!topicMap.has(eventType)) {
            topicMap.set(eventType, new Set());
          }
          topicMap.get(eventType)!.add(service.service);
        });
      }
    });

    // Add topic nodes and edges
    let edgeId = 0;
    topicMap.forEach((subscribers, topic) => {
      const topicId = `topic-${topic}`;
      
      nodes.push({
        id: topicId,
        label: topic,
        type: 'topic',
        status: 'unknown',
        metrics: {
          published: 0,
          received: 0,
          subscriptions: subscribers.size,
        },
      });

      // Create edges from topic to subscribers
      subscribers.forEach(subscriber => {
        edges.push({
          id: `edge-${edgeId++}`,
          source: topicId,
          target: subscriber,
          label: topic,
          weight: 1,
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * Aggregate all recent events from all services
   */
  aggregateRecentEvents(allEvents: ServiceEvents[], limit: number = 100): AggregatedEvent[] {
    const aggregated: AggregatedEvent[] = [];

    allEvents.forEach(serviceEvents => {
      if (serviceEvents.history && Array.isArray(serviceEvents.history)) {
        serviceEvents.history.forEach((event, index) => {
          aggregated.push({
            id: `${serviceEvents.service}-${event.timestamp}-${index}`,
            service: serviceEvents.service,
            eventType: event.type,
            timestamp: event.timestamp,
            payload: event.payload as Record<string, unknown>,
          });
        });
      }
    });

    // Sort by timestamp descending
    aggregated.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return aggregated.slice(0, limit);
  }

  /**
   * Calculate event metrics by type
   */
  calculateEventMetrics(allEvents: ServiceEvents[]): EventMetrics[] {
    const metricsMap = new Map<string, EventMetrics>();

    allEvents.forEach(serviceEvents => {
      if (serviceEvents.history && Array.isArray(serviceEvents.history)) {
        serviceEvents.history.forEach(event => {
          if (!metricsMap.has(event.type)) {
            metricsMap.set(event.type, {
              eventType: event.type,
              count: 0,
              lastOccurrence: event.timestamp,
              sources: [],
            });
          }

          const metrics = metricsMap.get(event.type)!;
          metrics.count++;
          
          if (new Date(event.timestamp) > new Date(metrics.lastOccurrence)) {
            metrics.lastOccurrence = event.timestamp;
          }
          
          if (!metrics.sources.includes(serviceEvents.service)) {
            metrics.sources.push(serviceEvents.service);
          }
        });
      }
    });

    return Array.from(metricsMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Build complete aggregated dashboard
   */
  async buildDashboard(): Promise<AggregatedDashboard> {
    const [services, allEvents] = await Promise.all([
      this.fetchAllServicesHealth(),
      this.fetchAllServicesEvents(),
    ]);

    const healthyServices = services.filter(s => s.status === 'OK').length;
    const kafkaConnected = services.filter(s => s.kafka?.connected).length;

    let totalSubscriptions = 0;
    let totalEventsProcessed = 0;

    services.forEach(service => {
      if (service.events) {
        totalSubscriptions += service.events.subscriptions || 0;
        totalSubscriptions += service.events.customer || 0;
        totalSubscriptions += service.events.supplier || 0;
      }
      if (service.kafka?.stats) {
        totalEventsProcessed += service.kafka.stats.published + service.kafka.stats.received;
      }
    });

    const eventFlow = this.buildEventFlowGraph(services, allEvents);
    const recentEvents = this.aggregateRecentEvents(allEvents, 100);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalServices: services.length,
        healthyServices,
        unhealthyServices: services.length - healthyServices,
        totalSubscriptions,
        totalEventsProcessed,
        kafkaConnected,
      },
      services,
      eventFlow,
      recentEvents,
    };
  }

  /**
   * Get service metrics for a specific service
   */
  async getServiceMetrics(serviceName: string): Promise<ServiceMetrics | null> {
    const config = SERVICE_CONFIGS.find(c => c.name === serviceName);
    if (!config) return null;

    const [health, events] = await Promise.all([
      this.fetchServiceHealth(config),
      this.fetchServiceEvents(config),
    ]);

    const now = new Date().toISOString();
    
    return {
      service: serviceName,
      uptime: health.status === 'OK' ? 100 : 0,
      eventsPublished: [{ timestamp: now, value: health.kafka?.stats?.published || 0 }],
      eventsReceived: [{ timestamp: now, value: health.kafka?.stats?.received || 0 }],
      errorRate: health.kafka?.stats?.errors ? 
        (health.kafka.stats.errors / ((health.kafka.stats.published || 1) + (health.kafka.stats.received || 1))) * 100 : 0,
      avgResponseTime: health.responseTime,
    };
  }

  /**
   * Helper: Count subscriptions from various formats
   */
  private countSubscriptions(subscriptions: ServiceEvents['subscriptions']): number {
    if (!subscriptions) return 0;
    if (Array.isArray(subscriptions)) return subscriptions.length;
    
    // Handle nested subscriptions (e.g., customer-service with customer/supplier)
    let count = 0;
    Object.values(subscriptions).forEach(subs => {
      if (Array.isArray(subs)) count += subs.length;
    });
    return count;
  }

  /**
   * Helper: Extract event types from subscriptions
   */
  private extractEventTypes(subscriptions: ServiceEvents['subscriptions']): string[] {
    if (!subscriptions) return [];
    
    if (Array.isArray(subscriptions)) {
      return subscriptions.map(s => s.eventType);
    }
    
    const types: string[] = [];
    Object.values(subscriptions).forEach(subs => {
      if (Array.isArray(subs)) {
        types.push(...subs.map(s => s.eventType));
      }
    });
    return types;
  }

  /**
   * Get list of configured services
   */
  getServiceConfigs(): ServiceConfig[] {
    return [...SERVICE_CONFIGS];
  }
}

export const serviceAggregator = new ServiceAggregator();

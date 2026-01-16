import { Router, Request, Response } from 'express';
import { serviceAggregator } from './ServiceAggregator';

const router = Router();

/**
 * GET /api/monitoring/dashboard
 * Get complete aggregated dashboard with all services
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboard = await serviceAggregator.buildDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    res.status(500).json({ error: 'Failed to aggregate dashboard data' });
  }
});

/**
 * GET /api/monitoring/health
 * Get health status of all services
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const services = await serviceAggregator.fetchAllServicesHealth();
    
    const summary = {
      timestamp: new Date().toISOString(),
      total: services.length,
      healthy: services.filter(s => s.status === 'OK').length,
      unhealthy: services.filter(s => s.status !== 'OK').length,
      services,
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Failed to fetch health status' });
  }
});

/**
 * GET /api/monitoring/events
 * Get recent events from all services
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const eventType = req.query.eventType as string;
    const service = req.query.service as string;
    
    const allEvents = await serviceAggregator.fetchAllServicesEvents();
    let recentEvents = serviceAggregator.aggregateRecentEvents(allEvents, limit);
    
    // Filter by event type if specified
    if (eventType) {
      recentEvents = recentEvents.filter(e => e.eventType === eventType);
    }
    
    // Filter by service if specified
    if (service) {
      recentEvents = recentEvents.filter(e => e.service === service);
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      count: recentEvents.length,
      events: recentEvents,
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/monitoring/events/metrics
 * Get event metrics grouped by type
 */
router.get('/events/metrics', async (req: Request, res: Response) => {
  try {
    const allEvents = await serviceAggregator.fetchAllServicesEvents();
    const metrics = serviceAggregator.calculateEventMetrics(allEvents);
    
    res.json({
      timestamp: new Date().toISOString(),
      totalEventTypes: metrics.length,
      metrics,
    });
  } catch (error) {
    console.error('Event metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate event metrics' });
  }
});

/**
 * GET /api/monitoring/flow
 * Get event flow graph for visualization
 */
router.get('/flow', async (req: Request, res: Response) => {
  try {
    const [services, allEvents] = await Promise.all([
      serviceAggregator.fetchAllServicesHealth(),
      serviceAggregator.fetchAllServicesEvents(),
    ]);
    
    const flow = serviceAggregator.buildEventFlowGraph(services, allEvents);
    
    res.json({
      timestamp: new Date().toISOString(),
      nodes: flow.nodes.length,
      edges: flow.edges.length,
      graph: flow,
    });
  } catch (error) {
    console.error('Flow graph error:', error);
    res.status(500).json({ error: 'Failed to build event flow graph' });
  }
});

/**
 * GET /api/monitoring/services
 * Get list of all configured services
 */
router.get('/services', (req: Request, res: Response) => {
  const configs = serviceAggregator.getServiceConfigs();
  res.json({
    count: configs.length,
    services: configs.map(c => ({
      name: c.name,
      url: c.url,
    })),
  });
});

/**
 * GET /api/monitoring/services/:serviceName
 * Get detailed metrics for a specific service
 */
router.get('/services/:serviceName', async (req: Request, res: Response) => {
  try {
    const { serviceName } = req.params;
    const metrics = await serviceAggregator.getServiceMetrics(serviceName);
    
    if (!metrics) {
      return res.status(404).json({ error: `Service '${serviceName}' not found` });
    }
    
    res.json(metrics);
  } catch (error) {
    console.error('Service metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch service metrics' });
  }
});

/**
 * GET /api/monitoring/services/:serviceName/events
 * Get events for a specific service
 */
router.get('/services/:serviceName/events', async (req: Request, res: Response) => {
  try {
    const { serviceName } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    
    const configs = serviceAggregator.getServiceConfigs();
    const config = configs.find(c => c.name === serviceName);
    
    if (!config) {
      return res.status(404).json({ error: `Service '${serviceName}' not found` });
    }
    
    const allEvents = await serviceAggregator.fetchAllServicesEvents();
    const serviceEvents = allEvents.find(e => e.service === serviceName);
    
    if (!serviceEvents) {
      return res.json({ service: serviceName, events: [] });
    }
    
    const events = serviceAggregator.aggregateRecentEvents([serviceEvents], limit);
    
    res.json({
      service: serviceName,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Service events error:', error);
    res.status(500).json({ error: 'Failed to fetch service events' });
  }
});

/**
 * GET /api/monitoring/kafka
 * Get Kafka connectivity status across all services
 */
router.get('/kafka', async (req: Request, res: Response) => {
  try {
    const services = await serviceAggregator.fetchAllServicesHealth();
    
    const kafkaStatus = services.map(service => ({
      service: service.service,
      kafka: service.kafka || { enabled: false, connected: false },
    }));
    
    const connectedCount = kafkaStatus.filter(s => s.kafka.connected).length;
    const enabledCount = kafkaStatus.filter(s => s.kafka.enabled).length;
    
    let totalPublished = 0;
    let totalReceived = 0;
    let totalErrors = 0;
    
    kafkaStatus.forEach(s => {
      if (s.kafka.stats) {
        totalPublished += s.kafka.stats.published || 0;
        totalReceived += s.kafka.stats.received || 0;
        totalErrors += s.kafka.stats.errors || 0;
      }
    });
    
    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        total: services.length,
        enabled: enabledCount,
        connected: connectedCount,
        totalPublished,
        totalReceived,
        totalErrors,
      },
      services: kafkaStatus,
    });
  } catch (error) {
    console.error('Kafka status error:', error);
    res.status(500).json({ error: 'Failed to fetch Kafka status' });
  }
});

/**
 * GET /api/monitoring/subscriptions
 * Get all event subscriptions across services
 */
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const allEvents = await serviceAggregator.fetchAllServicesEvents();
    
    const subscriptionsByService: Record<string, string[]> = {};
    const subscriptionsByEvent: Record<string, string[]> = {};
    
    allEvents.forEach(serviceEvents => {
      const eventTypes: string[] = [];
      
      if (Array.isArray(serviceEvents.subscriptions)) {
        eventTypes.push(...serviceEvents.subscriptions.map(s => s.eventType));
      } else if (serviceEvents.subscriptions) {
        Object.values(serviceEvents.subscriptions).forEach(subs => {
          if (Array.isArray(subs)) {
            eventTypes.push(...subs.map(s => s.eventType));
          }
        });
      }
      
      subscriptionsByService[serviceEvents.service] = eventTypes;
      
      eventTypes.forEach(eventType => {
        if (!subscriptionsByEvent[eventType]) {
          subscriptionsByEvent[eventType] = [];
        }
        if (!subscriptionsByEvent[eventType].includes(serviceEvents.service)) {
          subscriptionsByEvent[eventType].push(serviceEvents.service);
        }
      });
    });
    
    res.json({
      timestamp: new Date().toISOString(),
      byService: subscriptionsByService,
      byEvent: subscriptionsByEvent,
    });
  } catch (error) {
    console.error('Subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

export default router;

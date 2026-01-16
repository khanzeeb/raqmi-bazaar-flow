/**
 * Monitoring Data Hook
 * Manages state and data fetching for the monitoring dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { monitoringGateway } from '../services/monitoring.gateway';
import type { 
  AggregatedDashboard, 
  ServiceHealth, 
  AggregatedEvent, 
  EventMetrics,
  EventFlowData,
  KafkaStatus 
} from '../types';

interface UseMonitoringDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useMonitoringData(options: UseMonitoringDataOptions = {}) {
  const { autoRefresh = true, refreshInterval = 10000 } = options;
  
  const [dashboard, setDashboard] = useState<AggregatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    const response = await monitoringGateway.getDashboard();
    
    if (response.success && response.data) {
      setDashboard(response.data);
      setError(null);
      setLastUpdated(new Date());
    } else {
      setError(response.error || 'Failed to fetch monitoring data');
    }
    
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboard, autoRefresh, refreshInterval]);

  return {
    dashboard,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}

export function useServicesHealth() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const response = await monitoringGateway.getServicesHealth();
    
    if (response.success && response.data) {
      setServices(response.data.services);
      setError(null);
    } else {
      setError(response.error || 'Failed to fetch services health');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { services, loading, error, refresh: fetch };
}

export function useRecentEvents(limit: number = 20) {
  const [events, setEvents] = useState<AggregatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const response = await monitoringGateway.getEvents({ limit });
    
    if (response.success && response.data) {
      setEvents(response.data.events);
      setError(null);
    } else {
      setError(response.error || 'Failed to fetch events');
    }
    
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { events, loading, error, refresh: fetch };
}

export function useEventMetrics() {
  const [metrics, setMetrics] = useState<EventMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const response = await monitoringGateway.getEventMetrics();
    
    if (response.success && response.data) {
      setMetrics(response.data.metrics);
      setError(null);
    } else {
      setError(response.error || 'Failed to fetch event metrics');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { metrics, loading, error, refresh: fetch };
}

export function useEventFlow() {
  const [flowData, setFlowData] = useState<EventFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const response = await monitoringGateway.getEventFlow();
    
    if (response.success && response.data) {
      setFlowData(response.data);
      setError(null);
    } else {
      setError(response.error || 'Failed to fetch event flow');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { flowData, loading, error, refresh: fetch };
}

export function useKafkaStatus() {
  const [kafkaStatus, setKafkaStatus] = useState<KafkaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const response = await monitoringGateway.getKafkaStatus();
    
    if (response.success && response.data) {
      setKafkaStatus(response.data);
      setError(null);
    } else {
      setError(response.error || 'Failed to fetch Kafka status');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { kafkaStatus, loading, error, refresh: fetch };
}

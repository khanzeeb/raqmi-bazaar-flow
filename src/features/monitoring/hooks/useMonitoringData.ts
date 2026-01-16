/**
 * Monitoring Data Hook
 * Manages state and data fetching for the monitoring dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { monitoringGateway } from '../services/monitoring.gateway';
import {
  generateMockDashboard,
  generateMockEventMetrics,
  generateMockKafkaStatus,
} from '../services/mockData';
import type {
  AggregatedDashboard,
  ServiceHealth,
  AggregatedEvent,
  EventMetrics,
  EventFlowData,
  KafkaStatus,
} from '../types';

interface UseMonitoringDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  /**
   * When the backend isn't reachable (common in preview), show mock data instead of an error.
   */
  fallbackToMock?: boolean;
}

export function useMonitoringData(options: UseMonitoringDataOptions = {}) {
  const { autoRefresh = true, refreshInterval = 10000, fallbackToMock = true } = options;

  const [dashboard, setDashboard] = useState<AggregatedDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await monitoringGateway.getDashboard();

      if (response.success && response.data) {
        setDashboard(response.data);
        setError(null);
        setLastUpdated(new Date());
        return;
      }

      // In preview/dev, /api/* may return HTML (index.html) which triggers JSON parse errors.
      if (fallbackToMock) {
        setDashboard(generateMockDashboard());
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(response.error || 'Failed to fetch monitoring data');
      }
    } catch (e) {
      if (fallbackToMock) {
        setDashboard(generateMockDashboard());
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(e instanceof Error ? e.message : 'Failed to fetch monitoring data');
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackToMock]);

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
    try {
      const response = await monitoringGateway.getServicesHealth();

      if (response.success && response.data) {
        setServices(response.data.services);
        setError(null);
      } else {
        setServices(generateMockDashboard().services);
        setError(null);
      }
    } catch {
      setServices(generateMockDashboard().services);
      setError(null);
    } finally {
      setLoading(false);
    }
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
    try {
      const response = await monitoringGateway.getEvents({ limit });

      if (response.success && response.data) {
        setEvents(response.data.events);
        setError(null);
      } else {
        setEvents(generateMockDashboard().recentEvents.slice(0, limit));
        setError(null);
      }
    } catch {
      setEvents(generateMockDashboard().recentEvents.slice(0, limit));
      setError(null);
    } finally {
      setLoading(false);
    }
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
    try {
      const response = await monitoringGateway.getEventMetrics();

      if (response.success && response.data) {
        setMetrics(response.data.metrics);
        setError(null);
      } else {
        setMetrics(generateMockEventMetrics());
        setError(null);
      }
    } catch {
      setMetrics(generateMockEventMetrics());
      setError(null);
    } finally {
      setLoading(false);
    }
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
    try {
      const response = await monitoringGateway.getEventFlow();

      if (response.success && response.data) {
        setFlowData(response.data);
        setError(null);
      } else {
        setFlowData(generateMockDashboard().eventFlow);
        setError(null);
      }
    } catch {
      setFlowData(generateMockDashboard().eventFlow);
      setError(null);
    } finally {
      setLoading(false);
    }
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
    try {
      const response = await monitoringGateway.getKafkaStatus();

      if (response.success && response.data) {
        setKafkaStatus(response.data);
        setError(null);
      } else {
        setKafkaStatus(generateMockKafkaStatus());
        setError(null);
      }
    } catch {
      setKafkaStatus(generateMockKafkaStatus());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { kafkaStatus, loading, error, refresh: fetch };
}


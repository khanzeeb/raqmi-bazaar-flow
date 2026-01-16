/**
 * Event Monitoring Dashboard Page
 * Visualizes service health, event flow, and real-time event activity
 */

import { RefreshCw, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

import {
  useMonitoringData,
  useEventMetrics,
  ServiceHealthCard,
  EventFlowGraph,
  RecentEventsTable,
  MonitoringSummary,
  EventMetricsChart,
} from '@/features/monitoring';

export default function Monitoring() {
  const { dashboard, loading, error, lastUpdated, refresh } = useMonitoringData({
    autoRefresh: true,
    refreshInterval: 10000,
  });
  
  const { metrics, loading: metricsLoading } = useEventMetrics();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Failed to load monitoring data</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time visibility into service health and event flow
          </p>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </div>
          )}
          <Button onClick={refresh} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !dashboard && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading monitoring data...</p>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {dashboard && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              Services
              <Badge variant="secondary" className="ml-1">
                {dashboard.summary.totalServices}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              Events
              <Badge variant="secondary" className="ml-1">
                {dashboard.recentEvents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="flow" className="gap-2">
              Event Flow
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <MonitoringSummary summary={dashboard.summary} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <RecentEventsTable events={dashboard.recentEvents} maxItems={10} />

              {/* Service Health Grid */}
              <div className="card-elegant p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Service Health</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashboard.services.slice(0, 6).map((service) => (
                    <ServiceHealthCard key={service.service} service={service} />
                  ))}
                </div>
                {dashboard.services.length > 6 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    +{dashboard.services.length - 6} more services
                  </div>
                )}
              </div>
            </div>

            {/* Event Metrics Charts */}
            {!metricsLoading && metrics.length > 0 && (
              <EventMetricsChart metrics={metrics} />
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dashboard.services.map((service) => (
                <ServiceHealthCard key={service.service} service={service} />
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentEventsTable events={dashboard.recentEvents} maxItems={30} />
              </div>
              <div>
                {!metricsLoading && metrics.length > 0 && (
                  <EventMetricsChart metrics={metrics.slice(0, 5)} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Event Flow Tab */}
          <TabsContent value="flow" className="space-y-6">
            <EventFlowGraph flowData={dashboard.eventFlow} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

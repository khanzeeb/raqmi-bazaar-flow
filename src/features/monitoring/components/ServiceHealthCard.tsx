/**
 * Service Health Card Component
 * Displays individual service health status with Kafka connectivity
 */

import { Activity, Server, Wifi, WifiOff, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ServiceHealth } from '../types';

interface ServiceHealthCardProps {
  service: ServiceHealth;
}

export function ServiceHealthCard({ service }: ServiceHealthCardProps) {
  const getStatusIcon = () => {
    switch (service.status) {
      case 'OK':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'TIMEOUT':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (service.status) {
      case 'OK':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Healthy</Badge>;
      case 'ERROR':
        return <Badge variant="destructive">Error</Badge>;
      case 'TIMEOUT':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Timeout</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatServiceName = (name: string) => {
    return name
      .replace(/-service$/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="card-elegant p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{formatServiceName(service.service)}</h4>
            <p className="text-xs text-muted-foreground">{service.service}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-3">
        {/* Status Row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {getStatusBadge()}
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Response Time</span>
          <span className="text-sm font-medium text-foreground">{service.responseTime}ms</span>
        </div>

        {/* Kafka Status */}
        {service.kafka && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Kafka</span>
            <div className="flex items-center gap-1.5">
              {service.kafka.connected ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Disconnected</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Event Stats */}
        {service.kafka?.stats && (
          <div className="pt-2 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {service.kafka.stats.published}
                </div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {service.kafka.stats.received}
                </div>
                <div className="text-xs text-muted-foreground">Received</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-destructive">
                  {service.kafka.stats.errors}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {service.error && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{service.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

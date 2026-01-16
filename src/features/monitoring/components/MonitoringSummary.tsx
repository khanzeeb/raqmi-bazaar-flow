/**
 * Monitoring Summary Component
 * Displays key metrics overview
 */

import { Server, Activity, Wifi, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MonitoringSummaryProps {
  summary: {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    totalSubscriptions: number;
    totalEventsProcessed: number;
    kafkaConnected: number;
  };
}

export function MonitoringSummary({ summary }: MonitoringSummaryProps) {
  const healthPercentage = summary.totalServices > 0
    ? Math.round((summary.healthyServices / summary.totalServices) * 100)
    : 0;

  const stats = [
    {
      label: 'Services',
      value: summary.totalServices,
      icon: Server,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      badge: `${healthPercentage}% healthy`,
      badgeColor: healthPercentage >= 80 ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600',
    },
    {
      label: 'Healthy',
      value: summary.healthyServices,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Unhealthy',
      value: summary.unhealthyServices,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      highlight: summary.unhealthyServices > 0,
    },
    {
      label: 'Kafka Connected',
      value: summary.kafkaConnected,
      icon: Wifi,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Subscriptions',
      value: summary.totalSubscriptions,
      icon: Activity,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Events Processed',
      value: summary.totalEventsProcessed,
      icon: Zap,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`card-elegant p-4 ${stat.highlight ? 'border-destructive/50 bg-destructive/5' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            {stat.badge && (
              <Badge className={stat.badgeColor}>
                {stat.badge}
              </Badge>
            )}
          </div>
          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

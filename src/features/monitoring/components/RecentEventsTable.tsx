/**
 * Recent Events Table Component
 * Displays a live feed of recent events across all services
 */

import { formatDistanceToNow } from 'date-fns';
import { Clock, Server, Zap, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AggregatedEvent } from '../types';

interface RecentEventsTableProps {
  events: AggregatedEvent[];
  maxItems?: number;
}

export function RecentEventsTable({ events, maxItems = 15 }: RecentEventsTableProps) {
  const displayEvents = events.slice(0, maxItems);

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('created') || eventType.includes('Created')) {
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    }
    if (eventType.includes('updated') || eventType.includes('Updated')) {
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
    if (eventType.includes('deleted') || eventType.includes('Deleted')) {
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    if (eventType.includes('failed') || eventType.includes('Failed')) {
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
    return 'bg-muted text-muted-foreground';
  };

  const formatEventType = (type: string) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatServiceName = (name: string) => {
    return name
      .replace(/-service$/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (events.length === 0) {
    return (
      <div className="card-elegant p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No events recorded yet</p>
          <p className="text-sm">Events will appear here as they occur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Events</h3>
        </div>
        <Badge variant="secondary">{events.length} total</Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {displayEvents.map((event) => (
            <div
              key={event.id}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatEventType(event.eventType)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Server className="h-3 w-3" />
                        {formatServiceName(event.service)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge className={getEventTypeColor(event.eventType)}>
                      {event.eventType.split(/(?=[A-Z])/).pop()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Payload Preview */}
                {Object.keys(event.payload).length > 0 && (
                  <div className="mt-2 p-2 rounded bg-muted/30 text-xs font-mono text-muted-foreground overflow-hidden">
                    <div className="truncate">
                      {JSON.stringify(event.payload).slice(0, 100)}
                      {JSON.stringify(event.payload).length > 100 && '...'}
                    </div>
                  </div>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
            </div>
          ))}
        </div>
      </ScrollArea>

      {events.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View all {events.length} events →
          </button>
        </div>
      )}
    </div>
  );
}

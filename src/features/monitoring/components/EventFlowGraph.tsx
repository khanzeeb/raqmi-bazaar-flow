/**
 * Event Flow Graph Component
 * Visualizes the flow of events between services
 */

import { useMemo } from 'react';
import { Activity, Box, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { EventFlowData, EventFlowNode, EventFlowEdge } from '../types';

interface EventFlowGraphProps {
  flowData: EventFlowData;
}

export function EventFlowGraph({ flowData }: EventFlowGraphProps) {
  const { serviceNodes, topicNodes, edges } = useMemo(() => {
    const services = flowData.nodes.filter(n => n.type === 'service');
    const topics = flowData.nodes.filter(n => n.type === 'topic');
    return { serviceNodes: services, topicNodes: topics, edges: flowData.edges };
  }, [flowData]);

  const getStatusColor = (status: EventFlowNode['status']) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500 bg-green-500/10';
      case 'unhealthy':
        return 'border-destructive bg-destructive/10';
      default:
        return 'border-muted bg-muted/10';
    }
  };

  const getNodeConnections = (nodeId: string) => {
    const outgoing = edges.filter(e => e.source === nodeId);
    const incoming = edges.filter(e => e.target === nodeId);
    return { outgoing, incoming };
  };

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Event Flow Graph</h3>
      </div>

      <div className="space-y-8">
        {/* Services Section */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Box className="h-4 w-4" />
            Services ({serviceNodes.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {serviceNodes.map((node) => {
              const { outgoing, incoming } = getNodeConnections(node.id);
              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border-2 ${getStatusColor(node.status)} transition-all hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {node.label}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={node.status === 'healthy' ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive'}
                    >
                      {node.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-center">
                    <div>
                      <div className="font-semibold text-foreground">{node.metrics.published}</div>
                      <div className="text-muted-foreground">Pub</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{node.metrics.received}</div>
                      <div className="text-muted-foreground">Rec</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{node.metrics.subscriptions}</div>
                      <div className="text-muted-foreground">Sub</div>
                    </div>
                  </div>
                  {(outgoing.length > 0 || incoming.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                      {outgoing.length} out / {incoming.length} in
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Topics Section */}
        {topicNodes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Kafka Topics ({topicNodes.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {topicNodes.map((node) => (
                <Badge
                  key={node.id}
                  variant="outline"
                  className="py-1.5 px-3"
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  {node.label}
                  <span className="ml-2 text-muted-foreground">
                    ({node.metrics.subscriptions} subscribers)
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Edges / Connections */}
        {edges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Active Connections ({edges.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {edges.slice(0, 12).map((edge) => (
                <div
                  key={edge.id}
                  className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm"
                >
                  <span className="font-medium text-foreground truncate">{edge.source}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-foreground truncate">{edge.target}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {edge.weight}
                  </Badge>
                </div>
              ))}
              {edges.length > 12 && (
                <div className="p-2 text-sm text-muted-foreground">
                  +{edges.length - 12} more connections
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

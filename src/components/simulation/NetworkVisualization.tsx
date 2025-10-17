import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Company, Relationship } from '@/pages/Simulation';
import { CompanyNode } from './CompanyNode';
import { RelationshipCreator } from './RelationshipCreator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NetworkVisualizationProps {
  companies: Company[];
  relationships: Relationship[];
  onNodePositionChange: (id: string, x: number, y: number) => void;
  onRelationshipCreate: (sourceId: string, targetId: string, label: string, strength: number) => void;
}

export const NetworkVisualization = ({
  companies,
  relationships,
  onNodePositionChange,
  onRelationshipCreate,
}: NetworkVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConnection, setDragConnection] = useState<{ sourceId: string; x: number; y: number } | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [showRelationshipCreator, setShowRelationshipCreator] = useState(false);
  const [hoveredRelationship, setHoveredRelationship] = useState<string | null>(null);

  const handleDragStart = (sourceId: string, x: number, y: number) => {
    setDragConnection({ sourceId, x, y });
  };

  const handleDragMove = (x: number, y: number) => {
    if (dragConnection && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragConnection({ ...dragConnection, x: x - rect.left, y: y - rect.top });
    }
  };

  const handleDragEnd = (targetId?: string) => {
    if (dragConnection && targetId && targetId !== dragConnection.sourceId) {
      setPendingConnection({ sourceId: dragConnection.sourceId, targetId });
      setShowRelationshipCreator(true);
    }
    setDragConnection(null);
  };

  const handleRelationshipCreated = (label: string, strength: number) => {
    if (pendingConnection) {
      onRelationshipCreate(pendingConnection.sourceId, pendingConnection.targetId, label, strength);
    }
    setPendingConnection(null);
    setShowRelationshipCreator(false);
  };

  const getNodePosition = (id: string) => {
    const company = companies.find(c => c.id === id);
    const index = companies.findIndex(c => c.id === id);
    return {
      x: company?.x || (index * 150) + 100,
      y: company?.y || (index * 100) + 100
    };
  };

  return (
    <TooltipProvider>
      <Card className="border-2 p-6 relative" style={{ height: '700px' }}>
        <h3 className="text-lg font-semibold mb-4">Network Visualization</h3>
        
        <div 
          ref={containerRef}
          className="relative w-full h-[calc(100%-3rem)] bg-muted/20 rounded-lg overflow-hidden"
          onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
          onMouseUp={() => handleDragEnd()}
        >
          <svg ref={svgRef} className="w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--primary))" />
              </marker>
            </defs>

            {/* Draw relationships */}
            {relationships.map((rel) => {
              const sourcePos = getNodePosition(rel.source_company_id);
              const targetPos = getNodePosition(rel.target_company_id);
              
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const curve = distance * 0.2;
              
              const midX = (sourcePos.x + targetPos.x) / 2;
              const midY = (sourcePos.y + targetPos.y) / 2;
              const perpX = -dy / distance;
              const perpY = dx / distance;
              const controlX = midX + perpX * curve;
              const controlY = midY + perpY * curve;

              const path = `M ${sourcePos.x},${sourcePos.y} Q ${controlX},${controlY} ${targetPos.x},${targetPos.y}`;
              const isHovered = hoveredRelationship === rel.id;

              return (
                <g key={rel.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <path
                        d={path}
                        stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={Math.max(2, 4 * rel.strength)}
                        fill="none"
                        opacity={isHovered ? 0.9 : 0.4 + (rel.strength * 0.3)}
                        className="pointer-events-auto cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredRelationship(rel.id)}
                        onMouseLeave={() => setHoveredRelationship(null)}
                        markerEnd="url(#arrowhead)"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-semibold">{rel.label}</p>
                        <p className="text-muted-foreground">
                          Strength: {(rel.strength * 100).toFixed(0)}%
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <text
                    x={controlX}
                    y={controlY - 10}
                    fontSize="11"
                    fill="hsl(var(--foreground))"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                    opacity={0.8}
                  >
                    {rel.label}
                  </text>
                </g>
              );
            })}

            {/* Draw temporary drag connection */}
            {dragConnection && (
              <line
                x1={getNodePosition(dragConnection.sourceId).x}
                y1={getNodePosition(dragConnection.sourceId).y}
                x2={dragConnection.x}
                y2={dragConnection.y}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity={0.6}
              />
            )}
          </svg>

          {/* Render company nodes */}
          {companies.map((company, index) => (
            <CompanyNode
              key={company.id}
              company={company}
              onPositionChange={(x, y) => onNodePositionChange(company.id, x, y)}
              onDragStart={(x, y) => handleDragStart(company.id, x, y)}
              onDragEnd={(targetId) => handleDragEnd(targetId)}
              initialX={company.x || (index * 150) + 100}
              initialY={company.y || (index * 100) + 100}
            />
          ))}

        {companies.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p>Upload company data to generate entities and start building your network</p>
          </div>
        )}
      </div>

        {showRelationshipCreator && (
          <RelationshipCreator
            onSubmit={handleRelationshipCreated}
            onCancel={() => {
              setShowRelationshipCreator(false);
              setPendingConnection(null);
            }}
          />
        )}
      </Card>
    </TooltipProvider>
  );
};
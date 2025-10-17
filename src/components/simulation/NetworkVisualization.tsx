import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Company, Relationship } from '@/pages/Simulation';
import { CompanyNode } from './CompanyNode';
import { RelationshipCreator } from './RelationshipCreator';

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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showRelationshipCreator, setShowRelationshipCreator] = useState(false);

  const handleNodeClick = (id: string) => {
    if (selectedNode === id) {
      setSelectedNode(null);
    } else if (selectedNode && selectedNode !== id) {
      setShowRelationshipCreator(true);
    } else {
      setSelectedNode(id);
    }
  };

  const handleRelationshipCreated = (label: string, strength: number) => {
    if (selectedNode) {
      const lastClickedNode = companies.find(c => c.id !== selectedNode)?.id;
      if (lastClickedNode) {
        onRelationshipCreate(selectedNode, lastClickedNode, label, strength);
      }
    }
    setSelectedNode(null);
    setShowRelationshipCreator(false);
  };

  return (
    <Card className="border-2 p-6 relative" style={{ height: '700px' }}>
      <h3 className="text-lg font-semibold mb-4">Network Visualization</h3>
      
      <div className="relative w-full h-[calc(100%-3rem)] bg-muted/20 rounded-lg overflow-hidden">
        <svg ref={svgRef} className="w-full h-full">
          {/* Draw relationships */}
          {relationships.map((rel) => {
            const source = companies.find(c => c.id === rel.source_company_id);
            const target = companies.find(c => c.id === rel.target_company_id);
            
            if (!source || !target) return null;

            const sourceX = source.x || 100;
            const sourceY = source.y || 100;
            const targetX = target.x || 200;
            const targetY = target.y || 200;

            return (
              <g key={rel.id}>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="hsl(0, 0%, 70%)"
                  strokeWidth={2 * rel.strength}
                  opacity={0.6}
                />
                <text
                  x={(sourceX + targetX) / 2}
                  y={(sourceY + targetY) / 2}
                  fontSize="12"
                  fill="hsl(0, 0%, 40%)"
                  textAnchor="middle"
                >
                  {rel.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Render company nodes */}
        {companies.map((company, index) => (
          <CompanyNode
            key={company.id}
            company={company}
            isSelected={selectedNode === company.id}
            onClick={() => handleNodeClick(company.id)}
            onPositionChange={(x, y) => onNodePositionChange(company.id, x, y)}
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
            setSelectedNode(null);
          }}
        />
      )}
    </Card>
  );
};
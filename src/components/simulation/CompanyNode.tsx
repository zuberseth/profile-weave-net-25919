import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Company } from '@/pages/Simulation';

interface CompanyNodeProps {
  company: Company;
  onPositionChange: (x: number, y: number) => void;
  onDragStart: (x: number, y: number) => void;
  onDragEnd: (targetId?: string) => void;
  initialX: number;
  initialY: number;
}

export const CompanyNode = ({ 
  company, 
  onPositionChange,
  onDragStart,
  onDragEnd,
  initialX,
  initialY 
}: CompanyNodeProps) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    if (e.shiftKey && nodeRef.current) {
      // Shift + click to create connection
      const rect = nodeRef.current.getBoundingClientRect();
      const parent = nodeRef.current.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const x = rect.left + rect.width / 2 - parentRect.left;
        const y = rect.top + rect.height / 2 - parentRect.top;
        setIsConnecting(true);
        onDragStart(x, y);
      }
    } else if (nodeRef.current) {
      // Regular drag to move
      const rect = nodeRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && nodeRef.current) {
      const parent = nodeRef.current.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const newX = e.clientX - parentRect.left - dragOffset.current.x;
        const newY = e.clientY - parentRect.top - dragOffset.current.y;
        setPosition({ x: newX, y: newY });
        onPositionChange(newX, newY);
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isConnecting) {
      // Check if we're over another node
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const targetNode = elements.find(el => 
        el.hasAttribute('data-company-id') && 
        el.getAttribute('data-company-id') !== company.id
      );
      
      if (targetNode) {
        const targetId = targetNode.getAttribute('data-company-id');
        onDragEnd(targetId || undefined);
      } else {
        onDragEnd();
      }
      setIsConnecting(false);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging || isConnecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isConnecting]);

  return (
    <div
      ref={nodeRef}
      data-company-id={company.id}
      className={`absolute cursor-move transition-transform ${
        isConnecting ? 'ring-2 ring-primary scale-105' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="p-4 w-48 bg-card hover:shadow-lg transition-shadow pointer-events-auto">
        <h4 className="font-semibold text-sm mb-2 truncate">{company.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-3">
          {company.who_they_are || 'Entity profile...'}
        </p>
        {company.market_position && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Position:</span> {company.market_position}
          </p>
        )}
        <p className="text-xs text-primary mt-2 italic">
          Hold Shift + drag to connect
        </p>
      </Card>
    </div>
  );
};

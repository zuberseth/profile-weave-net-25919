import { useState, useRef, useEffect } from 'react';
import { Company } from '@/pages/Simulation';
import { Card } from '@/components/ui/card';

interface CompanyNodeProps {
  company: Company;
  isSelected: boolean;
  onClick: () => void;
  onPositionChange: (x: number, y: number) => void;
  initialX: number;
  initialY: number;
}

export const CompanyNode = ({
  company,
  isSelected,
  onClick,
  onPositionChange,
  initialX,
  initialY,
}: CompanyNodeProps) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  useEffect(() => {
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

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onPositionChange]);

  return (
    <div
      ref={nodeRef}
      className="absolute cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <Card
        className={`p-4 w-48 transition-all ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
        }`}
      >
        <h4 className="font-semibold text-sm mb-2 truncate">{company.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-3">
          {company.who_they_are || 'Entity profile...'}
        </p>
        {company.market_position && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Position:</span> {company.market_position}
          </p>
        )}
      </Card>
    </div>
  );
};
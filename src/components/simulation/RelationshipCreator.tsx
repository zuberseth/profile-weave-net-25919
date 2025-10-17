import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface RelationshipCreatorProps {
  onSubmit: (label: string, strength: number) => void;
  onCancel: () => void;
}

export const RelationshipCreator = ({ onSubmit, onCancel }: RelationshipCreatorProps) => {
  const [label, setLabel] = useState('');
  const [strength, setStrength] = useState([0.5]);

  const handleSubmit = () => {
    if (label.trim()) {
      onSubmit(label, strength[0]);
    }
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Create Relationship</CardTitle>
          <CardDescription>Define the connection between selected companies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Relationship Label</Label>
            <Input
              id="label"
              placeholder="e.g. partner, competitor, supplier..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Strength: {strength[0].toFixed(2)}</Label>
            <Slider
              value={strength}
              onValueChange={setStrength}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!label.trim()}>
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
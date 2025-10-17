import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadSection } from '@/components/simulation/UploadSection';
import { NetworkVisualization } from '@/components/simulation/NetworkVisualization';
import { ProjectManager } from '@/components/simulation/ProjectManager';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  who_they_are?: string;
  goals?: string;
  risk_appetite?: string;
  market_position?: string;
  leadership_style?: string;
  x?: number;
  y?: number;
}

export interface Relationship {
  id: string;
  source_company_id: string;
  target_company_id: string;
  label: string;
  strength: number;
}

const Simulation = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleEntityGenerated = async (profile: any, rawData: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: profile.name,
          who_they_are: profile.who_they_are,
          goals: profile.goals,
          risk_appetite: profile.risk_appetite,
          market_position: profile.market_position,
          leadership_style: profile.leadership_style,
          raw_data_ref: rawData.substring(0, 500), // Store excerpt of raw data
        })
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => [...prev, { ...data, x: 100, y: 100 }]);
      
      toast({
        title: "Entity profile created",
        description: `${profile.name} has been added to the simulation.`,
      });
    } catch (error) {
      console.error('Error saving entity:', error);
      toast({
        title: "Error",
        description: "Failed to save entity profile.",
        variant: "destructive",
      });
    }
  };

  const handleNodePositionChange = (id: string, x: number, y: number) => {
    setCompanies(prev =>
      prev.map(c => (c.id === id ? { ...c, x, y } : c))
    );
  };

  const handleRelationshipCreate = async (
    sourceId: string,
    targetId: string,
    label: string,
    strength: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('relationships')
        .insert({
          source_company_id: sourceId,
          target_company_id: targetId,
          label,
          strength,
        })
        .select()
        .single();

      if (error) throw error;

      setRelationships(prev => [...prev, data]);
      
      toast({
        title: "Relationship created",
        description: `Link added between companies.`,
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
      toast({
        title: "Error",
        description: "Failed to create relationship.",
        variant: "destructive",
      });
    }
  };

  const handleLoadProject = (loadedCompanies: Company[], loadedRelationships: Relationship[]) => {
    setCompanies(loadedCompanies);
    setRelationships(loadedRelationships);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Parallel Simulation</h1>
          </div>
          
          <ProjectManager 
            companies={companies}
            relationships={relationships}
            onLoadProject={handleLoadProject}
          />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <UploadSection 
            onEntityGenerated={handleEntityGenerated}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </div>

        <div className="lg:col-span-2">
          <NetworkVisualization
            companies={companies}
            relationships={relationships}
            onNodePositionChange={handleNodePositionChange}
            onRelationshipCreate={handleRelationshipCreate}
          />
        </div>
      </div>
    </div>
  );
};

export default Simulation;
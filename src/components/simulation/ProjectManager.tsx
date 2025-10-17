import { useState } from 'react';
import { Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Company, Relationship } from '@/pages/Simulation';

interface ProjectManagerProps {
  companies: Company[];
  relationships: Relationship[];
  onLoadProject: (companies: Company[], relationships: Relationship[]) => void;
}

export const ProjectManager = ({ companies, relationships, onLoadProject }: ProjectManagerProps) => {
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const companyIds = companies.map(c => c.id);
      const relationshipIds = relationships.map(r => r.id);
      const layoutData = companies.reduce((acc, c) => {
        acc[c.id] = { x: c.x, y: c.y };
        return acc;
      }, {} as Record<string, { x?: number; y?: number }>);

      const { error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          company_ids: companyIds,
          relationship_ids: relationshipIds,
          layout_data: layoutData,
        });

      if (error) throw error;

      toast({
        title: "Project saved",
        description: `"${projectName}" has been saved successfully.`,
      });

      setProjectName('');
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project.",
        variant: "destructive",
      });
    }
  };

  const handleLoadDialogOpen = async () => {
    setIsLoadDialogOpen(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects.",
        variant: "destructive",
      });
    }
  };

  const handleLoadProject = async (project: any) => {
    try {
      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', project.company_ids);

      if (companiesError) throw companiesError;

      // Load relationships
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('relationships')
        .select('*')
        .in('id', project.relationship_ids);

      if (relationshipsError) throw relationshipsError;

      // Apply layout data
      const companiesWithLayout = (companiesData || []).map(c => ({
        ...c,
        x: project.layout_data?.[c.id]?.x,
        y: project.layout_data?.[c.id]?.y,
      }));

      onLoadProject(companiesWithLayout, relationshipsData || []);
      
      toast({
        title: "Project loaded",
        description: `"${project.name}" has been loaded successfully.`,
      });

      setIsLoadDialogOpen(false);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error",
        description: "Failed to load project.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Simulation Project</DialogTitle>
            <DialogDescription>
              Enter a name for your project to save the current state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Button onClick={handleSave} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleLoadDialogOpen}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Load Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Simulation Project</DialogTitle>
            <DialogDescription>
              Select a saved project to restore.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No saved projects found
              </p>
            ) : (
              projects.map((project) => (
                <Button
                  key={project.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleLoadProject(project)}
                >
                  <div className="text-left">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
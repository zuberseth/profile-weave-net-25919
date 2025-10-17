import { useState } from 'react';
import { Upload, FileText, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadSectionProps {
  onEntityGenerated: (profile: any, rawData: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const UploadSection = ({ onEntityGenerated, isGenerating, setIsGenerating }: UploadSectionProps) => {
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleGenerate = async () => {
    let companyData = '';

    if (file) {
      // Read file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        companyData = e.target?.result as string;
        await generateEntity(companyData);
      };
      reader.readAsText(file);
    } else if (textInput.trim()) {
      companyData = textInput;
      await generateEntity(companyData);
    } else if (urlInput.trim()) {
      companyData = `URL: ${urlInput}`;
      await generateEntity(companyData);
    } else {
      toast({
        title: "No data provided",
        description: "Please upload a file, enter text, or provide a URL.",
        variant: "destructive",
      });
    }
  };

  const generateEntity = async (companyData: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-entity', {
        body: { companyData },
      });

      if (error) throw error;

      onEntityGenerated(data.profile, companyData);
      
      // Reset inputs
      setTextInput('');
      setUrlInput('');
      setFile(null);
    } catch (error: any) {
      console.error('Error generating entity:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate entity profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Upload Company Data</CardTitle>
        <CardDescription>
          Provide company information to generate an AI entity profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">
              <Upload className="w-4 h-4 mr-2" />
              File
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="w-4 h-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, TXT, DOC, DOCX
                </p>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Enter company information, business description, or any relevant data..."
              className="min-h-[200px]"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <Input
              type="url"
              placeholder="https://company-website.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide a URL to company information, LinkedIn page, or website
            </p>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full mt-6"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Entity Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};
-- Create storage bucket for company data uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-uploads', 'company-uploads', false);

-- Create companies table for AI-generated entity profiles
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  who_they_are TEXT,
  goals TEXT,
  risk_appetite TEXT,
  market_position TEXT,
  leadership_style TEXT,
  raw_data_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationships table for company connections
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  target_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table for saving simulations
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_ids UUID[] DEFAULT '{}',
  relationship_ids UUID[] DEFAULT '{}',
  layout_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables (public access for now since no auth yet)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create public access policies (Phase 1 - no authentication)
CREATE POLICY "Allow public read on companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on companies" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on companies" ON public.companies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on companies" ON public.companies FOR DELETE USING (true);

CREATE POLICY "Allow public read on relationships" ON public.relationships FOR SELECT USING (true);
CREATE POLICY "Allow public insert on relationships" ON public.relationships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on relationships" ON public.relationships FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on relationships" ON public.relationships FOR DELETE USING (true);

CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on projects" ON public.projects FOR DELETE USING (true);

-- Storage policies for uploads
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-uploads');
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'company-uploads');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'company-uploads');
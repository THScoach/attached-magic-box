-- Create report schedules table
CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'custom')),
  next_generation_date TIMESTAMPTZ NOT NULL,
  last_generated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  email_delivery BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create generated reports table
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.report_schedules(id) ON DELETE SET NULL,
  report_url TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('manual', 'scheduled', 'automated')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for report_schedules
CREATE POLICY "Users can view own report schedules"
  ON public.report_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own report schedules"
  ON public.report_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own report schedules"
  ON public.report_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own report schedules"
  ON public.report_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for generated_reports
CREATE POLICY "Users can view own generated reports"
  ON public.generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generated reports"
  ON public.generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_report_schedules_user_id ON public.report_schedules(user_id);
CREATE INDEX idx_report_schedules_next_generation ON public.report_schedules(next_generation_date) WHERE is_active = true;
CREATE INDEX idx_generated_reports_user_id ON public.generated_reports(user_id);
CREATE INDEX idx_generated_reports_created_at ON public.generated_reports(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_report_schedules_updated_at
  BEFORE UPDATE ON public.report_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
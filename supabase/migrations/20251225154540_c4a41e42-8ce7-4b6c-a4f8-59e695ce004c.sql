-- Create storage bucket for templates
INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true);

-- Storage policies for templates bucket
CREATE POLICY "Users can view their own templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all templates"
ON storage.objects FOR SELECT
USING (bucket_id = 'templates' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'templates' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'templates' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates"
ON storage.objects FOR DELETE
USING (bucket_id = 'templates' AND public.has_role(auth.uid(), 'admin'));

-- Create user_templates table
CREATE TABLE public.user_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_templates
ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_templates
CREATE POLICY "Users can view their own templates"
ON public.user_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all templates"
ON public.user_templates FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert templates"
ON public.user_templates FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update templates"
ON public.user_templates FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete templates"
ON public.user_templates FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create template_requests table
CREATE TABLE public.template_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on template_requests
ALTER TABLE public.template_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for template_requests
CREATE POLICY "Users can view their own requests"
ON public.template_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
ON public.template_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.template_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
ON public.template_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on user_templates
CREATE TRIGGER update_user_templates_updated_at
BEFORE UPDATE ON public.user_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on template_requests
CREATE TRIGGER update_template_requests_updated_at
BEFORE UPDATE ON public.template_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
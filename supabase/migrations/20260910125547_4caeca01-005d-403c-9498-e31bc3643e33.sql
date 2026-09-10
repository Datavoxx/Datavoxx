CREATE TABLE public.showroom_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  selected_template TEXT,
  source TEXT NOT NULL DEFAULT 'showroom_interest',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  test_sent_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.showroom_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.showroom_requests TO authenticated;
GRANT ALL ON public.showroom_requests TO service_role;

ALTER TABLE public.showroom_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a showroom request"
  ON public.showroom_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners and admins can view showroom requests"
  ON public.showroom_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can update showroom requests"
  ON public.showroom_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_showroom_requests_updated_at
  BEFORE UPDATE ON public.showroom_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
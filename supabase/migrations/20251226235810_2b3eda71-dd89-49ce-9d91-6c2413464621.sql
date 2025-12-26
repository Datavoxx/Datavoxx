-- Allow gen_2+ users to upload logo requests to templates bucket
CREATE POLICY "Gen2+ users can upload logo requests" 
ON storage.objects 
FOR INSERT 
TO public 
WITH CHECK (
  bucket_id = 'templates' 
  AND (storage.foldername(name))[1] = 'logo-requests'
  AND public.has_role_level(auth.uid(), 'gen_2')
);
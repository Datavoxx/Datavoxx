-- Allow users to delete their own templates from user_templates table
CREATE POLICY "Users can delete their own templates"
ON public.user_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own template files from storage
CREATE POLICY "Users can delete their own template files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'templates' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Add additional_info column to prompts table
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS additional_info text;

-- Create storage bucket for prompt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for prompt images
CREATE POLICY "Anyone can view prompt images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-images');

CREATE POLICY "Authenticated users can upload prompt images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prompt-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own prompt images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'prompt-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own prompt images"
ON storage.objects FOR DELETE
USING (bucket_id = 'prompt-images' AND auth.uid()::text = (storage.foldername(name))[1]);
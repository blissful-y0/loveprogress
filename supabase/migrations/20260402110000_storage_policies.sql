-- Storage RLS 정책: images 버킷
-- 읽기: 누구나 (public bucket)
CREATE POLICY images_public_read ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- 업로드: 인증된 사용자만
CREATE POLICY images_auth_insert ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 삭제: 인증된 사용자만
CREATE POLICY images_auth_delete ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

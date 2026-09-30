-- Additive only. Apply to a test Supabase project before previewing live persistence.
ALTER TABLE public.booths
  ADD COLUMN row_label text,
  ADD COLUMN column_number integer,
  ADD COLUMN info_url text,
  ADD COLUMN author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.booths ADD CONSTRAINT booth_position_valid CHECK (
  (row_label IS NULL AND column_number IS NULL) OR
  (row_label IS NOT NULL AND column_number IS NOT NULL AND column_number >= 1 AND
    CASE row_label WHEN '거' THEN column_number <= 11 WHEN '위' THEN column_number <= 11
      WHEN '와' THEN column_number <= 7 WHEN '토' THEN column_number <= 3
      WHEN '끼' THEN column_number <= 8 ELSE false END)
);
CREATE UNIQUE INDEX booths_unique_position ON public.booths(row_label, column_number)
  WHERE row_label IS NOT NULL;
ALTER TABLE public.booths ADD CONSTRAINT booth_info_http CHECK (info_url IS NULL OR info_url ~* '^https?://');

CREATE OR REPLACE FUNCTION public.save_booth_promotion(p_id uuid, p_author uuid, p_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_author uuid; v_person jsonb; v_order integer := 1;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id=p_author AND role IN ('booth_member','admin')) THEN
    RAISE EXCEPTION 'Booth membership required' USING ERRCODE='42501';
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO public.booths(name, thumbnail_image_key, age_type, row_label, column_number, info_url, author_user_id)
    VALUES(p_data->>'name', p_data->>'thumbnailImageKey', (p_data->>'ageType')::public.booth_age_type,
      p_data->>'rowLabel', (p_data->>'columnNumber')::integer, p_data->>'infoUrl', p_author)
    RETURNING id INTO v_id;
  ELSE
    SELECT author_user_id INTO v_author FROM public.booths WHERE id=p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Booth not found' USING ERRCODE='P0002'; END IF;
    IF v_author IS DISTINCT FROM p_author THEN RAISE EXCEPTION 'Owner required' USING ERRCODE='42501'; END IF;
    UPDATE public.booths SET name=p_data->>'name', thumbnail_image_key=p_data->>'thumbnailImageKey',
      age_type=(p_data->>'ageType')::public.booth_age_type, row_label=p_data->>'rowLabel',
      column_number=(p_data->>'columnNumber')::integer, info_url=p_data->>'infoUrl' WHERE id=p_id;
    v_id := p_id;
    DELETE FROM public.booth_keywords WHERE booth_id=v_id;
    DELETE FROM public.booth_participants WHERE booth_id=v_id;
  END IF;
  INSERT INTO public.booth_keywords(booth_id,keyword)
    SELECT v_id, value::public.booth_keyword FROM jsonb_array_elements_text(p_data->'keywords');
  INSERT INTO public.booth_participants(booth_id,name,sns_url,role_order)
    VALUES(v_id,p_data->'owner'->>'name',p_data->'owner'->>'snsUrl',0);
  FOR v_person IN SELECT value FROM jsonb_array_elements(p_data->'participants') LOOP
    INSERT INTO public.booth_participants(booth_id,name,sns_url,role_order)
      VALUES(v_id,v_person->>'name',v_person->>'snsUrl',v_order);
    v_order := v_order+1;
  END LOOP;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.save_booth_promotion(uuid,uuid,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_booth_promotion(uuid,uuid,jsonb) TO service_role;
-- Existing booths deliberately remain unassigned. An admin must confirm their author and position.

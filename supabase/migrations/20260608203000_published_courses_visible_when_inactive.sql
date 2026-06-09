DROP POLICY IF EXISTS "Public read published cursos" ON public.cursos;

CREATE POLICY "Public read published cursos" ON public.cursos
  FOR SELECT USING (published_at IS NOT NULL);

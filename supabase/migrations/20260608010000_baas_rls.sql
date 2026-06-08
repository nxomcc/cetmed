-- Supabase BaaS security model for CETMED.
-- Public users can read published content and create leads.
-- Admin/editor access is controlled through Supabase Auth email + public.users.role.
-- Secrets for Getnet/Moodle stay in Edge Functions and use the service role.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.users
  WHERE lower(email) = lower(auth.jwt() ->> 'email')
    AND blocked = false
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() IN ('editor', 'admin-api')
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'admin-api'
$$;

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descuentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media" ON public.media
  FOR SELECT USING (true);
CREATE POLICY "Editors manage media" ON public.media
  FOR ALL USING (public.is_editor()) WITH CHECK (public.is_editor());

CREATE POLICY "Public read categorias" ON public.categorias
  FOR SELECT USING (true);
CREATE POLICY "Editors manage categorias" ON public.categorias
  FOR ALL USING (public.is_editor()) WITH CHECK (public.is_editor());

CREATE POLICY "Public read published cursos" ON public.cursos
  FOR SELECT USING (activo = true AND published_at IS NOT NULL);
CREATE POLICY "Editors read all cursos" ON public.cursos
  FOR SELECT USING (public.is_editor());
CREATE POLICY "Editors insert cursos" ON public.cursos
  FOR INSERT WITH CHECK (public.is_editor());
CREATE POLICY "Editors update cursos" ON public.cursos
  FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());
CREATE POLICY "Admins delete cursos" ON public.cursos
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Public read published noticias" ON public.noticias
  FOR SELECT USING (published_at IS NOT NULL);
CREATE POLICY "Editors read all noticias" ON public.noticias
  FOR SELECT USING (public.is_editor());
CREATE POLICY "Editors insert noticias" ON public.noticias
  FOR INSERT WITH CHECK (public.is_editor());
CREATE POLICY "Editors update noticias" ON public.noticias
  FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());
CREATE POLICY "Admins delete noticias" ON public.noticias
  FOR DELETE USING (public.is_admin());

CREATE POLICY "Public read active descuentos" ON public.descuentos
  FOR SELECT USING (activo = true);
CREATE POLICY "Editors manage descuentos" ON public.descuentos
  FOR ALL USING (public.is_editor()) WITH CHECK (public.is_editor());

CREATE POLICY "Editors read pedidos" ON public.pedidos
  FOR SELECT USING (public.is_editor());
CREATE POLICY "Editors update pedidos" ON public.pedidos
  FOR UPDATE USING (public.is_editor()) WITH CHECK (public.is_editor());

CREATE POLICY "Public insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Editors manage leads" ON public.leads
  FOR ALL USING (public.is_editor()) WITH CHECK (public.is_editor());

CREATE POLICY "Users read own profile" ON public.users
  FOR SELECT USING (lower(email) = lower(auth.jwt() ->> 'email') AND blocked = false);
CREATE POLICY "Admins manage users" ON public.users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage bucket policies. The bucket must exist in Storage as "cetmed".
CREATE POLICY "Public read CETMED assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'cetmed');
CREATE POLICY "Editors upload CETMED assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cetmed' AND public.is_editor());
CREATE POLICY "Editors update CETMED assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cetmed' AND public.is_editor()) WITH CHECK (bucket_id = 'cetmed' AND public.is_editor());
CREATE POLICY "Admins delete CETMED assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'cetmed' AND public.is_admin());

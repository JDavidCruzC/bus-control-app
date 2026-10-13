ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publico ve empresas activas" ON public.empresas FOR SELECT TO anon USING (activo IS DISTINCT FROM false);
CREATE POLICY "Gerentes gestionan su empresa" ON public.empresas FOR UPDATE TO authenticated
  USING (get_current_user_role() = 'gerente' AND id = get_current_user_empresa_id())
  WITH CHECK (get_current_user_role() = 'gerente' AND id = get_current_user_empresa_id());

CREATE POLICY "Cualquiera ve ajustes de mapa" ON public.configuraciones FOR SELECT TO anon, authenticated
  USING (clave IN ('map_default_lat','map_default_lng','map_default_zoom'));
CREATE POLICY "Usuarios ven ajustes de su empresa" ON public.configuraciones FOR SELECT TO authenticated
  USING (empresa_id IS NULL OR empresa_id = get_current_user_empresa_id());
CREATE POLICY "Gerentes gestionan ajustes de su empresa" ON public.configuraciones FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id())
  WITH CHECK (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id());
CREATE POLICY "Super admin gestiona ajustes" ON public.configuraciones FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
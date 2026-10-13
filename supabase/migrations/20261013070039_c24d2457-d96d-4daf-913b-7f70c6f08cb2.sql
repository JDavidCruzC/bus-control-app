ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gestiona usuarios" ON public.usuarios FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes gestionan usuarios de su empresa" ON public.usuarios FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id())
  WITH CHECK (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id());

CREATE POLICY "Super admin gestiona rutas" ON public.rutas FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes gestionan rutas de su empresa" ON public.rutas FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id())
  WITH CHECK (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id());

CREATE POLICY "Gerentes ven membresias de su empresa" ON public.membresias FOR SELECT TO authenticated
  USING (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id());
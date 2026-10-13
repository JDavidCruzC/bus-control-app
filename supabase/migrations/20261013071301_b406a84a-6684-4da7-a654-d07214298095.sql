ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver roles" ON public.roles FOR SELECT TO anon USING (true);
CREATE POLICY "Super admin gestiona roles" ON public.roles FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admin gestiona conductores" ON public.conductores FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes gestionan conductores de su empresa" ON public.conductores FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM usuarios u WHERE u.id = conductores.usuario_id AND u.empresa_id = get_current_user_empresa_id()))
  WITH CHECK (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM usuarios u WHERE u.id = conductores.usuario_id AND u.empresa_id = get_current_user_empresa_id()));

CREATE POLICY "Super admin gestiona vehiculos" ON public.vehiculos FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes gestionan vehiculos de su empresa" ON public.vehiculos FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id())
  WITH CHECK (get_current_user_role() = 'gerente' AND empresa_id = get_current_user_empresa_id());
CREATE POLICY "Publico ve buses de rutas publicadas" ON public.vehiculos FOR SELECT TO anon
  USING (activo AND EXISTS (SELECT 1 FROM rutas_publicas rp WHERE rp.ruta_id = vehiculos.ruta_id AND rp.visible_publico));
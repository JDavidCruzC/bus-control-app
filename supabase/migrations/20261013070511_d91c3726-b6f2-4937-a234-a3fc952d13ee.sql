ALTER FUNCTION public.create_simulated_buses_for_route() SECURITY DEFINER SET search_path = public;

ALTER TABLE public.recorridos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses_simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desvios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin gestiona recorridos" ON public.recorridos FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes ven recorridos de su empresa" ON public.recorridos FOR SELECT TO authenticated
  USING (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM vehiculos v WHERE v.id = recorridos.vehiculo_id AND v.empresa_id = get_current_user_empresa_id()));

CREATE POLICY "Super admin gestiona desvios" ON public.desvios FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes gestionan desvios de su empresa" ON public.desvios FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM recorridos r JOIN vehiculos v ON v.id = r.vehiculo_id WHERE r.id = desvios.recorrido_id AND v.empresa_id = get_current_user_empresa_id()))
  WITH CHECK (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM recorridos r JOIN vehiculos v ON v.id = r.vehiculo_id WHERE r.id = desvios.recorrido_id AND v.empresa_id = get_current_user_empresa_id()));

CREATE POLICY "Super admin gestiona buses simulados" ON public.buses_simulados FOR ALL TO authenticated
  USING (get_current_user_role() = 'super_admin') WITH CHECK (get_current_user_role() = 'super_admin');
CREATE POLICY "Gerentes gestionan buses simulados de su empresa" ON public.buses_simulados FOR ALL TO authenticated
  USING (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM rutas r WHERE r.id = buses_simulados.ruta_id AND r.empresa_id = get_current_user_empresa_id()))
  WITH CHECK (get_current_user_role() = 'gerente' AND EXISTS (SELECT 1 FROM rutas r WHERE r.id = buses_simulados.ruta_id AND r.empresa_id = get_current_user_empresa_id()));
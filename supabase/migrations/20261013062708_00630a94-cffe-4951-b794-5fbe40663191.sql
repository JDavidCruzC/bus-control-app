DROP POLICY IF EXISTS "Administradores pueden gestionar geometrías de rutas" ON public.rutas_geometria;
CREATE POLICY "Gestores pueden gestionar geometrías de rutas" ON public.rutas_geometria
FOR ALL TO authenticated
USING (
  (public.get_current_user_role() IN ('administrador','gerente') AND EXISTS (SELECT 1 FROM public.rutas r WHERE r.id = rutas_geometria.ruta_id AND r.empresa_id = public.get_current_user_empresa_id()))
  OR public.get_current_user_role() = 'super_admin'
)
WITH CHECK (
  (public.get_current_user_role() IN ('administrador','gerente') AND EXISTS (SELECT 1 FROM public.rutas r WHERE r.id = rutas_geometria.ruta_id AND r.empresa_id = public.get_current_user_empresa_id()))
  OR public.get_current_user_role() = 'super_admin'
);
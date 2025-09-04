-- Security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT r.nombre FROM public.roles r 
  JOIN public.usuarios u ON u.rol_id = r.id 
  WHERE u.id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Security definer function to get current user empresa_id
CREATE OR REPLACE FUNCTION public.get_current_user_empresa_id()
RETURNS UUID AS $$
  SELECT u.empresa_id FROM public.usuarios u 
  WHERE u.id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Empresas policies
CREATE POLICY "Usuarios pueden ver su propia empresa"
ON public.empresas FOR SELECT
USING (id = public.get_current_user_empresa_id());

CREATE POLICY "Administradores pueden actualizar su empresa"
ON public.empresas FOR UPDATE
USING (public.get_current_user_role() = 'administrador' AND id = public.get_current_user_empresa_id());

-- Roles policies (read-only for authenticated users)
CREATE POLICY "Usuarios autenticados pueden ver roles"
ON public.roles FOR SELECT
TO authenticated
USING (true);

-- Usuarios policies
CREATE POLICY "Usuarios pueden ver usuarios de su empresa"
ON public.usuarios FOR SELECT
USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden actualizar sus propios datos"
ON public.usuarios FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Administradores pueden insertar usuarios en su empresa"
ON public.usuarios FOR INSERT
WITH CHECK (public.get_current_user_role() = 'administrador' AND empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Administradores pueden actualizar usuarios de su empresa"
ON public.usuarios FOR UPDATE
USING (public.get_current_user_role() = 'administrador' AND empresa_id = public.get_current_user_empresa_id());

-- Rutas policies
CREATE POLICY "Todos pueden ver rutas activas"
ON public.rutas FOR SELECT
USING (activo = true);

CREATE POLICY "Administradores pueden gestionar rutas de su empresa"
ON public.rutas FOR ALL
USING (public.get_current_user_role() = 'administrador' AND empresa_id = public.get_current_user_empresa_id());

-- Paraderos policies
CREATE POLICY "Todos pueden ver paraderos activos"
ON public.paraderos FOR SELECT
USING (activo = true);

CREATE POLICY "Administradores pueden gestionar paraderos"
ON public.paraderos FOR ALL
USING (public.get_current_user_role() = 'administrador');

-- Rutas_paraderos policies
CREATE POLICY "Todos pueden ver rutas_paraderos"
ON public.rutas_paraderos FOR SELECT
USING (true);

CREATE POLICY "Administradores pueden gestionar rutas_paraderos"
ON public.rutas_paraderos FOR ALL
USING (public.get_current_user_role() = 'administrador');

-- Vehiculos policies
CREATE POLICY "Usuarios pueden ver vehiculos de su empresa"
ON public.vehiculos FOR SELECT
USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Administradores pueden gestionar vehiculos de su empresa"
ON public.vehiculos FOR ALL
USING (public.get_current_user_role() = 'administrador' AND empresa_id = public.get_current_user_empresa_id());

-- Conductores policies
CREATE POLICY "Conductores pueden ver sus propios datos"
ON public.conductores FOR SELECT
USING (usuario_id = auth.uid());

CREATE POLICY "Administradores pueden ver conductores de su empresa"
ON public.conductores FOR SELECT
USING (public.get_current_user_role() = 'administrador' AND 
       EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = usuario_id AND u.empresa_id = public.get_current_user_empresa_id()));

CREATE POLICY "Conductores pueden actualizar sus propios datos"
ON public.conductores FOR UPDATE
USING (usuario_id = auth.uid());

CREATE POLICY "Administradores pueden gestionar conductores de su empresa"
ON public.conductores FOR ALL
USING (public.get_current_user_role() = 'administrador' AND 
       EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = usuario_id AND u.empresa_id = public.get_current_user_empresa_id()));

-- Viajes policies
CREATE POLICY "Conductores pueden ver sus propios viajes"
ON public.viajes FOR SELECT
USING (EXISTS (SELECT 1 FROM public.conductores c WHERE c.id = conductor_id AND c.usuario_id = auth.uid()));

CREATE POLICY "Administradores pueden ver viajes de su empresa"
ON public.viajes FOR SELECT
USING (public.get_current_user_role() = 'administrador' AND 
       EXISTS (SELECT 1 FROM public.vehiculos v WHERE v.id = vehiculo_id AND v.empresa_id = public.get_current_user_empresa_id()));

CREATE POLICY "Conductores pueden actualizar sus propios viajes"
ON public.viajes FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.conductores c WHERE c.id = conductor_id AND c.usuario_id = auth.uid()));

CREATE POLICY "Administradores pueden gestionar viajes de su empresa"
ON public.viajes FOR ALL
USING (public.get_current_user_role() = 'administrador' AND 
       EXISTS (SELECT 1 FROM public.vehiculos v WHERE v.id = vehiculo_id AND v.empresa_id = public.get_current_user_empresa_id()));

-- Ubicaciones_tiempo_real policies
CREATE POLICY "Todos pueden ver ubicaciones en tiempo real"
ON public.ubicaciones_tiempo_real FOR SELECT
USING (true);

CREATE POLICY "Conductores pueden insertar sus propias ubicaciones"
ON public.ubicaciones_tiempo_real FOR INSERT
WITH CHECK (conductor_id IN (SELECT id FROM public.conductores WHERE usuario_id = auth.uid()));

CREATE POLICY "Conductores pueden actualizar sus propias ubicaciones"
ON public.ubicaciones_tiempo_real FOR UPDATE
USING (conductor_id IN (SELECT id FROM public.conductores WHERE usuario_id = auth.uid()));

-- Reportes policies
CREATE POLICY "Usuarios pueden crear reportes"
ON public.reportes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Conductores pueden ver sus propios reportes"
ON public.reportes FOR SELECT
USING (conductor_id IN (SELECT id FROM public.conductores WHERE usuario_id = auth.uid()));

CREATE POLICY "Administradores pueden ver todos los reportes de su empresa"
ON public.reportes FOR SELECT
USING (public.get_current_user_role() = 'administrador' AND 
       (conductor_id IN (SELECT c.id FROM public.conductores c 
                        JOIN public.usuarios u ON c.usuario_id = u.id 
                        WHERE u.empresa_id = public.get_current_user_empresa_id()) OR
        vehiculo_id IN (SELECT id FROM public.vehiculos WHERE empresa_id = public.get_current_user_empresa_id())));

CREATE POLICY "Administradores pueden gestionar reportes"
ON public.reportes FOR ALL
USING (public.get_current_user_role() = 'administrador');

-- Configuraciones policies
CREATE POLICY "Administradores pueden gestionar configuraciones de su empresa"
ON public.configuraciones FOR ALL
USING (public.get_current_user_role() = 'administrador' AND empresa_id = public.get_current_user_empresa_id());
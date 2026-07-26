-- =====================================================
-- FASE 1: CORRECCIONES DE SEGURIDAD CRÍTICAS
-- =====================================================

-- 1.1 CORREGIR VULNERABILIDAD DE ESCALACIÓN DE PRIVILEGIOS
-- Eliminar política peligrosa que permite cambiar rol_id
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios datos" ON public.usuarios;

-- Crear política restrictiva que previene cambios de rol_id y empresa_id
CREATE POLICY "Usuarios pueden actualizar datos limitados"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Prevenir cambio de rol
  rol_id = (SELECT rol_id FROM usuarios WHERE id = auth.uid()) AND
  -- Prevenir cambio de empresa
  empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
);

-- Política separada para que administradores gestionen usuarios (incluyendo roles)
CREATE POLICY "Admins pueden cambiar roles y empresa"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = 'administrador' AND
  empresa_id = get_current_user_empresa_id()
)
WITH CHECK (
  get_current_user_role() = 'administrador' AND
  empresa_id = get_current_user_empresa_id()
);

-- 1.2 PROTEGER DATOS PERSONALES DE EMPLEADOS
-- Crear función para verificar si el usuario puede ver PII
CREATE OR REPLACE FUNCTION public.can_view_employee_pii()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_current_user_role() IN ('administrador', 'super_admin');
$$;

-- Actualizar política SELECT de usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver usuarios de su empresa" ON public.usuarios;

-- Info básica para todos los usuarios de la empresa
CREATE POLICY "Ver info basica de colegas"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  empresa_id = get_current_user_empresa_id()
);

-- 1.3 RESTRINGIR ACCESO PÚBLICO A RUTAS
-- Eliminar acceso público a rutas
DROP POLICY IF EXISTS "Acceso publico limitado a rutas activas" ON public.rutas;

-- Eliminar acceso público a rutas_paraderos
DROP POLICY IF EXISTS "Acceso publico limitado a rutas_paraderos" ON public.rutas_paraderos;

-- Crear tabla para rutas que las empresas quieren hacer públicas
CREATE TABLE IF NOT EXISTS public.rutas_publicas (
  ruta_id UUID REFERENCES rutas(id) ON DELETE CASCADE,
  publicado_por UUID REFERENCES usuarios(id),
  visible_publico BOOLEAN DEFAULT false,
  fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (ruta_id)
);

ALTER TABLE public.rutas_publicas ENABLE ROW LEVEL SECURITY;

-- Política para que administradores gestionen visibilidad pública
CREATE POLICY "Admins pueden gestionar visibilidad publica"
ON public.rutas_publicas
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'administrador' AND
  EXISTS (
    SELECT 1 FROM rutas r
    WHERE r.id = rutas_publicas.ruta_id AND r.empresa_id = get_current_user_empresa_id()
  )
)
WITH CHECK (
  get_current_user_role() = 'administrador' AND
  EXISTS (
    SELECT 1 FROM rutas r
    WHERE r.id = rutas_publicas.ruta_id AND r.empresa_id = get_current_user_empresa_id()
  )
);

-- Permitir acceso anónimo solo a rutas explícitamente públicas
CREATE POLICY "Acceso publico a rutas autorizadas"
ON public.rutas
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.rutas_publicas rp
    WHERE rp.ruta_id = rutas.id AND rp.visible_publico = true
  )
);

-- Permitir acceso anónimo a paraderos de rutas públicas
CREATE POLICY "Acceso publico a paraderos de rutas autorizadas"
ON public.rutas_paraderos
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.rutas_publicas rp
    JOIN rutas r ON r.id = rp.ruta_id
    WHERE rp.ruta_id = rutas_paraderos.ruta_id 
    AND rp.visible_publico = true
    AND r.activo = true
  )
);

-- 1.4 ELIMINAR COLUMNA password_hash (NO DEBERÍA ESTAR AHÍ)
-- Las contraseñas se gestionan en auth.users, no en usuarios
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS password_hash;

-- 1.5 CORREGIR SEARCH PATH DE FUNCIONES SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT r.nombre FROM public.roles r 
  JOIN public.usuarios u ON u.rol_id = r.id 
  WHERE u.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_empresa_id()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.empresa_id FROM public.usuarios u 
  WHERE u.id = auth.uid();
$$;

-- Actualizar otras funciones security definer
CREATE OR REPLACE FUNCTION public.handle_new_client_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'user_type' = 'cliente' THEN
    INSERT INTO public.clientes (
      id, 
      email, 
      nombre, 
      apellido, 
      telefono, 
      cedula
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'nombre',
      NEW.raw_user_meta_data ->> 'apellido',
      NEW.raw_user_meta_data ->> 'telefono',
      NEW.raw_user_meta_data ->> 'cedula'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_employee_pii()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT get_current_user_role() IN ('administrador', 'super_admin');
$$;

-- 1.6 CREAR SISTEMA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins y super_admins pueden ver logs de auditoría
CREATE POLICY "Solo admins pueden ver audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('administrador', 'super_admin'));

-- Trigger para registrar cambios de rol
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.rol_id IS DISTINCT FROM NEW.rol_id THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'role_change',
      'usuarios',
      NEW.id,
      jsonb_build_object('rol_id', OLD.rol_id, 'nombre', OLD.nombre, 'email', OLD.email),
      jsonb_build_object('rol_id', NEW.rol_id, 'nombre', NEW.nombre, 'email', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_role_changes
AFTER UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION log_role_changes();

-- Trigger para registrar cambios de empresa
CREATE OR REPLACE FUNCTION public.log_empresa_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.empresa_id IS DISTINCT FROM NEW.empresa_id THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'empresa_change',
      'usuarios',
      NEW.id,
      jsonb_build_object('empresa_id', OLD.empresa_id, 'nombre', OLD.nombre, 'email', OLD.email),
      jsonb_build_object('empresa_id', NEW.empresa_id, 'nombre', NEW.nombre, 'email', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_empresa_changes
AFTER UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION log_empresa_changes();
-- Agregar el rol de cobrador
INSERT INTO public.roles (nombre, descripcion, permisos) 
VALUES (
  'cobrador',
  'Cobrador de autobús - Ayudante del conductor',
  '{"puede_ver_rutas": true, "puede_registrar_ubicacion": true, "puede_ver_viajes": true}'::jsonb
)
ON CONFLICT (nombre) DO NOTHING;
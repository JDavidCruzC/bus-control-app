-- Crear rol de gerente
INSERT INTO roles (nombre, descripcion, permisos) 
VALUES (
  'gerente', 
  'Dueño/Representante de la empresa con acceso completo',
  '{"manage_users": true, "manage_roles": true, "view_all": true, "access_admin": true, "manage_routes": true, "manage_vehicles": true, "manage_drivers": true}'::jsonb
)
ON CONFLICT (nombre) DO NOTHING;

-- Actualizar usuarios que crearon empresas para que sean gerentes
-- (usuarios que tienen empresa_id y actualmente son administradores)
UPDATE usuarios 
SET rol_id = (SELECT id FROM roles WHERE nombre = 'gerente')
WHERE empresa_id IS NOT NULL 
  AND rol_id = (SELECT id FROM roles WHERE nombre = 'administrador');

-- Agregar índice para mejorar búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
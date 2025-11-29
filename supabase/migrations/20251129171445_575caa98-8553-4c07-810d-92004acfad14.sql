-- Actualizar campos de autenticación del Super Admin con strings vacíos
UPDATE auth.users
SET 
  email_change = '',
  email_change_token_new = '',
  confirmation_token = '',
  recovery_token = ''
WHERE email = 'superadmin@sistema.com';
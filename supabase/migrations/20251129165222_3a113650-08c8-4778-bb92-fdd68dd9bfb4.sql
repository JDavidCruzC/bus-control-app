-- Arreglar el usuario super admin: cambiar campos vacíos a NULL
-- El error ocurre porque email_change debe ser NULL, no string vacío

UPDATE auth.users
SET 
  email_change = NULL,
  email_change_token_new = NULL,
  confirmation_token = NULL,
  recovery_token = NULL
WHERE email = 'superadmin@sistema.com';
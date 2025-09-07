-- Fix the auth.users table schema issue by updating missing columns
UPDATE auth.users 
SET 
  email_change = '',
  email_change_sent_at = NULL,
  email_change_confirm_status = 0,
  phone_change = '',
  phone_change_sent_at = NULL,
  phone_change_confirm_status = 0,
  confirmation_sent_at = created_at,
  recovery_sent_at = NULL,
  email_change_token_new = '',
  email_change_token_current = '',
  phone_change_token = '',
  last_sign_in_at = NULL,
  raw_app_meta_data = '{"provider":"email","providers":["email"]}',
  raw_user_meta_data = '{}',
  is_super_admin = false,
  role = 'authenticated',
  updated_at = now(),
  invited_at = NULL,
  confirmation_token = '',
  recovery_token = '',
  phone_confirmed_at = NULL,
  phone = NULL,
  aud = 'authenticated',
  instance_id = '00000000-0000-0000-0000-000000000000'
WHERE email = 'admin@sistema.com';
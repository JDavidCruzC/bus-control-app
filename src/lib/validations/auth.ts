import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'El correo es requerido' })
  .email({ message: 'Correo electrónico inválido' })
  .max(255, { message: 'El correo es demasiado largo' });

// Password validation schema with security requirements
export const passwordSchema = z
  .string()
  .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  .max(128, { message: 'La contraseña es demasiado larga' })
  .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' })
  .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' })
  .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' });

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

// Registration schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nombre: z
    .string()
    .trim()
    .min(1, { message: 'El nombre es requerido' })
    .max(100, { message: 'El nombre es demasiado largo' }),
  ruc: z
    .string()
    .trim()
    .min(1, { message: 'El RUC es requerido' })
    .max(20, { message: 'El RUC es demasiado largo' })
    .regex(/^[0-9-]+$/, { message: 'El RUC solo debe contener números y guiones' }),
  telefono: z
    .string()
    .trim()
    .min(1, { message: 'El teléfono es requerido' })
    .max(20, { message: 'El teléfono es demasiado largo' })
    .regex(/^[0-9+\s()-]+$/, { message: 'Formato de teléfono inválido' }),
});

// Conductor login schema
export const conductorLoginSchema = z.object({
  placa: z
    .string()
    .trim()
    .min(1, { message: 'La placa es requerida' })
    .max(20, { message: 'La placa es demasiado larga' })
    .regex(/^[A-Z0-9-]+$/i, { message: 'La placa solo debe contener letras, números y guiones' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type ConductorLoginInput = z.infer<typeof conductorLoginSchema>;

import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid'),
  password: z.string().min(1, 'Password diperlukan'),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, 'Nama lengkap diperlukan').max(100, 'Nama terlalu panjang'),
  email: z.string().trim().email('Email tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
});

// Profile validation schemas
export const profileNameSchema = z.object({
  fullName: z.string().trim().min(1, 'Nama lengkap diperlukan').max(100, 'Nama terlalu panjang'),
});

export const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama diperlukan'),
  newPassword: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password diperlukan'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

// Prompt validation schemas
export const promptSchema = z.object({
  title: z.string().trim().min(1, 'Judul diperlukan').max(200, 'Judul maksimal 200 karakter'),
  category: z.string().min(1, 'Kategori diperlukan'),
  fullPrompt: z.string().trim().min(10, 'Prompt minimal 10 karakter').max(50000, 'Prompt terlalu panjang'),
  imageUrl: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileNameFormData = z.infer<typeof profileNameSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type PromptFormData = z.infer<typeof promptSchema>;

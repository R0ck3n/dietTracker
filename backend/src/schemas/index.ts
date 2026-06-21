import { z } from 'zod';

export const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : YYYY-MM-DD');

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  username: z.string().trim().min(1, 'Identifiant requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const confirmPasswordSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
});

export const createJournalSchema = z.object({
  date: dateParamSchema,
});

export const updateJournalSchema = z.object({
  notes: z.string().nullable().optional(),
});

export const updateWeightSchema = z.object({
  weight: z.number().positive('Le poids doit être positif').nullable(),
});

export const updateHydrationSchema = z.object({
  hydrationLiters: z.number().min(0, 'L\'hydratation ne peut pas être négative').nullable(),
});

export const foodUnitSchema = z.enum(['g', 'ml']);

export const foodInputSchema = z.object({
  foodName: z.string().trim().min(1, 'Nom de l\'aliment requis'),
  weightGrams: z.number().positive('La quantité doit être positive'),
  caloriesPer100g: z.number().min(0, 'Les calories ne peuvent pas être négatives'),
  unit: foodUnitSchema,
});

export const activityInputSchema = z.object({
  activityName: z.string().trim().min(1, 'Nom de l\'activité requis'),
  durationMinutes: z.number().int().positive('La durée doit être positive'),
  caloriesBurned: z.number().min(0, 'Les calories ne peuvent pas être négatives'),
});

const isoDateTime = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Date/heure invalide');

export const sleepInterruptionSchema = z.object({
  startTime: isoDateTime,
  endTime: isoDateTime,
  comment: z.string().nullable().optional(),
});

export const sleepInputSchema = z.object({
  bedTime: isoDateTime,
  wakeTime: isoDateTime,
  comment: z.string().nullable().optional(),
  interruptions: z.array(sleepInterruptionSchema).optional().default([]),
});

export const statsQuerySchema = z.object({
  from: dateParamSchema,
  to: dateParamSchema,
});

export const idParamSchema = z.coerce.number().int().positive();

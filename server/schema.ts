import { z } from 'zod'
import { backgroundIds, colorMoodIds, cropIds, formatIds, intensityIds, styleIds, typeMoodIds } from './catalog.js'

export const generationConfigSchema = z.object({
  format: z.enum(formatIds),
  style: z.object({
    artStyle: z.enum(styleIds),
    crop: z.enum(cropIds),
    colorMood: z.enum(colorMoodIds),
    typeMood: z.enum(typeMoodIds),
    intensity: z.enum(intensityIds).default('balanced'),
    background: z.enum(backgroundIds).default('paper'),
  }).strict(),
  copy: z.object({
    name: z.string().trim().min(1).max(24),
    subtitle: z.string().trim().max(40).default(''),
    detail: z.string().trim().max(32).default(''),
    quote: z.string().trim().max(54).default(''),
  }).strict().optional(),
  variants: z.number().int().min(1).optional(),
}).strict()

export type GenerationConfig = z.infer<typeof generationConfigSchema>

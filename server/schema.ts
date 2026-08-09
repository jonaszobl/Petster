import { z } from 'zod'
import { colorMoodIds, cropIds, formatIds, styleIds, typeMoodIds } from './catalog.js'

export const generationConfigSchema = z.object({
  format: z.enum(formatIds),
  style: z.object({
    artStyle: z.enum(styleIds),
    crop: z.enum(cropIds),
    colorMood: z.enum(colorMoodIds),
    typeMood: z.enum(typeMoodIds),
  }).strict(),
  variants: z.number().int().min(1).optional(),
}).strict()

export type GenerationConfig = z.infer<typeof generationConfigSchema>

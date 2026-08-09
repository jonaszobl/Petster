import { styles } from './catalog.js'
import type { GenerationConfig } from './schema.js'

export function buildPrompt(config: GenerationConfig) {
  const profile = styles[config.style.artStyle]
  const crop = {
    close: 'a distinctly close head-and-shoulders portrait; the animal fills most of the lower subject area with strong presence',
    balanced: 'a balanced head-and-upper-body portrait with natural proportions and comfortable breathing room',
    spacious: 'a clearly spacious editorial portrait; the animal is smaller with generous calm negative space around it',
  }[config.style.crop]
  const colorMood = {
    original: 'use the style-defined palette exactly as specified',
    warm: 'make the palette visibly warmer with amber, ochre, terracotta and creamy highlights while keeping the animal recognizable',
    cool: 'make the palette visibly cooler with slate, blue-gray, eucalyptus and cool ivory while keeping the animal recognizable',
    mono: 'use a strictly refined monochrome interpretation in graphite gray, charcoal and warm paper white',
  }[config.style.colorMood]

  return [
    'TASK',
    'Create exactly ONE premium pet artwork on the full canvas, using the input photo only as the identity reference.',
    'This is the artwork layer of a poster. Typography is added later by the frontend.',
    '',
    'NON-NEGOTIABLE OUTPUT CONTRACT',
    '- One single artwork filling the entire canvas.',
    '- Show exactly one animal, once, as the only focal point.',
    '- Never create a collage, grid, contact sheet, diptych, split screen, thumbnails, frame or room mockup.',
    '- Never repeat the animal or any design element.',
    '- No text, letters, numbers, symbols, signature, logo or watermark.',
    '',
    'IDENTITY',
    'Preserve exact facial structure, expression, markings, eye color, nose, ears, fur pattern, fur color and natural proportions.',
    'Do not change the breed, invent accessories or add another animal.',
    '',
    'ART DIRECTION',
    `Style: ${profile.name}. Medium: ${profile.medium}.`,
    `Background: ${profile.backdrop}.`,
    `Palette: ${profile.palette}; ${colorMood}.`,
    `Composition: ${crop}.`,
    `Constraints: ${profile.constraints}.`,
    '',
    'LAYOUT',
    '- Keep the upper 30 percent visually quiet with only a simple continuation of the background.',
    '- Place the face and ears fully below the upper safe zone; the animal remains visually dominant.',
    '- Use restrained decoration and a calm gallery-quality composition.',
    '',
    'FINAL CHECK',
    'Artwork only. Absolutely no typography or pseudo-text anywhere in the image.',
  ].join('\n')
}

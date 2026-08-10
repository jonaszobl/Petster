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
  const intensity = {
    soft: 'Keep the artistic treatment delicate and restrained, close to the reference photo with subtle medium texture.',
    balanced: 'Use a clearly visible but natural artistic treatment with balanced detail, contrast and medium texture.',
    strong: 'Use a bold, unmistakable artistic treatment with pronounced medium texture and confident contrast while preserving identity.',
  }[config.style.intensity]
  const background = {
    paper: 'Use a calm, premium natural-paper background with subtle tactile grain.',
    studio: 'Use a soft studio vignette that clearly focuses attention on the animal.',
    wash: 'Use a restrained painterly color wash derived from the active palette.',
    arch: 'Place one clean, gallery-like architectural arch behind the animal without adding clutter.',
  }[config.style.background]
  const typographyComposition = {
    elegant: 'Integrate the supplied copy as a graceful editorial lockup using refined, highly legible serif typography, generous breathing room and one subtle hairline accent.',
    modern: 'Integrate the supplied copy as a clean asymmetrical editorial lockup using premium, highly legible sans-serif typography and one subtle visual anchor.',
    bold: 'Integrate the supplied copy as a confident but restrained typographic lockup using a premium geometric sans-serif; strong, never oversized.',
  }[config.style.typeMood]
  const copyLines = config.copy ? [
    `NAME=${JSON.stringify(config.copy.name)}`,
    ...(config.copy.subtitle ? [`SUBTITLE=${JSON.stringify(config.copy.subtitle)}`] : []),
    ...(config.copy.detail ? [`DETAIL=${JSON.stringify(config.copy.detail)}`] : []),
    ...(config.copy.quote ? [`QUOTE=${JSON.stringify(config.copy.quote)}`] : []),
  ] : []
  const typographyRules = config.copy ? [
    'EXACT COPY — RENDER VERBATIM',
    ...copyLines,
    '',
    'TYPOGRAPHY CONTRACT',
    '- Render every supplied value exactly once and exactly as quoted above.',
    '- Preserve the exact characters, capitalization, spaces, umlauts, accents and punctuation. Do not translate, correct, abbreviate or invent wording.',
    '- The NAME is the clear primary line. SUBTITLE, DETAIL and QUOTE are quieter supporting lines when supplied.',
    '- Use only the supplied copy. No logo, signature, edition number, watermark or additional pseudo-text.',
    `- ${typographyComposition}`,
    '- Typography must feel painted, printed or drawn into the same physical artwork while remaining crisp and immediately readable.',
    '- Keep all letters away from the animal, with safe margins on every edge. Never place text over the face, ears or body.',
  ] : [
    'TYPOGRAPHY CONTRACT',
    '- No copy was supplied. Do not render text, letters, numbers, signature, logo, watermark or pseudo-text.',
  ]

  return [
    'TASK',
    'Create exactly ONE premium pet artwork on the full canvas, using the input photo only as the identity reference.',
    'Create the complete finished poster, including the supplied typography as part of the generated composition.',
    '',
    'NON-NEGOTIABLE OUTPUT CONTRACT',
    '- One single artwork filling the entire canvas.',
    '- Show exactly one animal, once, as the only focal point.',
    '- Never create a collage, grid, contact sheet, diptych, split screen, thumbnails, frame or room mockup.',
    '- Never repeat the animal or any design element.',
    '- No text other than the exact supplied copy.',
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
    `Intensity: ${intensity}`,
    `Background treatment: ${background}`,
    `Constraints: ${profile.constraints}.`,
    '',
    ...typographyRules,
    '',
    'LAYOUT',
    '- Keep the upper 34 percent visually quiet, coherent with the artwork, and free of high-contrast subject details.',
    '- Use that area for the typographic lockup. It must feel intentionally composed, never like an empty white rectangle or a pasted-on label.',
    '- Place the eyes, face and ears fully below the title area; the animal remains visually dominant.',
    '- Allow restrained pigment, paper grain, studio tone or one subtle decorative gesture to continue behind the title area.',
    '- Use restrained decoration and a calm gallery-quality composition.',
    '',
    'FINAL CHECK',
    config.copy
      ? 'Complete poster with beautiful integrated typography. Before returning, compare every rendered character against the EXACT COPY block and fix any mismatch.'
      : 'Artwork only. Absolutely no typography or pseudo-text anywhere in the image.',
  ].join('\n')
}

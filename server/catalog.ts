export const formatIds = ['a4', 'a3', 'a2'] as const
export const styleIds = ['watercolor', 'classic-oil', 'modern-minimal', 'pop-color', 'pencil-sketch'] as const
export const cropIds = ['close', 'balanced', 'spacious'] as const
export const colorMoodIds = ['original', 'warm', 'cool', 'mono'] as const
export const typeMoodIds = ['elegant', 'modern', 'bold'] as const
export const intensityIds = ['soft', 'balanced', 'strong'] as const
export const backgroundIds = ['paper', 'studio', 'wash', 'arch'] as const

export type FormatId = typeof formatIds[number]
export type StyleId = typeof styleIds[number]
export type CropId = typeof cropIds[number]
export type ColorMoodId = typeof colorMoodIds[number]
export type TypeMoodId = typeof typeMoodIds[number]
export type IntensityId = typeof intensityIds[number]
export type BackgroundId = typeof backgroundIds[number]

export const formats: Record<FormatId, {
  name: string
  dimensions: string
  roomPreview: string
  outputSize: string
}> = {
  a4: { name: 'Kompakt', dimensions: 'A4 · 21 × 29,7 cm', roomPreview: '/assets/format-previews/a4-room-v1.webp', outputSize: '688x976' },
  a3: { name: 'Klassisch', dimensions: 'A3 · 29,7 × 42 cm', roomPreview: '/assets/format-previews/a3-room-v1.webp', outputSize: '688x976' },
  a2: { name: 'Statement', dimensions: 'A2 · 42 × 59,4 cm', roomPreview: '/assets/format-previews/a2-room-v1.webp', outputSize: '688x976' },
}

export const styles: Record<StyleId, {
  name: string
  preview: string
  medium: string
  backdrop: string
  palette: string
  constraints: string
}> = {
  watercolor: {
    name: 'Aquarell', preview: '/assets/style-previews/watercolor-v3.webp',
    medium: 'authentic hand-painted transparent watercolor with pigment blooms and fine facial detail',
    backdrop: 'warm white watercolor paper with restrained ochre and sage washes',
    palette: 'cream-gold, warm ochre, muted sage, paper white',
    constraints: 'preserve identity; no digital filter look; no hard vector edges',
  },
  'classic-oil': {
    name: 'Klassisches Ölportrait', preview: '/assets/style-previews/classic-oil-v3.webp',
    medium: 'museum-quality traditional oil painting on fine linen with controlled visible brushwork',
    backdrop: 'deep muted olive-brown painterly studio vignette',
    palette: 'cream-gold, umber, olive, muted ivory',
    constraints: 'preserve identity; no costume; no crown; no novelty portrait',
  },
  'modern-minimal': {
    name: 'Modern Minimal', preview: '/assets/style-previews/modern-minimal-v3.webp',
    medium: 'refined contemporary gouache illustration with simplified shapes and subtle paper grain',
    backdrop: 'warm ivory field with one restrained terracotta architectural shape',
    palette: 'ivory, sand, terracotta, cream-gold, charcoal brown',
    constraints: 'preserve facial recognition; no busy pattern; no photorealism',
  },
  'pop-color': {
    name: 'Pop Color', preview: '/assets/style-previews/pop-color-v3.webp',
    medium: 'premium contemporary screen-print pop illustration with subtle halftone grain',
    backdrop: 'crisp geometric color fields with strong intentional contrast',
    palette: 'coral, cobalt, warm yellow, cream-gold, deep navy',
    constraints: 'preserve identity; no named artist imitation; no speech bubbles',
  },
  'pencil-sketch': {
    name: 'Pencil Sketch', preview: '/assets/style-previews/pencil-sketch-v3.webp',
    medium: 'premium hand-drawn graphite pencil portrait with layered fine hatching, delicate fur strokes and confident dark accents around eyes and nose',
    backdrop: 'warm off-white heavyweight drawing paper with visible paper tooth and restrained graphite smudging',
    palette: 'graphite gray, charcoal, warm paper white, extremely subtle sepia warmth',
    constraints: 'preserve exact identity and anatomy; no photo-filter look; no colored paint; no cartoon outlines',
  },
}

export function publicCatalog() {
  return {
    formats: formatIds.map((id) => ({ id, ...formats[id] })),
    styles: styleIds.map((id) => ({ id, name: styles[id].name, preview: styles[id].preview })),
    customizing: {
      crops: cropIds,
      colorMoods: colorMoodIds,
      typeMoods: typeMoodIds,
      intensities: intensityIds,
      backgrounds: backgroundIds,
    },
  }
}

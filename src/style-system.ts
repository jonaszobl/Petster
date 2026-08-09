import sourceDog from './assets/style-previews-v2/golden-source.jpg'
import watercolor from './assets/style-previews-v2/watercolor-v3.webp'
import classicOil from './assets/style-previews-v2/classic-oil-v3.webp'
import modernMinimal from './assets/style-previews-v2/modern-minimal-v3.webp'
import popColor from './assets/style-previews-v2/pop-color-v3.webp'
import pencilSketch from './assets/style-previews-v2/pencil-sketch-v3.webp'

export type ArtStyleId = 'watercolor' | 'classic-oil' | 'modern-minimal' | 'pop-color' | 'pencil-sketch'
export type CropId = 'close' | 'balanced' | 'spacious'
export type ColorMoodId = 'original' | 'warm' | 'cool' | 'mono'
export type TypeMoodId = 'elegant' | 'modern' | 'bold'

export type StyleConfig = {
  artStyle: ArtStyleId
  crop: CropId
  colorMood: ColorMoodId
  typeMood: TypeMoodId
}

export type StyleDefinition = {
  id: ArtStyleId
  name: string
  shortName: string
  badge: string
  description: string
  bestFor: string
  image: string
  previewPalettes: Record<ColorMoodId, {
    colors: [string, string, string]
    filter: string
    overlay: string
  }>
  promptProfile: {
    medium: string
    backdrop: string
    palette: string
    constraints: string
  }
}

export const demoPet = sourceDog

export const artStyles: StyleDefinition[] = [
  {
    id: 'watercolor',
    name: 'Aquarell',
    shortName: 'Aquarell',
    badge: 'Beliebtester Allrounder',
    description: 'Weiche Pigmentverläufe, feine Gesichtszüge und viel Luft.',
    bestFor: 'Emotionale Geschenke & Erinnerungsstücke',
    image: watercolor,
    previewPalettes: {
      original: { colors: ['#d5a354', '#84906c', '#f2ecdf'], filter: 'saturate(1.04) contrast(1.02)', overlay: 'transparent' },
      warm: { colors: ['#d6843e', '#aa5b3e', '#f0d2a8'], filter: 'sepia(.3) saturate(1.28) brightness(1.03)', overlay: 'rgba(211,103,46,.08)' },
      cool: { colors: ['#73989a', '#596f86', '#e5eeec'], filter: 'hue-rotate(22deg) saturate(.76) brightness(1.04)', overlay: 'rgba(70,126,151,.1)' },
      mono: { colors: ['#444846', '#9d9d96', '#eeeae2'], filter: 'grayscale(1) contrast(1.08)', overlay: 'rgba(40,45,43,.04)' },
    },
    promptProfile: {
      medium: 'authentic hand-painted transparent watercolor with pigment blooms and fine facial detail',
      backdrop: 'warm white watercolor paper with restrained ochre and sage washes',
      palette: 'cream-gold, warm ochre, muted sage, paper white',
      constraints: 'preserve identity; no digital filter look; no hard vector edges',
    },
  },
  {
    id: 'classic-oil',
    name: 'Klassisches Ölportrait',
    shortName: 'Ölportrait',
    badge: 'Premium & zeitlos',
    description: 'Tiefe Farbtöne, sichtbare Pinselarbeit und ruhiges Studiolicht.',
    bestFor: 'Elegante Wohnräume & hochwertige Prints',
    image: classicOil,
    previewPalettes: {
      original: { colors: ['#b48a47', '#41452e', '#d9cfbc'], filter: 'saturate(1.03) contrast(1.05)', overlay: 'transparent' },
      warm: { colors: ['#b96838', '#713723', '#dbb67b'], filter: 'sepia(.28) saturate(1.3) brightness(1.03)', overlay: 'rgba(157,68,31,.1)' },
      cool: { colors: ['#657b83', '#343f4a', '#c8cfd0'], filter: 'hue-rotate(24deg) saturate(.72) brightness(1.04)', overlay: 'rgba(54,94,121,.12)' },
      mono: { colors: ['#30312f', '#777772', '#d6d0c6'], filter: 'grayscale(1) contrast(1.14)', overlay: 'rgba(20,22,21,.05)' },
    },
    promptProfile: {
      medium: 'museum-quality traditional oil painting on fine linen with controlled visible brushwork',
      backdrop: 'deep muted olive-brown painterly studio vignette',
      palette: 'cream-gold, umber, olive, muted ivory',
      constraints: 'preserve identity; no costume; no crown; no novelty portrait',
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    shortName: 'Minimal',
    badge: 'Moderner Wohntrend',
    description: 'Reduzierte Gouacheflächen, warme Naturtöne und klare Formen.',
    bestFor: 'Skandinavische & moderne Einrichtungen',
    image: modernMinimal,
    previewPalettes: {
      original: { colors: ['#d17c51', '#dfc394', '#f3e9d6'], filter: 'saturate(1.03) contrast(1.02)', overlay: 'transparent' },
      warm: { colors: ['#c75b3d', '#e5a458', '#f4d9b0'], filter: 'sepia(.24) saturate(1.25) brightness(1.03)', overlay: 'rgba(216,91,46,.09)' },
      cool: { colors: ['#648e92', '#9cb8ac', '#e9eee4'], filter: 'hue-rotate(25deg) saturate(.74) brightness(1.04)', overlay: 'rgba(64,130,143,.1)' },
      mono: { colors: ['#474946', '#a19f98', '#eeebe4'], filter: 'grayscale(1) contrast(1.08)', overlay: 'rgba(45,48,46,.04)' },
    },
    promptProfile: {
      medium: 'refined contemporary gouache illustration with simplified shapes and subtle paper grain',
      backdrop: 'warm ivory field with one restrained terracotta architectural shape',
      palette: 'ivory, sand, terracotta, cream-gold, charcoal brown',
      constraints: 'preserve facial recognition; no busy pattern; no photorealism',
    },
  },
  {
    id: 'pop-color',
    name: 'Pop Color',
    shortName: 'Pop Color',
    badge: 'Statement-Piece',
    description: 'Kräftige Farbflächen, Screenprint-Textur und hoher Kontrast.',
    bestFor: 'Verspielte Tiere & farbige Interieurs',
    image: popColor,
    previewPalettes: {
      original: { colors: ['#ef4d34', '#123f7d', '#f5b825'], filter: 'saturate(1.08) contrast(1.04)', overlay: 'transparent' },
      warm: { colors: ['#ed4b25', '#7e2737', '#f6bd37'], filter: 'sepia(.18) saturate(1.28) brightness(1.03)', overlay: 'rgba(230,78,28,.08)' },
      cool: { colors: ['#d34c84', '#164e98', '#40b4c5'], filter: 'hue-rotate(27deg) saturate(1.08) brightness(1.03)', overlay: 'rgba(39,99,173,.1)' },
      mono: { colors: ['#171c28', '#777a7d', '#eee9df'], filter: 'grayscale(1) contrast(1.18)', overlay: 'rgba(15,20,28,.05)' },
    },
    promptProfile: {
      medium: 'premium contemporary screen-print pop illustration with subtle halftone grain',
      backdrop: 'crisp geometric color fields with strong intentional contrast',
      palette: 'coral, cobalt, warm yellow, cream-gold, deep navy',
      constraints: 'preserve identity; no named artist imitation; no speech bubbles',
    },
  },
  {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    shortName: 'Bleistift',
    badge: 'Fein & persönlich',
    description: 'Feine Graphitlinien, natürliche Schraffur und echtes Papierkorn.',
    bestFor: 'Minimalistische Räume & persönliche Erinnerungen',
    image: pencilSketch,
    previewPalettes: {
      original: { colors: ['#3b3a37', '#8c8880', '#f0ece4'], filter: 'grayscale(.92) sepia(.08) contrast(1.07)', overlay: 'transparent' },
      warm: { colors: ['#594336', '#9a745b', '#f1dfc7'], filter: 'grayscale(.72) sepia(.42) saturate(.92) brightness(1.04)', overlay: 'rgba(157,100,61,.1)' },
      cool: { colors: ['#394752', '#788994', '#e5ebeb'], filter: 'grayscale(.7) hue-rotate(173deg) saturate(.55) brightness(1.04)', overlay: 'rgba(67,106,130,.12)' },
      mono: { colors: ['#20211f', '#74746f', '#f1efe9'], filter: 'grayscale(1) contrast(1.2)', overlay: 'rgba(25,27,26,.04)' },
    },
    promptProfile: {
      medium: 'premium hand-drawn graphite pencil portrait with layered fine hatching, delicate fur strokes, confident dark accents around eyes and nose, and subtle kneaded-eraser highlights',
      backdrop: 'warm off-white heavyweight drawing paper with visible paper tooth and only restrained graphite smudging',
      palette: 'graphite gray, charcoal, warm paper white, extremely subtle sepia warmth',
      constraints: 'preserve exact identity and natural anatomy; no photo-filter look; no colored paint; no cartoon outlines; chest may fade into unfinished pencil strokes',
    },
  },
]

export const cropOptions: Array<{ id: CropId; label: string; hint: string }> = [
  { id: 'close', label: 'Nah', hint: 'Maximale Präsenz' },
  { id: 'balanced', label: 'Ausgewogen', hint: 'Unser Favorit' },
  { id: 'spacious', label: 'Mit Raum', hint: 'Ruhig & elegant' },
]

export const colorMoodOptions: Array<{ id: ColorMoodId; label: string }> = [
  { id: 'original', label: 'Stil-Original' },
  { id: 'warm', label: 'Wärmer' },
  { id: 'cool', label: 'Kühler' },
  { id: 'mono', label: 'Monochrom' },
]

export const typeMoodOptions: Array<{ id: TypeMoodId; label: string; sample: string }> = [
  { id: 'elegant', label: 'Elegant', sample: 'Aa' },
  { id: 'modern', label: 'Modern', sample: 'Aa' },
  { id: 'bold', label: 'Markant', sample: 'AA' },
]

export function getStyleDefinition(id: ArtStyleId) {
  return artStyles.find((style) => style.id === id) ?? artStyles[0]
}

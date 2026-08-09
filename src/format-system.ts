import a4Room from './assets/format-previews/a4-room-v1.webp'
import a3Room from './assets/format-previews/a3-room-v1.webp'
import a2Room from './assets/format-previews/a2-room-v1.webp'

export type FormatId = 'a4' | 'a3' | 'a2'

export const formats: Array<{
  id: FormatId
  name: string
  size: string
  useCase: string
  roomPreview: string
}> = [
  { id: 'a4', name: 'Kompakt', size: 'A4 · 21 × 29,7 cm', useCase: 'Für Regal, Flur & kleine Wandflächen', roomPreview: a4Room },
  { id: 'a3', name: 'Klassisch', size: 'A3 · 29,7 × 42 cm', useCase: 'Der vielseitige Favorit fürs Wohnzimmer', roomPreview: a3Room },
  { id: 'a2', name: 'Statement', size: 'A2 · 42 × 59,4 cm', useCase: 'Für eine starke Wirkung über Sideboard & Sofa', roomPreview: a2Room },
]

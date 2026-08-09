import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPrompt } from './prompt.js'

test('keeps typography out of the generated artwork', () => {
  const prompt = buildPrompt({
    format: 'a2', variants: 4,
    style: { artStyle: 'pencil-sketch', crop: 'spacious', colorMood: 'mono', typeMood: 'modern' },
  })
  assert.match(prompt, /Pencil Sketch/)
  assert.match(prompt, /upper 30 percent visually quiet/)
  assert.match(prompt, /Absolutely no typography/)
  assert.doesNotMatch(prompt, /Luna|Golden Retriever/)
})

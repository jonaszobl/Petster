import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPrompt } from './prompt.js'

test('integrates supplied typography verbatim into the generated poster', () => {
  const prompt = buildPrompt({
    format: 'a2', variants: 2,
    style: {
      artStyle: 'pencil-sketch', crop: 'spacious', colorMood: 'mono', typeMood: 'modern',
      intensity: 'strong', background: 'arch',
    },
    copy: { name: 'Käthe', subtitle: 'Großer Schweizer Sennenhund', detail: '2018 · Wien', quote: 'Für immer bei mir.' },
  })
  assert.match(prompt, /Pencil Sketch/)
  assert.match(prompt, /upper 34 percent visually quiet/)
  assert.match(prompt, /clean asymmetrical editorial lockup/)
  assert.match(prompt, /NAME="Käthe"/)
  assert.match(prompt, /SUBTITLE="Großer Schweizer Sennenhund"/)
  assert.match(prompt, /DETAIL="2018 · Wien"/)
  assert.match(prompt, /QUOTE="Für immer bei mir\."/)
  assert.match(prompt, /compare every rendered character/)
  assert.match(prompt, /bold, unmistakable artistic treatment/)
  assert.match(prompt, /architectural arch/)
  assert.doesNotMatch(prompt, /Luna|Golden Retriever/)
})

test('forbids typography when no copy is supplied', () => {
  const prompt = buildPrompt({
    format: 'a4', variants: 1,
    style: { artStyle: 'watercolor', crop: 'balanced', colorMood: 'original', typeMood: 'elegant', intensity: 'soft', background: 'paper' },
  })
  assert.match(prompt, /No copy was supplied/)
  assert.match(prompt, /Absolutely no typography/)
})

import { describe, expect, it } from 'vitest'
import { createLocalProvider } from './localProvider'

describe('localProvider.translateHinglish', () => {
  const provider = createLocalProvider()

  it('prefers the longest matching phrase over a shorter substring match', async () => {
    const result = await provider.translateHinglish('kya baat hai, sab theek hai')
    expect(result.text).toBe('that is remarkable, everything is fine')
    expect(result.source).toBe('local')
  })

  it('leaves unknown words untouched', async () => {
    const result = await provider.translateHinglish('mujhe pizza chahiye')
    expect(result.text).toContain('pizza')
  })
})

describe('localProvider.continueThought', () => {
  const provider = createLocalProvider()

  it('always resolves with a non-empty local suggestion', async () => {
    const result = await provider.continueThought('I am feeling anxious about tomorrow.')
    expect(result.source).toBe('local')
    expect(result.text.length).toBeGreaterThan(0)
  })
})

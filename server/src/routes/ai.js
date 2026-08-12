import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createClaudeProvider } from '../lib/ai/claudeProvider.js'
import { translateHinglishViaGoogle } from '../lib/ai/googleTranslateProvider.js'
import { createLocalProvider } from '../lib/ai/localProvider.js'

export const aiRouter = Router()
aiRouter.use(requireAuth)

const localProvider = createLocalProvider()
const apiKey = process.env.ANTHROPIC_API_KEY || null

aiRouter.post('/continue', async (req, res) => {
  const { text, mood } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' })
  }

  if (apiKey) {
    try {
      return res.json(await createClaudeProvider(apiKey).continueThought(text, { mood }))
    } catch (err) {
      console.error('continueThought: Claude failed, falling back to local heuristic:', err.message)
    }
  }
  res.json(await localProvider.continueThought(text))
})

aiRouter.post('/translate', async (req, res) => {
  const { text } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' })
  }

  if (apiKey) {
    try {
      return res.json(await createClaudeProvider(apiKey).translateHinglish(text))
    } catch (err) {
      console.error('translateHinglish: Claude failed, falling back to Google:', err.message)
    }
  }

  try {
    const translated = await translateHinglishViaGoogle(text)
    return res.json({ text: translated, source: 'google' })
  } catch (err) {
    console.error('translateHinglish: Google fallback failed, using local dictionary:', err.message)
  }

  res.json(await localProvider.translateHinglish(text))
})

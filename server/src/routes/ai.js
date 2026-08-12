import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createClaudeProvider } from '../lib/ai/claudeProvider.js'
import { createGeminiProvider, listGeminiModels } from '../lib/ai/geminiProvider.js'
import { translateHinglishViaGoogle } from '../lib/ai/googleTranslateProvider.js'
import { translateHinglishViaGoogleCloud } from '../lib/ai/googleCloudTranslateProvider.js'
import { createLocalProvider } from '../lib/ai/localProvider.js'

export const aiRouter = Router()
aiRouter.use(requireAuth)

const localProvider = createLocalProvider()
const apiKey = process.env.ANTHROPIC_API_KEY || null
const geminiApiKey = process.env.GEMINI_API_KEY || null
const googleCloudApiKey = process.env.GOOGLE_TRANSLATE_API_KEY || null

aiRouter.get('/status', async (req, res) => {
  const status = {}

  status.claude = { configured: Boolean(apiKey) }
  if (apiKey) {
    try {
      await createClaudeProvider(apiKey).translateHinglish('test')
      status.claude.ok = true
    } catch (err) {
      status.claude.ok = false
      status.claude.error = err.message
    }
  }

  status.gemini = { configured: Boolean(geminiApiKey) }
  if (geminiApiKey) {
    try {
      await createGeminiProvider(geminiApiKey).translateHinglish('test')
      status.gemini.ok = true
    } catch (err) {
      status.gemini.ok = false
      status.gemini.error = err.message
      status.gemini.availableModels = await listGeminiModels(geminiApiKey)
    }
  }

  status.googleCloudTranslate = { configured: Boolean(googleCloudApiKey) }
  if (googleCloudApiKey) {
    try {
      await translateHinglishViaGoogleCloud('test', googleCloudApiKey)
      status.googleCloudTranslate.ok = true
    } catch (err) {
      status.googleCloudTranslate.ok = false
      status.googleCloudTranslate.error = err.message
    }
  }

  res.json(status)
})

aiRouter.post('/continue', async (req, res) => {
  const { text, mood } = req.body ?? {}
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required.' })
  }

  if (apiKey) {
    try {
      return res.json(await createClaudeProvider(apiKey).continueThought(text, { mood }))
    } catch (err) {
      console.error('continueThought: Claude failed, falling back:', err.message)
    }
  }

  if (geminiApiKey) {
    try {
      return res.json(await createGeminiProvider(geminiApiKey).continueThought(text, { mood }))
    } catch (err) {
      console.error('continueThought: Gemini failed, falling back to local heuristic:', err.message)
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
      console.error('translateHinglish: Claude failed, falling back:', err.message)
    }
  }

  if (geminiApiKey) {
    try {
      return res.json(await createGeminiProvider(geminiApiKey).translateHinglish(text))
    } catch (err) {
      console.error('translateHinglish: Gemini failed, falling back:', err.message)
    }
  }

  if (googleCloudApiKey) {
    try {
      const translated = await translateHinglishViaGoogleCloud(text, googleCloudApiKey)
      return res.json({ text: translated, source: 'google' })
    } catch (err) {
      console.error('translateHinglish: Google Cloud Translate failed, falling back:', err.message)
    }
  }

  try {
    const translated = await translateHinglishViaGoogle(text)
    return res.json({ text: translated, source: 'google' })
  } catch (err) {
    console.error('translateHinglish: unofficial Google fallback failed, using local dictionary:', err.message)
  }

  res.json(await localProvider.translateHinglish(text))
})

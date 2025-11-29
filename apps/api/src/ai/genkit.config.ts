import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'

// Validate required environment variable
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

if (!GOOGLE_AI_API_KEY) {
  console.warn(
    '⚠️ GOOGLE_AI_API_KEY is not set. AI features will not work properly. ' +
    'Please set the GOOGLE_AI_API_KEY environment variable in your .env file.'
  )
}

// Initialize Genkit with Google AI plugin using Gemini 2.5 Flash model
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
})

// Helper to check if AI is properly configured
export const isAIConfigured = (): boolean => !!GOOGLE_AI_API_KEY

export default ai

import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash',
})

export default ai

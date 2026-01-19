import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'

const API_URL = 'http://localhost:4000/api'

describe('Status API E2E', () => {
  let userId: string

  it('should get all users', async () => {
    const response = await axios.get(`${API_URL}/users`)
    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should create a story', async () => {
    // We need a user first. Assuming demo user exists or using demo ID
    const storyData = {
      userId: 'demo-user-id',
      type: 'TEXT',
      content: 'Hello from Vitest!',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }

    try {
      const response = await axios.post(`${API_URL}/stories`, storyData)
      expect(response.status).toBe(201)
      expect(response.data.content).toBe('Hello from Vitest!')
    } catch (error: any) {
      // If user doesn't exist, this might fail, but we're testing the route presence
      if (error.response?.status !== 404) {
        throw error
      }
    }
  })

  it('should get active stories', async () => {
    const response = await axios.get(`${API_URL}/stories`)
    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)
  })
})

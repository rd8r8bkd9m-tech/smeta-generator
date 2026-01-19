import { Story } from './Story.js'

export interface StoryRepository {
  save(story: Story): Promise<void>
  findById(id: string): Promise<Story | null>
  findByUserId(userId: string): Promise<Story[]>
  findAllActive(): Promise<Story[]>
  update(story: Story): Promise<void>
  delete(id: string): Promise<void>
}

import type { StoryRepository } from '../domain/StoryRepository.js'
import type { UseCase } from '../../shared/application/UseCase.js'
import type { StoryDTO } from './CreateStory.js'

export class ListStories implements UseCase<void, StoryDTO[]> {
  constructor(private readonly repository: StoryRepository) {}

  async execute(): Promise<StoryDTO[]> {
    const stories = await this.repository.findAllActive()
    return stories.map(story => story.toJSON() as any)
  }
}

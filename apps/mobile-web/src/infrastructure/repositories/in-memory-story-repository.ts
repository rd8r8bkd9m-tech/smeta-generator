import { StoryRepository } from '../../domain/repositories/story-repository';
import { Story, StoryReaction } from '../../domain/entities/story';

export class InMemoryStoryRepository implements StoryRepository {
  private stories = new Map<string, Story>();
  private reactions = new Map<string, StoryReaction[]>();

  async save(story: Story): Promise<void> {
    this.stories.set(story.id, story);
  }

  async findById(id: string): Promise<Story | null> {
    return this.stories.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(story => story.userId === userId);
  }

  async findActiveByUserId(userId: string): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(
      story => story.userId === userId && story.isActive()
    );
  }

  async findExpiredStories(): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(story => story.isExpired());
  }

  async findAllActive(): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(story => story.isActive());
  }

  async findByIds(ids: string[]): Promise<Story[]> {
    const stories: Story[] = [];
    for (const id of ids) {
      const story = this.stories.get(id);
      if (story) {
        stories.push(story);
      }
    }
    return stories;
  }

  async update(story: Story): Promise<void> {
    if (!this.stories.has(story.id)) {
      throw new Error('Story not found');
    }
    this.stories.set(story.id, story);
  }

  async delete(id: string): Promise<void> {
    this.stories.delete(id);
    this.reactions.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.stories.has(id);
  }

  // Reactions
  async saveReaction(reaction: StoryReaction): Promise<void> {
    const storyReactions = this.reactions.get(reaction.storyId) || [];
    storyReactions.push(reaction);
    this.reactions.set(reaction.storyId, storyReactions);
  }

  async findReactionsByStoryId(storyId: string): Promise<StoryReaction[]> {
    return this.reactions.get(storyId) || [];
  }

  async deleteReaction(storyId: string, userId: string): Promise<void> {
    const storyReactions = this.reactions.get(storyId) || [];
    const filteredReactions = storyReactions.filter(r => r.userId !== userId);
    this.reactions.set(storyId, filteredReactions);
  }

  // Statistics
  async countByUserId(userId: string): Promise<number> {
    return Array.from(this.stories.values()).filter(story => story.userId === userId).length;
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return Array.from(this.stories.values()).filter(
      story => story.userId === userId && story.isActive()
    ).length;
  }

  async getTotalViewsByUserId(userId: string): Promise<number> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId)
      .reduce((total, story) => total + story.viewsCount, 0);
  }

  async getTotalReactionsByUserId(userId: string): Promise<number> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId)
      .reduce((total, story) => total + story.reactionsCount, 0);
  }

  // Utility methods for testing
  clear(): void {
    this.stories.clear();
    this.reactions.clear();
  }

  seedTestData(stories: Story[]): void {
    for (const story of stories) {
      this.stories.set(story.id, story);
    }
  }
}
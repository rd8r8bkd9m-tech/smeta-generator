import { Story, StoryType, StoryStatus, StoryReaction } from '../entities/story';

export interface StoryRepository {
  save(story: Story): Promise<void>;
  findById(id: string): Promise<Story | null>;
  findByUserId(userId: string): Promise<Story[]>;
  findActiveByUserId(userId: string): Promise<Story[]>;
  findExpiredStories(): Promise<Story[]>;
  findAllActive(): Promise<Story[]>;
  findByIds(ids: string[]): Promise<Story[]>;
  update(story: Story): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;

  // Reactions
  saveReaction(reaction: StoryReaction): Promise<void>;
  findReactionsByStoryId(storyId: string): Promise<StoryReaction[]>;
  deleteReaction(storyId: string, userId: string): Promise<void>;

  // Statistics
  countByUserId(userId: string): Promise<number>;
  countActiveByUserId(userId: string): Promise<number>;
  getTotalViewsByUserId(userId: string): Promise<number>;
  getTotalReactionsByUserId(userId: string): Promise<number>;
}
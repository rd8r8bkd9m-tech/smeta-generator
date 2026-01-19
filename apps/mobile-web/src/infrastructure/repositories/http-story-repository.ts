import { StoryRepository } from '../../domain/repositories/story-repository';
import { Story, StoryReaction } from '../../domain/entities/story';
import { apiClient } from '../services/api-client';

export class HttpStoryRepository implements StoryRepository {
  async save(story: Story): Promise<void> {
    const props = story.toJSON();
    await apiClient.post('/stories', props);
  }

  async findById(id: string): Promise<Story | null> {
    try {
      const response = await apiClient.get(`/stories/${id}`);
      return this.mapToDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Story[]> {
    const response = await apiClient.get('/stories', {
      params: { userId }
    });
    return response.data.map(this.mapToDomain);
  }

  async findActiveByUserId(userId: string): Promise<Story[]> {
    const response = await apiClient.get('/stories', {
      params: { userId, activeOnly: true }
    });
    return response.data.map(this.mapToDomain);
  }

  async findExpiredStories(): Promise<Story[]> {
    const response = await apiClient.get('/stories', {
      params: { expiredOnly: true }
    });
    return response.data.map(this.mapToDomain);
  }

  async findAllActive(): Promise<Story[]> {
    const response = await apiClient.get('/stories');
    return response.data.map(this.mapToDomain);
  }

  async findByIds(ids: string[]): Promise<Story[]> {
    const response = await apiClient.get('/stories', {
      params: { ids: ids.join(',') }
    });
    return response.data.map(this.mapToDomain);
  }

  async update(story: Story): Promise<void> {
    const props = story.toJSON();
    await apiClient.put(`/stories/${story.id}`, props);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/stories/${id}`);
  }

  async exists(id: string): Promise<boolean> {
    const story = await this.findById(id);
    return story !== null;
  }

  // Reactions
  async saveReaction(reaction: StoryReaction): Promise<void> {
    await apiClient.post(`/stories/${reaction.storyId}/reactions`, {
      userId: reaction.userId,
      type: reaction.type
    });
  }

  async findReactionsByStoryId(storyId: string): Promise<StoryReaction[]> {
    const response = await apiClient.get(`/stories/${storyId}/reactions`);
    return response.data.map((r: any) => new StoryReaction(r.id, r.userId, r.type, new Date(r.createdAt)));
  }

  async deleteReaction(storyId: string, userId: string): Promise<void> {
    await apiClient.delete(`/stories/${storyId}/reactions/${userId}`);
  }

  // Statistics
  async countByUserId(userId: string): Promise<number> {
    const response = await apiClient.get(`/stories/count/${userId}`);
    return response.data.count;
  }

  async countActiveByUserId(userId: string): Promise<number> {
    const response = await apiClient.get(`/stories/count/${userId}`, {
      params: { activeOnly: true }
    });
    return response.data.count;
  }

  async getTotalViewsByUserId(userId: string): Promise<number> {
    const response = await apiClient.get(`/stories/stats/${userId}/views`);
    return response.data.total;
  }

  async getTotalReactionsByUserId(userId: string): Promise<number> {
    const response = await apiClient.get(`/stories/stats/${userId}/reactions`);
    return response.data.total;
  }

  private mapToDomain(data: any): Story {
    return new Story(
      data.id,
      data.userId,
      data.type as any,
      data.content,
      new Date(data.expiresAt),
      data.background,
      data.status as any,
      data.viewsCount,
      (data.reactions || []).map((r: any) => new StoryReaction(r.id, r.userId, r.type, new Date(r.createdAt))),
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}

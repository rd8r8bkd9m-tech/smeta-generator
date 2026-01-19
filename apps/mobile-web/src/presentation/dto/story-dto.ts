import { StoryType } from '../../domain/entities/story';

export interface CreateStoryRequest {
  type: StoryType;
  content: string;
  background?: string;
}

export interface ViewStoryRequest {
  storyId: string;
}

export interface AddReactionRequest {
  storyId: string;
  reactionType: string;
}

export interface StoryResponse {
  id: string;
  userId: string;
  type: StoryType;
  content: string;
  background?: string;
  status: string;
  expiresAt: string;
  viewsCount: number;
  reactionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryWithReactionsResponse extends StoryResponse {
  reactions: StoryReactionResponse[];
  hasUserReacted: boolean;
  userReaction?: StoryReactionResponse;
}

export interface StoryReactionResponse {
  id: string;
  userId: string;
  type: string;
  createdAt: string;
}

export interface StoriesListResponse {
  stories: StoryResponse[];
  total: number;
  hasMore: boolean;
}

export interface FeedStoriesResponse {
  stories: StoryWithReactionsResponse[];
  total: number;
  hasMore: boolean;
}
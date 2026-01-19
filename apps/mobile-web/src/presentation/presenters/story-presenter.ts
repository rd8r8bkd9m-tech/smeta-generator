import { Story, StoryReaction } from '../../domain/entities/story';
import { StoryResponse, StoryWithReactionsResponse, StoryReactionResponse } from '../dto/story-dto';

export class StoryPresenter {
  static toResponse(story: Story): StoryResponse {
    return {
      id: story.id,
      userId: story.userId,
      type: story.type,
      content: story.content,
      background: story.background,
      status: story.status,
      expiresAt: story.expiresAt.toISOString(),
      viewsCount: story.viewsCount,
      reactionsCount: story.reactionsCount,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    };
  }

  static toResponseWithReactions(
    story: Story,
    reactions: StoryReaction[],
    currentUserId: string
  ): StoryWithReactionsResponse {
    const baseResponse = this.toResponse(story);
    const userReaction = story.getUserReaction(currentUserId);

    return {
      ...baseResponse,
      reactions: reactions.map(this.reactionToResponse),
      hasUserReacted: story.hasUserReacted(currentUserId),
      userReaction: userReaction ? this.reactionToResponse(userReaction) : undefined,
    };
  }

  static reactionToResponse(reaction: StoryReaction): StoryReactionResponse {
    return {
      id: reaction.id,
      userId: reaction.userId,
      type: reaction.type,
      createdAt: reaction.createdAt.toISOString(),
    };
  }
}
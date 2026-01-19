import { User } from '../../domain/entities/user';
import { UserResponse, UserStatsResponse } from '../dto/user-dto';

export class UserPresenter {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: {
        firstName: user.name.firstName,
        lastName: user.name.lastName,
        fullName: user.name.fullName,
        displayName: user.name.displayName,
      },
      phoneNumber: user.phoneNumber.value,
      avatarUrl: user.avatarUrl?.value,
      username: user.username,
      status: user.status,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt?.toISOString(),
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toStatsResponse(
    totalStories: number,
    activeStories: number,
    totalViews: number,
    totalReactions: number
  ): UserStatsResponse {
    return {
      totalStories,
      activeStories,
      totalViews,
      totalReactions,
    };
  }
}
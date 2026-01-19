export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl?: string;
  username?: string;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: string;
  name: {
    firstName: string;
    lastName: string;
    fullName: string;
    displayName: string;
  };
  phoneNumber: string;
  avatarUrl?: string;
  username?: string;
  status: string;
  isOnline: boolean;
  lastSeenAt?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResponse {
  users: UserResponse[];
  total: number;
  hasMore: boolean;
}

export interface UserStatsResponse {
  totalStories: number;
  activeStories: number;
  totalViews: number;
  totalReactions: number;
}
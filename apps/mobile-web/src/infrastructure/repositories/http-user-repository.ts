import { UserRepository } from '../../domain/repositories/user-repository';
import { User, UserName, PhoneNumber, AvatarUrl } from '../../domain/entities/user';
import { apiClient } from '../services/api-client';

export class HttpUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    const props = user.toJSON();
    await apiClient.post('/users', props);
  }

  async findById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return this.mapToDomain(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<User | null> {
    try {
      const response = await apiClient.get('/users', {
        params: { phoneNumber: phoneNumber.value }
      });
      const users = response.data;
      return users.length > 0 ? this.mapToDomain(users[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const response = await apiClient.get('/users', {
        params: { username }
      });
      const users = response.data;
      return users.length > 0 ? this.mapToDomain(users[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data.map(this.mapToDomain);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    // In a real app, this would be a specific bulk endpoint
    const response = await apiClient.get('/users', {
      params: { ids: ids.join(',') }
    });
    return response.data.map(this.mapToDomain);
  }

  async findOnlineUsers(): Promise<User[]> {
    const response = await apiClient.get('/users', {
      params: { onlineOnly: true }
    });
    return response.data.map(this.mapToDomain);
  }

  async update(user: User): Promise<void> {
    const props = user.toJSON();
    await apiClient.put(`/users/${user.id}`, props);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  async count(): Promise<number> {
    const response = await apiClient.get('/users/count');
    return response.data.count;
  }

  private mapToDomain(data: any): User {
    return new User(
      data.id,
      new UserName(data.name.split(' ')[0] || '', data.name.split(' ')[1] || ''),
      new PhoneNumber(data.phoneNumber || '+7 (999) 000-00-00'),
      data.avatar ? new AvatarUrl(data.avatar) : undefined,
      data.username,
      data.status as any,
      data.isOnline,
      data.lastSeenAt ? new Date(data.lastSeenAt) : undefined,
      data.bio,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
}

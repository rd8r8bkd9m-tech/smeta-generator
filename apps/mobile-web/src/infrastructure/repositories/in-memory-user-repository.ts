import { UserRepository } from '../../domain/repositories/user-repository';
import { User } from '../../domain/entities/user';
import { PhoneNumber } from '../../domain/value-objects/phone-number';

export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.phoneNumber.equals(phoneNumber)) {
        return user;
      }
    }
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users: User[] = [];
    for (const id of ids) {
      const user = this.users.get(id);
      if (user) {
        users.push(user);
      }
    }
    return users;
  }

  async findOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isOnline);
  }

  async update(user: User): Promise<void> {
    if (!this.users.has(user.id)) {
      throw new Error('User not found');
    }
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  // Utility method for testing
  clear(): void {
    this.users.clear();
  }
}
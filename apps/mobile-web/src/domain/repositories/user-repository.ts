import { User, UserStatus } from '../entities/user';
import { PhoneNumber } from '../value-objects/phone-number';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: PhoneNumber): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByIds(ids: string[]): Promise<User[]>;
  findOnlineUsers(): Promise<User[]>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}
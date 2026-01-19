import { AggregateRoot } from '../../shared/kernel/base-entity';
import { UserName } from '../value-objects/user-name';
import { PhoneNumber } from '../value-objects/phone-number';
import { AvatarUrl } from '../value-objects/avatar-url';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export class User extends AggregateRoot {
  private _name: UserName;
  private _phoneNumber: PhoneNumber;
  private _avatarUrl?: AvatarUrl;
  private _username?: string;
  private _status: UserStatus;
  private _isOnline: boolean;
  private _lastSeenAt?: Date;
  private _bio?: string;

  constructor(
    id: string,
    name: UserName,
    phoneNumber: PhoneNumber,
    avatarUrl?: AvatarUrl,
    username?: string,
    status: UserStatus = UserStatus.ACTIVE,
    isOnline: boolean = false,
    lastSeenAt?: Date,
    bio?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = name;
    this._phoneNumber = phoneNumber;
    this._avatarUrl = avatarUrl;
    this._username = username;
    this._status = status;
    this._isOnline = isOnline;
    this._lastSeenAt = lastSeenAt;
    this._bio = bio;
  }

  // Getters
  get name(): UserName {
    return this._name;
  }

  get phoneNumber(): PhoneNumber {
    return this._phoneNumber;
  }

  get avatarUrl(): AvatarUrl | undefined {
    return this._avatarUrl;
  }

  get username(): string | undefined {
    return this._username;
  }

  get status(): UserStatus {
    return this._status;
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  get lastSeenAt(): Date | undefined {
    return this._lastSeenAt;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  // Business methods
  updateProfile(name: UserName, bio?: string, avatarUrl?: AvatarUrl): void {
    this._name = name;
    this._bio = bio;
    this._avatarUrl = avatarUrl;
    this.markAsModified();
  }

  changeUsername(username: string): void {
    if (username.length < 3 || username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    this._username = username;
    this.markAsModified();
  }

  goOnline(): void {
    this._isOnline = true;
    this._lastSeenAt = new Date();
    this.markAsModified();
  }

  goOffline(): void {
    this._isOnline = false;
    this._lastSeenAt = new Date();
    this.markAsModified();
  }

  ban(): void {
    this._status = UserStatus.BANNED;
    this.markAsModified();
  }

  unban(): void {
    this._status = UserStatus.ACTIVE;
    this.markAsModified();
  }

  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  canCreateStories(): boolean {
    return this.isActive();
  }

  canViewStories(): boolean {
    return this.isActive();
  }

  // Factory method
  static create(
    id: string,
    name: UserName,
    phoneNumber: PhoneNumber,
    avatarUrl?: AvatarUrl,
    username?: string
  ): User {
    return new User(id, name, phoneNumber, avatarUrl, username);
  }
}
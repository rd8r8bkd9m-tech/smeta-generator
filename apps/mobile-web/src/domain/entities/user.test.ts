import { describe, it, expect, beforeEach } from 'vitest';
import { User, UserName, PhoneNumber, AvatarUrl } from './user';

describe('User Entity', () => {
  let userName: UserName;
  let phoneNumber: PhoneNumber;
  let avatarUrl: AvatarUrl;

  beforeEach(() => {
    userName = new UserName('John', 'Doe');
    phoneNumber = new PhoneNumber('+7 (999) 123-45-67');
    avatarUrl = new AvatarUrl('https://example.com/avatar.jpg');
  });

  it('should create a user successfully', () => {
    const user = User.create('user-1', userName, phoneNumber, avatarUrl, 'johndoe');

    expect(user.id).toBe('user-1');
    expect(user.name.fullName).toBe('John Doe');
    expect(user.phoneNumber.value).toBe('+7 (999) 123-45-67');
    expect(user.avatarUrl?.value).toBe('https://example.com/avatar.jpg');
    expect(user.username).toBe('johndoe');
    expect(user.isActive()).toBe(true);
  });

  it('should update user profile', () => {
    const user = User.create('user-1', userName, phoneNumber);
    const newName = new UserName('Jane', 'Smith');

    user.updateProfile(newName, 'New bio', avatarUrl);

    expect(user.name.fullName).toBe('Jane Smith');
    expect(user.bio).toBe('New bio');
    expect(user.avatarUrl?.value).toBe('https://example.com/avatar.jpg');
  });

  it('should change username', () => {
    const user = User.create('user-1', userName, phoneNumber);

    user.changeUsername('janesmith');

    expect(user.username).toBe('janesmith');
  });

  it('should throw error for invalid username', () => {
    const user = User.create('user-1', userName, phoneNumber);

    expect(() => user.changeUsername('ab')).toThrow('Username must be between 3 and 30 characters');
    expect(() => user.changeUsername('user@name')).toThrow('Username can only contain letters, numbers, and underscores');
  });

  it('should handle online status', () => {
    const user = User.create('user-1', userName, phoneNumber);

    expect(user.isOnline).toBe(false);

    user.goOnline();
    expect(user.isOnline).toBe(true);
    expect(user.lastSeenAt).toBeInstanceOf(Date);

    user.goOffline();
    expect(user.isOnline).toBe(false);
  });

  it('should check permissions', () => {
    const user = User.create('user-1', userName, phoneNumber);

    expect(user.canCreateStories()).toBe(true);
    expect(user.canViewStories()).toBe(true);

    user.ban();
    expect(user.canCreateStories()).toBe(false);
    expect(user.canViewStories()).toBe(false);
  });
});
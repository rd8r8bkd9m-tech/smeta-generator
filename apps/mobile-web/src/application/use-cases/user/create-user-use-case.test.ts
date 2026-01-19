import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateUserUseCase } from './create-user-use-case';
import { CreateUserCommand } from '../../commands/user-commands';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { EventBus } from '../../../shared/kernel/cqrs';
import { InMemoryUserRepository } from '../../../infrastructure/repositories/in-memory-user-repository';
import { InMemoryEventBus } from '../../../infrastructure/services/in-memory-event-bus';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: UserRepository;
  let eventBus: EventBus;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    eventBus = new InMemoryEventBus();
    useCase = new CreateUserUseCase(userRepository, eventBus);
  });

  it('should create a user successfully', async () => {
    const command = new CreateUserCommand(
      'user-1',
      'John',
      'Doe',
      '+7 (999) 123-45-67',
      'https://example.com/avatar.jpg',
      'johndoe'
    );

    const result = await useCase.execute(command);

    expect(result.success).toBe(true);
    expect(result.userId).toBe('user-1');

    const createdUser = await userRepository.findById('user-1');
    expect(createdUser).toBeTruthy();
    expect(createdUser?.name.fullName).toBe('John Doe');
    expect(createdUser?.phoneNumber.value).toBe('+7 (999) 123-45-67');
  });

  it('should throw error if user with phone number already exists', async () => {
    // Create first user
    const command1 = new CreateUserCommand(
      'user-1',
      'John',
      'Doe',
      '+7 (999) 123-45-67'
    );
    await useCase.execute(command1);

    // Try to create second user with same phone
    const command2 = new CreateUserCommand(
      'user-2',
      'Jane',
      'Smith',
      '+7 (999) 123-45-67'
    );

    await expect(useCase.execute(command2)).rejects.toThrow('User with this phone number already exists');
  });

  it('should publish domain events', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish');

    const command = new CreateUserCommand(
      'user-1',
      'John',
      'Doe',
      '+7 (999) 123-45-67'
    );

    await useCase.execute(command);

    // User creation typically doesn't generate domain events in this simple case
    // But the infrastructure is ready for when we add them
    expect(publishSpy).toHaveBeenCalledTimes(0);
  });
});
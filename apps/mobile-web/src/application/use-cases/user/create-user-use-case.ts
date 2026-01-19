import { CommandUseCase } from '../base-use-case';
import { CreateUserCommand } from '../../commands/user-commands';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { User, UserName, PhoneNumber, AvatarUrl } from '../../../domain/entities/user';
import { EventBus } from '../../../shared/kernel/cqrs';

export interface CreateUserResult {
  userId: string;
  success: boolean;
}

export class CreateUserUseCase extends CommandUseCase<CreateUserCommand, CreateUserResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // Validate that user doesn't already exist
    const existingUser = await this.userRepository.findByPhoneNumber(
      new PhoneNumber(command.phoneNumber)
    );

    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    // Create domain objects
    const userName = new UserName(command.firstName, command.lastName);
    const phoneNumber = new PhoneNumber(command.phoneNumber);
    const avatarUrl = command.avatarUrl ? new AvatarUrl(command.avatarUrl) : undefined;

    // Create user entity
    const user = User.create(
      command.userId,
      userName,
      phoneNumber,
      avatarUrl,
      command.username
    );

    // Save to repository
    await this.userRepository.save(user);

    // Publish domain events
    for (const event of user.domainEvents) {
      await this.eventBus.publish(event);
    }

    return {
      userId: user.id,
      success: true
    };
  }
}
import { CommandUseCase } from '../base-use-case';
import { CreateStoryCommand } from '../../commands/story-commands';
import { StoryRepository } from '../../../domain/repositories/story-repository';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { Story } from '../../../domain/entities/story';
import { EventBus } from '../../../shared/kernel/cqrs';

export interface CreateStoryResult {
  storyId: string;
  success: boolean;
}

export class CreateStoryUseCase extends CommandUseCase<CreateStoryCommand, CreateStoryResult> {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {
    super();
  }

  async execute(command: CreateStoryCommand): Promise<CreateStoryResult> {
    // Validate that user exists and can create stories
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.canCreateStories()) {
      throw new Error('User cannot create stories');
    }

    // Create story entity based on type
    let story: Story;

    switch (command.type) {
      case 'text':
        if (!command.content.trim()) {
          throw new Error('Text content is required for text stories');
        }
        story = Story.createText(
          command.storyId,
          command.userId,
          command.content,
          command.background
        );
        break;

      case 'image':
      case 'video':
        if (!command.content) {
          throw new Error('Media URL is required for media stories');
        }
        story = Story.createMedia(
          command.storyId,
          command.userId,
          command.type,
          command.content
        );
        break;

      default:
        throw new Error('Invalid story type');
    }

    // Save to repository
    await this.storyRepository.save(story);

    // Publish domain events
    for (const event of story.domainEvents) {
      await this.eventBus.publish(event);
    }

    return {
      storyId: story.id,
      success: true
    };
  }
}
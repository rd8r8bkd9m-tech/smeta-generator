import { container } from '../../shared/utils/dependency-container';

// Repositories
import { UserRepository } from '../../domain/repositories/user-repository';
import { StoryRepository } from '../../domain/repositories/story-repository';
import { HttpUserRepository } from '../repositories/http-user-repository';
import { HttpStoryRepository } from '../repositories/http-story-repository';

// Event Bus
import { EventBus } from '../../shared/kernel/cqrs';
import { InMemoryEventBus } from '../services/in-memory-event-bus';

// Use Cases
import { CreateUserUseCase } from '../../application/use-cases/user/create-user-use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id-use-case';
import { CreateStoryUseCase } from '../../application/use-cases/story/create-story-use-case';

// Register repositories (Switching from InMemory to HTTP)
container.register(UserRepository.name, () => new HttpUserRepository());
container.register(StoryRepository.name, () => new HttpStoryRepository());

// Register event bus
container.register(EventBus.name, () => new InMemoryEventBus());

// Register use cases
container.register(CreateUserUseCase.name, () => {
  const userRepository = container.resolve<UserRepository>(UserRepository.name);
  const eventBus = container.resolve<EventBus>(EventBus.name);
  return new CreateUserUseCase(userRepository, eventBus);
});

container.register(GetUserByIdUseCase.name, () => {
  const userRepository = container.resolve<UserRepository>(UserRepository.name);
  return new GetUserByIdUseCase(userRepository);
});

container.register(CreateStoryUseCase.name, () => {
  const storyRepository = container.resolve<StoryRepository>(StoryRepository.name);
  const userRepository = container.resolve<UserRepository>(UserRepository.name);
  const eventBus = container.resolve<EventBus>(EventBus.name);
  return new CreateStoryUseCase(storyRepository, userRepository, eventBus);
});
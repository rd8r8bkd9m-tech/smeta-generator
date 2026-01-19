import { CreateUserCommand } from '../../application/commands/user-commands';
import { GetUserByIdQuery } from '../../application/queries/user-queries';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user-use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id-use-case';
import { CreateUserRequest, UserResponse } from '../dto/user-dto';
import { UserPresenter } from '../presenters/user-presenter';
import { container } from '../../shared/utils/dependency-container';

export class UserController {
  private createUserUseCase: CreateUserUseCase;
  private getUserByIdUseCase: GetUserByIdUseCase;

  constructor() {
    this.createUserUseCase = container.resolve(CreateUserUseCase.name);
    this.getUserByIdUseCase = container.resolve(GetUserByIdUseCase.name);
  }

  async createUser(request: CreateUserRequest): Promise<{ userId: string; success: boolean }> {
    const command = new CreateUserCommand(
      crypto.randomUUID(), // In real app, this might come from auth service
      request.firstName,
      request.lastName,
      request.phoneNumber,
      request.avatarUrl,
      request.username
    );

    return await this.createUserUseCase.execute(command);
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const query = new GetUserByIdQuery(userId);
    const user = await this.getUserByIdUseCase.execute(query);

    return user ? UserPresenter.toResponse(user) : null;
  }

  // Additional methods can be added here
  async updateProfile(userId: string, request: any): Promise<void> {
    // Implementation for updating user profile
    console.log('Update profile not implemented yet', userId, request);
  }

  async changeUsername(userId: string, username: string): Promise<void> {
    // Implementation for changing username
    console.log('Change username not implemented yet', userId, username);
  }
}
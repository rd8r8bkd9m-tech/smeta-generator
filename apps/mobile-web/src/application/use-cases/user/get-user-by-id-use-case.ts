import { QueryUseCase } from '../base-use-case';
import { GetUserByIdQuery } from '../../queries/user-queries';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { User } from '../../../domain/entities/user';

export class GetUserByIdUseCase extends QueryUseCase<GetUserByIdQuery, User | null> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(query: GetUserByIdQuery): Promise<User | null> {
    return await this.userRepository.findById(query.userId);
  }
}
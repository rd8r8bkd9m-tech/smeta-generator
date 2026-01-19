import { Command } from '../../shared/kernel/cqrs';

export class CreateUserCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'CreateUserCommand';
  readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phoneNumber: string,
    public readonly avatarUrl?: string,
    public readonly username?: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class UpdateUserProfileCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'UpdateUserProfileCommand';
  readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly bio?: string,
    public readonly avatarUrl?: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class ChangeUsernameCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'ChangeUsernameCommand';
  readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly username: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class UpdateUserOnlineStatusCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'UpdateUserOnlineStatusCommand';
  readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly isOnline: boolean
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
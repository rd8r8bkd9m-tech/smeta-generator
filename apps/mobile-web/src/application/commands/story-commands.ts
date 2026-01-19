import { Command } from '../../shared/kernel/cqrs';
import { StoryType } from '../../domain/entities/story';

export class CreateStoryCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'CreateStoryCommand';
  readonly timestamp: Date;

  constructor(
    public readonly storyId: string,
    public readonly userId: string,
    public readonly type: StoryType,
    public readonly content: string,
    public readonly background?: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class ViewStoryCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'ViewStoryCommand';
  readonly timestamp: Date;

  constructor(
    public readonly storyId: string,
    public readonly userId: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class AddStoryReactionCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'AddStoryReactionCommand';
  readonly timestamp: Date;

  constructor(
    public readonly storyId: string,
    public readonly userId: string,
    public readonly reactionType: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class RemoveStoryReactionCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'RemoveStoryReactionCommand';
  readonly timestamp: Date;

  constructor(
    public readonly storyId: string,
    public readonly userId: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class DeleteStoryCommand implements Command {
  readonly commandId: string;
  readonly commandType = 'DeleteStoryCommand';
  readonly timestamp: Date;

  constructor(
    public readonly storyId: string,
    public readonly userId: string
  ) {
    this.commandId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
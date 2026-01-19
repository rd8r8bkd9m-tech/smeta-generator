export interface Command {
  readonly commandId: string;
  readonly commandType: string;
  readonly timestamp: Date;
}

export interface CommandHandler<TCommand extends Command, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}

export interface Query<TResult = unknown> {
  readonly queryId: string;
  readonly queryType: string;
  readonly timestamp: Date;
}

export interface QueryHandler<TQuery extends Query, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

export interface CommandBus {
  execute<TCommand extends Command, TResult = void>(
    command: TCommand
  ): Promise<TResult>;
}

export interface QueryBus {
  execute<TQuery extends Query, TResult>(
    query: TQuery
  ): Promise<TResult>;
}

export interface Event {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventVersion: number;
}

export interface EventHandler<TEvent extends Event> {
  handle(event: TEvent): Promise<void>;
}

export interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe<TEvent extends Event>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): void;
}
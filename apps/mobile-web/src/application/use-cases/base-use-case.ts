export abstract class BaseUseCase<TInput, TOutput> {
  abstract execute(input: TInput): Promise<TOutput>;

  protected generateId(): string {
    return crypto.randomUUID();
  }

  protected createTimestamp(): Date {
    return new Date();
  }
}

export abstract class CommandUseCase<TCommand, TResult = void> extends BaseUseCase<TCommand, TResult> {
  abstract execute(command: TCommand): Promise<TResult>;
}

export abstract class QueryUseCase<TQuery, TResult> extends BaseUseCase<TQuery, TResult> {
  abstract execute(query: TQuery): Promise<TResult>;
}
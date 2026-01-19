import { Query } from '../../shared/kernel/cqrs';

export class GetStoryByIdQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetStoryByIdQuery';
  readonly timestamp: Date;

  constructor(public readonly storyId: string) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class GetStoriesByUserIdQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetStoriesByUserIdQuery';
  readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly activeOnly: boolean = true
  ) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class GetFeedStoriesQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetFeedStoriesQuery';
  readonly timestamp: Date;

  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number
  ) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class GetStoryReactionsQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetStoryReactionsQuery';
  readonly timestamp: Date;

  constructor(public readonly storyId: string) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class GetUserStoryStatsQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetUserStoryStatsQuery';
  readonly timestamp: Date;

  constructor(public readonly userId: string) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
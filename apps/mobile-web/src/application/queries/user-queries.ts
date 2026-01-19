import { Query } from '../../shared/kernel/cqrs';

export class GetUserByIdQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetUserByIdQuery';
  readonly timestamp: Date;

  constructor(public readonly userId: string) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class GetUserByPhoneNumberQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetUserByPhoneNumberQuery';
  readonly timestamp: Date;

  constructor(public readonly phoneNumber: string) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class GetUsersQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'GetUsersQuery';
  readonly timestamp: Date;

  constructor(
    public readonly limit?: number,
    public readonly offset?: number,
    public readonly onlineOnly?: boolean
  ) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}

export class SearchUsersQuery implements Query {
  readonly queryId: string;
  readonly queryType = 'SearchUsersQuery';
  readonly timestamp: Date;

  constructor(
    public readonly searchTerm: string,
    public readonly limit?: number,
    public readonly offset?: number
  ) {
    this.queryId = crypto.randomUUID();
    this.timestamp = new Date();
  }
}
import { AggregateRoot, DomainEvent } from '../../shared/kernel/base-entity';

export enum StoryType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video'
}

export enum StoryStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DELETED = 'deleted'
}

export class Story extends AggregateRoot {
  private _userId: string;
  private _type: StoryType;
  private _content: string;
  private _background?: string;
  private _status: StoryStatus;
  private _expiresAt: Date;
  private _viewsCount: number;
  private _reactions: StoryReaction[];

  constructor(
    id: string,
    userId: string,
    type: StoryType,
    content: string,
    expiresAt: Date,
    background?: string,
    status: StoryStatus = StoryStatus.ACTIVE,
    viewsCount: number = 0,
    reactions: StoryReaction[] = [],
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._userId = userId;
    this._type = type;
    this._content = content;
    this._background = background;
    this._status = status;
    this._expiresAt = expiresAt;
    this._viewsCount = viewsCount;
    this._reactions = reactions;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get type(): StoryType {
    return this._type;
  }

  get content(): string {
    return this._content;
  }

  get background(): string | undefined {
    return this._background;
  }

  get status(): StoryStatus {
    return this._status;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get viewsCount(): number {
    return this._viewsCount;
  }

  get reactions(): readonly StoryReaction[] {
    return [...this._reactions];
  }

  get reactionsCount(): number {
    return this._reactions.length;
  }

  // Business methods
  addView(): void {
    this._viewsCount++;
    this.markAsModified();
  }

  addReaction(reaction: StoryReaction): void {
    if (this.isExpired() || this.isDeleted()) {
      throw new Error('Cannot add reaction to expired or deleted story');
    }

    // Check if user already reacted
    const existingReaction = this._reactions.find(r => r.userId === reaction.userId);
    if (existingReaction) {
      throw new Error('User has already reacted to this story');
    }

    this._reactions.push(reaction);
    this.markAsModified();

    // Domain event
    this.addDomainEvent({
      eventId: crypto.randomUUID(),
      eventType: 'StoryReactionAdded',
      aggregateId: this.id,
      occurredOn: new Date(),
      eventVersion: 1
    });
  }

  removeReaction(userId: string): void {
    const reactionIndex = this._reactions.findIndex(r => r.userId === userId);
    if (reactionIndex === -1) {
      throw new Error('Reaction not found');
    }

    this._reactions.splice(reactionIndex, 1);
    this.markAsModified();
  }

  expire(): void {
    this._status = StoryStatus.EXPIRED;
    this.markAsModified();
  }

  delete(): void {
    this._status = StoryStatus.DELETED;
    this.markAsModified();
  }

  isActive(): boolean {
    return this._status === StoryStatus.ACTIVE && !this.isExpired();
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt || this._status === StoryStatus.EXPIRED;
  }

  isDeleted(): boolean {
    return this._status === StoryStatus.DELETED;
  }

  hasUserReacted(userId: string): boolean {
    return this._reactions.some(r => r.userId === userId);
  }

  getUserReaction(userId: string): StoryReaction | undefined {
    return this._reactions.find(r => r.userId === userId);
  }

  // Factory methods
  static createText(
    id: string,
    userId: string,
    content: string,
    background?: string
  ): Story {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return new Story(id, userId, StoryType.TEXT, content, expiresAt, background);
  }

  static createMedia(
    id: string,
    userId: string,
    type: StoryType.IMAGE | StoryType.VIDEO,
    content: string
  ): Story {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return new Story(id, userId, type, content, expiresAt);
  }
}

export class StoryReaction extends BaseEntity {
  private _userId: string;
  private _type: string;

  constructor(
    id: string,
    userId: string,
    type: string,
    createdAt?: Date
  ) {
    super(id, createdAt);
    this._userId = userId;
    this._type = type;
  }

  get userId(): string {
    return this._userId;
  }

  get type(): string {
    return this._type;
  }

  static create(id: string, userId: string, type: string): StoryReaction {
    return new StoryReaction(id, userId, type);
  }
}
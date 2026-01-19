import { ValueObject } from './value-object';

export class AvatarUrl extends ValueObject {
  private readonly _value: string;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Avatar URL must be a non-empty string');
    }

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Avatar URL must use HTTP or HTTPS protocol');
      }
    } catch {
      throw new Error('Avatar URL must be a valid URL');
    }
  }

  equals(other: ValueObject): boolean {
    if (!(other instanceof AvatarUrl)) {
      return false;
    }
    return this._value === other._value;
  }
}
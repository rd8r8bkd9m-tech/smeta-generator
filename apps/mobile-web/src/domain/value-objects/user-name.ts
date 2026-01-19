import { ValueObject } from './value-object';

export class UserName extends ValueObject {
  private readonly _firstName: string;
  private readonly _lastName: string;

  constructor(firstName: string, lastName: string) {
    super();
    this.validate(firstName, lastName);
    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get displayName(): string {
    return this._firstName;
  }

  private validate(firstName: string, lastName: string): void {
    if (!firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!lastName?.trim()) {
      throw new Error('Last name is required');
    }
    if (firstName.length < 2 || firstName.length > 50) {
      throw new Error('First name must be between 2 and 50 characters');
    }
    if (lastName.length < 2 || lastName.length > 50) {
      throw new Error('Last name must be between 2 and 50 characters');
    }
  }

  equals(other: ValueObject): boolean {
    if (!(other instanceof UserName)) {
      return false;
    }
    return this._firstName === other._firstName && this._lastName === other._lastName;
  }
}
import { ValueObject } from './value-object';

export class PhoneNumber extends ValueObject {
  private readonly _value: string;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = this.format(value);
  }

  get value(): string {
    return this._value;
  }

  get countryCode(): string {
    return this._value.slice(0, this._value.indexOf(' '));
  }

  get nationalNumber(): string {
    return this._value.slice(this._value.indexOf(' ') + 1);
  }

  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Phone number must be a non-empty string');
    }

    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length < 10 || cleanValue.length > 15) {
      throw new Error('Phone number must be between 10 and 15 digits');
    }

    if (!cleanValue.startsWith('7') && !cleanValue.startsWith('8')) {
      throw new Error('Phone number must start with 7 or 8');
    }
  }

  private format(value: string): string {
    const cleanValue = value.replace(/\D/g, '');

    // Russian phone number format: +7 (XXX) XXX-XX-XX
    const countryCode = cleanValue.startsWith('8') ? '7' : cleanValue.slice(0, 1);
    const nationalNumber = cleanValue.slice(-10);

    return `+${countryCode} (${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6, 8)}-${nationalNumber.slice(8, 10)}`;
  }

  equals(other: ValueObject): boolean {
    if (!(other instanceof PhoneNumber)) {
      return false;
    }
    return this._value === other._value;
  }
}
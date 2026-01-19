export abstract class ValueObject {
  abstract equals(other: ValueObject): boolean;

  protected shallowEquals(other: ValueObject): boolean {
    if (!other) {
      return false;
    }

    if (this.constructor !== other.constructor) {
      return false;
    }

    return this.equals(other);
  }
}
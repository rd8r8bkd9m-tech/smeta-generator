export class DependencyContainer {
  private services = new Map<string, any>();

  register<T>(token: string, factory: () => T): void {
    this.services.set(token, factory);
  }

  resolve<T>(token: string): T {
    const factory = this.services.get(token);
    if (!factory) {
      throw new Error(`Service ${token} not registered`);
    }
    return factory();
  }

  clear(): void {
    this.services.clear();
  }
}

export const container = new DependencyContainer();
import { EventBus, Event, EventHandler } from '../../shared/kernel/cqrs';

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, EventHandler<Event>[]>();

  async publish(event: Event): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventType) || [];

    for (const handler of eventHandlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
        // In production, you might want to send this to a monitoring service
      }
    }
  }

  subscribe<TEvent extends Event>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as EventHandler<Event>);
    this.handlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler: EventHandler<Event>): void {
    const handlers = this.handlers.get(eventType) || [];
    const filteredHandlers = handlers.filter(h => h !== handler);
    this.handlers.set(eventType, filteredHandlers);
  }

  clear(): void {
    this.handlers.clear();
  }
}
import { Bid, Prisma } from '@prisma/client'
import { EventEmitter } from 'events'

export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter()

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []))
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.on(eventName, handler as any)
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.off(eventName, handler as any)
  }
}

type LocalEventTypes = {
  'bid-added': [bid: Prisma.BidGetPayload<{include: {author: {select: {name: true, id: true,}}}}>],
  'auction-watching': [count: number]
}

export const WATCHING:Record<number, number> = {}

export const localEventEmitter = new TypedEventEmitter<LocalEventTypes>()

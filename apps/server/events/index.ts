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

export type AddedBid = Prisma.BidGetPayload<{ select: {amount: true, postId: true, userId: true, createdAt: true, author: {select: {name: true, id: true,}}}}>

type LocalEventTypes = {
  'bid-added': [bid: AddedBid],
  'auction-watching': [count: number]
}

export const WATCHING:Record<string, number> = {}

export const localEventEmitter = new TypedEventEmitter<LocalEventTypes>()

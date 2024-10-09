import { z, ZodError } from "zod";
import { fastAuthProcedure, protectedProcedure, publicProcedure, router } from "../../trpc";
import { prisma } from "../../database";
import {createBidValidation} from './validation'
import { TRPCError } from "@trpc/server";
import { AddedBid, localEventEmitter, WATCHING } from "../../events";
import { observable } from "@trpc/server/observable";
import { obfuscateName } from "utils";
import { InternalRedisConnection } from "../../database/redis";

export const bidsRoute = router({
  create: fastAuthProcedure.input(createBidValidation).mutation(async ({input, ctx: {sub, name}}) => {
    console.time()
    const conn = await InternalRedisConnection.getRedisConnection();
    console.timeEnd()


    console.time()
    const data = await conn.get(`post:${input.id}`)
    console.timeEnd()

    if(!data) {
      throw new TRPCError({code: 'NOT_FOUND'})
    }

    const state = JSON.parse(data);

    if(state.endTime < new Date()) {
      throw new TRPCError({
        code: 'CONFLICT'
      })
    }

    if((state.currentBid + state.bidIncrement) > input.amount) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: "Bid amount is incorrect",
        cause: new ZodError([
          {path: ['amount'], message: "Bid amount is incorrect", code: 'custom'}
        ])
      })
    }

    await conn.set(`post:${input.id}`, JSON.stringify({
      ...state,
      currentBid: input.amount,
    }))

    console.timeEnd()

    localEventEmitter.emit('bid-added', {amount: input.amount, createdAt: new Date(), postId: input.id, userId: sub, author: { id: sub, name: name ? obfuscateName(name) : null}})


    const saveBid = async () => {
      const bid = await prisma.$transaction(async (tx) => {
        const bid = await tx.bid.create({
          data: {
            amount: input.amount,
            userId: sub,
            postId: input.id,
            createdAt: new Date()
          }
        })

        return {
          bid,
        }
      })
    }

    saveBid();

    return true

  }),
  listenToBidAdded: publicProcedure.input(z.object({auctionIds: z.string(), ignoreMe: z.boolean().default(false)})).subscription(async ({ctx: {user}, input: {auctionIds, ignoreMe}}) => observable<AddedBid>((emit) => {

    const onBidAdded = (bid: AddedBid) => {
      const shouldInformMe = (user?.id !== bid.userId || !ignoreMe)
      if(auctionIds === bid.postId && shouldInformMe) {
        emit.next(bid)
      }
    }

    localEventEmitter.on('bid-added', onBidAdded)

    WATCHING[auctionIds] = (WATCHING[auctionIds] ?? 0);
    WATCHING[auctionIds] = WATCHING[auctionIds] + 1


    localEventEmitter.emit('auction-watching', WATCHING[auctionIds] + 1)

    return () => {
      localEventEmitter.off('bid-added', onBidAdded)

      WATCHING[auctionIds]  = WATCHING[auctionIds] - 1
      localEventEmitter.emit('auction-watching', WATCHING[auctionIds] - 1)
    }
  })),
})

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { prisma } from "../../database";
import {createBidValidation} from './validation'
import { TRPCError } from "@trpc/server";
import { localEventEmitter, WATCHING } from "../../events";
import { observable } from "@trpc/server/observable";
import { Bid, Prisma } from "@prisma/client";
import { obfuscateName } from "../../../utils/src/shared";

export const bidsRoute = router({
  create: protectedProcedure.input(createBidValidation).mutation(async ({input, ctx: {user}}) => {
    const bid = await prisma.$transaction(async (tx) => {
      const data = await tx.post.findUnique({
        where: {
          id: input.id,
        },
        select: {
          bidIncrement: true,
          endTime: true,
          priceMin: true,
          Bids: {
            select: {
              amount: true,
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
        }
      })

      if(!data) {
        throw new TRPCError({code: 'NOT_FOUND'})
      }

      const lastBidAmount = data.Bids[0]?.amount ?? data.priceMin

      if((lastBidAmount + data.bidIncrement) > input.amount) {
        throw new TRPCError({
          code: 'CONFLICT'
        })
      }

      if(data.endTime < new Date()) {
        throw new TRPCError({
          code: 'CONFLICT'
        })
      }

      return tx.bid.create({
        data: {
          amount: input.amount,
          userId: user.id,
          postId: input.id,
          createdAt: new Date()
        }
      })
    })

    localEventEmitter.emit('bid-added', {...bid, author: {id: user.id, name: user.name ? obfuscateName(user.name) : null}})
  }),
  listenToBidAdded: publicProcedure.input(z.object({auctionIds: z.number(), ignoreMe: z.boolean().default(false)})).subscription(async ({ctx: {user}, input: {auctionIds, ignoreMe}}) => observable<Prisma.BidGetPayload<{include: {author: {select: {id: true, name: true,}}}}>>((emit) => {

    const onBidAdded = (bid: Prisma.BidGetPayload<{ include: { author: { select: { id: true, name: true } } } }>) => {
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

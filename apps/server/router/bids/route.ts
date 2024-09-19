import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { prisma } from "../../database";
import {createBidValidation} from './validation'
import { TRPCError } from "@trpc/server";
import { localEventEmitter } from "../../events";
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

    localEventEmitter.emit('bid-added', {...bid, author: {...user, name: user.name ? obfuscateName(user.name) : null}})
  }),
  listenToBidAdded: publicProcedure.input(z.object({auctionIds: z.number().array(), ignoreMe: z.boolean().default(false)})).subscription(async ({ctx: {user}, input: {auctionIds, ignoreMe}}) => observable<Prisma.BidGetPayload<{include: {author: true}}>>((emit) => {
    
    const onBidAdded = (bid: Prisma.BidGetPayload<{include: {author: true}}>) => {
      const shouldInformMe = (user?.id !== bid.userId || !ignoreMe)
      if(auctionIds.includes(bid.postId) && shouldInformMe) {
        emit.next(bid)
      }
    }

    localEventEmitter.on('bid-added', onBidAdded)

    return () => {
      localEventEmitter.off('bid-added', onBidAdded)
    }
  })),
})

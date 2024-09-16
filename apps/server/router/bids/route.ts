import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { prisma } from "../../database";
import {createBidValidation} from './validation'
import { TRPCError } from "@trpc/server";

export const bidsRoute = router({
  create: protectedProcedure.input(createBidValidation).mutation(async ({input, ctx: {user}}) => {
    return prisma.$transaction(async (tx) => {
      const data = await tx.post.findUnique({
        where: {
          id: input.id,
        },
        include: {
          Bids: {
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

      return tx.bids.create({
        data: {
          amount: input.amount,
          userId: user.id,
          postId: data.id,
          createdAt: new Date()
        }
      })
    })
  })
})

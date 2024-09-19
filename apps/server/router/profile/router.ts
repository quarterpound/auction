import { z } from "zod";
import { prisma } from "../../database";
import { protectedProcedure, router } from "../../trpc";
import { profileUpdateValidation } from "./validation";
import bcrypt from 'bcrypt'

export const profileRouter = router({
  update: protectedProcedure.input(profileUpdateValidation).mutation(async ({input, ctx: {user}}) => {
    return prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwords: input.password ? (
          {
            create: {
              hash: await bcrypt.hash(input.password, 12)
            }
          }
        ) : undefined
      }
    })
  }),
  auctions: protectedProcedure.input(z.object({cursor: z.number().default(0)})).query(({input, ctx: {user}}) => {
    return prisma.post.findMany({
      take: 10,
      skip: 10 * input.cursor,
    })
  })
})

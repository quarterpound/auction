import { z } from "zod";
import { prisma } from "../../database";
import { publicProcedure, router } from "../../trpc";

export const categoryRouter = router({
  all: publicProcedure.query(async () => {
    return prisma.category.findMany({
      take: 10,
      include: {
        _count: {
          select: {
            post: true,
          }
        },
        children: {
          include: {
            _count: {
              select: {
                post: true,
              }
            }
          },
          take: 10
        },
      }
    })
  }),
  getCategoryMetadata: publicProcedure.input(z.object({slug: z.string()})).query(async ({input}) => {
    return prisma.category.findUnique({
      where: {
        slug: input.slug
      },
      select: {
        slug: true,
        name: true,
      }
    })
  }),
  getSubCategories: publicProcedure.input(z.object({slug: z.string()})).query(async({input}) => {
    return prisma.category.findUnique({
      where: {
        slug: input.slug
      },
      include: {
        children: true
      }
    })
  })
})

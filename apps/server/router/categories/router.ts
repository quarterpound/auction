import { z } from "zod";
import { prisma } from "../../database";
import { publicProcedure, router } from "../../trpc";

export const categoryRouter = router({
  all: publicProcedure.input(z.object({take: z.number().default(10).optional()})).query(async ({input}) => {
    return prisma.category.findMany({
      take: input.take,
      where: {
        categoryId: null
      },
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
        id: true,
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

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
  })
})

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
      where: {
        authorId: user.id
      },
      include: {
        _count: {
          select: {
            Bids: true,
          },
        },
        AssetOnPost: {
          include: {
            asset: true,
          }
        },
        Bids: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            userId: true,
            amount: true,
          }
        }
      }
    })
  }),
  bids: protectedProcedure.input(z.object({cursor: z.number().default(0)})).query(async ({input, ctx: {user}}) => {
    return prisma.post.findMany({
      where: {
        Bids: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        Bids: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            userId: true,
            amount: true,
          }
        },
        AssetOnPost: {
          include: {
            asset: true,
          }
        },
      },
      take: 10,
      skip: input.cursor * 10
    })
  }),
  addAuctionToFavorites: protectedProcedure.input(z.object({id: z.number()})).mutation(async ({input, ctx: {user}}) => {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.userFavorite.findUnique({
        where: {
          userId_postId: {
            userId: user.id,
            postId: input.id
          }
        }
      })

      if(existing) {
        await tx.userFavorite.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId: input.id
            }
          }
        })

        return 'deleted' as const
      }

      return tx.userFavorite.create({
        data: {
          userId: user.id,
          postId: input.id
        }
      })
    })
  }),
  favorites: protectedProcedure.input(z.object({cursor: z.number().default(0)})).query(async ({ctx: {user}, input}) => {
    return prisma.userFavorite.findMany({
      take: 10,
      skip: 10 * input.cursor,
      where: {
        userId: user.id
      },
      include: {
        post: {
          include: {
            _count: {
              select: {
                Bids: true,
              },
            },
            AssetOnPost: {
              include: {
                asset: true,
              }
            },
            Bids: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              select: {
                id: true,
                userId: true,
                amount: true,
              }
            }
          }
        }
      }
    })
  })
})

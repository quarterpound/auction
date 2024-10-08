import { z, ZodError } from "zod";
import { prisma } from "../../database";
import { protectedProcedure, router } from "../../trpc";
import { profileUpdateValidation } from "./validation";
import bcrypt from 'bcrypt'
import { TRPCError } from "@trpc/server";
import { InternalRedisConnection } from "../../database/redis";
import { sendWelcomeEmail } from "../../mail";
import dayjs from "dayjs";

export const profileRouter = router({
  update: protectedProcedure.input(profileUpdateValidation).mutation(async ({input, ctx: {user}}) => {
    return prisma.$transaction(async tx => {
      if(user.email !== input.email && input.email) {
        const userCheck = await tx.user.findUnique({
          where: {
            email: input.email
          }
        })

        if(userCheck) {
          throw new TRPCError({
            cause: new ZodError([
              {path: ['email'], code: 'custom', message: 'Email is already taken'}
            ]),
            code: 'BAD_REQUEST'
          })
        }
      }

      return tx.user.update({
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
        category: {
          include: {
            parent: true
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
        category: {
          include: {
            parent: true
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
  addAuctionToFavorites: protectedProcedure.input(z.object({id: z.string()})).mutation(async ({input, ctx: {user}}) => {
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
            category: {
              include: {
                parent: true
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
  }),
  deleteAuction: protectedProcedure.input(z.object({id: z.string()})).mutation(async({ctx: {user}, input}) => {
    return prisma.$transaction(async (tx) => {
      const data = await tx.post.findUnique({
        where: {
          id: input.id
        }
      })

      if(!data) {
        throw new TRPCError({code: 'NOT_FOUND'})
      }

      if(data?.authorId !== user.id) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      await tx.bid.deleteMany({
        where: {
          postId: data.id
        }
      })

      await tx.assetOnPost.deleteMany({
        where: {
          postId: data.id
        }
      })

      const conn = await InternalRedisConnection.getRedisConnection()
      await conn.del(`post:${data.id}`)

      return await tx.post.delete({
        where: {
          id: data.id
        }
      })
    })
  }),
  resendVerificationEmail: protectedProcedure.mutation(async ({ctx: {user}}) => {

    const email = user.email;

    if(!email) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User does not have an email present'
      })
    }

    if(user.emailVerified) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Email already verified'
      })
    }

    return prisma.$transaction(async (tx) => {
      const lastVerificationRequest = await tx.verificationRequest.findFirst({
        where: {
          identifier: email,
          used: false,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if(!lastVerificationRequest) {
        let num = Math.floor(Math.random() * 1000000);

        let sixDigitNumber = num.toString().padStart(6, '0')

        const createdToken = await tx.verificationRequest.create({
          data: {
            identifier: email,
            token: sixDigitNumber,
            expires: dayjs().add(1, 'day').toDate()
          }
        })

        await sendWelcomeEmail(email, user.name ?? '', sixDigitNumber, true)

        return createdToken;
      }

      if (dayjs().diff(dayjs(lastVerificationRequest.createdAt), 'minute') < 5) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Please wait 5 minutes before trying again'
        });
      }

      let num = Math.floor(Math.random() * 1000000);

      let sixDigitNumber = num.toString().padStart(6, '0')

      const createdToken = await tx.verificationRequest.create({
        data: {
          identifier: email,
          token: sixDigitNumber,
          expires: dayjs().add(1, 'day').toDate()
        }
      })

      await sendWelcomeEmail(email, user.name ?? '', sixDigitNumber, true)

      return createdToken;
    })
  })
})

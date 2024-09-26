import { TRPCError } from "@trpc/server";
import { prisma } from "../../database";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { loginValidation, registerValidation } from "./validation";
import bcrypt from 'bcrypt'
import dayjs from "dayjs";
import { env } from "../../env";
import crypto from 'crypto'
import { sendWelcomeEmail } from "../../mail";
import _ from 'lodash';
import { User } from "@prisma/client";
import { setCookie } from "hono/cookie";
import { signInternal } from "../../jwt";
import { z } from "zod";

export const authRoute = router({
  login: publicProcedure.input(loginValidation).mutation(async ({input, ctx: {c}}) => {
    const { username, password } = input

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { phone: username }
        ]
      },
      include: {
        _count: {
          select: {
            Bids: true,
            Post: {
              where: {
                pending: true,
              }
            }
          }
        },
        UserFavorites: true,
        passwords: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!user) {
      throw new TRPCError({ message: 'User not found', code: 'NOT_FOUND' })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwords[0].hash)

    if (!passwordMatch) {
      throw new TRPCError({ message: 'Invalid password', code: 'UNAUTHORIZED' })
    }

    const jwt = await signInternal({
      sub: user.id,
      name: user.name ?? '',
      emailVerified: false,
    })

    if(c) {
      setCookie(c, 'authorization', jwt)
    }

    return {
      token: jwt,
      user: _.omit(user, ['passwords']),
    };
  }),
  register: publicProcedure.input(registerValidation).mutation(async ({ input, ctx: {c} }) => {
    const { name, email, password, addToAudiences } = input

    const { jwt, user } = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            {
              email,
            }
          ]
        }
      })

      if (existingUser) {
        throw new TRPCError({ message: 'User already exists', code: 'CONFLICT' })
      }

      const newUser = await tx.user.create({
        data: {
          email,
          name,
          passwords: {
            create: {
              hash: await bcrypt.hash(password, 12)
            }
          }
        }
      })

      const verificationToken = crypto.randomBytes(32).toString('hex')

      await prisma.verificationRequest.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: dayjs().add(1, 'day').toDate()
        }
      })

      if (email) {
        try {
          await sendWelcomeEmail(email, email, verificationToken, addToAudiences);
        } catch (e) {
          throw new TRPCError({ message: 'Failed to send email', code: 'INTERNAL_SERVER_ERROR' })
        }
      }

      const jwt = await signInternal({
        sub: newUser.id,
        name: newUser.name ?? '',
        emailVerified: false,
      })

      return {
        jwt,
        user: _.omit(newUser, ['passwords']) as User,
      };
    })



    if(c) {
      setCookie(c, 'authorization', jwt)
    }

    return {
      token: jwt,
      user,
    }
  }),
  me: protectedProcedure.query(async({ctx}) => {
    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: ctx.user.id,
      },
    })

    const bids = await prisma.bid.count({where: {userId: ctx.user.id}})
    const pendingAuctions = await prisma.post.count({where: {authorId: ctx.user.id}})
    return {...ctx.user, favorites, hasMadeBids: bids !== 0, hasPendingAuctions: pendingAuctions !== 0};
  }),
  verify: publicProcedure.input(z.object({token: z.string(), identifier: z.string()})).mutation(async ({ctx, input}) => {
    const verificationToken = await prisma.verificationRequest.findUnique({
      where: {
        identifier_token: {
          identifier: input.identifier,
          token: input.token
        }
      }
    });


    if(!verificationToken) {
      throw new TRPCError({
        code: 'NOT_FOUND'
      })
    }

    if(verificationToken.used) {
      console.log('here')

      throw new TRPCError({
        code: "NOT_FOUND"
      })
    }

    if(!dayjs(verificationToken.expires).isAfter()) {
      throw new TRPCError({code: "NOT_FOUND"})
    }

    const user = await prisma.$transaction(async tx => {

      await tx.verificationRequest.update({
        where: {
          id: verificationToken.id
        },
        data: {
          used: true,
        }
      })

      const user = await tx.user.update({
        where: {
          email: verificationToken.identifier,
        },
        data: {
          emailVerified: new Date(),
        }
      })

      await tx.post.updateMany({
        where: {
          authorId: user.id
        },
        data: {
          pending: false,
        }
      })

      return user
    })

    return user
  })
})

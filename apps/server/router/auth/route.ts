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
      name: user.name ?? ''
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
    const { name, email, password, phone, addToAudiences } = input

    const { jwt, user } = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            {
              email,
            },
            {
              phone,
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
          phone,
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
          identifier: email ?? phone,
          token: verificationToken,
          expires: dayjs().add(1, 'day').toDate()
        }
      })

      if (email) {
        try {
          await sendWelcomeEmail(email, `${env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`, addToAudiences);
        } catch (e) {
          throw new TRPCError({ message: 'Failed to send email', code: 'INTERNAL_SERVER_ERROR' })
        }
      }

      const jwt = await signInternal({
        sub: user.id,
        name: user.name ?? ''
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
    return {...ctx.user, favorites, hasMadeBids: bids !== 0};
  })
})

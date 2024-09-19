import { TRPCError } from "@trpc/server";
import { prisma } from "../../database";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { loginValidation, registerValidation } from "./validation";
import bcrypt from 'bcrypt'
import {sign} from 'hono/jwt'
import dayjs from "dayjs";
import { env } from "../../env";
import crypto from 'crypto'
import { sendWelcomeEmail } from "../../mail";
import _ from 'lodash';
import { User } from "@prisma/client";
import { setCookie } from "hono/cookie";

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

    const jwt = await sign({
      sub: user.id,
      exp: Math.floor(dayjs().add(7, 'days').toDate().getTime() / 1000),
    }, env.JWT_SECRET)

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

      const jwt = await sign({
        sub: newUser.id,
        exp: Math.floor(dayjs().add(7, 'days').toDate().getTime() / 1000),
      }, env.JWT_SECRET)

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
    return ctx.user;
  })
})

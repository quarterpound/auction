import { TRPCError } from "@trpc/server";
import { prisma } from "../../database";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { loginValidation, registerValidation } from "./validation";
import bcrypt from 'bcrypt'
import dayjs from "dayjs";
import crypto from 'crypto'
import { sendWelcomeEmail } from "../../mail";
import _ from 'lodash';
import { User } from "@prisma/client";
import { setCookie } from "hono/cookie";
import { signInternal } from "../../jwt";
import { z, ZodError } from "zod";

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
      throw new TRPCError({
        cause: new ZodError<typeof loginValidation>([
          {path: ['root'], code: 'custom', message: 'Email or password incorrect'}
        ]),
        code: 'BAD_REQUEST'
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.passwords[0].hash)

    if (!passwordMatch) {
      throw new TRPCError({
        cause: new ZodError<typeof loginValidation>([
          {path: ['root'], code: 'custom', message: 'Email or password incorrect'}
        ]),
        code: 'BAD_REQUEST'
      })

    }

    const jwt = await signInternal({
      sub: user.id,
      name: user.name ?? '',
      emailVerified: !!user.emailVerified,
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
        throw new ZodError<typeof loginValidation>([
          {path: ['email'], code: 'custom', message: 'Email is taken'}
        ])
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


      let num = Math.floor(Math.random() * 1000000);

      let sixDigitNumber = num.toString().padStart(6, '0')

      await prisma.verificationRequest.create({
        data: {
          identifier: email,
          token: sixDigitNumber,
          expires: dayjs().add(1, 'day').toDate()
        }
      })

      if (email) {
        try {
          await sendWelcomeEmail(email, newUser.name ?? '', sixDigitNumber, addToAudiences);
        } catch (e) {
          throw new ZodError<typeof loginValidation>([
            {path: ['email'], code: 'custom', message: 'Email is invalid'}
          ])
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
    }, {timeout: 10000})

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
  verify: publicProcedure.input(z.object({token: z.string(), identifier: z.string()})).mutation(async ({input, ctx}) => {
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

    const jwt = await signInternal({
      sub: user.id,
      emailVerified: !!user.emailVerified,
      name: user.name ?? ''
    })


    if(ctx.c) {
      setCookie(ctx.c, 'authorization', jwt)
    }

    return {
      user,
      jwt
    }
  })
})

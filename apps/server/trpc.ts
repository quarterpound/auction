import { initTRPC, TRPCError } from '@trpc/server';
import { verify } from 'hono/jwt';
import { env } from './env';
import { prisma } from './database';
import superjson from 'superjson'
import { Context } from 'hono';
import { User } from '@prisma/client';
import { ZodError } from 'zod';
import { deleteCookie } from 'hono/cookie';
import { verifyInternal } from './jwt';

type ParsedContext = {
  authorization: string | null
  c?: Context
}

const t = initTRPC.context<ParsedContext>().create({
  transformer: superjson,
  errorFormatter(opts) {
      const { shape, error } = opts;
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      };
    },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure.use(async (opts) => {

  const token = opts.ctx.authorization
  let user: User | null = null;

  if(token) {
    const payload = await verify(token, env.JWT_SECRET)

    if(!payload) {
      if(opts.ctx.c) {
        deleteCookie(opts.ctx.c, 'authorization')
      }
      throw new TRPCError({message: 'Token expired', code: 'UNAUTHORIZED'})
    }

    user = await prisma.user.findUnique({
      where: {
        id: payload.sub as string,
      }
    })


    if(!user) {
      if(opts.ctx.c) {
        deleteCookie(opts.ctx.c, 'authorization')
      }
      throw new TRPCError({message: 'User could not be found', code: 'CONFLICT'})
    }
  }

  return opts.next({
    ctx: {
      user,
      c: opts.ctx.c,
    }
  })
});

export const protectedProcedure = t.procedure.use(async (opts) => {
  const token = opts.ctx.authorization

  if(!token) {
    throw new TRPCError({message: 'Not authorized', code: 'UNAUTHORIZED'})
  }

  const payload = await verify(token, env.JWT_SECRET)

  if(!payload) {
    if(opts.ctx.c) {
      deleteCookie(opts.ctx.c, 'authorization')
    }
    throw new TRPCError({message: 'Token expired', code: 'UNAUTHORIZED'})
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub as string,
    }
  })


  if(!user) {
    if(opts.ctx.c) {
      deleteCookie(opts.ctx.c, 'authorization')
    }
    throw new TRPCError({message: 'User could not be found', code: 'CONFLICT'})
  }

  return opts.next({
    ctx: {
      user,
      c: opts.ctx.c,
    }
  })
})

export const fastAuthProcedure = t.procedure.use(async (opts) => {
  const token = opts.ctx.authorization

  if(!token) {
    if(opts.ctx.c) {
      deleteCookie(opts.ctx.c, 'authorization')
    }
    throw new TRPCError({code: 'UNAUTHORIZED', message: 'Token expired'})
  }

  let payload = null;

  try {
    payload = await verifyInternal(token)
  } catch(e) {
    if(opts.ctx.c) {
      deleteCookie(opts.ctx.c, 'authorization')
    }
    throw new TRPCError({code: 'UNAUTHORIZED', message: 'Token expired'})
  }

  if(!payload.emailVerified) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: 'Email verification is required'
    })
  }

  return opts.next({
    ctx: {
      ...payload,
      c: opts.ctx.c,
    }
  })
})

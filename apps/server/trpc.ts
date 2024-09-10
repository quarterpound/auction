import { initTRPC, TRPCError } from '@trpc/server';
import { verify } from 'hono/jwt';
import { env } from './env';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { prisma } from './database';
import superjson from 'superjson'

type Context = {
  authorization: string | null
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const token = opts.ctx.authorization

  if(!token) {
    throw new TRPCError({message: 'Not authorized', code: 'UNAUTHORIZED'})
  }

  const payload = await verify(token, env.JWT_SECRET)

  if(!payload) {
    throw new TRPCError({message: 'Token expired', code: 'UNAUTHORIZED'})
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub as string,
    }
  })


  if(!user) {
    throw new TRPCError({message: 'User could not be found', code: 'CONFLICT'})
  }

  return opts.next({
    ctx: {
      user,
    }
  })
})

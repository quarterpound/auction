import { prisma } from '../database';
import { publicProcedure, router } from '../trpc';

export const appRouter = router({
  userList: publicProcedure.query(async() => {
    const users = await prisma.user.findMany()

    return users;
  })
});

export type AppRouter = typeof appRouter;

import { router } from '../trpc';
import { authRoute } from './auth/route';

export const appRouter = router({
  auth: authRoute,
});

export type AppRouter = typeof appRouter;

import { router } from '../trpc';
import { auctionRoute } from './auctions/route';
import { authRoute } from './auth/route';
import { bidsRoute } from './bids/route';
import { categoryRouter } from './categories/router';
import { feedRouter } from './feed/router';
import { generalRouter } from './general/route';
import { profileRouter } from './profile/router';

export const appRouter = router({
  auth: authRoute,
  auctions: auctionRoute,
  category: categoryRouter,
  feed: feedRouter,
  bids: bidsRoute,
  profile: profileRouter,
  general: generalRouter,
});

export type AppRouter = typeof appRouter;

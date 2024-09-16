import type {AppRouter} from "server/router"

import { createTRPCClient, createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson'

export const trpc = createTRPCReact<AppRouter>();

export const trpcVanillaClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4200/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
      transformer: superjson,
    }),
  ],
});

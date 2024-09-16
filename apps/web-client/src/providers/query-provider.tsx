'use client'

import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from "@/trpc";
import { httpBatchLink } from '@trpc/client';
import SuperJSON from "superjson";

const QueryProvider = ({children}: React.PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4200/trpc',
          transformer: SuperJSON,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )

}

export default QueryProvider

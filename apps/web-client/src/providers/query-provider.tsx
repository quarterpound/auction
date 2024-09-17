'use client'

import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink, trpc } from "@/trpc";

const QueryProvider = ({children}: React.PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink,
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

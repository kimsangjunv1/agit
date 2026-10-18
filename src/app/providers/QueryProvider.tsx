"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: React.PropsWithChildren) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        refetchOnMount: false,
                        retry: 1,
                        staleTime: 1000 * 60 * 5,
                        throwOnError: true,
                    },
                },
            }),
    );

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

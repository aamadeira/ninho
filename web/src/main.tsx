import "@fontsource-variable/fraunces/soft.css";
import "@fontsource-variable/nunito-sans/wght.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { isApiError } from "./lib/api";
import { queryKeys } from "./lib/queries";
import { routes } from "./router";

const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            if (isApiError(error, 401)) {
                queryClient.setQueryData(queryKeys.me, null);
            }
        }
    }),
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (isApiError(error) && error.status < 500) {
                    return false;
                }
                return failureCount < 2;
            }
        }
    }
});

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>
);

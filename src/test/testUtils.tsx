import { ReactElement, PropsWithChildren } from "react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  DefaultOptions,
} from "@tanstack/react-query";
import { render } from "@testing-library/react";

type RenderOptions = {
  routerProps?: MemoryRouterProps;
  queryClient?: QueryClient;
};

const defaultQueryClientOptions: DefaultOptions = {
  queries: {
    retry: false,
    refetchOnWindowFocus: false,
  },
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { routerProps, queryClient }: RenderOptions = {}
) {
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    queryClient: client,
    ...render(ui, { wrapper: Wrapper }),
  };
}


"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import CustomMapProvider from "./CustomMapProvider";
import { TooltipProvider } from "./ui/tooltip";

const Providers = ({ children }: { children: ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 20 * 60 * 1000, // 20 minutes
						gcTime: 20 * 60 * 1000, // 20 minutes
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<CustomMapProvider>
				<TooltipProvider>{children}</TooltipProvider>
			</CustomMapProvider>
		</QueryClientProvider>
	);
};

export default Providers;

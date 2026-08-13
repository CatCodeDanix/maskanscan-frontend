"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import CustomMapProvider from "./CustomMapProvider";
import { SidebarProvider } from "./ui/sidebar";
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
				<TooltipProvider>
					<SidebarProvider
						className="h-svh overflow-hidden"
						style={
							{
								"--sidebar-width": "350px",
							} as React.CSSProperties
						}
					>
						{children}
					</SidebarProvider>
				</TooltipProvider>
			</CustomMapProvider>
		</QueryClientProvider>
	);
};

export default Providers;

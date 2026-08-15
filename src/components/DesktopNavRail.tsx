"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavUser } from "@/components/NavUser";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type NavItem, useNavigationStore } from "@/store/navigation-store";

export const placeholderUser = {
	name: "کاربر",
	email: "user@example.com",
	avatar: "",
};

interface DesktopNavRailProps {
	onItemClick: (itemId: string) => void;
}

export function DesktopNavRail({ onItemClick }: DesktopNavRailProps) {
	const router = useRouter();
	const items = useNavigationStore((s) => s.items);
	const activeItemId = useNavigationStore((s) => s.activeItemId);
	const isDrawerOpen = useNavigationStore((s) => s.isDrawerOpen);
	const toggleDrawer = useNavigationStore((s) => s.toggleDrawer);
	const setIsDrawerOpen = useNavigationStore((s) => s.setIsDrawerOpen);

	const handleClick = (item: NavItem) => {
		if (item.type === "link") {
			router.push(item.url);
			return;
		}

		if (item.type === "action") {
			item.onClick();
			return;
		}

		// If clicking the currently active panel, toggle the drawer open/close
		if (item.id === activeItemId) {
			toggleDrawer();
			return;
		}

		// If clicking a different panel, activate it and make sure drawer is open
		onItemClick(item.id);
		setIsDrawerOpen(true);
	};

	return (
		<TooltipProvider delayDuration={150}>
			<aside
				className="w-13 shrink-0 h-full border-l bg-background/95 flex flex-col items-center py-2 justify-between z-30 select-none shadow-xs"
				dir="rtl"
			>
				{/* Top Brand Home Button */}
				<div className="flex flex-col items-center gap-3">
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/"
								aria-label="صفحه اصلی مسکن‌اسکن"
								className="flex size-9.5 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-2xs group"
							>
								<Home className="size-4.5 transition-transform group-hover:scale-105" />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="left" className="text-xs">
							صفحه اصلی
						</TooltipContent>
					</Tooltip>

					<div className="h-px w-6 bg-border/80 my-0.5" />

					{/* Navigation Icons Menu */}
					<nav className="flex flex-col items-center gap-1.5">
						{items.map((item) => {
							const isActive = isDrawerOpen && item.id === activeItemId;

							return (
								<Tooltip key={item.id}>
									<TooltipTrigger asChild>
										<button
											type="button"
											onClick={() => handleClick(item)}
											className={cn(
												"relative flex size-9.5 items-center justify-center rounded-xl transition-all duration-150 cursor-pointer",
												isActive
													? "bg-primary text-primary-foreground shadow-xs font-semibold scale-100"
													: "text-muted-foreground hover:text-foreground hover:bg-muted/80",
											)}
											aria-label={item.title}
										>
											<item.icon className="size-4.5 shrink-0" />
										</button>
									</TooltipTrigger>
									<TooltipContent side="left" className="text-xs">
										{item.title}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</nav>
				</div>

				{/* Bottom User Avatar */}
				<div className="flex flex-col items-center pt-2">
					<NavUser user={placeholderUser} />
				</div>
			</aside>
		</TooltipProvider>
	);
}

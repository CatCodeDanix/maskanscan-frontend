"use client";

import { AppWindow, Columns3, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigationStore } from "@/store/navigation-store";

export function DesktopDrawerPanel() {
	const items = useNavigationStore((s) => s.items);
	const activeItemId = useNavigationStore((s) => s.activeItemId);
	const isDrawerOpen = useNavigationStore((s) => s.isDrawerOpen);
	const setIsDrawerOpen = useNavigationStore((s) => s.setIsDrawerOpen);
	const drawerMode = useNavigationStore((s) => s.drawerMode);
	const setDrawerMode = useNavigationStore((s) => s.setDrawerMode);

	const activeItem = items.find((item) => item.id === activeItemId);
	const activeTitle = activeItem?.title ?? "پنل";

	const panelContent = useMemo(() => {
		if (activeItem?.type === "panel") {
			const Component = activeItem.component;
			return <Component />;
		}
		return null;
	}, [activeItem]);

	const isOverlay = drawerMode === "overlay";

	return (
		<div
			className={cn(
				"h-full flex flex-col bg-background/95 border-l border-border/80 transition-all duration-300 ease-in-out select-none",
				isOverlay
					? cn(
							"absolute top-0 right-0 bottom-0 z-20 w-[360px] md:w-[380px] shadow-2xl backdrop-blur-md",
							isDrawerOpen
								? "translate-x-0 opacity-100"
								: "translate-x-full pointer-events-none opacity-0",
						)
					: cn(
							"relative shrink-0",
							isDrawerOpen
								? "w-[360px] md:w-[380px] opacity-100"
								: "w-0 overflow-hidden border-none opacity-0",
						),
			)}
			dir="rtl"
		>
			{/* Drawer Panel Header */}
			<div className="flex shrink-0 items-center justify-between border-b px-4 py-3 bg-background/90 backdrop-blur-xs">
				<div className="flex items-center gap-2">
					<span className="text-sm font-bold text-foreground">
						{activeTitle}
					</span>
				</div>

				<div className="flex items-center gap-1">
					<TooltipProvider delayDuration={200}>
						{/* Toggle Overlay / Push Presentation Mode */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
									onClick={() => setDrawerMode(isOverlay ? "push" : "overlay")}
									aria-label={
										isOverlay
											? "تغییر به حالت کنار هم (Push)"
											: "تغییر به حالت شناور (Overlay)"
									}
								>
									{isOverlay ? (
										<AppWindow className="size-4" />
									) : (
										<Columns3 className="size-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom" className="text-xs">
								{isOverlay
									? "حالت شناور (روی نقشه) — تغییر به حالت کنار هم"
									: "حالت کنار هم — تغییر به حالت شناور"}
							</TooltipContent>
						</Tooltip>

						{/* Close Panel Button */}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
									onClick={() => setIsDrawerOpen(false)}
									aria-label="بستن پنل"
								>
									<X className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom" className="text-xs">
								بستن پنل
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Drawer Panel Scrollable Content */}
			<div className="flex-1 overflow-hidden flex flex-col">{panelContent}</div>
		</div>
	);
}

"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import BaseMapWrapper from "@/components/BaseMapWrapper";
import { BottomBar } from "@/components/BottomBar";
import { ContentDrawer } from "@/components/ContentDrawer";
import { DesktopDrawerPanel } from "@/components/DesktopDrawerPanel";
import { DesktopNavRail, placeholderUser } from "@/components/DesktopNavRail";
import { NavUser } from "@/components/NavUser";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFilterSync } from "@/hooks/use-filter-sync";
import { useIsMobile } from "@/hooks/use-mobile";
import { useListingStore } from "@/store/listing-store";
import { useNavigationStore } from "@/store/navigation-store";

function AppContent() {
	useFilterSync();

	const isMobile = useIsMobile();
	const activeItemId = useNavigationStore((s) => s.activeItemId);
	const setActiveItemId = useNavigationStore((s) => s.setActiveItemId);
	const isDrawerOpen = useNavigationStore((s) => s.isDrawerOpen);
	const toggleDrawer = useNavigationStore((s) => s.toggleDrawer);
	const setIsDrawerOpen = useNavigationStore((s) => s.setIsDrawerOpen);
	const drawerMode = useNavigationStore((s) => s.drawerMode);
	const selectedListing = useListingStore((s) => s.selectedListing);
	const setSelectedListing = useListingStore((s) => s.setSelectedListing);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

	const handleItemClick = (itemId: string) => {
		if (isMobile) {
			const hasDetailOpen = selectedListing !== null;
			if (hasDetailOpen) {
				setSelectedListing(null);
			}

			if (itemId === activeItemId) {
				// If detail sheet was open, dismissing it already returns to the active panel.
				// Only toggle drawer open/closed if detail sheet was NOT open.
				if (!hasDetailOpen) {
					triggerRef.current?.click();
				}
			} else {
				setActiveItemId(itemId);
				if (!mobileDrawerOpen) {
					triggerRef.current?.click();
				}
			}
		} else {
			setActiveItemId(itemId);
			setIsDrawerOpen(true);
		}
	};

	return (
		<div
			className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-row bg-background"
			dir="rtl"
		>
			{/* 1. Far-Right Icon Rail (First child in RTL = rightmost edge) */}
			{!isMobile && <DesktopNavRail onItemClick={handleItemClick} />}

			{/* 2. Main Workspace (Header on top + Map and Drawer below Header) */}
			<div className="flex flex-1 flex-col overflow-hidden h-full relative min-w-0">
				{/* Top Application Header (Spans all the way from left edge to the right rail) */}
				<header className="bg-background/95 sticky top-0 z-30 h-14 md:h-15 border-b px-3 md:px-4 shrink-0 flex items-center justify-between backdrop-blur-md shadow-2xs">
					{/* Right section (adjacent to the rail on the right): Toggle Drawer button */}
					<div className="flex items-center gap-2">
						{!isMobile ? (
							<TooltipProvider delayDuration={200}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={toggleDrawer}
											className="size-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
											aria-label={
												isDrawerOpen ? "بستن پنل کناری" : "باز کردن پنل کناری"
											}
										>
											{isDrawerOpen ? (
												<PanelRightClose className="size-4.5" />
											) : (
												<PanelRightOpen className="size-4.5" />
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent side="bottom" className="text-xs">
										{isDrawerOpen ? "بستن پنل کناری" : "باز کردن پنل کناری"}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<div className="w-9">
								<NavUser user={placeholderUser} />
							</div>
						)}
					</div>

					{/* Center Logo and Brand with Logo between مسکن and اسکن */}
					<div className="flex items-center justify-center gap-1.5 md:gap-2 select-none">
						<span className="text-primary text-base font-extrabold md:text-lg tracking-tight">
							مسکن
						</span>
						<Image
							src="/logo.svg"
							className="block size-7 md:size-8 shrink-0 hover:scale-105 transition-transform"
							width={32}
							height={32}
							priority
							alt="MaskanScan Logo"
						/>
						<span className="text-primary text-base font-extrabold md:text-lg tracking-tight">
							اسکن
						</span>
					</div>

					{/* Left spacer for visual balance */}
					<div className="w-8.5 md:w-9" />
				</header>

				{/* Below-Header Area (Drawer Content Panel + Map) */}
				<div className="flex-1 relative overflow-hidden flex flex-row">
					{/* Push Mode: Drawer Panel sits as first child (on the right of the map in RTL) */}
					{!isMobile && drawerMode === "push" && <DesktopDrawerPanel />}

					{/* Map Canvas */}
					<div className="flex-1 h-full w-full relative overflow-hidden">
						<BaseMapWrapper />

						{/* Overlay Mode: Drawer Panel floats on top of the map on the right */}
						{!isMobile && drawerMode === "overlay" && <DesktopDrawerPanel />}
					</div>
				</div>
			</div>

			{/* Mobile Bottom Navigation & Content Drawer */}
			{isMobile && (
				<>
					<BottomBar onItemClick={handleItemClick} />
					<ContentDrawer
						triggerRef={triggerRef}
						onOpenChange={setMobileDrawerOpen}
					/>
				</>
			)}
		</div>
	);
}

export default function Page() {
	return <AppContent />;
}

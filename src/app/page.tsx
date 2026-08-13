"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AppSidebar, placeholderUser } from "@/components/AppSidebar";
import BaseMapWrapper from "@/components/BaseMapWrapper";
import { BottomBar } from "@/components/BottomBar";
import { ContentDrawer } from "@/components/ContentDrawer";
import { NavUser } from "@/components/NavUser";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useFilterSync } from "@/hooks/use-filter-sync";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigationStore } from "@/store/navigation-store";

function AppContent() {
	useFilterSync();

	const isMobile = useIsMobile();
	const activeItemId = useNavigationStore((s) => s.activeItemId);
	const setActiveItemId = useNavigationStore((s) => s.setActiveItemId);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleItemClick = (itemId: string) => {
		if (isMobile) {
			if (itemId === activeItemId) {
				triggerRef.current?.click();
			} else {
				setActiveItemId(itemId);
				if (!drawerOpen) {
					triggerRef.current?.click();
				}
			}
		} else {
			setActiveItemId(itemId);
		}
	};

	return (
		<div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col md:flex-row">
			<AppSidebar onItemClick={handleItemClick} />

			<SidebarInset className="flex flex-1 flex-col overflow-hidden h-full">
				<header
					className="
						bg-background
						sticky top-0 z-10
						h-14 md:h-16 border-b px-3 md:px-4
						shrink-0
					"
				>
					<div className="flex h-full items-center justify-between">
						{/* Right action */}
						<div className="flex w-10 md:w-12 items-center justify-start">
							{isMobile ? (
								<div className="w-10">
									<NavUser user={placeholderUser} />
								</div>
							) : (
								<SidebarTrigger />
							)}
						</div>

						{/* Center logo and brand */}
						<div className="flex items-center justify-center gap-2">
							<Image
								src={"/logo.svg"}
								className="block size-8 md:size-10 shrink-0"
								width={40}
								height={40}
								priority
								alt="MaskanScan Logo"
							/>
							<span className="text-primary text-sm font-bold md:text-lg">
								مسکن‌اسکن
							</span>
						</div>

						{/* Left spacer for perfect visual centering */}
						<div className="w-10 md:w-12" />
					</div>
				</header>

				<div className="flex-1 overflow-hidden relative pb-14 md:pb-0 h-full">
					<BaseMapWrapper />
				</div>
			</SidebarInset>

			{isMobile && (
				<>
					<BottomBar onItemClick={handleItemClick} />
					<ContentDrawer triggerRef={triggerRef} onOpenChange={setDrawerOpen} />
				</>
			)}
		</div>
	);
}

export default function Page() {
	return <AppContent />;
}

"use client";

import Image from "next/image";
import { Suspense, useRef, useState } from "react";
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
		<>
			<AppSidebar onItemClick={handleItemClick} />

			<SidebarInset className="flex flex-col overflow-hidden">
				<header
					className="
    bg-background
    sticky top-0 z-10
    h-16 border-b px-4
  "
				>
					<div className="flex h-full items-center">
						{/* Right action */}
						<div className="flex w-12 items-center justify-start">
							{isMobile ? (
								<div className="w-12">
									<NavUser user={placeholderUser} />
								</div>
							) : (
								<SidebarTrigger />
							)}
						</div>

						{/* Center content */}
						<div className="flex flex-1 items-center justify-center p-12">
							<Image
								src={"/logo.svg"}
								className="block size-[50px] shrink-0"
								width={50}
								height={50}
								priority
								alt="MaskanScan Logo - A blended house and map marker"
							/>
							<span className="text-primary text-base font-semibold md:text-lg">
								مسکناسکن
							</span>
						</div>

						{/* Left spacer for perfect balance */}
						<div className="w-12" />
					</div>
				</header>

				<div
					className="
            flex-1 pb-14
            md:pb-0
          "
				>
					<BaseMapWrapper />
				</div>
			</SidebarInset>

			{isMobile && (
				<>
					<BottomBar onItemClick={handleItemClick} />
					<ContentDrawer triggerRef={triggerRef} onOpenChange={setDrawerOpen} />
				</>
			)}
		</>
	);
}

export default function Page() {
	return (
		<Suspense>
			<AppContent />
		</Suspense>
	);
}

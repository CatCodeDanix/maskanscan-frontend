"use client";

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { useNavigationStore } from "@/store/navigation-store";

interface ContentDrawerProps {
	triggerRef: React.RefObject<HTMLButtonElement | null>;
	onOpenChange: (open: boolean) => void;
}

export function ContentDrawer({
	triggerRef,
	onOpenChange,
}: ContentDrawerProps) {
	const items = useNavigationStore((s) => s.items);
	const activeItemId = useNavigationStore((s) => s.activeItemId);
	const activeItem = items.find((item) => item.id === activeItemId);

	const panelContent =
		activeItem?.type === "panel" ? <activeItem.component /> : null;

	return (
		<Drawer
			closeThreshold={0.15}
			modal={false}
			shouldScaleBackground={false}
			onOpenChange={onOpenChange}
		>
			<DrawerTrigger ref={triggerRef} className="hidden" />
			<DrawerContent
				showOverlay={false}
				className="mb-14 h-[75dvh] max-h-[85dvh] flex flex-col p-0 bg-background border-t shadow-2xl"
				style={
					{
						"--initial-transform": "calc(100% + 3.5rem)",
					} as React.CSSProperties
				}
			>
				<DrawerHeader
					className="shrink-0 flex items-center justify-between border-b px-4 py-2.5 text-right bg-background"
					dir="rtl"
				>
					<DrawerTitle className="text-xs font-bold text-foreground">
						{activeItem?.title ?? "پنل"}
					</DrawerTitle>
				</DrawerHeader>
				<div className="flex-1 overflow-hidden flex flex-col">
					{panelContent}
				</div>
			</DrawerContent>
		</Drawer>
	);
}

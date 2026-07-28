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
				className="mb-14"
				style={
					{
						maxHeight: "calc(100dvh - 12rem)",
						height: "550px",
						"--initial-transform": "calc(100% + 3.5rem)",
					} as React.CSSProperties
				}
			>
				<DrawerHeader className="gap-3.5 border-b p-4 text-left">
					<DrawerTitle>{activeItem?.title ?? "پنل"}</DrawerTitle>
				</DrawerHeader>
				<div className="flex-1 overflow-y-auto p-4 pt-0">{panelContent}</div>
			</DrawerContent>
		</Drawer>
	);
}

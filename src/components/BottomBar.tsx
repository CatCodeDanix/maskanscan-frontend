"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type NavItem, useNavigationStore } from "@/store/navigation-store";

interface BottomBarProps {
	onItemClick: (itemId: string) => void;
}

export function BottomBar({ onItemClick }: BottomBarProps) {
	const router = useRouter();
	const items = useNavigationStore((s) => s.items);
	const activeItemId = useNavigationStore((s) => s.activeItemId);

	const handleClick = (item: NavItem) => {
		if (item.type === "link") {
			router.push(item.url);
		} else if (item.type === "action") {
			item.onClick();
		} else {
			onItemClick(item.id);
		}
	};

	return (
		<div
			className="
        bg-background fixed inset-x-0 bottom-0 z-100 flex w-full items-center
        justify-around border-t p-2
        md:hidden
      "
		>
			{items.map((item) => {
				const Icon = item.icon;
				const isActive = item.id === activeItemId;
				return (
					<Button
						key={item.id}
						variant={isActive ? "secondary" : "ghost"}
						size="icon"
						onClick={() => handleClick(item)}
						className={cn(
							"size-10",
							isActive && "bg-accent text-accent-foreground",
						)}
						aria-label={item.title}
					>
						<Icon className="size-5" />
					</Button>
				);
			})}
		</div>
	);
}

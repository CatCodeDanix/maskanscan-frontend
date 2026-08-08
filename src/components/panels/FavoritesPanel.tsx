"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Heart, Trash2 } from "lucide-react";
import { useRef } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/favorites-store";

export function FavoritesPanel() {
	const favoriteListings = useFavoritesStore((s) => s.favoriteListings);
	const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: favoriteListings.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 240, // height of property card + margin
		overscan: 5,
	});

	if (favoriteListings.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
				<Heart className="size-10 stroke-1 opacity-40" />
				<div className="space-y-1">
					<p className="text-sm font-semibold">
						هیچ آگهی علاقه‌مندی ثبت نشده است
					</p>
					<p className="text-xs text-muted-foreground">
						با کلیک روی آیکون قلب در آگهی‌ها، آن‌ها را به این لیست اضافه کنید.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-background" dir="rtl">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-4 py-2 text-xs">
				<span className="font-medium text-muted-foreground">
					{favoriteListings.length.toLocaleString("fa-IR")} آگهی در علاقه‌مندی‌ها
				</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={clearFavorites}
					className="h-7 gap-1 text-[11px] text-destructive hover:bg-destructive/10"
				>
					<Trash2 className="size-3" />
					پاکسازی لیست
				</Button>
			</div>

			{/* Virtualized Container */}
			<div ref={parentRef} className="flex-1 overflow-y-auto p-3">
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const listing = favoriteListings[virtualRow.index];
						if (!listing) return null;

						return (
							<div
								key={`${listing.source}-${listing.externalId}`}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
									paddingBottom: "12px",
								}}
							>
								<PropertyCard listing={listing} />
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

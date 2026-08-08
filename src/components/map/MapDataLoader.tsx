"use client";

import { Home, Loader2, MapPin, Sparkles } from "lucide-react";
import { useListingStore } from "@/store/listing-store";

export function MapDataLoader() {
	const isLoadingMapPins = useListingStore((s) => s.isLoadingMapPins);
	const mapPins = useListingStore((s) => s.mapPins);
	const isLoadingListings = useListingStore((s) => s.isLoading);

	const isInitialLoading =
		(isLoadingMapPins || isLoadingListings) && mapPins.length === 0;

	if (!isInitialLoading) return null;

	return (
		<div
			className="absolute top-4 left-1/2 z-20 -translate-x-1/2 transition-all duration-500 animate-in fade-in slide-in-from-top-4"
			dir="rtl"
		>
			<div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-background/90 px-4 py-2.5 shadow-2xl backdrop-blur-md">
				{/* Glowing radar ping icon */}
				<div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<span className="absolute inline-flex size-full animate-ping rounded-xl bg-primary/30 opacity-75" />
					<MapPin className="relative size-5 text-primary" />
					<Home className="absolute size-2.5 text-primary-foreground font-bold" />
				</div>

				<div className="space-y-0.5 text-right">
					<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
						<Sparkles className="size-3 text-amber-500 animate-pulse" />
						<span>در حال چیدمان داده‌های مکانی ملک‌ها روی نقشه...</span>
					</div>
					<p className="text-[11px] text-muted-foreground">
						فراخوانی و بهینه‌سازی ۱۵۰,۰۰۰+ آگهی سراسر کشور
					</p>
				</div>

				<Loader2 className="mr-2 size-4 shrink-0 animate-spin text-primary" />
			</div>
		</div>
	);
}

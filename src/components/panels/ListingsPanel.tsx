"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Home, Loader2, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useViewportListings } from "@/hooks/use-viewport-listings";
import { cn } from "@/lib/utils";
import { useListingStore } from "@/store/listing-store";
import { useMapStore } from "@/store/map-store";

function CardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border bg-card p-0 shadow-2xs">
			<Skeleton className="h-36 w-full rounded-none" />
			<div className="space-y-2.5 p-3">
				<Skeleton className="h-4 w-full" />
				<div className="flex items-center gap-3">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-3 w-16" />
				</div>
				<Skeleton className="h-12 w-full rounded-lg" />
			</div>
		</div>
	);
}

export function ListingsPanel() {
	const queryClient = useQueryClient();
	const viewportBBox = useMapStore((s) => s.viewportBBox);
	const resetFilters = useListingStore((s) => s.resetFilters);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Geospatial Viewport Infinite Query
	const {
		listings,
		total,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
		refetch,
	} = useViewportListings({ viewportBBox });

	const parentRef = useRef<HTMLDivElement>(null);
	const count = listings.length;

	const rowVirtualizer = useVirtualizer({
		count,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 310, // Card height estimate
		overscan: 6,
	});

	// Trigger next page when scrolling near bottom
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		const distanceToBottom =
			target.scrollHeight - target.scrollTop - target.clientHeight;
		if (
			distanceToBottom < 3000 &&
			hasNextPage &&
			!isLoading &&
			!isFetchingNextPage
		) {
			void fetchNextPage();
		}
	};

	const handleManualRefresh = async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([queryClient.invalidateQueries(), refetch()]);
			toast.success("آگهی‌ها با موفقیت به‌روزرسانی شدند");
		} catch {
			toast.error("خطا در به‌روزرسانی آگهی‌ها");
		} finally {
			setTimeout(() => setIsRefreshing(false), 500);
		}
	};

	// 1. Initial Loading State: Pure shimmering skeleton cards (no banners/text)
	if (isLoading && listings.length === 0) {
		return (
			<div className="space-y-3 p-3" dir="rtl">
				{[0, 1, 2].map((i) => (
					<CardSkeleton key={i} />
				))}
			</div>
		);
	}

	// 2. Error State
	if (error && listings.length === 0) {
		return (
			<div
				className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full"
				dir="rtl"
			>
				<AlertCircle className="size-8 text-destructive" />
				<p className="text-sm text-muted-foreground">{error}</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => void handleManualRefresh()}
					className="gap-2"
				>
					<RefreshCcw className="size-3.5" />
					تلاش مجدد
				</Button>
			</div>
		);
	}

	// 3. Empty State
	if (!isLoading && listings.length === 0) {
		return (
			<div
				className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full"
				dir="rtl"
			>
				<div className="rounded-full bg-muted p-4">
					<Home className="size-8 text-muted-foreground/60" />
				</div>
				<p className="text-sm font-bold text-foreground">
					هیچ آگهیی در این محدوده یافت نشد
				</p>
				<p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
					روی نقشه جابجا شوید، زوم را تغییر دهید یا فیلترهای جستجو را پاکسازی
					کنید
				</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => {
						resetFilters();
						void handleManualRefresh();
					}}
					className="mt-1"
				>
					پاک کردن فیلترها
				</Button>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-background" dir="rtl">
			{/* Sticky Header Status Bar with Non-Overflowing Layout */}
			<div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-background/95 px-3.5 py-2.5 text-xs backdrop-blur-xs shadow-2xs">
				<span className="font-semibold text-muted-foreground text-xs">
					نمایش {listings.length.toLocaleString("fa-IR")} از{" "}
					{total.toLocaleString("fa-IR")} آگهی در این محدوده
				</span>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-7.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
								onClick={() => void handleManualRefresh()}
								aria-label="به‌روزرسانی آگهی‌ها"
							>
								<RefreshCcw
									className={cn(
										"size-3.5 transition-transform",
										isRefreshing && "animate-spin text-primary",
									)}
								/>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom" className="text-[11px]">
							به‌روزرسانی آگهی‌ها
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			{/* TanStack Virtual Container */}
			<div
				ref={parentRef}
				onScroll={handleScroll}
				className="flex-1 overflow-y-auto p-3"
			>
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const listing = listings[virtualRow.index];
						if (!listing) return null;

						return (
							<div
								key={`${listing.source}-${listing.externalId}-${virtualRow.index}`}
								ref={rowVirtualizer.measureElement}
								data-index={virtualRow.index}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									transform: `translateY(${virtualRow.start}px)`,
									paddingBottom: "12px",
								}}
							>
								<PropertyCard listing={listing} />
							</div>
						);
					})}
				</div>

				{/* Loading indicator at bottom of infinite scroll */}
				{isFetchingNextPage && (
					<div className="py-4 text-center">
						<Loader2 className="mx-auto size-5 animate-spin text-primary" />
					</div>
				)}
			</div>
		</div>
	);
}

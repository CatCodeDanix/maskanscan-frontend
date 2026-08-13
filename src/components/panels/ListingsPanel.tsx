"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { LOTTIE_PRESETS, LottieLoader } from "@/components/ui/LottieLoader";
import { Skeleton } from "@/components/ui/skeleton";
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
		<div className="overflow-hidden rounded-xl border bg-card p-0">
			<Skeleton className="h-36 w-full rounded-none" />
			<div className="space-y-2 p-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-3 w-2/3" />
				<Skeleton className="h-4 w-1/2" />
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
		} finally {
			setTimeout(() => setIsRefreshing(false), 600);
		}
	};

	if (isLoading && listings.length === 0) {
		return (
			<div
				className="flex h-full flex-col items-center justify-center p-6 text-center"
				dir="rtl"
			>
				<LottieLoader
					src={LOTTIE_PRESETS.loading}
					size={100}
					fallbackText="در حال جستجو و بارگذاری املاک در این محدوده..."
				/>
				<div className="mt-4 w-full space-y-3">
					{[0, 1].map((i) => (
						<CardSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}

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

	if (!isLoading && listings.length === 0) {
		return (
			<div
				className="flex flex-col items-center justify-center gap-3 p-6 text-center h-full"
				dir="rtl"
			>
				<LottieLoader src={LOTTIE_PRESETS.empty} size={120} fallbackText="" />
				<p className="text-sm font-bold text-foreground">
					هیچ آگهیی در این محدوده یافت نشد
				</p>
				<p className="text-xs text-muted-foreground max-w-[260px]">
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
					className="mt-2"
				>
					پاک کردن فیلترها
				</Button>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-background" dir="rtl">
			{/* Sticky Header Status Bar with Manual Refresh Button & Tooltips */}
			<div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-background/95 px-3.5 py-2.5 text-xs backdrop-blur-xs shadow-2xs">
				<span className="font-semibold text-muted-foreground text-[11px] sm:text-xs truncate">
					نمایش {listings.length.toLocaleString("fa-IR")} از{" "}
					{total.toLocaleString("fa-IR")} آگهی
				</span>

				<div className="flex items-center gap-2 shrink-0">
					{(isLoading || isFetchingNextPage || isRefreshing) && (
						<div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-[10px] sm:text-[11px] whitespace-nowrap animate-in fade-in duration-200">
							<Loader2 className="size-3 animate-spin shrink-0" />
							<span>در حال به‌روزرسانی...</span>
						</div>
					)}

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
											isRefreshing && "animate-spin",
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

				{/* Loading indicator at bottom of scroll */}
				{isFetchingNextPage && (
					<div className="py-4 text-center">
						<Loader2 className="mx-auto size-5 animate-spin text-primary" />
					</div>
				)}
			</div>
		</div>
	);
}

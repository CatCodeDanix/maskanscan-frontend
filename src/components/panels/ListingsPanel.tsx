"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Home, Loader2, RefreshCcw } from "lucide-react";
import { useRef } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListingStore } from "@/store/listing-store";

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
	const listings = useListingStore((s) => s.listings);
	const isLoading = useListingStore((s) => s.isLoading);
	const isFetchingNextPage = useListingStore((s) => s.isFetchingNextPage);
	const hasMore = useListingStore((s) => s.hasMore);
	const error = useListingStore((s) => s.error);
	const total = useListingStore((s) => s.total);
	const hasFetched = useListingStore((s) => s.hasFetched);
	const fetchListings = useListingStore((s) => s.fetchListings);
	const fetchNextPage = useListingStore((s) => s.fetchNextPage);
	const resetFilters = useListingStore((s) => s.resetFilters);

	const parentRef = useRef<HTMLDivElement>(null);

	const count = listings.length;

	const rowVirtualizer = useVirtualizer({
		count,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 310, // Card height estimate with 2-row pricing
		overscan: 6,
	});

	// Trigger next page when scrolling within 3500px of bottom (~10 cards ahead)
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		const distanceToBottom =
			target.scrollHeight - target.scrollTop - target.clientHeight;
		if (
			distanceToBottom < 3500 &&
			hasMore &&
			!isLoading &&
			!isFetchingNextPage
		) {
			void fetchNextPage();
		}
	};

	if (isLoading && !hasFetched) {
		return (
			<div className="space-y-3 p-3" dir="rtl">
				{[0, 1, 2, 3].map((i) => (
					<CardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (error && listings.length === 0) {
		return (
			<div
				className="flex flex-col items-center gap-3 p-6 text-center"
				dir="rtl"
			>
				<AlertCircle className="size-8 text-destructive" />
				<p className="text-sm text-muted-foreground">{error}</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => void fetchListings(true)}
					className="gap-2"
				>
					<RefreshCcw className="size-3.5" />
					تلاش مجدد
				</Button>
			</div>
		);
	}

	if (hasFetched && listings.length === 0) {
		return (
			<div
				className="flex flex-col items-center gap-3 p-6 text-center"
				dir="rtl"
			>
				<Home className="size-8 text-muted-foreground/50" />
				<p className="text-sm font-medium">هیچ آگهیی یافت نشد</p>
				<p className="text-xs text-muted-foreground">
					فیلترهای خود را تغییر دهید یا محدوده شهر/قیمت دیگری را انتخاب کنید
				</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => {
						resetFilters();
						void fetchListings(true);
					}}
				>
					پاک کردن فیلترها
				</Button>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-background" dir="rtl">
			{/* Sticky Header Status Bar */}
			{hasFetched && (
				<div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-background/95 p-3 text-xs backdrop-blur-xs shadow-2xs">
					<span className="font-medium text-muted-foreground">
						نمایش {listings.length.toLocaleString("fa-IR")} از{" "}
						{total.toLocaleString("fa-IR")} آگهی
					</span>
					{(isLoading || isFetchingNextPage) && (
						<div className="flex items-center gap-1.5 font-medium text-primary text-[11px]">
							<Loader2 className="size-3.5 animate-spin" />
							در حال بارگذاری...
						</div>
					)}
				</div>
			)}

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

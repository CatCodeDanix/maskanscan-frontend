"use client";

import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useListingStore } from "@/store/listing-store";

function CardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border bg-card">
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
	const error = useListingStore((s) => s.error);
	const total = useListingStore((s) => s.total);
	const hasFetched = useListingStore((s) => s.hasFetched);
	const fetchListings = useListingStore((s) => s.fetchListings);
	const resetFilters = useListingStore((s) => s.resetFilters);

	if (isLoading && !hasFetched) {
		return (
			<div className="space-y-3 p-3">
				{[0, 1, 2].map((i) => (
					<CardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center gap-3 p-6 text-center">
				<AlertCircle className="size-8 text-destructive" />
				<p className="text-sm text-muted-foreground">{error}</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => void fetchListings()}
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
			<div className="flex flex-col items-center gap-3 p-6 text-center">
				<Home className="size-8 text-muted-foreground/50" />
				<p className="text-sm font-medium">آگهیی یافت نشد</p>
				<p className="text-xs text-muted-foreground">
					فیلترهای خود را تغییر دهید یا شهر دیگری را انتخاب کنید
				</p>
				<Button
					size="sm"
					variant="outline"
					onClick={() => {
						resetFilters();
						void fetchListings();
					}}
				>
					پاک کردن فیلترها
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			{/* Header */}
			{hasFetched && (
				<div className="flex items-center justify-between border-b px-4 py-2">
					<span className="text-xs text-muted-foreground">
						{total.toLocaleString("fa-IR")} آگهی یافت شد
					</span>
					{isLoading && (
						<RefreshCcw className="size-3 animate-spin text-muted-foreground" />
					)}
				</div>
			)}

			<ScrollArea className="flex-1">
				<div className="space-y-3 p-3">
					{listings.map((listing) => (
						<PropertyCard
							key={`${listing.source}-${listing.externalId}`}
							listing={listing}
						/>
					))}
					{isLoading && hasFetched && <CardSkeleton />}
				</div>
			</ScrollArea>
		</div>
	);
}

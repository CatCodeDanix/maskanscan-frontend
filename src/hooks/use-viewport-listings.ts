"use client";

import {
	keepPreviousData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchViewportListingsAction } from "@/app/actions/geospatial";
import { expandBBox, isBBoxContained, snapBBox } from "@/lib/geospatial";
import { useListingStore } from "@/store/listing-store";
import type { BBox, ViewportListingsResponse } from "@/types/geospatial";
import type { UnifiedListing } from "@/types/listing";

interface UseViewportListingsProps {
	viewportBBox: BBox | null;
}

export function useViewportListings({
	viewportBBox,
}: UseViewportListingsProps) {
	const queryClient = useQueryClient();

	// Extract active committed filters from listing-store
	const appliedFilters = useListingStore((s) => s.appliedFilters);

	const filters = useMemo(
		() => ({
			dealType: appliedFilters.dealType,
			city: appliedFilters.city || undefined,
			district: appliedFilters.district || undefined,
			bedrooms: appliedFilters.bedrooms,
			minBedrooms: appliedFilters.minBedrooms,
			maxBedrooms: appliedFilters.maxBedrooms,
			hasParking: appliedFilters.hasParking || undefined,
			hasElevator: appliedFilters.hasElevator || undefined,
			hasStorage: appliedFilters.hasStorage || undefined,
			hasBalcony: appliedFilters.hasBalcony || undefined,
			isConvertible: appliedFilters.isConvertible || undefined,
			excludeAgreed: appliedFilters.excludeAgreed || undefined,
			publisherType:
				appliedFilters.publisherType !== "all"
					? appliedFilters.publisherType
					: undefined,
			minArea: appliedFilters.minArea,
			maxArea: appliedFilters.maxArea,
			minDeposit:
				appliedFilters.dealType === "rent"
					? appliedFilters.minDeposit
					: undefined,
			maxDeposit:
				appliedFilters.dealType === "rent"
					? appliedFilters.maxDeposit
					: undefined,
			minRent:
				appliedFilters.dealType === "rent" ? appliedFilters.minRent : undefined,
			maxRent:
				appliedFilters.dealType === "rent" ? appliedFilters.maxRent : undefined,
			minEquivalentDeposit:
				appliedFilters.dealType === "rent"
					? appliedFilters.minEquivalentDeposit
					: undefined,
			maxEquivalentDeposit:
				appliedFilters.dealType === "rent"
					? appliedFilters.maxEquivalentDeposit
					: undefined,
			minPrice:
				appliedFilters.dealType === "buy" ? appliedFilters.minPrice : undefined,
			maxPrice:
				appliedFilters.dealType === "buy" ? appliedFilters.maxPrice : undefined,
			minPricePerSqMeter:
				appliedFilters.dealType === "buy"
					? appliedFilters.minPricePerSqMeter
					: undefined,
			maxPricePerSqMeter:
				appliedFilters.dealType === "buy"
					? appliedFilters.maxPricePerSqMeter
					: undefined,
		}),
		[appliedFilters],
	);

	// Reconciliation tracking for list
	const lastListBboxRef = useRef<BBox | null>(null);
	const [activeListBbox, setActiveListBbox] = useState<BBox | null>(
		viewportBBox,
	);

	useEffect(() => {
		if (!viewportBBox) return;

		// If current viewport is within last fetched padded bbox (15% margin), don't reset list
		if (lastListBboxRef.current) {
			const padded = expandBBox(lastListBboxRef.current, 0.15);
			if (isBBoxContained(viewportBBox, padded)) {
				return;
			}
		}

		lastListBboxRef.current = viewportBBox;
		setActiveListBbox(viewportBBox);
	}, [viewportBBox]);

	const snappedBbox = useMemo(
		() => (activeListBbox ? snapBBox(activeListBbox, 0.01) : null),
		[activeListBbox],
	);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isFetching,
		error,
		refetch,
	} = useInfiniteQuery<ViewportListingsResponse>({
		queryKey: ["listingsViewport", snappedBbox, filters],
		queryFn: async ({ pageParam = 1 }) => {
			if (!activeListBbox) {
				return {
					success: true,
					items: [],
					total: 0,
					page: 1,
					limit: 20,
					hasMore: false,
				};
			}

			const res = await fetchViewportListingsAction({
				bbox: activeListBbox,
				filters,
				page: pageParam as number,
				limit: 20,
			});

			return res;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (!lastPage.hasMore) return undefined;
			return lastPage.page + 1;
		},
		enabled: Boolean(activeListBbox),
		placeholderData: keepPreviousData,
		staleTime: 20 * 60 * 1000,
		gcTime: 20 * 60 * 1000,
	});

	// Flatten all pages of listings
	const listings: UnifiedListing[] = useMemo(() => {
		if (!data?.pages) return [];
		return data.pages.flatMap((page) => page.items);
	}, [data?.pages]);

	const total = data?.pages[0]?.total ?? 0;

	const invalidateListings = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: ["listingsViewport"] });
	}, [queryClient]);

	return {
		listings,
		total,
		isLoading,
		isFetching,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error: error ? error.message : null,
		refetch,
		invalidateListings,
	};
}

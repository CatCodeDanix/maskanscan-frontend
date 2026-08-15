"use client";

import {
	keepPreviousData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { fetchViewportListingsAction } from "@/app/actions/geospatial";
import { snapBBox } from "@/lib/geospatial";
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

	// Snap bbox to 0.01 precision (~1km) for caching, using primitive coordinates for stable dependencies
	const snappedBbox = useMemo(
		() => (viewportBBox ? snapBBox(viewportBBox, 0.01) : null),
		[
			viewportBBox?.[0],
			viewportBBox?.[1],
			viewportBBox?.[2],
			viewportBBox?.[3],
		],
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
			if (!viewportBBox) {
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
				bbox: viewportBBox,
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
		enabled: Boolean(viewportBBox),
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

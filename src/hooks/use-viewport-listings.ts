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

	// Extract active filters from listing-store
	const dealType = useListingStore((s) => s.dealType);
	const city = useListingStore((s) => s.city);
	const district = useListingStore((s) => s.district);
	const bedrooms = useListingStore((s) => s.bedrooms);
	const minBedrooms = useListingStore((s) => s.minBedrooms);
	const maxBedrooms = useListingStore((s) => s.maxBedrooms);
	const hasParking = useListingStore((s) => s.hasParking);
	const hasElevator = useListingStore((s) => s.hasElevator);
	const hasStorage = useListingStore((s) => s.hasStorage);
	const hasBalcony = useListingStore((s) => s.hasBalcony);
	const isConvertible = useListingStore((s) => s.isConvertible);
	const excludeAgreed = useListingStore((s) => s.excludeAgreed);
	const publisherType = useListingStore((s) => s.publisherType);
	const minArea = useListingStore((s) => s.minArea);
	const maxArea = useListingStore((s) => s.maxArea);
	const minDeposit = useListingStore((s) => s.minDeposit);
	const maxDeposit = useListingStore((s) => s.maxDeposit);
	const minRent = useListingStore((s) => s.minRent);
	const maxRent = useListingStore((s) => s.maxRent);
	const minEquivalentDeposit = useListingStore((s) => s.minEquivalentDeposit);
	const maxEquivalentDeposit = useListingStore((s) => s.maxEquivalentDeposit);
	const minPrice = useListingStore((s) => s.minPrice);
	const maxPrice = useListingStore((s) => s.maxPrice);
	const minPricePerSqMeter = useListingStore((s) => s.minPricePerSqMeter);
	const maxPricePerSqMeter = useListingStore((s) => s.maxPricePerSqMeter);

	const filters = useMemo(
		() => ({
			dealType,
			city: city || undefined,
			district: district || undefined,
			bedrooms,
			minBedrooms,
			maxBedrooms,
			hasParking: hasParking || undefined,
			hasElevator: hasElevator || undefined,
			hasStorage: hasStorage || undefined,
			hasBalcony: hasBalcony || undefined,
			isConvertible: isConvertible || undefined,
			excludeAgreed: excludeAgreed || undefined,
			publisherType: publisherType !== "all" ? publisherType : undefined,
			minArea,
			maxArea,
			minDeposit: dealType === "rent" ? minDeposit : undefined,
			maxDeposit: dealType === "rent" ? maxDeposit : undefined,
			minRent: dealType === "rent" ? minRent : undefined,
			maxRent: dealType === "rent" ? maxRent : undefined,
			minEquivalentDeposit:
				dealType === "rent" ? minEquivalentDeposit : undefined,
			maxEquivalentDeposit:
				dealType === "rent" ? maxEquivalentDeposit : undefined,
			minPrice: dealType === "buy" ? minPrice : undefined,
			maxPrice: dealType === "buy" ? maxPrice : undefined,
			minPricePerSqMeter: dealType === "buy" ? minPricePerSqMeter : undefined,
			maxPricePerSqMeter: dealType === "buy" ? maxPricePerSqMeter : undefined,
		}),
		[
			dealType,
			city,
			district,
			bedrooms,
			minBedrooms,
			maxBedrooms,
			hasParking,
			hasElevator,
			hasStorage,
			hasBalcony,
			isConvertible,
			excludeAgreed,
			publisherType,
			minArea,
			maxArea,
			minDeposit,
			maxDeposit,
			minRent,
			maxRent,
			minEquivalentDeposit,
			maxEquivalentDeposit,
			minPrice,
			maxPrice,
			minPricePerSqMeter,
			maxPricePerSqMeter,
		],
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

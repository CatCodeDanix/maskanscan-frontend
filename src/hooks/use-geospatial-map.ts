"use client";

import {
	keepPreviousData,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import { fetchMapDataAction } from "@/app/actions/geospatial";
import {
	expandBBox,
	getZoomTier,
	isBBoxContained,
	snapBBox,
} from "@/lib/geospatial";
import { useListingStore } from "@/store/listing-store";
import type {
	BackendClusterItem,
	BBox,
	MapDataResponse,
	ZoomTier,
} from "@/types/geospatial";
import type { MapPinItem, UnifiedListing } from "@/types/listing";

const SUPERCLUSTER_OPTIONS: Supercluster.Options<
	{ pin: MapPinItem | UnifiedListing },
	Record<string, never>
> = {
	radius: 80,
	maxZoom: 16,
	minZoom: 14,
};

type PointFeature = Supercluster.PointFeature<{
	pin: MapPinItem | UnifiedListing;
}>;

interface UseGeospatialMapProps {
	viewportBBox: BBox | null;
	zoom: number;
}

export function useGeospatialMap({
	viewportBBox,
	zoom,
}: UseGeospatialMapProps) {
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

	const currentTier = getZoomTier(zoom);

	// Reconciliation tracking state
	const lastFetchedBboxRef = useRef<BBox | null>(null);
	const lastFetchedPaddedBboxRef = useRef<BBox | null>(null);
	const lastFetchedTierRef = useRef<ZoomTier | null>(null);

	// Target bbox to request (held steady when panning within padded bounds at raw tier)
	const [requestBBox, setRequestBBox] = useState<BBox | null>(viewportBBox);

	// ── Reconciliation Check on viewport change ──────────────────────────────
	useEffect(() => {
		if (!viewportBBox) return;

		const tierChanged = lastFetchedTierRef.current !== currentTier;

		if (tierChanged) {
			// Tier boundary crossed (< 14 <-> >= 14) -> always fetch
			setRequestBBox(viewportBBox);
			return;
		}

		if (currentTier === "raw" && lastFetchedPaddedBboxRef.current) {
			// Within Raw Tier (>= 14): check if current viewport is inside padded last bbox
			if (isBBoxContained(viewportBBox, lastFetchedPaddedBboxRef.current)) {
				// Contained -> skip network fetch, use local supercluster
				return;
			}
		} else if (currentTier === "clustered" && lastFetchedBboxRef.current) {
			// Clustered Tier (< 14): check small pan containment
			const paddedClusterBbox = expandBBox(lastFetchedBboxRef.current, 0.15);
			if (isBBoxContained(viewportBBox, paddedClusterBbox)) {
				return;
			}
		}

		// Otherwise, update request bbox
		setRequestBBox(viewportBBox);
	}, [viewportBBox, currentTier]);

	// Stable snapped bbox for TanStack Query key
	const snappedKeyBbox = useMemo(
		() => (requestBBox ? snapBBox(requestBBox, 0.01) : null),
		[requestBBox],
	);

	// ── TanStack Query ───────────────────────────────────────────────────────
	const { data, isLoading, isFetching, error, refetch } =
		useQuery<MapDataResponse>({
			queryKey: ["mapData", snappedKeyBbox, currentTier, filters],
			queryFn: async () => {
				if (!requestBBox) {
					return {
						success: true,
						zoomTier: currentTier,
						clusters: [],
						rawPoints: [],
						bbox: [0, 0, 0, 0],
						totalCount: 0,
					};
				}

				const res = await fetchMapDataAction({
					bbox: requestBBox,
					zoom,
					filters,
				});

				if (res.success) {
					lastFetchedBboxRef.current = requestBBox;
					lastFetchedTierRef.current = res.zoomTier;
					if (res.zoomTier === "raw") {
						lastFetchedPaddedBboxRef.current = res.bbox; // res.bbox is the padded bbox
					} else {
						lastFetchedPaddedBboxRef.current = null;
					}
				}

				return res;
			},
			enabled: Boolean(requestBBox),
			placeholderData: keepPreviousData, // Avoid map flicker
			staleTime: 20 * 60 * 1000, // 20 min
			gcTime: 20 * 60 * 1000,
		});

	// ── Idle Polling (15-20 min timer) ───────────────────────────────────────
	useEffect(() => {
		const IDLE_TIMEOUT_MS = 18 * 60 * 1000; // 18 minutes
		const timer = setInterval(() => {
			void refetch();
		}, IDLE_TIMEOUT_MS);

		return () => clearInterval(timer);
	}, [refetch]);

	// ── Manual Refresh Handler (Unscoped cache invalidation) ─────────────────
	const invalidateAll = useCallback(async () => {
		await queryClient.invalidateQueries();
	}, [queryClient]);

	// ── Client Supercluster for Zoom >= 14 ───────────────────────────────────
	const rawPoints = data?.rawPoints ?? [];
	const backendClusters: BackendClusterItem[] = data?.clusters ?? [];

	// Build Supercluster points for raw tier
	const superclusterPoints = useMemo<PointFeature[]>(() => {
		if (data?.zoomTier !== "raw" || rawPoints.length === 0) return [];

		const coordCounts = new Map<string, number>();

		return rawPoints.map((pin) => {
			const baseLat = pin.latitude;
			const baseLng = pin.longitude;
			const key = `${baseLat.toFixed(5)},${baseLng.toFixed(5)}`;
			const count = coordCounts.get(key) ?? 0;
			coordCounts.set(key, count + 1);

			let lng = baseLng;
			let lat = baseLat;
			if (count > 0) {
				const angle = (count * (2 * Math.PI)) / 6;
				const radius = 0.00015 * Math.ceil(count / 6);
				lng = baseLng + radius * Math.cos(angle);
				lat = baseLat + radius * Math.sin(angle);
			}

			return {
				type: "Feature",
				geometry: {
					type: "Point",
					coordinates: [lng, lat],
				},
				properties: { pin },
			};
		});
	}, [data?.zoomTier, rawPoints]);

	const clientSupercluster = useMemo(() => {
		if (superclusterPoints.length === 0) return null;
		const index = new Supercluster(SUPERCLUSTER_OPTIONS);
		index.load(superclusterPoints);
		return index;
	}, [superclusterPoints]);

	return {
		data,
		zoomTier: data?.zoomTier ?? currentTier,
		backendClusters,
		rawPoints,
		clientSupercluster,
		superclusterPoints,
		isLoading,
		isFetching,
		error,
		invalidateAll,
		refetch,
	};
}

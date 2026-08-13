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
	minPoints: 3,
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

	const currentTier = getZoomTier(zoom);
	const intZoom = Math.floor(zoom);

	// Reconciliation tracking state
	const lastFetchedBboxRef = useRef<BBox | null>(null);
	const lastFetchedPaddedBboxRef = useRef<BBox | null>(null);
	const lastFetchedTierRef = useRef<ZoomTier | null>(null);
	const lastFetchedZoomRef = useRef<number | null>(null);

	// Target bbox to request (held steady when panning within padded bounds at raw tier)
	const [requestBBox, setRequestBBox] = useState<BBox | null>(viewportBBox);

	// ── Reconciliation Check on viewport change ──────────────────────────────
	useEffect(() => {
		if (!viewportBBox) return;

		const tierChanged = lastFetchedTierRef.current !== currentTier;
		const zoomChanged = lastFetchedZoomRef.current !== intZoom;

		if (tierChanged || zoomChanged) {
			// Zoom level changed or Tier boundary crossed -> always fetch fresh data for this zoom!
			setRequestBBox(viewportBBox);
			return;
		}

		if (currentTier === "raw" && lastFetchedPaddedBboxRef.current) {
			// Within Raw Tier (>= 14) at same zoom: check if current viewport is inside padded last bbox
			if (isBBoxContained(viewportBBox, lastFetchedPaddedBboxRef.current)) {
				// Contained -> skip network fetch, use local supercluster
				return;
			}
		} else if (currentTier === "clustered" && lastFetchedBboxRef.current) {
			// Clustered Tier (< 14) at same zoom: check small pan containment
			const paddedClusterBbox = expandBBox(lastFetchedBboxRef.current, 0.15);
			if (isBBoxContained(viewportBBox, paddedClusterBbox)) {
				return;
			}
		}

		// Otherwise, update request bbox
		setRequestBBox(viewportBBox);
	}, [viewportBBox, currentTier, intZoom]);

	// Stable snapped bbox for TanStack Query key
	const snappedKeyBbox = useMemo(
		() => (requestBBox ? snapBBox(requestBBox, 0.01) : null),
		[requestBBox],
	);

	// ── TanStack Query ───────────────────────────────────────────────────────
	const { data, isLoading, isFetching, error, refetch } =
		useQuery<MapDataResponse>({
			queryKey: [
				"mapData",
				snappedKeyBbox,
				currentTier,
				currentTier === "clustered" ? intZoom : "raw",
				filters,
			],
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
					lastFetchedZoomRef.current = intZoom;
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

	// ── Idle Polling (15-20 min timer, resets on every moveend) ───────────────
	// biome-ignore lint/correctness/useExhaustiveDependencies: idle timer resets on map moveend (viewportBBox / zoom)
	useEffect(() => {
		const IDLE_TIMEOUT_MS = 18 * 60 * 1000; // 18 minutes
		const timer = setTimeout(() => {
			void refetch();
		}, IDLE_TIMEOUT_MS);

		return () => clearTimeout(timer);
	}, [viewportBBox, zoom, refetch]);

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

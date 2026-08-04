"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useListingStore } from "@/store/listing-store";
import type { DealType } from "@/types/listing";

/**
 * Syncs URL search params <-> listing store filters.
 * - On mount: hydrates filters from URL, then fetches listings + location tree.
 * - On filter change: pushes updated URL params (no page reload).
 */
export function useFilterSync() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const hasMounted = useRef(false);

	const patchFilters = useListingStore((s) => s.patchFilters);
	const fetchLocationTree = useListingStore((s) => s.fetchLocationTree);
	const fetchListings = useListingStore((s) => s.fetchListings);

	// ── Mount: hydrate from URL ─────────────────────────────────────────────
	useEffect(() => {
		if (hasMounted.current) return;
		hasMounted.current = true;

		const dealType = searchParams.get("dealType") as DealType | null;
		const city = searchParams.get("city");
		const district = searchParams.get("district");
		const bedrooms = searchParams.get("bedrooms");
		const hasParking = searchParams.get("hasParking");
		const hasElevator = searchParams.get("hasElevator");
		const hasStorage = searchParams.get("hasStorage");
		const minArea = searchParams.get("minArea");
		const maxArea = searchParams.get("maxArea");
		const minDeposit = searchParams.get("minDeposit");
		const maxDeposit = searchParams.get("maxDeposit");
		const minRent = searchParams.get("minRent");
		const maxRent = searchParams.get("maxRent");
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");

		patchFilters({
			...(dealType ? { dealType } : {}),
			...(city ? { city } : {}),
			...(district ? { district } : {}),
			...(bedrooms ? { bedrooms: Number(bedrooms) } : {}),
			...(hasParking === "true" ? { hasParking: true } : {}),
			...(hasElevator === "true" ? { hasElevator: true } : {}),
			...(hasStorage === "true" ? { hasStorage: true } : {}),
			...(minArea ? { minArea: Number(minArea) } : {}),
			...(maxArea ? { maxArea: Number(maxArea) } : {}),
			...(minDeposit ? { minDeposit: Number(minDeposit) } : {}),
			...(maxDeposit ? { maxDeposit: Number(maxDeposit) } : {}),
			...(minRent ? { minRent: Number(minRent) } : {}),
			...(maxRent ? { maxRent: Number(maxRent) } : {}),
			...(minPrice ? { minPrice: Number(minPrice) } : {}),
			...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
		});

		// Fetch initial data
		void fetchLocationTree();
		void fetchListings();
	}, [searchParams, patchFilters, fetchLocationTree, fetchListings]);

	const dealType = useListingStore((s) => s.dealType);
	const city = useListingStore((s) => s.city);
	const district = useListingStore((s) => s.district);
	const bedrooms = useListingStore((s) => s.bedrooms);
	const hasParking = useListingStore((s) => s.hasParking);
	const hasElevator = useListingStore((s) => s.hasElevator);
	const hasStorage = useListingStore((s) => s.hasStorage);
	const minArea = useListingStore((s) => s.minArea);
	const maxArea = useListingStore((s) => s.maxArea);
	const minDeposit = useListingStore((s) => s.minDeposit);
	const maxDeposit = useListingStore((s) => s.maxDeposit);
	const minRent = useListingStore((s) => s.minRent);
	const maxRent = useListingStore((s) => s.maxRent);
	const minPrice = useListingStore((s) => s.minPrice);
	const maxPrice = useListingStore((s) => s.maxPrice);

	// ── Push URL when filters change ────────────────────────────────────────
	useEffect(() => {
		if (!hasMounted.current) return;

		const params = new URLSearchParams();

		if (dealType) params.set("dealType", dealType);
		if (city) params.set("city", city);
		if (district) params.set("district", district);
		if (bedrooms !== undefined) params.set("bedrooms", String(bedrooms));
		if (hasParking) params.set("hasParking", "true");
		if (hasElevator) params.set("hasElevator", "true");
		if (hasStorage) params.set("hasStorage", "true");
		if (minArea !== undefined) params.set("minArea", String(minArea));
		if (maxArea !== undefined) params.set("maxArea", String(maxArea));
		if (dealType === "rent") {
			if (minDeposit !== undefined)
				params.set("minDeposit", String(minDeposit));
			if (maxDeposit !== undefined)
				params.set("maxDeposit", String(maxDeposit));
			if (minRent !== undefined) params.set("minRent", String(minRent));
			if (maxRent !== undefined) params.set("maxRent", String(maxRent));
		} else {
			if (minPrice !== undefined) params.set("minPrice", String(minPrice));
			if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
		}

		const qs = params.toString();
		router.replace(qs ? `/?${qs}` : "/", { scroll: false });
	}, [
		dealType,
		city,
		district,
		bedrooms,
		hasParking,
		hasElevator,
		hasStorage,
		minArea,
		maxArea,
		minDeposit,
		maxDeposit,
		minRent,
		maxRent,
		minPrice,
		maxPrice,
		router,
	]);
}

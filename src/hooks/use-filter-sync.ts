"use client";

import { useEffect, useRef } from "react";
import { useListingStore } from "@/store/listing-store";
import type { DealType } from "@/types/listing";

/**
 * Syncs URL search params <-> listing store filters.
 *
 * Design principles to avoid infinite loops:
 * - Reads the initial URL via window.location.search (not useSearchParams).
 *   This avoids subscribing to Next.js navigation events, so no re-render
 *   cascade is triggered.
 * - Writes the URL via window.history.replaceState (not router.replace).
 *   This is a silent browser-level update — it does NOT trigger Next.js
 *   navigation, does NOT fire useSearchParams hooks, does NOT cause re-renders.
 * - Mount effect runs exactly once (empty deps + isInitialized guard).
 * - URL push effect skips the very first render so it only fires on user-driven
 *   filter changes, not on the initial hydration.
 */
export function useFilterSync() {
	const isInitialized = useRef(false);
	const skipFirstURLPush = useRef(true);

	// Stable Zustand action selectors (referentially stable across renders)
	const patchFilters = useListingStore((s) => s.patchFilters);
	const fetchLocationTree = useListingStore((s) => s.fetchLocationTree);
	const fetchListings = useListingStore((s) => s.fetchListings);

	// Filter state values (for the URL push effect)
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

	// ── Mount: hydrate from URL once ─────────────────────────────────────────
	// Uses window.location.search so we never subscribe to Next.js navigation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
	useEffect(() => {
		if (isInitialized.current) return;
		isInitialized.current = true;

		const params = new URLSearchParams(window.location.search);

		patchFilters({
			...(params.get("dealType")
				? { dealType: params.get("dealType") as DealType }
				: {}),
			...(params.get("city") ? { city: params.get("city") as string } : {}),
			...(params.get("district")
				? { district: params.get("district") as string }
				: {}),
			...(params.get("bedrooms")
				? { bedrooms: Number(params.get("bedrooms")) }
				: {}),
			...(params.get("hasParking") === "true" ? { hasParking: true } : {}),
			...(params.get("hasElevator") === "true" ? { hasElevator: true } : {}),
			...(params.get("hasStorage") === "true" ? { hasStorage: true } : {}),
			...(params.get("minArea")
				? { minArea: Number(params.get("minArea")) }
				: {}),
			...(params.get("maxArea")
				? { maxArea: Number(params.get("maxArea")) }
				: {}),
			...(params.get("minDeposit")
				? { minDeposit: Number(params.get("minDeposit")) }
				: {}),
			...(params.get("maxDeposit")
				? { maxDeposit: Number(params.get("maxDeposit")) }
				: {}),
			...(params.get("minRent")
				? { minRent: Number(params.get("minRent")) }
				: {}),
			...(params.get("maxRent")
				? { maxRent: Number(params.get("maxRent")) }
				: {}),
			...(params.get("minPrice")
				? { minPrice: Number(params.get("minPrice")) }
				: {}),
			...(params.get("maxPrice")
				? { maxPrice: Number(params.get("maxPrice")) }
				: {}),
		});

		void fetchLocationTree();
		void fetchListings();
	}, []);

	// ── Push URL when filters change (silently, no navigation event) ─────────
	// Uses window.history.replaceState so Next.js never sees a navigation,
	// so useSearchParams hooks never fire, so no component re-renders occur.
	useEffect(() => {
		// Skip the very first render — filters are at their default/hydrated state,
		// and we don't want to push a URL before the mount effect even ran.
		if (skipFirstURLPush.current) {
			skipFirstURLPush.current = false;
			return;
		}

		const qs_params = new URLSearchParams();

		if (dealType) qs_params.set("dealType", dealType);
		if (city) qs_params.set("city", city);
		if (district) qs_params.set("district", district);
		if (bedrooms !== undefined) qs_params.set("bedrooms", String(bedrooms));
		if (hasParking) qs_params.set("hasParking", "true");
		if (hasElevator) qs_params.set("hasElevator", "true");
		if (hasStorage) qs_params.set("hasStorage", "true");
		if (minArea !== undefined) qs_params.set("minArea", String(minArea));
		if (maxArea !== undefined) qs_params.set("maxArea", String(maxArea));
		if (dealType === "rent") {
			if (minDeposit !== undefined)
				qs_params.set("minDeposit", String(minDeposit));
			if (maxDeposit !== undefined)
				qs_params.set("maxDeposit", String(maxDeposit));
			if (minRent !== undefined) qs_params.set("minRent", String(minRent));
			if (maxRent !== undefined) qs_params.set("maxRent", String(maxRent));
		} else {
			if (minPrice !== undefined) qs_params.set("minPrice", String(minPrice));
			if (maxPrice !== undefined) qs_params.set("maxPrice", String(maxPrice));
		}

		const qs = qs_params.toString();
		// Silent URL update — no Next.js navigation, no re-renders
		window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
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
	]);
}

"use client";

import { useEffect, useRef } from "react";
import { useListingStore } from "@/store/listing-store";
import type { DealType } from "@/types/listing";

export function useFilterSync() {
	const isInitialized = useRef(false);
	const skipFirstURLPush = useRef(true);

	const patchFilters = useListingStore((s) => s.patchFilters);
	const fetchLocationTree = useListingStore((s) => s.fetchLocationTree);

	const appliedFilters = useListingStore((s) => s.appliedFilters);

	// 1. Initial mount: parse URL query params & load location tree
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
			...(params.get("minBedrooms")
				? { minBedrooms: Number(params.get("minBedrooms")) }
				: {}),
			...(params.get("maxBedrooms")
				? { maxBedrooms: Number(params.get("maxBedrooms")) }
				: {}),
			...(params.get("hasParking") === "true" ? { hasParking: true } : {}),
			...(params.get("hasElevator") === "true" ? { hasElevator: true } : {}),
			...(params.get("hasStorage") === "true" ? { hasStorage: true } : {}),
			...(params.get("hasBalcony") === "true" ? { hasBalcony: true } : {}),
			...(params.get("isConvertible") === "true"
				? { isConvertible: true }
				: {}),
			...(params.get("excludeAgreed") === "true"
				? { excludeAgreed: true }
				: {}),
			...(params.get("publisherType")
				? {
						publisherType: params.get("publisherType") as
							| "all"
							| "personal"
							| "agency",
					}
				: {}),
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
			...(params.get("minEquivalentDeposit")
				? { minEquivalentDeposit: Number(params.get("minEquivalentDeposit")) }
				: {}),
			...(params.get("maxEquivalentDeposit")
				? { maxEquivalentDeposit: Number(params.get("maxEquivalentDeposit")) }
				: {}),
			...(params.get("minPrice")
				? { minPrice: Number(params.get("minPrice")) }
				: {}),
			...(params.get("maxPrice")
				? { maxPrice: Number(params.get("maxPrice")) }
				: {}),
			...(params.get("minPricePerSqMeter")
				? { minPricePerSqMeter: Number(params.get("minPricePerSqMeter")) }
				: {}),
			...(params.get("maxPricePerSqMeter")
				? { maxPricePerSqMeter: Number(params.get("maxPricePerSqMeter")) }
				: {}),
		});

		// void fetchLocationTree();
	}, [fetchLocationTree, patchFilters]);

	// 2. URL query params sync (only syncs applied filters)
	useEffect(() => {
		if (skipFirstURLPush.current) {
			skipFirstURLPush.current = false;
			return;
		}

		const qs_params = new URLSearchParams();
		const {
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
		} = appliedFilters;

		if (dealType && dealType !== "rent") qs_params.set("dealType", dealType);
		if (city) qs_params.set("city", city);
		if (district) qs_params.set("district", district);
		if (bedrooms !== undefined) qs_params.set("bedrooms", String(bedrooms));
		if (minBedrooms !== undefined)
			qs_params.set("minBedrooms", String(minBedrooms));
		if (maxBedrooms !== undefined)
			qs_params.set("maxBedrooms", String(maxBedrooms));
		if (hasParking) qs_params.set("hasParking", "true");
		if (hasElevator) qs_params.set("hasElevator", "true");
		if (hasStorage) qs_params.set("hasStorage", "true");
		if (hasBalcony) qs_params.set("hasBalcony", "true");
		if (isConvertible) qs_params.set("isConvertible", "true");
		if (excludeAgreed) qs_params.set("excludeAgreed", "true");
		if (publisherType && publisherType !== "all")
			qs_params.set("publisherType", publisherType);
		if (minArea !== undefined) qs_params.set("minArea", String(minArea));
		if (maxArea !== undefined) qs_params.set("maxArea", String(maxArea));

		if (dealType === "rent") {
			if (minDeposit !== undefined)
				qs_params.set("minDeposit", String(minDeposit));
			if (maxDeposit !== undefined)
				qs_params.set("maxDeposit", String(maxDeposit));
			if (minRent !== undefined) qs_params.set("minRent", String(minRent));
			if (maxRent !== undefined) qs_params.set("maxRent", String(maxRent));
			if (minEquivalentDeposit !== undefined)
				qs_params.set("minEquivalentDeposit", String(minEquivalentDeposit));
			if (maxEquivalentDeposit !== undefined)
				qs_params.set("maxEquivalentDeposit", String(maxEquivalentDeposit));
		} else {
			if (minPrice !== undefined) qs_params.set("minPrice", String(minPrice));
			if (maxPrice !== undefined) qs_params.set("maxPrice", String(maxPrice));
			if (minPricePerSqMeter !== undefined)
				qs_params.set("minPricePerSqMeter", String(minPricePerSqMeter));
			if (maxPricePerSqMeter !== undefined)
				qs_params.set("maxPricePerSqMeter", String(maxPricePerSqMeter));
		}

		const qs = qs_params.toString();
		const pathname = window.location.pathname;
		window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
	}, [appliedFilters]);
}

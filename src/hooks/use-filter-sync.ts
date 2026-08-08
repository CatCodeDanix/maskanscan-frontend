"use client";

import { useEffect, useRef } from "react";
import { useListingStore } from "@/store/listing-store";
import type { DealType } from "@/types/listing";

export function useFilterSync() {
	const isInitialized = useRef(false);
	const skipFirstURLPush = useRef(true);

	const patchFilters = useListingStore((s) => s.patchFilters);
	const fetchLocationTree = useListingStore((s) => s.fetchLocationTree);
	const fetchListings = useListingStore((s) => s.fetchListings);
	const fetchMapPins = useListingStore((s) => s.fetchMapPins);

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

	// 1. Initial mount: parse URL query params & load location tree + listings + map pins from DB
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

		void fetchLocationTree();
		void fetchMapPins();
		void fetchListings(true);
	}, [fetchLocationTree, fetchListings, fetchMapPins, patchFilters]);

	// 2. Reactive Filter Change Listener: whenever filters change, fetch DB data
	const isFirstFilterEffect = useRef(true);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reactive filter state listener
	useEffect(() => {
		if (isFirstFilterEffect.current) {
			isFirstFilterEffect.current = false;
			return;
		}

		const timer = setTimeout(() => {
			void fetchMapPins();
			void fetchListings(true);
		}, 300);

		return () => clearTimeout(timer);
	}, [
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
		fetchMapPins,
		fetchListings,
	]);

	// 3. Auto refresh map pins & listings every 20 minutes (aligned with scraper backend cron)
	useEffect(() => {
		const TWENTY_MINUTES_MS = 20 * 60 * 1000;
		const timer = setInterval(() => {
			void fetchMapPins();
			void fetchListings(true);
		}, TWENTY_MINUTES_MS);

		return () => clearInterval(timer);
	}, [fetchMapPins, fetchListings]);

	// 4. URL query params sync
	useEffect(() => {
		if (skipFirstURLPush.current) {
			skipFirstURLPush.current = false;
			return;
		}

		const qs_params = new URLSearchParams();

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
		window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
	}, [
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
	]);
}

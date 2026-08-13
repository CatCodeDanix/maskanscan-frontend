import { create } from "zustand";
import {
	getListingByIdAction,
	queryListingsAction,
	queryMapPinsAction,
} from "@/app/actions/listings";
import { getLocationTreeAction } from "@/app/actions/locations";
import { useFavoritesStore } from "@/store/favorites-store";
import type {
	DealType,
	ListingFilters,
	MapPinItem,
	Province,
	UnifiedListing,
} from "@/types/listing";

// ── Default Filters ───────────────────────────────────────────────────────────

export const DEFAULT_FILTERS = {
	dealType: "rent" as DealType,
	city: "",
	district: "",
	bedrooms: undefined as number | undefined,
	minBedrooms: undefined as number | undefined,
	maxBedrooms: undefined as number | undefined,
	hasParking: false,
	hasElevator: false,
	hasStorage: false,
	hasBalcony: false,
	isConvertible: false,
	excludeAgreed: false,
	publisherType: "all" as "all" | "personal" | "agency",
	minArea: undefined as number | undefined,
	maxArea: undefined as number | undefined,
	// Rent — Exact & Equivalent
	minDeposit: undefined as number | undefined,
	maxDeposit: undefined as number | undefined,
	minRent: undefined as number | undefined,
	maxRent: undefined as number | undefined,
	minEquivalentDeposit: undefined as number | undefined,
	maxEquivalentDeposit: undefined as number | undefined,
	// Buy
	minPrice: undefined as number | undefined,
	maxPrice: undefined as number | undefined,
	minPricePerSqMeter: undefined as number | undefined,
	maxPricePerSqMeter: undefined as number | undefined,
};

export type FilterState = typeof DEFAULT_FILTERS;

// ── Store interface ───────────────────────────────────────────────────────────

interface ListingState extends FilterState {
	// Data
	listings: UnifiedListing[];
	mapPins: MapPinItem[];
	selectedListing: UnifiedListing | null;
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
	isLoading: boolean;
	isLoadingMapPins: boolean;
	isFetchingNextPage: boolean;
	isLoadingDetail: boolean;
	error: string | null;
	hasFetched: boolean;

	// Staged / Draft Filters
	draftFilters: FilterState;
	appliedFilters: FilterState;

	// Location tree
	locationTree: Province[];

	// Draft Filter Actions
	setDraft: <K extends keyof FilterState>(key: K, val: FilterState[K]) => void;
	patchDraft: (filters: Partial<FilterState>) => void;
	applyDraftFilters: () => void;
	resetDraftFilters: () => void;

	// Direct Filter Actions (Legacy / Direct Sync)
	setDealType: (t: DealType) => void;
	setCity: (c: string) => void;
	setDistrict: (d: string) => void;
	setBedrooms: (n: number | undefined) => void;
	setMinBedrooms: (n: number | undefined) => void;
	setMaxBedrooms: (n: number | undefined) => void;
	setHasParking: (v: boolean) => void;
	setHasElevator: (v: boolean) => void;
	setHasStorage: (v: boolean) => void;
	setHasBalcony: (v: boolean) => void;
	setIsConvertible: (v: boolean) => void;
	setExcludeAgreed: (v: boolean) => void;
	setPublisherType: (p: "all" | "personal" | "agency") => void;
	setMinArea: (v: number | undefined) => void;
	setMaxArea: (v: number | undefined) => void;
	setMinDeposit: (v: number | undefined) => void;
	setMaxDeposit: (v: number | undefined) => void;
	setMinRent: (v: number | undefined) => void;
	setMaxRent: (v: number | undefined) => void;
	setMinEquivalentDeposit: (v: number | undefined) => void;
	setMaxEquivalentDeposit: (v: number | undefined) => void;
	setMinPrice: (v: number | undefined) => void;
	setMaxPrice: (v: number | undefined) => void;
	setMinPricePerSqMeter: (v: number | undefined) => void;
	setMaxPricePerSqMeter: (v: number | undefined) => void;
	patchFilters: (filters: Partial<FilterState>) => void;
	resetFilters: () => void;

	// Data Actions
	setSelectedListing: (l: UnifiedListing | null) => void;
	selectListingById: (
		source: string,
		externalId: string,
		pinFallback?: MapPinItem | UnifiedListing,
	) => Promise<void>;
	setLocationTree: (t: Province[]) => void;
	fetchListings: (reset?: boolean) => Promise<void>;
	fetchMapPins: () => Promise<void>;
	fetchNextPage: () => Promise<void>;
	fetchLocationTree: () => Promise<void>;
	applyFilters: () => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deduplicateListings(
	existing: UnifiedListing[],
	newItems: UnifiedListing[],
): UnifiedListing[] {
	const seen = new Set<string>(
		existing.map((l) => `${l.source}:${l.externalId}`),
	);
	const result = [...existing];
	for (const item of newItems) {
		const key = `${item.source}:${item.externalId}`;
		if (!seen.has(key)) {
			seen.add(key);
			result.push(item);
		}
	}
	return result;
}

function getFiltersObject(
	filters: FilterState,
	page = 1,
	limit = 50,
): ListingFilters {
	return {
		dealType: filters.dealType,
		city: filters.city || undefined,
		district: filters.district || undefined,
		bedrooms: filters.bedrooms,
		minBedrooms: filters.minBedrooms,
		maxBedrooms: filters.maxBedrooms,
		hasParking: filters.hasParking || undefined,
		hasElevator: filters.hasElevator || undefined,
		hasStorage: filters.hasStorage || undefined,
		hasBalcony: filters.hasBalcony || undefined,
		isConvertible: filters.isConvertible || undefined,
		excludeAgreed: filters.excludeAgreed || undefined,
		publisherType:
			filters.publisherType !== "all" ? filters.publisherType : undefined,
		minArea: filters.minArea,
		maxArea: filters.maxArea,
		minDeposit: filters.dealType === "rent" ? filters.minDeposit : undefined,
		maxDeposit: filters.dealType === "rent" ? filters.maxDeposit : undefined,
		minRent: filters.dealType === "rent" ? filters.minRent : undefined,
		maxRent: filters.dealType === "rent" ? filters.maxRent : undefined,
		minEquivalentDeposit:
			filters.dealType === "rent" ? filters.minEquivalentDeposit : undefined,
		maxEquivalentDeposit:
			filters.dealType === "rent" ? filters.maxEquivalentDeposit : undefined,
		minPrice: filters.dealType === "buy" ? filters.minPrice : undefined,
		maxPrice: filters.dealType === "buy" ? filters.maxPrice : undefined,
		minPricePerSqMeter:
			filters.dealType === "buy" ? filters.minPricePerSqMeter : undefined,
		maxPricePerSqMeter:
			filters.dealType === "buy" ? filters.maxPricePerSqMeter : undefined,
		page,
		limit,
	};
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useListingStore = create<ListingState>((set, get) => ({
	// Data
	listings: [],
	mapPins: [],
	selectedListing: null,
	total: 0,
	page: 1,
	limit: 50,
	hasMore: true,
	isLoading: false,
	isLoadingMapPins: false,
	isFetchingNextPage: false,
	isLoadingDetail: false,
	error: null,
	hasFetched: false,
	locationTree: [],

	// Staged / Draft Filters
	draftFilters: { ...DEFAULT_FILTERS },
	appliedFilters: { ...DEFAULT_FILTERS },

	// Top level mirror (for legacy or direct bindings)
	...DEFAULT_FILTERS,

	// Draft Filter Actions
	setDraft: (key, val) =>
		set((state) => ({
			draftFilters: {
				...state.draftFilters,
				[key]: val,
			},
		})),

	patchDraft: (partial) =>
		set((state) => ({
			draftFilters: {
				...state.draftFilters,
				...partial,
			},
		})),

	applyDraftFilters: () => {
		const draft = get().draftFilters;
		set({
			appliedFilters: { ...draft },
			...draft,
			page: 1,
			hasMore: true,
		});
	},

	resetDraftFilters: () =>
		set({
			draftFilters: { ...DEFAULT_FILTERS },
		}),

	// Direct Filter Actions (Legacy / Synchronous setters)
	setDealType: (t) => {
		const update = { dealType: t, city: "", district: "", bedrooms: undefined };
		set((state) => ({
			...update,
			draftFilters: { ...state.draftFilters, ...update },
			appliedFilters: { ...state.appliedFilters, ...update },
		}));
	},
	setCity: (c) => {
		const update = { city: c, district: "" };
		set((state) => ({
			...update,
			draftFilters: { ...state.draftFilters, ...update },
			appliedFilters: { ...state.appliedFilters, ...update },
		}));
	},
	setDistrict: (d) => {
		set((state) => ({
			district: d,
			draftFilters: { ...state.draftFilters, district: d },
			appliedFilters: { ...state.appliedFilters, district: d },
		}));
	},
	setBedrooms: (n) => {
		const update = {
			bedrooms: n,
			minBedrooms: undefined,
			maxBedrooms: undefined,
		};
		set((state) => ({
			...update,
			draftFilters: { ...state.draftFilters, ...update },
			appliedFilters: { ...state.appliedFilters, ...update },
		}));
	},
	setMinBedrooms: (n) => {
		const update = { minBedrooms: n, bedrooms: undefined };
		set((state) => ({
			...update,
			draftFilters: { ...state.draftFilters, ...update },
			appliedFilters: { ...state.appliedFilters, ...update },
		}));
	},
	setMaxBedrooms: (n) => {
		const update = { maxBedrooms: n, bedrooms: undefined };
		set((state) => ({
			...update,
			draftFilters: { ...state.draftFilters, ...update },
			appliedFilters: { ...state.appliedFilters, ...update },
		}));
	},
	setHasParking: (v) =>
		set((state) => ({
			hasParking: v,
			draftFilters: { ...state.draftFilters, hasParking: v },
			appliedFilters: { ...state.appliedFilters, hasParking: v },
		})),
	setHasElevator: (v) =>
		set((state) => ({
			hasElevator: v,
			draftFilters: { ...state.draftFilters, hasElevator: v },
			appliedFilters: { ...state.appliedFilters, hasElevator: v },
		})),
	setHasStorage: (v) =>
		set((state) => ({
			hasStorage: v,
			draftFilters: { ...state.draftFilters, hasStorage: v },
			appliedFilters: { ...state.appliedFilters, hasStorage: v },
		})),
	setHasBalcony: (v) =>
		set((state) => ({
			hasBalcony: v,
			draftFilters: { ...state.draftFilters, hasBalcony: v },
			appliedFilters: { ...state.appliedFilters, hasBalcony: v },
		})),
	setIsConvertible: (v) =>
		set((state) => ({
			isConvertible: v,
			draftFilters: { ...state.draftFilters, isConvertible: v },
			appliedFilters: { ...state.appliedFilters, isConvertible: v },
		})),
	setExcludeAgreed: (v) =>
		set((state) => ({
			excludeAgreed: v,
			draftFilters: { ...state.draftFilters, excludeAgreed: v },
			appliedFilters: { ...state.appliedFilters, excludeAgreed: v },
		})),
	setPublisherType: (p) =>
		set((state) => ({
			publisherType: p,
			draftFilters: { ...state.draftFilters, publisherType: p },
			appliedFilters: { ...state.appliedFilters, publisherType: p },
		})),
	setMinArea: (v) =>
		set((state) => ({
			minArea: v,
			draftFilters: { ...state.draftFilters, minArea: v },
			appliedFilters: { ...state.appliedFilters, minArea: v },
		})),
	setMaxArea: (v) =>
		set((state) => ({
			maxArea: v,
			draftFilters: { ...state.draftFilters, maxArea: v },
			appliedFilters: { ...state.appliedFilters, maxArea: v },
		})),
	setMinDeposit: (v) =>
		set((state) => ({
			minDeposit: v,
			draftFilters: { ...state.draftFilters, minDeposit: v },
			appliedFilters: { ...state.appliedFilters, minDeposit: v },
		})),
	setMaxDeposit: (v) =>
		set((state) => ({
			maxDeposit: v,
			draftFilters: { ...state.draftFilters, maxDeposit: v },
			appliedFilters: { ...state.appliedFilters, maxDeposit: v },
		})),
	setMinRent: (v) =>
		set((state) => ({
			minRent: v,
			draftFilters: { ...state.draftFilters, minRent: v },
			appliedFilters: { ...state.appliedFilters, minRent: v },
		})),
	setMaxRent: (v) =>
		set((state) => ({
			maxRent: v,
			draftFilters: { ...state.draftFilters, maxRent: v },
			appliedFilters: { ...state.appliedFilters, maxRent: v },
		})),
	setMinEquivalentDeposit: (v) =>
		set((state) => ({
			minEquivalentDeposit: v,
			draftFilters: { ...state.draftFilters, minEquivalentDeposit: v },
			appliedFilters: { ...state.appliedFilters, minEquivalentDeposit: v },
		})),
	setMaxEquivalentDeposit: (v) =>
		set((state) => ({
			maxEquivalentDeposit: v,
			draftFilters: { ...state.draftFilters, maxEquivalentDeposit: v },
			appliedFilters: { ...state.appliedFilters, maxEquivalentDeposit: v },
		})),
	setMinPrice: (v) =>
		set((state) => ({
			minPrice: v,
			draftFilters: { ...state.draftFilters, minPrice: v },
			appliedFilters: { ...state.appliedFilters, minPrice: v },
		})),
	setMaxPrice: (v) =>
		set((state) => ({
			maxPrice: v,
			draftFilters: { ...state.draftFilters, maxPrice: v },
			appliedFilters: { ...state.appliedFilters, maxPrice: v },
		})),
	setMinPricePerSqMeter: (v) =>
		set((state) => ({
			minPricePerSqMeter: v,
			draftFilters: { ...state.draftFilters, minPricePerSqMeter: v },
			appliedFilters: { ...state.appliedFilters, minPricePerSqMeter: v },
		})),
	setMaxPricePerSqMeter: (v) =>
		set((state) => ({
			maxPricePerSqMeter: v,
			draftFilters: { ...state.draftFilters, maxPricePerSqMeter: v },
			appliedFilters: { ...state.appliedFilters, maxPricePerSqMeter: v },
		})),
	patchFilters: (filters) =>
		set((state) => ({
			...filters,
			draftFilters: { ...state.draftFilters, ...filters },
			appliedFilters: { ...state.appliedFilters, ...filters },
		})),
	resetFilters: () =>
		set({
			...DEFAULT_FILTERS,
			draftFilters: { ...DEFAULT_FILTERS },
			appliedFilters: { ...DEFAULT_FILTERS },
			page: 1,
			hasMore: true,
		}),

	// Data actions
	setSelectedListing: (l) => set({ selectedListing: l }),

	selectListingById: async (
		source: string,
		externalId: string,
		pinFallback?: MapPinItem | UnifiedListing,
	) => {
		const state = get();
		// 1. Check in current loaded listings
		const foundInListings = state.listings.find(
			(l) => l.source === source && l.externalId === externalId,
		);
		if (foundInListings) {
			set({ selectedListing: foundInListings, isLoadingDetail: false });
			return;
		}

		// 2. Check in favorites
		const favoriteListings = useFavoritesStore.getState().favoriteListings;
		const foundInFavs = favoriteListings.find(
			(l) => l.source === source && l.externalId === externalId,
		);
		if (foundInFavs) {
			set({ selectedListing: foundInFavs, isLoadingDetail: false });
			return;
		}

		// 3. Instant Optimistic Open (0ms latency!)
		if (pinFallback) {
			const optimisticListing: UnifiedListing =
				"url" in pinFallback
					? (pinFallback as UnifiedListing)
					: {
							id: pinFallback.id,
							source: pinFallback.source,
							externalId: pinFallback.externalId,
							url: "",
							title: pinFallback.title,
							dealType: pinFallback.dealType,
							city: pinFallback.cityPersian,
							cityPersian: pinFallback.cityPersian,
							districtPersian: pinFallback.districtPersian,
							depositTomans: pinFallback.depositTomans,
							rentTomans: pinFallback.rentTomans,
							totalPriceTomans: pinFallback.totalPriceTomans,
							location: {
								latitude: pinFallback.latitude,
								longitude: pinFallback.longitude,
								isFuzzy: false,
								isFallback: Boolean(pinFallback.isFallback),
							},
							attributes: {},
							images: [],
							scrapedAt: new Date().toISOString(),
						};
			set({ selectedListing: optimisticListing, isLoadingDetail: true });
		} else {
			set({ isLoadingDetail: true });
		}

		// 4. Fetch full listing in background via Server Action
		try {
			const res = await getListingByIdAction(source, externalId);
			if (res.success && res.listing) {
				set({ selectedListing: res.listing, isLoadingDetail: false });
			} else {
				set({ isLoadingDetail: false });
			}
		} catch (err) {
			console.error("selectListingById background fetch error:", err);
			set({ isLoadingDetail: false });
		}
	},

	setLocationTree: (t) => set({ locationTree: t }),

	fetchListings: async (reset = true) => {
		const state = get();
		const pageToFetch = reset ? 1 : state.page;
		set({
			isLoading: reset,
			error: null,
			...(reset ? { page: 1, listings: [], hasMore: true } : {}),
		});

		try {
			const filterParams = getFiltersObject(
				state.appliedFilters,
				pageToFetch,
				state.limit,
			);
			const resAction = await queryListingsAction(filterParams);

			const items = resAction.items ?? [];
			const total = resAction.total ?? items.length;
			const nextListings = reset
				? deduplicateListings([], items)
				: deduplicateListings(state.listings, items);
			const hasMore = nextListings.length < total && items.length > 0;

			set({
				listings: nextListings,
				total,
				page: pageToFetch,
				hasMore,
				isLoading: false,
				hasFetched: true,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : "خطا در دریافت آگهی‌ها",
				isLoading: false,
			});
		}
	},

	fetchMapPins: async () => {
		const state = get();
		set({ isLoadingMapPins: true });
		try {
			const filterParams = getFiltersObject(state.appliedFilters, 1, 5000);
			const resAction = await queryMapPinsAction(filterParams);
			const pins = resAction.success ? resAction.pins : [];
			set({ mapPins: pins, isLoadingMapPins: false });
		} catch (err) {
			console.error("fetchMapPins error:", err);
			set({ isLoadingMapPins: false });
		}
	},

	fetchNextPage: async () => {
		const state = get();
		if (state.isLoading || state.isFetchingNextPage || !state.hasMore) return;

		const nextPage = state.page + 1;
		set({ isFetchingNextPage: true });

		try {
			const filterParams = getFiltersObject(
				state.appliedFilters,
				nextPage,
				state.limit,
			);
			const resAction = await queryListingsAction(filterParams);

			const items = resAction.items ?? [];
			const total = resAction.total ?? state.total;
			const nextListings = deduplicateListings(state.listings, items);
			const hasMore = items.length > 0 && nextListings.length < total;

			set({
				listings: nextListings,
				total,
				page: nextPage,
				hasMore,
				isFetchingNextPage: false,
			});
		} catch (err) {
			set({
				error:
					err instanceof Error ? err.message : "خطا در بارگذاری صفحات بعدی",
				isFetchingNextPage: false,
			});
		}
	},

	fetchLocationTree: async () => {
		try {
			const res = await getLocationTreeAction();
			if (res.success && res.tree) {
				set({ locationTree: res.tree });
			}
		} catch {
			// silent — location tree is non-critical
		}
	},

	applyFilters: async () => {
		get().applyDraftFilters();
		void get().fetchMapPins();
		await get().fetchListings(true);
	},
}));

import { create } from "zustand";
import { queryListingsAction } from "@/app/actions/listings";
import type {
	DealType,
	ListingFilters,
	Province,
	UnifiedListing,
} from "@/types/listing";

// ── Default Filters ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
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
	publisherType: "all" as "all" | "personal" | "agency",
	minArea: undefined as number | undefined,
	maxArea: undefined as number | undefined,
	// Rent
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

type FilterState = typeof DEFAULT_FILTERS;

// ── Store interface ───────────────────────────────────────────────────────────

interface ListingState extends FilterState {
	// Data
	listings: UnifiedListing[];
	selectedListing: UnifiedListing | null;
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
	isLoading: boolean;
	isFetchingNextPage: boolean;
	error: string | null;
	hasFetched: boolean;

	// Location tree
	locationTree: Province[];

	// Filter Actions
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
	setLocationTree: (t: Province[]) => void;
	fetchListings: (reset?: boolean) => Promise<void>;
	fetchNextPage: () => Promise<void>;
	fetchLocationTree: () => Promise<void>;
	applyFilters: () => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFiltersObject(state: ListingState, page = 1): ListingFilters {
	return {
		dealType: state.dealType,
		city: state.city || undefined,
		district: state.district || undefined,
		bedrooms: state.bedrooms,
		minBedrooms: state.minBedrooms,
		maxBedrooms: state.maxBedrooms,
		hasParking: state.hasParking || undefined,
		hasElevator: state.hasElevator || undefined,
		hasStorage: state.hasStorage || undefined,
		hasBalcony: state.hasBalcony || undefined,
		isConvertible: state.isConvertible || undefined,
		publisherType:
			state.publisherType !== "all" ? state.publisherType : undefined,
		minArea: state.minArea,
		maxArea: state.maxArea,
		minDeposit: state.dealType === "rent" ? state.minDeposit : undefined,
		maxDeposit: state.dealType === "rent" ? state.maxDeposit : undefined,
		minRent: state.dealType === "rent" ? state.minRent : undefined,
		maxRent: state.dealType === "rent" ? state.maxRent : undefined,
		minEquivalentDeposit:
			state.dealType === "rent" ? state.minEquivalentDeposit : undefined,
		maxEquivalentDeposit:
			state.dealType === "rent" ? state.maxEquivalentDeposit : undefined,
		minPrice: state.dealType === "buy" ? state.minPrice : undefined,
		maxPrice: state.dealType === "buy" ? state.maxPrice : undefined,
		minPricePerSqMeter:
			state.dealType === "buy" ? state.minPricePerSqMeter : undefined,
		maxPricePerSqMeter:
			state.dealType === "buy" ? state.maxPricePerSqMeter : undefined,
		page,
		limit: state.limit,
	};
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useListingStore = create<ListingState>((set, get) => ({
	// Data
	listings: [],
	selectedListing: null,
	total: 0,
	page: 1,
	limit: 50,
	hasMore: true,
	isLoading: false,
	isFetchingNextPage: false,
	error: null,
	hasFetched: false,
	locationTree: [],

	// Default filters
	...DEFAULT_FILTERS,

	// Filter setters
	setDealType: (t) =>
		set({ dealType: t, city: "", district: "", bedrooms: undefined }),
	setCity: (c) => set({ city: c, district: "" }),
	setDistrict: (d) => set({ district: d }),
	setBedrooms: (n) =>
		set({ bedrooms: n, minBedrooms: undefined, maxBedrooms: undefined }),
	setMinBedrooms: (n) => set({ minBedrooms: n, bedrooms: undefined }),
	setMaxBedrooms: (n) => set({ maxBedrooms: n, bedrooms: undefined }),
	setHasParking: (v) => set({ hasParking: v }),
	setHasElevator: (v) => set({ hasElevator: v }),
	setHasStorage: (v) => set({ hasStorage: v }),
	setHasBalcony: (v) => set({ hasBalcony: v }),
	setIsConvertible: (v) => set({ isConvertible: v }),
	setPublisherType: (p) => set({ publisherType: p }),
	setMinArea: (v) => set({ minArea: v }),
	setMaxArea: (v) => set({ maxArea: v }),
	setMinDeposit: (v) => set({ minDeposit: v }),
	setMaxDeposit: (v) => set({ maxDeposit: v }),
	setMinRent: (v) => set({ minRent: v }),
	setMaxRent: (v) => set({ maxRent: v }),
	setMinEquivalentDeposit: (v) => set({ minEquivalentDeposit: v }),
	setMaxEquivalentDeposit: (v) => set({ maxEquivalentDeposit: v }),
	setMinPrice: (v) => set({ minPrice: v }),
	setMaxPrice: (v) => set({ maxPrice: v }),
	setMinPricePerSqMeter: (v) => set({ minPricePerSqMeter: v }),
	setMaxPricePerSqMeter: (v) => set({ maxPricePerSqMeter: v }),
	patchFilters: (filters) => set(filters),
	resetFilters: () => set({ ...DEFAULT_FILTERS, page: 1, hasMore: true }),

	// Data actions
	setSelectedListing: (l) => set({ selectedListing: l }),
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
			const filterParams = getFiltersObject(state, pageToFetch);
			let responseData: {
				success: boolean;
				total: number;
				items: UnifiedListing[];
			};

			// Try Direct Server Action first, fallback to API route if client side
			try {
				const resAction = await queryListingsAction(filterParams);
				responseData = {
					success: resAction.success,
					total: resAction.total,
					items: resAction.items,
				};
			} catch {
				const params = new URLSearchParams();
				Object.entries(filterParams).forEach(([k, v]) => {
					if (v !== undefined) params.set(k, String(v));
				});
				const res = await fetch(`/api/listings?${params.toString()}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				responseData = {
					success: json.success,
					total: json.total ?? json.count ?? 0,
					items: json.items ?? json.data ?? [],
				};
			}

			const items = responseData.items ?? [];
			const total = responseData.total ?? items.length;
			const nextListings = reset ? items : [...state.listings, ...items];
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

	fetchNextPage: async () => {
		const state = get();
		if (state.isLoading || state.isFetchingNextPage || !state.hasMore) return;

		const nextPage = state.page + 1;
		set({ isFetchingNextPage: true });

		try {
			const filterParams = getFiltersObject(state, nextPage);
			let responseData: {
				success: boolean;
				total: number;
				items: UnifiedListing[];
			};

			try {
				const resAction = await queryListingsAction(filterParams);
				responseData = {
					success: resAction.success,
					total: resAction.total,
					items: resAction.items,
				};
			} catch {
				const params = new URLSearchParams();
				Object.entries(filterParams).forEach(([k, v]) => {
					if (v !== undefined) params.set(k, String(v));
				});
				const res = await fetch(`/api/listings?${params.toString()}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				responseData = {
					success: json.success,
					total: json.total ?? json.count ?? 0,
					items: json.items ?? json.data ?? [],
				};
			}

			const items = responseData.items ?? [];
			const total = responseData.total ?? state.total;
			const nextListings = [...state.listings, ...items];
			const hasMore = nextListings.length < total && items.length > 0;

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
			const res = await fetch("/api/locations/tree");
			if (!res.ok) return;
			const json = (await res.json()) as { tree: Province[] };
			if (json.tree) set({ locationTree: json.tree });
		} catch {
			// silent — location tree is non-critical
		}
	},

	applyFilters: async () => {
		await get().fetchListings(true);
	},
}));

import { create } from "zustand";
import type { DealType, Province, UnifiedListing } from "@/types/listing";

// ── Filter defaults ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
	dealType: "rent" as DealType,
	city: "",
	district: "",
	bedrooms: undefined as number | undefined,
	hasParking: false,
	hasElevator: false,
	hasStorage: false,
	minArea: undefined as number | undefined,
	maxArea: undefined as number | undefined,
	// Rent
	minDeposit: undefined as number | undefined,
	maxDeposit: undefined as number | undefined,
	minRent: undefined as number | undefined,
	maxRent: undefined as number | undefined,
	// Buy
	minPrice: undefined as number | undefined,
	maxPrice: undefined as number | undefined,
};

type FilterState = typeof DEFAULT_FILTERS;

// ── Store interface ───────────────────────────────────────────────────────────

interface ListingState extends FilterState {
	// Data
	listings: UnifiedListing[];
	selectedListing: UnifiedListing | null;
	total: number;
	isLoading: boolean;
	error: string | null;
	hasFetched: boolean;

	// Location tree
	locationTree: Province[];

	// Actions — filters
	setDealType: (t: DealType) => void;
	setCity: (c: string) => void;
	setDistrict: (d: string) => void;
	setBedrooms: (n: number | undefined) => void;
	setHasParking: (v: boolean) => void;
	setHasElevator: (v: boolean) => void;
	setHasStorage: (v: boolean) => void;
	setMinArea: (v: number | undefined) => void;
	setMaxArea: (v: number | undefined) => void;
	setMinDeposit: (v: number | undefined) => void;
	setMaxDeposit: (v: number | undefined) => void;
	setMinRent: (v: number | undefined) => void;
	setMaxRent: (v: number | undefined) => void;
	setMinPrice: (v: number | undefined) => void;
	setMaxPrice: (v: number | undefined) => void;
	patchFilters: (filters: Partial<FilterState>) => void;
	resetFilters: () => void;

	// Actions — data
	setSelectedListing: (l: UnifiedListing | null) => void;
	setLocationTree: (t: Province[]) => void;
	fetchListings: () => Promise<void>;
	fetchLocationTree: () => Promise<void>;
	applyFilters: () => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildQueryString(state: ListingState): string {
	const params = new URLSearchParams();

	if (state.dealType) params.set("dealType", state.dealType);
	if (state.city) params.set("city", state.city);
	if (state.district) params.set("district", state.district);
	if (state.bedrooms !== undefined)
		params.set("bedrooms", String(state.bedrooms));
	if (state.hasParking) params.set("hasParking", "true");
	if (state.hasElevator) params.set("hasElevator", "true");
	if (state.hasStorage) params.set("hasStorage", "true");
	if (state.minArea !== undefined) params.set("minArea", String(state.minArea));
	if (state.maxArea !== undefined) params.set("maxArea", String(state.maxArea));

	if (state.dealType === "rent") {
		if (state.minDeposit !== undefined)
			params.set("minDeposit", String(state.minDeposit));
		if (state.maxDeposit !== undefined)
			params.set("maxDeposit", String(state.maxDeposit));
		if (state.minRent !== undefined)
			params.set("minRent", String(state.minRent));
		if (state.maxRent !== undefined)
			params.set("maxRent", String(state.maxRent));
	} else {
		if (state.minPrice !== undefined)
			params.set("minPrice", String(state.minPrice));
		if (state.maxPrice !== undefined)
			params.set("maxPrice", String(state.maxPrice));
	}

	params.set("limit", "2000");
	return params.toString();
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useListingStore = create<ListingState>((set, get) => ({
	// Data
	listings: [],
	selectedListing: null,
	total: 0,
	isLoading: false,
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
	setBedrooms: (n) => set({ bedrooms: n }),
	setHasParking: (v) => set({ hasParking: v }),
	setHasElevator: (v) => set({ hasElevator: v }),
	setHasStorage: (v) => set({ hasStorage: v }),
	setMinArea: (v) => set({ minArea: v }),
	setMaxArea: (v) => set({ maxArea: v }),
	setMinDeposit: (v) => set({ minDeposit: v }),
	setMaxDeposit: (v) => set({ maxDeposit: v }),
	setMinRent: (v) => set({ minRent: v }),
	setMaxRent: (v) => set({ maxRent: v }),
	setMinPrice: (v) => set({ minPrice: v }),
	setMaxPrice: (v) => set({ maxPrice: v }),
	patchFilters: (filters) => set(filters),
	resetFilters: () => set({ ...DEFAULT_FILTERS }),

	// Data actions
	setSelectedListing: (l) => set({ selectedListing: l }),
	setLocationTree: (t) => set({ locationTree: t }),

	fetchListings: async () => {
		const state = get();
		set({ isLoading: true, error: null });
		try {
			const qs = buildQueryString(state);
			const res = await fetch(`/api/listings${qs ? `?${qs}` : ""}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = (await res.json()) as {
				success: boolean;
				count: number;
				items: UnifiedListing[];
			};
			set({
				listings: json.items ?? [],
				total: json.count ?? 0,
				isLoading: false,
				hasFetched: true,
			});
		} catch (err) {
			set({
				error: err instanceof Error ? err.message : "خطا در دریافت آگهیها",
				isLoading: false,
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
		await get().fetchListings();
	},
}));

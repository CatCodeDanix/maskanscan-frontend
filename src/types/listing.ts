// ── Source & Deal enums ───────────────────────────────────────────────────────

export type Source = "divar" | "sheypoor" | "kilid" | "mrestate";
export type DealType = "rent" | "buy";
export type IngestionStrategy = "fast_search" | "eager_detail";

// ── Sub-objects ───────────────────────────────────────────────────────────────

export interface ListingLocation {
	latitude: number;
	longitude: number;
	/** true if the pin coordinates are approximate */
	isFuzzy: boolean;
	/** true if the pin resolved to the neighbourhood centroid (not exact address) */
	isFallback: boolean;
}

export interface MapPinItem {
	id?: number;
	source: Source;
	externalId: string;
	title: string;
	dealType: DealType;
	cityPersian: string;
	districtPersian?: string;
	depositTomans?: number;
	rentTomans?: number;
	totalPriceTomans?: number;
	latitude: number;
	longitude: number;
	isFallback?: boolean;
}

export interface ListingAttributes {
	areaSqMeters?: number;
	landAreaSqMeters?: number;
	yearBuilt?: number;
	bedrooms?: number;
	floor?: number | string;
	totalFloorsInBuilding?: number;
	unitsPerFloor?: number;
	parkingSpots?: number;
	hasElevator?: boolean;
	hasParking?: boolean;
	hasStorage?: boolean;
	hasBalcony?: boolean;
	isConvertible?: boolean;
	isFurnished?: boolean;
	hasLobby?: boolean;
	hasPool?: boolean;
	hasSauna?: boolean;
	hasJacuzzi?: boolean;
	hasGym?: boolean;
	hasRoofGarden?: boolean;
	wcCount?: number;
	wcType?: string;
	coolingSystem?: string;
	heatingSystem?: string;
	waterHeater?: string;
	flooringType?: string;
	buildingFacade?: string;
	unitDirection?: string;
	features?: string[];
}

export interface AlternateSource {
	source: string;
	url: string;
	externalId: string;
	scrapedAt: string;
}

// ── Main listing type ─────────────────────────────────────────────────────────

export interface UnifiedListing {
	id?: number;
	source: Source;
	externalId: string;
	url: string;

	// UI Display Strings (Persian) — always use these in the UI
	title: string;
	description?: string;
	cityPersian: string;
	districtPersian?: string;

	// URL / Search Slugs (English ASCII) — use only for filters & params
	city: string;
	district?: string;

	// Deal Type & Pricing — ALL VALUES IN TOMANS
	dealType: DealType;
	depositTomans?: number;
	rentTomans?: number;
	equivalentFullDepositTomans?: number;
	isAgreedDeposit?: boolean;
	isAgreedRent?: boolean;
	totalPriceTomans?: number;
	pricePerSqMeterTomans?: number;
	isAgreedPrice?: boolean;

	// Map
	location: ListingLocation | null | undefined;

	// Attributes
	attributes: ListingAttributes;

	// Media & publisher
	images: string[];
	publisherType?: "personal" | "agency";
	publisherPhone?: string;

	// Cross-platform deduplication
	alternateSources?: AlternateSource[];

	// Timestamps (ISO 8601 UTC)
	publishedAt?: string;
	scrapedAt: string;
	lastSeenAt?: string;
	ingestionStrategy?: IngestionStrategy;
	isActive?: boolean;
}

// ── Filter params ─────────────────────────────────────────────────────────────

export interface ListingFilters {
	dealType?: DealType;
	city?: string;
	district?: string;
	minDeposit?: number;
	maxDeposit?: number;
	minRent?: number;
	maxRent?: number;
	minEquivalentDeposit?: number;
	maxEquivalentDeposit?: number;
	minPrice?: number;
	maxPrice?: number;
	minPricePerSqMeter?: number;
	maxPricePerSqMeter?: number;
	minArea?: number;
	maxArea?: number;
	bedrooms?: number;
	minBedrooms?: number;
	maxBedrooms?: number;
	hasParking?: boolean;
	hasElevator?: boolean;
	hasStorage?: boolean;
	hasBalcony?: boolean;
	isConvertible?: boolean;
	excludeAgreed?: boolean;
	publisherType?: "all" | "personal" | "agency";
	page?: number;
	limit?: number;
}

// ── Location tree ─────────────────────────────────────────────────────────────

export interface District {
	districtId: string;
	districtName: string;
	latitude: number;
	longitude: number;
}

export interface City {
	cityId: string;
	cityName: string;
	latitude: number;
	longitude: number;
	districts: District[];
}

export interface Province {
	provinceId: string;
	provinceName: string;
	cities: City[];
}

export interface LocationTree {
	success: boolean;
	provincesCount: number;
	tree: Province[];
}

// ── API responses ─────────────────────────────────────────────────────────────

export interface ListingsResponse {
	success: boolean;
	count: number;
	data: UnifiedListing[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

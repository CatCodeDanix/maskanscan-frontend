import type {
	DealType,
	ListingFilters,
	MapPinItem,
	UnifiedListing,
} from "./listing";

/**
 * Bounding box array representation: [minLng, minLat, maxLng, maxLat]
 * standard geojson / maplibre bbox format
 */
export type BBox = [
	minLng: number,
	minLat: number,
	maxLng: number,
	maxLat: number,
];

/**
 * Zoom tier determining backend live aggregation (< 14) vs frontend superclustering (>= 14)
 */
export type ZoomTier = "clustered" | "raw";

/**
 * Live grid cluster aggregated directly on backend PostgreSQL/PostGIS
 */
export interface BackendClusterItem {
	id: string;
	count: number;
	longitude: number;
	latitude: number;
	minDeposit?: number;
	maxDeposit?: number;
	minRent?: number;
	maxRent?: number;
	minPrice?: number;
	maxPrice?: number;
	dealType: DealType;
}

/**
 * Response payload returned from fetchMapDataAction
 */
export interface MapDataResponse {
	success: boolean;
	zoomTier: ZoomTier;
	clusters: BackendClusterItem[];
	rawPoints: MapPinItem[];
	bbox: BBox;
	totalCount: number;
	error?: string;
}

/**
 * Response payload returned from fetchViewportListingsAction
 */
export interface ViewportListingsResponse {
	success: boolean;
	items: UnifiedListing[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
	error?: string;
}

export interface FetchMapDataParams {
	bbox: BBox;
	zoom: number;
	filters: ListingFilters;
}

export interface FetchViewportListingsParams {
	bbox: BBox;
	filters: ListingFilters;
	page?: number;
	limit?: number;
}

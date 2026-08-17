"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { scrapedListings } from "@/db/schema";
import { expandBBox, getGridSizeForZoom, getZoomTier } from "@/lib/geospatial";
import type {
	BackendClusterItem,
	BBox,
	FetchMapDataParams,
	FetchViewportListingsParams,
	MapDataResponse,
	ViewportListingsResponse,
} from "@/types/geospatial";
import type {
	ListingFilters,
	MapPinItem,
	UnifiedListing,
} from "@/types/listing";

// ── Shared SQL Where Builder with Bounding Box ────────────────────────────────

function buildGeospatialWhereClause(filters: ListingFilters, bbox?: BBox) {
	const conditions = [eq(scrapedListings.isActive, true)];

	// Viewport Bounding Box: [minLng, minLat, maxLng, maxLat]
	if (bbox) {
		const [minLng, minLat, maxLng, maxLat] = bbox;
		conditions.push(
			gte(scrapedListings.longitude, minLng),
			lte(scrapedListings.longitude, maxLng),
			gte(scrapedListings.latitude, minLat),
			lte(scrapedListings.latitude, maxLat),
		);
	}

	// Deal type filter (defaults to rent)
	const dealType = filters.dealType || "rent";
	conditions.push(eq(scrapedListings.dealType, dealType));

	if (filters.city) {
		conditions.push(eq(scrapedListings.city, filters.city.toLowerCase()));
	}

	if (filters.district) {
		conditions.push(
			eq(scrapedListings.district, filters.district.toLowerCase()),
		);
	}

	// Rent price filters
	if (filters.minDeposit !== undefined) {
		conditions.push(gte(scrapedListings.depositTomans, filters.minDeposit));
	}
	if (filters.maxDeposit !== undefined) {
		conditions.push(lte(scrapedListings.depositTomans, filters.maxDeposit));
	}
	if (filters.minRent !== undefined) {
		conditions.push(gte(scrapedListings.rentTomans, filters.minRent));
	}
	if (filters.maxRent !== undefined) {
		conditions.push(lte(scrapedListings.rentTomans, filters.maxRent));
	}

	// Converted Equivalent Full Deposit Filter
	if (filters.minEquivalentDeposit !== undefined) {
		conditions.push(
			gte(
				scrapedListings.equivalentFullDepositTomans,
				filters.minEquivalentDeposit,
			),
		);
	}
	if (filters.maxEquivalentDeposit !== undefined) {
		conditions.push(
			lte(
				scrapedListings.equivalentFullDepositTomans,
				filters.maxEquivalentDeposit,
			),
		);
	}

	// Publisher type
	if (filters.publisherType && filters.publisherType !== "all") {
		conditions.push(eq(scrapedListings.publisherType, filters.publisherType));
	}

	// JSONB Attributes filters
	if (filters.minArea !== undefined) {
		conditions.push(
			sql`CAST(${scrapedListings.attributes}->>'areaSqMeters' AS NUMERIC) >= ${filters.minArea}`,
		);
	}
	if (filters.maxArea !== undefined) {
		conditions.push(
			sql`CAST(${scrapedListings.attributes}->>'areaSqMeters' AS NUMERIC) <= ${filters.maxArea}`,
		);
	}

	// Bedrooms
	if (filters.bedrooms !== undefined) {
		conditions.push(
			sql`CAST(${scrapedListings.attributes}->>'bedrooms' AS NUMERIC) = ${filters.bedrooms}`,
		);
	} else {
		if (filters.minBedrooms !== undefined) {
			conditions.push(
				sql`CAST(${scrapedListings.attributes}->>'bedrooms' AS NUMERIC) >= ${filters.minBedrooms}`,
			);
		}
		if (filters.maxBedrooms !== undefined) {
			conditions.push(
				sql`CAST(${scrapedListings.attributes}->>'bedrooms' AS NUMERIC) <= ${filters.maxBedrooms}`,
			);
		}
	}

	// Amenity boolean toggles inside JSONB
	if (filters.hasParking) {
		conditions.push(sql`${scrapedListings.attributes}->>'hasParking' = 'true'`);
	}
	if (filters.hasElevator) {
		conditions.push(
			sql`${scrapedListings.attributes}->>'hasElevator' = 'true'`,
		);
	}
	if (filters.hasStorage) {
		conditions.push(sql`${scrapedListings.attributes}->>'hasStorage' = 'true'`);
	}
	if (filters.hasBalcony) {
		conditions.push(sql`${scrapedListings.attributes}->>'hasBalcony' = 'true'`);
	}
	if (filters.isConvertible) {
		conditions.push(
			sql`${scrapedListings.attributes}->>'isConvertible' = 'true'`,
		);
	}

	// Exclude negotiable/agreed price listings ("توافقی")
	if (filters.excludeAgreed) {
		if (filters.dealType === "buy") {
			conditions.push(
				eq(scrapedListings.isAgreedPrice, false),
				sql`${scrapedListings.totalPriceTomans} IS NOT NULL AND ${scrapedListings.totalPriceTomans} > 0`,
			);
		} else {
			conditions.push(
				eq(scrapedListings.isAgreedDeposit, false),
				eq(scrapedListings.isAgreedRent, false),
				sql`(${scrapedListings.depositTomans} IS NOT NULL AND ${scrapedListings.depositTomans} > 0 OR ${scrapedListings.rentTomans} IS NOT NULL AND ${scrapedListings.rentTomans} > 0)`,
			);
		}
	}

	return and(...conditions);
}

// ── 1. Fetch Map Data (Server Action) ──────────────────────────────────────────

export async function fetchMapDataAction(
	params: FetchMapDataParams,
): Promise<MapDataResponse> {
	try {
		const { bbox, zoom, filters } = params;
		const zoomTier = getZoomTier(zoom);
		const dealType = filters.dealType || "rent";

		// ── Tier 1: Zoom < 14 (Backend Live Grid Aggregation in 1 Query) ──────────
		if (zoomTier === "clustered") {
			const gridSize = getGridSizeForZoom(zoom);
			const whereClause = buildGeospatialWhereClause(filters, bbox);

			const unifiedGridQuery = sql`
				SELECT 
					FLOOR(longitude / ${gridSize})::int AS gx,
					FLOOR(latitude / ${gridSize})::int AS gy,
					COUNT(*)::int AS point_count,
					AVG(longitude)::float8 AS avg_lng,
					AVG(latitude)::float8 AS avg_lat,
					MIN(id) AS sample_id,
					MIN(source) AS sample_source,
					MIN(external_id) AS sample_external_id,
					MIN(title) AS sample_title,
					MIN(city_persian) AS sample_city_persian,
					MIN(district_persian) AS sample_district_persian,
					MIN(deposit_tomans)::bigint AS min_deposit,
					MAX(deposit_tomans)::bigint AS max_deposit,
					MIN(rent_tomans)::bigint AS min_rent,
					MAX(rent_tomans)::bigint AS max_rent,
					MIN(total_price_tomans)::bigint AS min_price,
					MAX(total_price_tomans)::bigint AS max_price
				FROM ${scrapedListings}
				WHERE ${whereClause}
				GROUP BY 1, 2
				LIMIT 2500;
			`;

			const result = await db.execute(unifiedGridQuery);
			const rows = (result.rows || []) as Array<{
				gx: number;
				gy: number;
				point_count: number;
				avg_lng: number;
				avg_lat: number;
				sample_id: string | number | null;
				sample_source: string | null;
				sample_external_id: string | null;
				sample_title: string | null;
				sample_city_persian: string | null;
				sample_district_persian: string | null;
				min_deposit: number | null;
				max_deposit: number | null;
				min_rent: number | null;
				max_rent: number | null;
				min_price: number | null;
				max_price: number | null;
			}>;

			const clusters: BackendClusterItem[] = [];
			const rawPoints: MapPinItem[] = [];

			for (const row of rows) {
				const count = Number(row.point_count);
				if (count >= 3) {
					clusters.push({
						id: `cluster-${row.gx}-${row.gy}`,
						count,
						longitude: Number(row.avg_lng),
						latitude: Number(row.avg_lat),
						minDeposit:
							row.min_deposit != null ? Number(row.min_deposit) : undefined,
						maxDeposit:
							row.max_deposit != null ? Number(row.max_deposit) : undefined,
						minRent: row.min_rent != null ? Number(row.min_rent) : undefined,
						maxRent: row.max_rent != null ? Number(row.max_rent) : undefined,
						minPrice: row.min_price != null ? Number(row.min_price) : undefined,
						maxPrice: row.max_price != null ? Number(row.max_price) : undefined,
						dealType,
					});
				} else if (row.sample_external_id) {
					rawPoints.push({
						id:
							typeof row.sample_id === "number"
								? row.sample_id
								: Number(row.sample_id) || undefined,
						source: (row.sample_source as MapPinItem["source"]) || "divar",
						externalId: row.sample_external_id,
						title: row.sample_title || "ملک مسکونی",
						dealType: dealType as MapPinItem["dealType"],
						cityPersian: row.sample_city_persian || "تهران",
						districtPersian: row.sample_district_persian ?? undefined,
						depositTomans:
							row.min_deposit != null ? Number(row.min_deposit) : undefined,
						rentTomans: row.min_rent != null ? Number(row.min_rent) : undefined,
						totalPriceTomans:
							row.min_price != null ? Number(row.min_price) : undefined,
						latitude: Number(row.avg_lat),
						longitude: Number(row.avg_lng),
						isFallback: false,
					});
				}
			}

			const totalCount =
				clusters.reduce((acc, c) => acc + c.count, 0) + rawPoints.length;

			return {
				success: true,
				zoomTier: "clustered",
				clusters,
				rawPoints,
				bbox,
				totalCount,
			};
		}

		// ── Tier 2: Zoom >= 14 (Raw Points for Padded BBox) ───────────────────────
		const paddedBBox = expandBBox(bbox, 0.25);
		const whereClause = buildGeospatialWhereClause(filters, paddedBBox);

		const rawItems = await db
			.select({
				id: scrapedListings.id,
				source: scrapedListings.source,
				externalId: scrapedListings.externalId,
				title: scrapedListings.title,
				dealType: scrapedListings.dealType,
				cityPersian: scrapedListings.cityPersian,
				districtPersian: scrapedListings.districtPersian,
				depositTomans: scrapedListings.depositTomans,
				rentTomans: scrapedListings.rentTomans,
				totalPriceTomans: scrapedListings.totalPriceTomans,
				latitude: scrapedListings.latitude,
				longitude: scrapedListings.longitude,
				isFallback: scrapedListings.isFallback,
			})
			.from(scrapedListings)
			.where(whereClause)
			.limit(5000);

		const rawPoints: MapPinItem[] = rawItems.map((item) => ({
			id: typeof item.id === "number" ? item.id : Number(item.id) || undefined,
			source: item.source as MapPinItem["source"],
			externalId: item.externalId,
			title: item.title,
			dealType: item.dealType as MapPinItem["dealType"],
			cityPersian: item.cityPersian,
			districtPersian: item.districtPersian ?? undefined,
			depositTomans: item.depositTomans ?? undefined,
			rentTomans: item.rentTomans ?? undefined,
			totalPriceTomans: item.totalPriceTomans ?? undefined,
			latitude: item.latitude,
			longitude: item.longitude,
			isFallback: Boolean(item.isFallback),
		}));

		return {
			success: true,
			zoomTier: "raw",
			clusters: [],
			rawPoints,
			bbox: paddedBBox,
			totalCount: rawPoints.length,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Geospatial query error";
		console.error("fetchMapDataAction error:", error);
		return {
			success: false,
			zoomTier: "clustered",
			clusters: [],
			rawPoints: [],
			bbox: params.bbox,
			totalCount: 0,
			error: message,
		};
	}
}

// ── 2. Fetch Viewport Listings for Infinite List (Server Action) ───────────────

export async function fetchViewportListingsAction(
	params: FetchViewportListingsParams,
): Promise<ViewportListingsResponse> {
	try {
		const { bbox, filters } = params;
		const page = Math.max(1, params.page || 1);
		const limit = Math.min(100, Math.max(1, params.limit || 20));
		const offset = (page - 1) * limit;
		const whereClause = buildGeospatialWhereClause(filters, bbox);

		// Fetch limit + 1 items to determine hasMore without expensive full-table scans
		const rawItems = await db
			.select()
			.from(scrapedListings)
			.where(whereClause)
			.orderBy(desc(scrapedListings.publishedAt), desc(scrapedListings.id))
			.limit(limit + 1)
			.offset(offset);

		const hasMore = rawItems.length > limit;
		const pageItems = hasMore ? rawItems.slice(0, limit) : rawItems;

		// Fast approximate count capped to avoid 150k-row scan timeouts
		let total = offset + pageItems.length;
		if (hasMore) {
			const countResult = await db.execute(
				sql`SELECT COUNT(*)::int AS cnt FROM (SELECT 1 FROM ${scrapedListings} WHERE ${whereClause} LIMIT 5000) s`,
			);
			const rowCount = Number(
				(countResult.rows[0] as { cnt: number })?.cnt ?? 0,
			);
			total = rowCount >= 5000 ? 5000 : rowCount;
		}

		const items: UnifiedListing[] = pageItems.map((item) => {
			const lat = item.latitude;
			const lng = item.longitude;
			const location =
				lat != null && lng != null
					? {
							latitude: lat,
							longitude: lng,
							isFuzzy: Boolean(item.isFuzzy),
							isFallback: Boolean(item.isFallback),
						}
					: null;

			return {
				id:
					typeof item.id === "number" ? item.id : Number(item.id) || undefined,
				source: item.source as UnifiedListing["source"],
				externalId: item.externalId,
				url: item.url,
				title: item.title,
				description: item.description ?? undefined,
				dealType: item.dealType as UnifiedListing["dealType"],
				city: item.city,
				district: item.district ?? undefined,
				cityPersian: item.cityPersian,
				districtPersian: item.districtPersian ?? undefined,
				depositTomans: item.depositTomans ?? undefined,
				rentTomans: item.rentTomans ?? undefined,
				equivalentFullDepositTomans:
					item.equivalentFullDepositTomans ?? undefined,
				totalPriceTomans: item.totalPriceTomans ?? undefined,
				pricePerSqMeterTomans: item.pricePerSqMeterTomans ?? undefined,
				isAgreedDeposit: Boolean(item.isAgreedDeposit),
				isAgreedRent: Boolean(item.isAgreedRent),
				isAgreedPrice: Boolean(item.isAgreedPrice),
				location,
				attributes: (item.attributes ?? {}) as UnifiedListing["attributes"],
				images: (item.images ?? []) as string[],
				publisherType:
					(item.publisherType as UnifiedListing["publisherType"]) ?? undefined,
				publisherPhone: item.publisherPhone ?? undefined,
				alternateSources:
					item.alternateSources as UnifiedListing["alternateSources"],
				publishedAt: item.publishedAt
					? item.publishedAt.toISOString()
					: undefined,
				scrapedAt: item.scrapedAt
					? item.scrapedAt.toISOString()
					: new Date().toISOString(),
				lastSeenAt: item.lastSeenAt ? item.lastSeenAt.toISOString() : undefined,
				ingestionStrategy:
					item.ingestionStrategy as UnifiedListing["ingestionStrategy"],
				isActive: Boolean(item.isActive),
			};
		});

		return {
			success: true,
			items,
			total,
			page,
			limit,
			hasMore: offset + items.length < total,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Viewport listings query error";
		console.error("fetchViewportListingsAction error:", error);
		return {
			success: false,
			items: [],
			total: 0,
			page: 1,
			limit: 20,
			hasMore: false,
			error: message,
		};
	}
}

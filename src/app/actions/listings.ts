"use server";

import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { scrapedListings } from "@/db/schema";
import type {
	ListingFilters,
	MapPinItem,
	UnifiedListing,
} from "@/types/listing";

// ── Shared SQL Where Builder ──────────────────────────────────────────────────

function buildWhereClause(filters: ListingFilters) {
	const conditions = [eq(scrapedListings.isActive, true)];

	if (filters.dealType) {
		conditions.push(eq(scrapedListings.dealType, filters.dealType));
	} else {
		conditions.push(eq(scrapedListings.dealType, "rent"));
	}

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

	// Absolute / Converted Equivalent Deposit Filter
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

	// Buy price filters
	if (filters.minPrice !== undefined) {
		conditions.push(gte(scrapedListings.totalPriceTomans, filters.minPrice));
	}
	if (filters.maxPrice !== undefined) {
		conditions.push(lte(scrapedListings.totalPriceTomans, filters.maxPrice));
	}
	if (filters.minPricePerSqMeter !== undefined) {
		conditions.push(
			gte(scrapedListings.pricePerSqMeterTomans, filters.minPricePerSqMeter),
		);
	}
	if (filters.maxPricePerSqMeter !== undefined) {
		conditions.push(
			lte(scrapedListings.pricePerSqMeterTomans, filters.maxPricePerSqMeter),
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

	// Bedrooms (exact or range)
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

	// Amenity boolean toggles inside JSONB column
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

	return and(...conditions);
}

// ── 1. Query Paginated Rich Listings (Card List View) ─────────────────────────

export async function queryListingsAction(filters: ListingFilters = {}) {
	try {
		const page = Math.max(1, filters.page || 1);
		const limit = Math.min(200, Math.max(1, filters.limit || 50));
		const offset = (page - 1) * limit;

		const whereClause = buildWhereClause(filters);

		const [totalResult] = await db
			.select({ total: count() })
			.from(scrapedListings)
			.where(whereClause);

		const total = Number(totalResult?.total ?? 0);

		const rawItems = await db
			.select()
			.from(scrapedListings)
			.where(whereClause)
			.limit(limit)
			.offset(offset);

		const items: UnifiedListing[] = rawItems.map((item) => {
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
			count: items.length,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			items,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Database query error";
		console.error("queryListingsAction error:", error);
		return {
			success: false,
			error: message,
			count: 0,
			total: 0,
			page: 1,
			limit: 50,
			totalPages: 0,
			items: [],
		};
	}
}

// ── 2. Query Lightweight Map Pins (Deck.gl Overlay) ──────────────────────────

export async function queryMapPinsAction(filters: ListingFilters = {}) {
	try {
		const whereClause = buildWhereClause(filters);

		const rawPins = await db
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
			.limit(50000); // Extremely high limit for full map clustering

		const pins: MapPinItem[] = rawPins.map((item) => ({
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
			count: pins.length,
			pins,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Map pins query error";
		console.error("queryMapPinsAction error:", error);
		return {
			success: false,
			error: message,
			count: 0,
			pins: [],
		};
	}
}

// ── 3. Fetch Single Full Rich Listing by ID (On Marker Click) ────────────────

export async function getListingByIdAction(source: string, externalId: string) {
	try {
		const [item] = await db
			.select()
			.from(scrapedListings)
			.where(
				and(
					eq(scrapedListings.source, source),
					eq(scrapedListings.externalId, externalId),
					eq(scrapedListings.isActive, true),
				),
			)
			.limit(1);

		if (!item) return { success: false, listing: null };

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

		const listing: UnifiedListing = {
			id: typeof item.id === "number" ? item.id : Number(item.id) || undefined,
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

		return { success: true, listing };
	} catch (error) {
		console.error("getListingByIdAction error:", error);
		return { success: false, listing: null };
	}
}

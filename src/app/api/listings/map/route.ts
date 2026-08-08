import type { NextRequest } from "next/server";
import { queryMapPinsAction } from "@/app/actions/listings";
import type { DealType, ListingFilters } from "@/types/listing";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;

		const parseNum = (val: string | null) =>
			val && !Number.isNaN(Number(val)) ? Number(val) : undefined;
		const parseBool = (val: string | null) =>
			val === "true" ? true : val === "false" ? false : undefined;

		const filters: ListingFilters = {
			dealType: (searchParams.get("dealType") as DealType) || "rent",
			city: searchParams.get("city") || undefined,
			district: searchParams.get("district") || undefined,
			minDeposit: parseNum(searchParams.get("minDeposit")),
			maxDeposit: parseNum(searchParams.get("maxDeposit")),
			minRent: parseNum(searchParams.get("minRent")),
			maxRent: parseNum(searchParams.get("maxRent")),
			minEquivalentDeposit: parseNum(searchParams.get("minEquivalentDeposit")),
			maxEquivalentDeposit: parseNum(searchParams.get("maxEquivalentDeposit")),
			minPrice: parseNum(searchParams.get("minPrice")),
			maxPrice: parseNum(searchParams.get("maxPrice")),
			minPricePerSqMeter: parseNum(searchParams.get("minPricePerSqMeter")),
			maxPricePerSqMeter: parseNum(searchParams.get("maxPricePerSqMeter")),
			minArea: parseNum(searchParams.get("minArea")),
			maxArea: parseNum(searchParams.get("maxArea")),
			bedrooms: parseNum(searchParams.get("bedrooms")),
			minBedrooms: parseNum(searchParams.get("minBedrooms")),
			maxBedrooms: parseNum(searchParams.get("maxBedrooms")),
			hasParking: parseBool(searchParams.get("hasParking")),
			hasElevator: parseBool(searchParams.get("hasElevator")),
			hasStorage: parseBool(searchParams.get("hasStorage")),
			hasBalcony: parseBool(searchParams.get("hasBalcony")),
			isConvertible: parseBool(searchParams.get("isConvertible")),
			excludeAgreed: parseBool(searchParams.get("excludeAgreed")),
			publisherType:
				(searchParams.get(
					"publisherType",
				) as ListingFilters["publisherType"]) || undefined,
		};

		const result = await queryMapPinsAction(filters);

		return Response.json(result, {
			status: result.success ? 200 : 500,
			headers: {
				"Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
			},
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		return Response.json({ success: false, error: message }, { status: 500 });
	}
}

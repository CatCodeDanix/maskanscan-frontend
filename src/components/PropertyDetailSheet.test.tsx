import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";
import { PropertyDetailSheet } from "./PropertyDetailSheet";

const mockListing: UnifiedListing = {
	source: "divar",
	externalId: "test-sheet-1",
	url: "https://divar.ir/v/123",
	title: "ویلای دوبلکس لواسان",
	dealType: "buy",
	city: "tehran",
	cityPersian: "تهران",
	districtPersian: "لواسان",
	totalPriceTomans: 25_000_000_000,
	location: {
		latitude: 35.8,
		longitude: 51.6,
		isFuzzy: false,
		isFallback: false,
	},
	attributes: {
		areaSqMeters: 350,
		bedrooms: 4,
	},
	images: [],
	scrapedAt: new Date().toISOString(),
};

describe("PropertyDetailSheet component", () => {
	it("renders fallback image when selected listing has empty images array", () => {
		useListingStore.getState().setSelectedListing(mockListing);

		render(<PropertyDetailSheet />);

		const img = screen.getByAltText("تصویر در دسترس نیست");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute(
			"src",
			expect.stringContaining("property-placeholder.webp"),
		);
	});
});

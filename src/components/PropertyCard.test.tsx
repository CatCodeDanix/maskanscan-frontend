import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";
import { PropertyCard } from "./PropertyCard";

const mockListing: UnifiedListing = {
	source: "divar",
	externalId: "test-listing-1",
	url: "https://divar.ir/v/123",
	title: "آپارتمان ۱۰۰ متری سعادت آباد",
	dealType: "rent",
	city: "tehran",
	cityPersian: "تهران",
	districtPersian: "سعادت آباد",
	depositTomans: 500_000_000,
	rentTomans: 15_000_000,
	location: {
		latitude: 35.79,
		longitude: 51.37,
		isFuzzy: false,
		isFallback: false,
	},
	attributes: {
		areaSqMeters: 100,
		bedrooms: 2,
		hasParking: true,
	},
	images: ["https://example.com/image1.jpg"],
	scrapedAt: new Date().toISOString(),
};

describe("PropertyCard component", () => {
	it("renders listing title, location, and formatted pricing", () => {
		render(<PropertyCard listing={mockListing} />);

		expect(
			screen.getByText("آپارتمان ۱۰۰ متری سعادت آباد"),
		).toBeInTheDocument();
		expect(screen.getByText("تهران • سعادت آباد")).toBeInTheDocument();
		expect(screen.getByText("۵۰۰ میلیون تومان")).toBeInTheDocument();
	});

	it("updates selectedListing in store when clicked", async () => {
		const user = userEvent.setup();
		render(<PropertyCard listing={mockListing} />);

		const card = screen.getByRole("button", {
			name: /آپارتمان ۱۰۰ متری سعادت آباد/,
		});
		await user.click(card);

		const selected = useListingStore.getState().selectedListing;
		expect(selected?.externalId).toBe("test-listing-1");
	});
});

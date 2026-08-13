import { describe, expect, it } from "vitest";
import type { BBox } from "@/types/geospatial";
import {
	expandBBox,
	formatClusterPriceSummary,
	getZoomTier,
	isBBoxContained,
	snapBBox,
} from "./geospatial";

describe("Geospatial Math and Tier Utilities", () => {
	const tehranBbox: BBox = [51.15, 35.55, 51.62, 35.85];

	it("snaps bounding box to coarse grid (0.01 precision)", () => {
		const raw: BBox = [51.1523, 35.5511, 51.6288, 35.8599];
		const snapped = snapBBox(raw, 0.01);
		expect(snapped).toEqual([51.15, 35.55, 51.63, 35.86]);
	});

	it("expands bounding box with margin factor", () => {
		const expanded = expandBBox(tehranBbox, 0.25);
		expect(expanded[0]).toBeLessThan(tehranBbox[0]);
		expect(expanded[1]).toBeLessThan(tehranBbox[1]);
		expect(expanded[2]).toBeGreaterThan(tehranBbox[2]);
		expect(expanded[3]).toBeGreaterThan(tehranBbox[3]);
	});

	it("verifies spatial containment correctly", () => {
		const inner: BBox = [51.2, 35.6, 51.5, 35.8];
		const outerDisplaced: BBox = [50.9, 35.6, 51.5, 35.8];

		expect(isBBoxContained(inner, tehranBbox)).toBe(true);
		expect(isBBoxContained(outerDisplaced, tehranBbox)).toBe(false);
	});

	it("classifies zoom tiers across the zoom 14 threshold", () => {
		expect(getZoomTier(10)).toBe("clustered");
		expect(getZoomTier(13.99)).toBe("clustered");
		expect(getZoomTier(14)).toBe("raw");
		expect(getZoomTier(16)).toBe("raw");
	});

	it("formats cluster price summaries properly", () => {
		const rentCluster = {
			id: "c1",
			count: 10,
			latitude: 35.7,
			longitude: 51.4,
			dealType: "rent" as const,
			minDeposit: 100_000_000,
			maxDeposit: 500_000_000,
		};
		const summary = formatClusterPriceSummary(rentCluster);
		expect(summary).toContain("رهن");
		expect(summary).toContain("۱۰۰ میلیون");
	});
});

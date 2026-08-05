"use client";

import type { PickingInfo } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { Feature, LineString, MultiLineString, Point } from "geojson";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TransitTooltip from "@/components/map/TransitTooltip";
import type { TransitProperties } from "@/data";
import { formatListingPriceShort } from "@/lib/format";
import { useTransitLayers } from "@/lib/overlay-layers";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";
import DeckGLOverlay from "./DeckGLOverlay";

// ── Listing layer ───────────────────────────────────────────────────────────

// Amber for rent, green for buy
const RENT_COLOR: [number, number, number] = [245, 158, 11];
const BUY_COLOR: [number, number, number] = [16, 185, 129];

function buildListingLayer(
	listings: UnifiedListing[],
	setSelectedListing: (l: UnifiedListing | null) => void,
) {
	return new ScatterplotLayer<UnifiedListing>({
		id: "property-listings",
		data: listings,
		getPosition: (d): [number, number] => [
			d.location.longitude,
			d.location.latitude,
		],
		getFillColor: (d) => {
			const base = d.dealType === "rent" ? RENT_COLOR : BUY_COLOR;
			// Fallback pins are more transparent
			const alpha = d.location.isFallback ? 140 : 220;
			return [...base, alpha] as [number, number, number, number];
		},
		getLineColor: [255, 255, 255, 200],
		lineWidthMinPixels: 1.5,
		stroked: true,
		radiusScale: 1,
		radiusMinPixels: 6,
		radiusMaxPixels: 22,
		radiusUnits: "meters",
		pickable: true,
		autoHighlight: true,
		highlightColor: [255, 255, 255, 60],
		onClick: ({ object }) => {
			if (object) setSelectedListing(object);
		},
	});
}

// ── Tooltip ─────────────────────────────────────────────────────────────────────

function getTooltipContent(
	info: PickingInfo<
		| UnifiedListing
		| Feature<Point | LineString | MultiLineString, TransitProperties>
	>,
) {
	if (!info.object) return null;

	// Listing tooltip
	if ("source" in info.object && "location" in info.object) {
		const listing = info.object as UnifiedListing;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;min-width:160px">
				<p style="font-size:12px;font-weight:600;margin:0 0 4px">${listing.title}</p>
				<p style="font-size:11px;margin:0;opacity:0.7">${listing.cityPersian}${listing.districtPersian ? ` • ${listing.districtPersian}` : ""}</p>
				<p style="font-size:12px;font-weight:600;margin:4px 0 0;color:${listing.dealType === "rent" ? "#f59e0b" : "#10b981"}">${formatListingPriceShort(listing)}</p>
				${listing.location.isFallback ? '<p style="font-size:10px;margin:4px 0 0;opacity:0.6">⚠️ موقعیت تقریبی</p>' : ""}
			</div>`,
			className: "deck-tooltip-reset",
		};
	}

	// Transit tooltip
	const transitFeature = info.object as Feature<
		Point | LineString | MultiLineString,
		TransitProperties
	>;
	const html = renderToStaticMarkup(
		<TransitTooltip properties={transitFeature.properties} />,
	);
	return { html, className: "deck-tooltip-reset" };
}

// Stable module-level cursor function — never recreated
const getCursor = ({ isHovering }: { isHovering: boolean }) =>
	isHovering ? "pointer" : "grab";

// ── Component ─────────────────────────────────────────────────────────────────

const DeckMap = () => {
	const transitLayers = useTransitLayers();
	const listings = useListingStore((s) => s.listings);
	const setSelectedListing = useListingStore((s) => s.setSelectedListing);

	const listingLayer = useMemo(
		() => buildListingLayer(listings, setSelectedListing),
		[listings, setSelectedListing],
	);

	const layers = useMemo(
		() => [...transitLayers, listingLayer],
		[transitLayers, listingLayer],
	);

	return (
		<DeckGLOverlay
			layers={layers}
			getTooltip={getTooltipContent}
			getCursor={getCursor}
		/>
	);
};

export default DeckMap;

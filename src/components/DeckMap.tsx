"use client";

import type { PickingInfo } from "@deck.gl/core";
import { IconLayer, TextLayer } from "@deck.gl/layers";
import type { Feature, LineString, MultiLineString, Point } from "geojson";
import { useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Supercluster from "supercluster";
import TransitTooltip from "@/components/map/TransitTooltip";
import type { TransitProperties } from "@/data";
import { formatListingPriceShort } from "@/lib/format";
import { useTransitLayers } from "@/lib/overlay-layers";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";
import DeckGLOverlay from "./DeckGLOverlay";
import { useMapViewState } from "./MapViewStateContext";

// ── Cluster helpers ───────────────────────────────────────────────────────────

const SUPERCLUSTER_OPTIONS: Supercluster.Options<
	{ listing: UnifiedListing },
	Record<string, never>
> = {
	radius: 60,
	maxZoom: 16,
	minZoom: 0,
};

type ClusterFeature = Supercluster.ClusterFeature<Record<string, never>>;
type PointFeature = Supercluster.PointFeature<{ listing: UnifiedListing }>;
type AnyFeature = ClusterFeature | PointFeature;

function isCluster(f: AnyFeature): f is ClusterFeature {
	return (f as ClusterFeature).properties.cluster === true;
}

function toPersianDigits(n: number): string {
	return n.toLocaleString("fa-IR");
}

// ── Icon atlas (SVG data URIs rendered as 1×1 atlas with offsets) ─────────────
// We use a simple circle SVG encoded as a data URI for each marker type.

const ICON_ATLAS =
	"data:image/svg+xml;charset=utf-8," +
	encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <!-- rent pin: amber -->
  <circle cx="32" cy="32" r="28" fill="#f59e0b" stroke="#fff" stroke-width="4"/>
  <!-- buy pin: emerald -->
  <circle cx="96" cy="32" r="28" fill="#10b981" stroke="#fff" stroke-width="4"/>
  <!-- cluster: indigo -->
  <circle cx="32" cy="96" r="28" fill="#6366f1" stroke="#fff" stroke-width="4"/>
  <!-- fallback rent: muted amber -->
  <circle cx="96" cy="96" r="28" fill="#f59e0b" stroke="#fff" stroke-width="4" fill-opacity="0.5"/>
</svg>`);

const ICON_MAPPING = {
	rent: {
		x: 0,
		y: 0,
		width: 64,
		height: 64,
		mask: false,
		anchorY: 32,
		anchorX: 32,
	},
	buy: {
		x: 64,
		y: 0,
		width: 64,
		height: 64,
		mask: false,
		anchorY: 32,
		anchorX: 32,
	},
	cluster: {
		x: 0,
		y: 64,
		width: 64,
		height: 64,
		mask: false,
		anchorY: 32,
		anchorX: 32,
	},
	"rent-fallback": {
		x: 64,
		y: 64,
		width: 64,
		height: 64,
		mask: false,
		anchorY: 32,
		anchorX: 32,
	},
};

// ── Tooltip ───────────────────────────────────────────────────────────────────

function getTooltip(
	info: PickingInfo<
		| AnyFeature
		| Feature<Point | LineString | MultiLineString, TransitProperties>
	>,
) {
	if (!info.object) return null;

	const obj = info.object as AnyFeature;

	// Cluster
	if ("properties" in obj && obj.properties && "cluster" in obj.properties) {
		const cluster = obj as ClusterFeature;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;padding:4px 2px">
        <p style="font-size:12px;font-weight:600;margin:0">${toPersianDigits(cluster.properties.point_count)} آگهی</p>
        <p style="font-size:11px;margin:4px 0 0;opacity:0.7">برای زوم کلیک کنید</p>
      </div>`,
			className: "deck-tooltip-reset",
		};
	}

	// Single listing point
	if ("properties" in obj && obj.properties && "listing" in obj.properties) {
		const listing = (obj as PointFeature).properties.listing;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;min-width:160px;padding:4px 2px">
        <p style="font-size:12px;font-weight:600;margin:0 0 4px">${listing.title}</p>
        <p style="font-size:11px;margin:0;opacity:0.7">${listing.cityPersian}${listing.districtPersian ? ` • ${listing.districtPersian}` : ""}</p>
        <p style="font-size:12px;font-weight:600;margin:4px 0 0;color:${listing.dealType === "rent" ? "#f59e0b" : "#10b981"}">${formatListingPriceShort(listing)}</p>
        ${listing.location?.isFallback ? '<p style="font-size:10px;margin:4px 0 0;opacity:0.6">⚠️ موقعیت تقریبی</p>' : ""}
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

// Module-level stable cursor function
const getCursor = ({ isHovering }: { isHovering: boolean }) =>
	isHovering ? "pointer" : "grab";

// ── Component ─────────────────────────────────────────────────────────────────

const DeckMap = () => {
	const transitLayers = useTransitLayers();
	const listings = useListingStore((s) => s.listings);
	const setSelectedListing = useListingStore((s) => s.setSelectedListing);
	const viewState = useMapViewState();
	const zoom = viewState?.zoom ?? 10;

	// Build GeoJSON points for supercluster
	const points = useMemo<PointFeature[]>(
		() =>
			listings
				.filter(
					(l) => l.location?.latitude != null && l.location?.longitude != null,
				)
				.map((listing) => ({
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [
							// location is guaranteed non-null by the filter above
							listing.location!.longitude,
							listing.location!.latitude,
						],
					},
					properties: { listing },
				})),
		[listings],
	);

	// Run supercluster on the current viewport zoom
	const clusters = useMemo<AnyFeature[]>(() => {
		if (points.length === 0) return [];
		const index = new Supercluster(SUPERCLUSTER_OPTIONS);
		index.load(points);
		// Use a world-spanning bbox so all items cluster correctly
		return index.getClusters(
			[-180, -85, 180, 85],
			Math.round(zoom),
		) as AnyFeature[];
	}, [points, zoom]);

	// Filter cluster features only for TextLayer
	const clusterPointsOnly = useMemo<ClusterFeature[]>(
		() => clusters.filter(isCluster),
		[clusters],
	);

	// Build listing layer from clusters
	const clusterLayer = useMemo(
		() =>
			new IconLayer<AnyFeature>({
				id: "property-clusters",
				data: clusters,
				iconAtlas: ICON_ATLAS,
				iconMapping: ICON_MAPPING,
				getIcon: (d) => {
					if (isCluster(d)) return "cluster";
					const listing = (d as PointFeature).properties.listing;
					if (listing.dealType === "buy") return "buy";
					return listing.location?.isFallback ? "rent-fallback" : "rent";
				},
				getPosition: (d) => d.geometry.coordinates as [number, number],
				getSize: (d) => {
					if (isCluster(d)) {
						const count = (d as ClusterFeature).properties.point_count;
						// Logarithmic scaling: small clusters ~40px, large ~80px
						return Math.min(80, 36 + Math.log2(count + 1) * 8);
					}
					return 36;
				},
				pickable: true,
				onClick: ({ object }) => {
					if (!object) return;
					if (isCluster(object)) return; // zoom handled by map
					const listing = (object as PointFeature).properties.listing;
					setSelectedListing(listing);
				},
			}),
		[clusters, setSelectedListing],
	);

	// Text layer to draw count in Persian digits centered inside cluster circles
	const clusterTextLayer = useMemo(
		() =>
			new TextLayer<ClusterFeature>({
				id: "property-cluster-counts",
				data: clusterPointsOnly,
				getPosition: (d) => d.geometry.coordinates as [number, number],
				getText: (d) => toPersianDigits(d.properties.point_count),
				getSize: (d) => {
					const count = d.properties.point_count;
					return Math.min(22, Math.max(12, 13 + Math.log2(count + 1) * 2));
				},
				getColor: [255, 255, 255, 255],
				getTextAnchor: "middle",
				getAlignmentBaseline: "center",
				fontFamily: "Vazirmatn, IRANSans, system-ui, sans-serif",
				fontWeight: "bold",
				pickable: false,
			}),
		[clusterPointsOnly],
	);

	const layers = useMemo(
		() => [...transitLayers, clusterLayer, clusterTextLayer],
		[transitLayers, clusterLayer, clusterTextLayer],
	);

	return (
		<DeckGLOverlay
			layers={layers}
			getTooltip={getTooltip}
			getCursor={getCursor}
		/>
	);
};

export default DeckMap;

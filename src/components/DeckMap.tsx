"use client";

import type { PickingInfo } from "@deck.gl/core";
import { IconLayer, TextLayer } from "@deck.gl/layers";
import type { Feature, LineString, MultiLineString, Point } from "geojson";
import { useEffect, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useMap } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import TransitTooltip from "@/components/map/TransitTooltip";
import type { TransitProperties } from "@/data";
import { formatToman } from "@/lib/format";
import { useTransitLayers } from "@/lib/overlay-layers";
import { useListingStore } from "@/store/listing-store";
import type { MapPinItem, UnifiedListing } from "@/types/listing";
import DeckGLOverlay from "./DeckGLOverlay";
import { useMapViewState } from "./MapViewStateContext";

// ── Cluster helpers ───────────────────────────────────────────────────────────

const SUPERCLUSTER_OPTIONS: Supercluster.Options<
	{ pin: MapPinItem | UnifiedListing },
	Record<string, never>
> = {
	radius: 80,
	maxZoom: 16,
	minZoom: 0,
};

type ClusterFeature = Supercluster.ClusterFeature<Record<string, never>>;
type PointFeature = Supercluster.PointFeature<{
	pin: MapPinItem | UnifiedListing;
}>;
type AnyFeature = ClusterFeature | PointFeature;

function isCluster(f: AnyFeature): f is ClusterFeature {
	return (f as ClusterFeature).properties.cluster === true;
}

function toPersianDigits(n: number): string {
	return n.toLocaleString("fa-IR");
}

// ── SVG Icon Atlas ─────────────────────────────────────────────────────────────

const ICON_ATLAS =
	"data:image/svg+xml;charset=utf-8," +
	encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <!-- rent pin: amber -->
  <circle cx="32" cy="32" r="26" fill="#f59e0b" stroke="#ffffff" stroke-width="4"/>
  <circle cx="32" cy="32" r="10" fill="#ffffff"/>
  <!-- buy pin: emerald -->
  <circle cx="96" cy="32" r="26" fill="#10b981" stroke="#ffffff" stroke-width="4"/>
  <circle cx="96" cy="32" r="10" fill="#ffffff"/>
  <!-- cluster: indigo with outer glow -->
  <circle cx="32" cy="96" r="28" fill="#4f46e5" stroke="#ffffff" stroke-width="4"/>
  <!-- fallback rent: muted amber -->
  <circle cx="96" cy="96" r="26" fill="#f59e0b" stroke="#ffffff" stroke-width="3" fill-opacity="0.6"/>
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

function formatPinPrice(pin: MapPinItem | UnifiedListing): string {
	if (pin.dealType === "rent") {
		if (pin.depositTomans && pin.rentTomans) {
			return `${formatToman(pin.depositTomans)} رهن • ${formatToman(pin.rentTomans)} اجاره`;
		}
		if (pin.depositTomans) return `${formatToman(pin.depositTomans)} رهن`;
		if (pin.rentTomans) return `${formatToman(pin.rentTomans)} اجاره`;
		return "توافقی";
	}
	return pin.totalPriceTomans ? formatToman(pin.totalPriceTomans) : "توافقی";
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function getIsFallback(pin: MapPinItem | UnifiedListing): boolean {
	if ("location" in pin && pin.location) {
		return Boolean(pin.location.isFallback);
	}
	if ("isFallback" in pin) {
		return Boolean(pin.isFallback);
	}
	return false;
}

function getTooltip(
	info: PickingInfo<
		| AnyFeature
		| Feature<Point | LineString | MultiLineString, TransitProperties>
	>,
) {
	if (!info.object) return null;

	const obj = info.object as AnyFeature;

	// Cluster Tooltip
	if ("properties" in obj && obj.properties && "cluster" in obj.properties) {
		const cluster = obj as ClusterFeature;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;padding:6px 10px">
        <p style="font-size:12px;font-weight:700;margin:0;color:var(--foreground, #0f172a)">${toPersianDigits(cluster.properties.point_count)} آگهی ملک در این محدوده</p>
        <p style="font-size:11px;margin:3px 0 0;color:var(--muted-foreground, #64748b)">برای زوم و مشاهده آگهی‌ها کلیک کنید</p>
      </div>`,
			className: "deck-tooltip-reset",
		};
	}

	// Single listing pin Tooltip
	if ("properties" in obj && obj.properties && "pin" in obj.properties) {
		const pin = (obj as PointFeature).properties.pin;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;min-width:170px;padding:6px 8px">
        <p style="font-size:12px;font-weight:700;margin:0 0 4px;line-height:1.3">${pin.title}</p>
        <p style="font-size:11px;margin:0;opacity:0.8">${pin.cityPersian}${pin.districtPersian ? ` • ${pin.districtPersian}` : ""}</p>
        <p style="font-size:12px;font-weight:700;margin:4px 0 0;color:${pin.dealType === "rent" ? "#f59e0b" : "#10b981"}">${formatPinPrice(pin)}</p>
        ${getIsFallback(pin) ? '<p style="font-size:10px;margin:4px 0 0;color:#f59e0b">⚠️ موقعیت تقریبی محله</p>' : ""}
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

const getCursor = ({ isHovering }: { isHovering: boolean }) =>
	isHovering ? "pointer" : "grab";

// ── Component ─────────────────────────────────────────────────────────────────

const DeckMap = () => {
	const { current: mapInstance } = useMap();
	const transitLayers = useTransitLayers();
	const listings = useListingStore((s) => s.listings);
	const mapPins = useListingStore((s) => s.mapPins);
	const selectListingById = useListingStore((s) => s.selectListingById);
	const viewState = useMapViewState();
	const zoom = viewState?.zoom ?? 10;

	// Build GeoJSON points for supercluster from mapPins or listings with spiderfy jitter for overlapping coordinates
	const points = useMemo<PointFeature[]>(() => {
		const coordCounts = new Map<string, number>();

		if (mapPins.length > 0) {
			return mapPins
				.filter((p) => p.latitude != null && p.longitude != null)
				.map((pin) => {
					const baseLat = pin.latitude;
					const baseLng = pin.longitude;
					const key = `${baseLat.toFixed(5)},${baseLng.toFixed(5)}`;
					const count = coordCounts.get(key) ?? 0;
					coordCounts.set(key, count + 1);

					let lng = baseLng;
					let lat = baseLat;
					if (count > 0) {
						const angle = (count * (2 * Math.PI)) / 6;
						const radius = 0.00015 * Math.ceil(count / 6);
						lng = baseLng + radius * Math.cos(angle);
						lat = baseLat + radius * Math.sin(angle);
					}

					return {
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [lng, lat],
						},
						properties: { pin },
					};
				});
		}

		return listings
			.filter(
				(l) => l.location?.latitude != null && l.location?.longitude != null,
			)
			.map((listing) => {
				const baseLng = listing.location?.longitude ?? 0;
				const baseLat = listing.location?.latitude ?? 0;
				const key = `${baseLat.toFixed(5)},${baseLat.toFixed(5)}`;
				const count = coordCounts.get(key) ?? 0;
				coordCounts.set(key, count + 1);

				let lng = baseLng;
				let lat = baseLat;
				if (count > 0) {
					const angle = (count * (2 * Math.PI)) / 6;
					const radius = 0.00015 * Math.ceil(count / 6);
					lng = baseLng + radius * Math.cos(angle);
					lat = baseLat + radius * Math.sin(angle);
				}

				return {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [lng, lat],
					},
					properties: { pin: listing },
				};
			});
	}, [mapPins, listings]);

	// Supercluster instance
	const superclusterInstance = useMemo(() => {
		const index = new Supercluster(SUPERCLUSTER_OPTIONS);
		index.load(points);
		return index;
	}, [points]);

	// Run supercluster on the current viewport zoom
	const clusters = useMemo<AnyFeature[]>(() => {
		if (points.length === 0) return [];
		return superclusterInstance.getClusters(
			[-180, -85, 180, 85],
			Math.round(zoom),
		) as AnyFeature[];
	}, [points, superclusterInstance, zoom]);

	// Filter cluster features only for TextLayer
	const clusterPointsOnly = useMemo<ClusterFeature[]>(
		() => clusters.filter(isCluster),
		[clusters],
	);

	// Build IconLayer
	const clusterLayer = useMemo(
		() =>
			new IconLayer<AnyFeature>({
				id: "property-clusters",
				data: clusters,
				iconAtlas: ICON_ATLAS,
				iconMapping: ICON_MAPPING,
				getIcon: (d) => {
					if (isCluster(d)) return "cluster";
					const pin = (d as PointFeature).properties.pin;
					if (pin.dealType === "buy") return "buy";
					return getIsFallback(pin) ? "rent-fallback" : "rent";
				},
				getPosition: (d) => d.geometry.coordinates as [number, number],
				getSize: (d) => {
					if (isCluster(d)) {
						const count = (d as ClusterFeature).properties.point_count;
						return Math.min(84, 42 + Math.log2(count + 1) * 8);
					}
					return 38;
				},
				pickable: true,
				onClick: ({ object }) => {
					if (!object) return;
					if (isCluster(object)) {
						const clusterId = object.properties.cluster_id;
						const [lng, lat] = object.geometry.coordinates;
						const expansionZoom = Math.min(
							20,
							superclusterInstance.getClusterExpansionZoom(clusterId),
						);
						mapInstance?.flyTo({
							center: [lng, lat],
							zoom: expansionZoom,
							duration: 500,
						});
						return;
					}
					const pin = (object as PointFeature).properties.pin;
					void selectListingById(pin.source, pin.externalId, pin);
				},
			}),
		[clusters, mapInstance, selectListingById, superclusterInstance],
	);

	// Fly map to selected listing location when clicked from list or map
	const selectedListing = useListingStore((s) => s.selectedListing);
	useEffect(() => {
		if (!selectedListing || !mapInstance) return;
		const lat =
			selectedListing.location?.latitude ??
			("latitude" in selectedListing
				? (selectedListing as unknown as MapPinItem).latitude
				: null);
		const lng =
			selectedListing.location?.longitude ??
			("longitude" in selectedListing
				? (selectedListing as unknown as MapPinItem).longitude
				: null);

		if (lat != null && lng != null) {
			mapInstance.flyTo({
				center: [lng, lat],
				zoom: Math.max(15, mapInstance.getZoom()),
				duration: 800,
				essential: true,
			});
		}
	}, [selectedListing, mapInstance]);

	// Text layer rendering centered Persian count digits inside cluster nodes
	const clusterTextLayer = useMemo(
		() =>
			new TextLayer<ClusterFeature>({
				id: "property-cluster-counts",
				data: clusterPointsOnly,
				getPosition: (d) => d.geometry.coordinates as [number, number],
				getText: (d) => toPersianDigits(d.properties.point_count),
				getSize: (d) => {
					const count = d.properties.point_count;
					return Math.min(22, Math.max(13, 14 + Math.log2(count + 1) * 2));
				},
				getColor: [255, 255, 255, 255],
				getTextAnchor: "middle",
				getAlignmentBaseline: "center",
				fontFamily: "Vazirmatn, IRANSans, system-ui, sans-serif",
				fontWeight: "bold",
				characterSet: "auto",
				billboard: true,
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

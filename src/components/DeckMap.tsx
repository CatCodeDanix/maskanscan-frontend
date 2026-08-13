"use client";

import type { PickingInfo } from "@deck.gl/core";
import { IconLayer, TextLayer } from "@deck.gl/layers";
import type { Feature, LineString, MultiLineString, Point } from "geojson";
import { useEffect, useMemo } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useMap } from "react-map-gl/maplibre";
import type Supercluster from "supercluster";
import TransitTooltip from "@/components/map/TransitTooltip";
import { LottieLoader } from "@/components/ui/LottieLoader";
import type { TransitProperties } from "@/data";
import { useGeospatialMap } from "@/hooks/use-geospatial-map";
import { formatToman } from "@/lib/format";
import { formatClusterPriceSummary } from "@/lib/geospatial";
import { useTransitLayers } from "@/lib/overlay-layers";
import { useListingStore } from "@/store/listing-store";
import { useMapStore } from "@/store/map-store";
import type { BackendClusterItem } from "@/types/geospatial";
import type { MapPinItem, UnifiedListing } from "@/types/listing";
import DeckGLOverlay from "./DeckGLOverlay";
import { useMapViewState } from "./MapViewStateContext";

// ── Supercluster feature types ────────────────────────────────────────────────

type ClusterFeature = Supercluster.ClusterFeature<Record<string, never>>;
type PointFeature = Supercluster.PointFeature<{
	pin: MapPinItem | UnifiedListing;
}>;
type SuperclusterFeature = ClusterFeature | PointFeature;

type UnifiedRenderItem =
	| { type: "backend-cluster"; cluster: BackendClusterItem }
	| { type: "supercluster-cluster"; feature: ClusterFeature }
	| {
			type: "pin";
			pin: MapPinItem | UnifiedListing;
			coordinates: [number, number];
	  };

function isSuperclusterCluster(f: SuperclusterFeature): f is ClusterFeature {
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
  <!-- selected highlight pin: rose pink -->
  <circle cx="96" cy="96" r="28" fill="#f43f5e" stroke="#ffffff" stroke-width="5"/>
  <circle cx="96" cy="96" r="11" fill="#ffffff"/>
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
	selected: {
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

function getIsFallback(pin: MapPinItem | UnifiedListing): boolean {
	if ("location" in pin && pin.location) {
		return Boolean(pin.location.isFallback);
	}
	if ("isFallback" in pin) {
		return Boolean(pin.isFallback);
	}
	return false;
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

function getTooltip(
	info: PickingInfo<
		| UnifiedRenderItem
		| Feature<Point | LineString | MultiLineString, TransitProperties>
	>,
) {
	if (!info.object) return null;

	const obj = info.object as UnifiedRenderItem;

	// 1. Backend Cluster Tooltip
	if ("type" in obj && obj.type === "backend-cluster") {
		const cluster = obj.cluster;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;padding:6px 10px">
        <p style="font-size:12px;font-weight:700;margin:0;color:var(--foreground, #0f172a)">${toPersianDigits(cluster.count)} آگهی ملک در این محدوده</p>
        <p style="font-size:11px;margin:2px 0 0;color:var(--primary, #6366f1);font-weight:600">${formatClusterPriceSummary(cluster)}</p>
        <p style="font-size:10px;margin:3px 0 0;color:var(--muted-foreground, #64748b)">برای زوم و مشاهده آگهی‌ها کلیک کنید</p>
      </div>`,
			className: "deck-tooltip-reset",
		};
	}

	// 2. Frontend Supercluster Tooltip
	if ("type" in obj && obj.type === "supercluster-cluster") {
		const cluster = obj.feature;
		return {
			html: `<div style="font-family:inherit;direction:rtl;text-align:right;padding:6px 10px">
        <p style="font-size:12px;font-weight:700;margin:0;color:var(--foreground, #0f172a)">${toPersianDigits(cluster.properties.point_count)} آگهی ملک</p>
        <p style="font-size:11px;margin:3px 0 0;color:var(--muted-foreground, #64748b)">برای زوم و مشاهده آگهی‌ها کلیک کنید</p>
      </div>`,
			className: "deck-tooltip-reset",
		};
	}

	// 3. Single Listing Pin Tooltip
	if ("type" in obj && obj.type === "pin") {
		const pin = obj.pin;
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

	// 4. Transit tooltip
	const transitFeature = info.object as Feature<
		Point | LineString | MultiLineString,
		TransitProperties
	>;
	if (transitFeature.properties) {
		const html = renderToStaticMarkup(
			<TransitTooltip properties={transitFeature.properties} />,
		);
		return { html, className: "deck-tooltip-reset" };
	}

	return null;
}

const getCursor = ({ isHovering }: { isHovering: boolean }) =>
	isHovering ? "pointer" : "grab";

// ── DeckMap Component ─────────────────────────────────────────────────────────

const DeckMap = () => {
	const { current: mapInstance } = useMap();
	const transitLayers = useTransitLayers();
	const selectListingById = useListingStore((s) => s.selectListingById);
	const selectedListing = useListingStore((s) => s.selectedListing);

	const viewState = useMapViewState();
	const viewportBBox =
		useMapStore((s) => s.viewportBBox) ?? viewState.bbox ?? null;
	const zoom = viewState?.zoom ?? 10;

	// Geospatial Pipeline TanStack Query Hook
	const {
		zoomTier,
		backendClusters,
		rawPoints,
		clientSupercluster,
		isLoading,
		isFetching,
	} = useGeospatialMap({
		viewportBBox,
		zoom,
	});

	// Smoothly animate map camera when a listing is clicked from side list or elsewhere
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

	// Build unified rendering dataset based on active zoom tier
	const renderItems = useMemo<UnifiedRenderItem[]>(() => {
		// Tier 1: Clustered Tier (< 14)
		if (zoomTier === "clustered") {
			const items: UnifiedRenderItem[] = [];

			for (const cluster of backendClusters) {
				items.push({ type: "backend-cluster", cluster });
			}

			for (const pin of rawPoints) {
				items.push({
					type: "pin",
					pin,
					coordinates: [pin.longitude, pin.latitude],
				});
			}

			return items;
		}

		// Tier 2: Raw Tier (>= 14) via Client Supercluster
		if (!clientSupercluster) return [];

		const features = clientSupercluster.getClusters(
			[-180, -85, 180, 85],
			Math.round(zoom),
		);

		return features.map((f): UnifiedRenderItem => {
			if (isSuperclusterCluster(f)) {
				return { type: "supercluster-cluster", feature: f };
			}
			const pointFeature = f as PointFeature;
			return {
				type: "pin",
				pin: pointFeature.properties.pin,
				coordinates: pointFeature.geometry.coordinates as [number, number],
			};
		});
	}, [zoomTier, backendClusters, rawPoints, clientSupercluster, zoom]);

	// Check if selectedListing is present in the rendered raw pins
	const isSelectedPinPresent = useMemo(() => {
		if (!selectedListing) return false;
		return renderItems.some(
			(item) =>
				item.type === "pin" &&
				item.pin.externalId === selectedListing.externalId,
		);
	}, [selectedListing, renderItems]);

	// Fallback Always-On Highlight marker if selectedListing is absorbed in a cluster or off-tier
	const fallbackHighlightItem = useMemo<UnifiedRenderItem | null>(() => {
		if (!selectedListing || isSelectedPinPresent) return null;
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

		if (lat == null || lng == null) return null;

		return {
			type: "pin",
			pin: selectedListing,
			coordinates: [lng, lat],
		};
	}, [selectedListing, isSelectedPinPresent]);

	// Text dataset for cluster count numbers
	const textItems = useMemo(() => {
		return renderItems.filter(
			(item) =>
				item.type === "backend-cluster" || item.type === "supercluster-cluster",
		);
	}, [renderItems]);

	// ── Deck.gl Icon Layer ────────────────────────────────────────────────────
	const iconLayer = useMemo(
		() =>
			new IconLayer<UnifiedRenderItem>({
				id: "geospatial-pins",
				data: fallbackHighlightItem
					? [...renderItems, fallbackHighlightItem]
					: renderItems,
				iconAtlas: ICON_ATLAS,
				iconMapping: ICON_MAPPING,
				getIcon: (d) => {
					if (
						d.type === "backend-cluster" ||
						d.type === "supercluster-cluster"
					) {
						return "cluster";
					}
					if (
						selectedListing &&
						d.pin.externalId === selectedListing.externalId
					) {
						return "selected";
					}
					if (d.pin.dealType === "buy") return "buy";
					return "rent";
				},
				getPosition: (d) => {
					if (d.type === "backend-cluster") {
						return [d.cluster.longitude, d.cluster.latitude];
					}
					if (d.type === "supercluster-cluster") {
						return d.feature.geometry.coordinates as [number, number];
					}
					return d.coordinates;
				},
				getSize: (d) => {
					if (d.type === "backend-cluster") {
						return Math.min(88, 42 + Math.log2(d.cluster.count + 1) * 8);
					}
					if (d.type === "supercluster-cluster") {
						return Math.min(
							88,
							42 + Math.log2(d.feature.properties.point_count + 1) * 8,
						);
					}
					if (
						selectedListing &&
						d.pin.externalId === selectedListing.externalId
					) {
						return 46;
					}
					return 38;
				},
				pickable: true,
				onClick: ({ object }) => {
					if (!object) return;

					// Click on Backend Cluster -> fly and zoom closer
					if (object.type === "backend-cluster") {
						const cluster = object.cluster;
						mapInstance?.flyTo({
							center: [cluster.longitude, cluster.latitude],
							zoom: Math.min(18, zoom + 2.5),
							duration: 500,
						});
						return;
					}

					// Click on Frontend Supercluster -> expand cluster
					if (object.type === "supercluster-cluster") {
						const clusterId = object.feature.properties.cluster_id;
						const [lng, lat] = object.feature.geometry.coordinates;
						const expansionZoom = Math.min(
							20,
							clientSupercluster?.getClusterExpansionZoom(clusterId) ??
								zoom + 2,
						);
						mapInstance?.flyTo({
							center: [lng, lat],
							zoom: expansionZoom,
							duration: 500,
						});
						return;
					}

					// Click on single listing pin -> select immediately
					if (object.type === "pin") {
						const pin = object.pin;
						void selectListingById(pin.source, pin.externalId, pin);
					}
				},
			}),
		[
			renderItems,
			fallbackHighlightItem,
			selectedListing,
			mapInstance,
			zoom,
			clientSupercluster,
			selectListingById,
		],
	);

	// ── Deck.gl Text Layer for cluster counts ─────────────────────────────────
	const textLayer = useMemo(
		() =>
			new TextLayer<UnifiedRenderItem>({
				id: "geospatial-cluster-counts",
				data: textItems,
				getPosition: (d) => {
					if (d.type === "backend-cluster") {
						return [d.cluster.longitude, d.cluster.latitude];
					}
					if (d.type === "supercluster-cluster") {
						return d.feature.geometry.coordinates as [number, number];
					}
					return [0, 0];
				},
				getText: (d) => {
					if (d.type === "backend-cluster") {
						return toPersianDigits(d.cluster.count);
					}
					if (d.type === "supercluster-cluster") {
						return toPersianDigits(d.feature.properties.point_count);
					}
					return "";
				},
				getSize: (d) => {
					const count =
						d.type === "backend-cluster"
							? d.cluster.count
							: d.type === "supercluster-cluster"
								? d.feature.properties.point_count
								: 1;
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
		[textItems],
	);

	const layers = useMemo(
		() => [...transitLayers, iconLayer, textLayer],
		[transitLayers, iconLayer, textLayer],
	);

	return (
		<>
			{/* Top Scanning Line & Clean DotLottie Floating HUD */}
			{(isLoading || isFetching) && (
				<>
					<div className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse z-30" />
					<div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center rounded-full border border-primary/20 bg-background/90 p-1.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200">
						<LottieLoader
							src="/animations/map-loading.lottie"
							size={32}
							className="shrink-0"
						/>
					</div>
				</>
			)}
			<DeckGLOverlay
				layers={layers}
				getTooltip={getTooltip}
				getCursor={getCursor}
			/>
		</>
	);
};

export default DeckMap;

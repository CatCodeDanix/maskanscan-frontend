"use client";

import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { useEffect, useMemo, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import type Supercluster from "supercluster";
import {
	type HoveredObject,
	type HoverInfo,
	MapHoverTooltip,
} from "@/components/map/MapHoverTooltip";
import { LottieLoader } from "@/components/ui/LottieLoader";
import { useGeospatialMap } from "@/hooks/use-geospatial-map";
import { useIsMobile } from "@/hooks/use-mobile";
import { toPersianDigits } from "@/lib/format";
import { useTransitLayers } from "@/lib/overlay-layers";
import { useListingStore } from "@/store/listing-store";
import { useMapStore } from "@/store/map-store";
import { useNavigationStore } from "@/store/navigation-store";
import type { BackendClusterItem } from "@/types/geospatial";
import type { MapPinItem, UnifiedListing } from "@/types/listing";
import DeckGLOverlay from "./DeckGLOverlay";
import { useMapViewState } from "./MapViewStateContext";

// ── Unified Cluster Badge Generator & Cache ──────────────────────────────────
type ClusterBadgeIcon = {
	url: string;
	width: number;
	height: number;
	anchorX: number;
	anchorY: number;
};

const clusterBadgeCache = new Map<string, ClusterBadgeIcon>();

function getClusterFontFamily(): string {
	if (typeof document === "undefined") return "IRANSansX, sans-serif";
	const font = getComputedStyle(document.body).fontFamily;
	return font || "IRANSansX, Vazirmatn, Tahoma, sans-serif";
}

function getClusterRadius(count: number): number {
	if (count < 100) return 18;
	if (count < 1000) return 21;
	if (count < 5000) return 24;
	return 27;
}

function getClusterBadgeIcon(text: string, radius: number): ClusterBadgeIcon {
	const key = `${text}_${radius}`;
	const cached = clusterBadgeCache.get(key);
	if (cached) return cached;

	if (typeof document === "undefined") {
		return { url: "", width: 64, height: 64, anchorX: 32, anchorY: 32 };
	}

	// 2x scale: exact 1:1 match with Retina/High-DPI displays without downsampling blur
	const scale = 2;
	const padding = 2;
	const logicalSize = (radius + padding) * 2;
	const pixelSize = logicalSize * scale;
	const center = pixelSize / 2;
	const r = radius * scale;

	const canvas = document.createElement("canvas");
	canvas.width = pixelSize;
	canvas.height = pixelSize;
	const ctx = canvas.getContext("2d");

	if (ctx) {
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		// 1. Antialiased Royal Indigo Circle Background
		ctx.beginPath();
		ctx.arc(center, center, r, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(79, 70, 229, 0.96)"; // Royal Indigo
		ctx.fill();

		// 2. Crisp White Stroke Border
		ctx.lineWidth = 2 * scale; // 2px crisp border
		ctx.strokeStyle = "#ffffff";
		ctx.stroke();

		// 3. Crisp Persian Typography using actual IRANSansX font from document.body
		const fontFam = getClusterFontFamily();
		const baseFontSize = text.length > 4 ? 11 : text.length > 3 ? 12 : 13.5;
		const scaledFontSize = Math.round(baseFontSize * scale);
		ctx.font = `bold ${scaledFontSize}px ${fontFam}`;
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.direction = "rtl";
		ctx.fillText(text, center, center + Math.round(0.5 * scale));
	}

	const iconObj: ClusterBadgeIcon = {
		url: canvas.toDataURL("image/png"),
		width: pixelSize,
		height: pixelSize,
		anchorX: pixelSize / 2,
		anchorY: pixelSize / 2,
	};

	clusterBadgeCache.set(key, iconObj);
	return iconObj;
}

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

function formatClusterCount(count: number): string {
	if (!count) return "";
	if (count < 1000) return toPersianDigits(count);
	if (count < 10000) {
		const inThousands = (count / 1000).toFixed(1).replace(/\.0$/, "");
		return `${toPersianDigits(inThousands)}k`;
	}
	const inThousands = Math.round(count / 1000);
	return `${toPersianDigits(inThousands)}k`;
}

const getCursor = ({ isHovering }: { isHovering: boolean }) =>
	isHovering ? "pointer" : "grab";

// ── DeckMap Component ─────────────────────────────────────────────────────────

const DeckMap = () => {
	const { current: mapInstance } = useMap();

	useEffect(() => {
		if (!mapInstance) return;

		const handleIdle = () => {
			useMapStore.setState({ activeOverlays: ["metro", "brt"] });
		};

		mapInstance.once("idle", handleIdle);

		return () => {
			mapInstance.off("idle", handleIdle);
		};
	}, [mapInstance]);

	const isMobile = useIsMobile();
	const isDrawerOpen = useNavigationStore((s) => s.isDrawerOpen);
	const drawerMode = useNavigationStore((s) => s.drawerMode);
	const isDesktopOverlayOpen =
		!isMobile && isDrawerOpen && drawerMode === "overlay";

	const [fontLoaded, setFontLoaded] = useState(false);

	useEffect(() => {
		if (typeof document !== "undefined" && document.fonts) {
			document.fonts.ready.then(() => {
				clusterBadgeCache.clear();
				setFontLoaded(true);
			});
		}
	}, []);

	const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

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
		// Tier 1: Clustered Tier (< 14) via Server Action
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

	// Split items into clusters vs individual pins for razor-sharp layered rendering
	const { clusterItems, pinItems } = useMemo(() => {
		const clusters: UnifiedRenderItem[] = [];
		const pins: UnifiedRenderItem[] = [];

		const allItems = fallbackHighlightItem
			? [...renderItems, fallbackHighlightItem]
			: renderItems;

		for (const item of allItems) {
			if (
				item.type === "backend-cluster" ||
				item.type === "supercluster-cluster"
			) {
				clusters.push(item);
			} else {
				pins.push(item);
			}
		}

		return { clusterItems: clusters, pinItems: pins };
	}, [renderItems, fallbackHighlightItem]);

	// ── 1. Unified Cluster Layer (Single Atomic Sprite: Circle + Stroke + Centered Text) ──
	const clustersUnifiedLayer = useMemo(
		() =>
			new IconLayer<UnifiedRenderItem>({
				id: "geospatial-clusters-unified",
				data: clusterItems,
				updateTriggers: {
					getIcon: [fontLoaded],
				},
				getPosition: (d) => {
					if (d.type === "backend-cluster") {
						return [d.cluster.longitude, d.cluster.latitude];
					}
					if (d.type === "supercluster-cluster") {
						return d.feature.geometry.coordinates as [number, number];
					}
					return [0, 0];
				},
				getIcon: (d) => {
					const count =
						d.type === "backend-cluster"
							? d.cluster.count
							: d.type === "supercluster-cluster"
								? d.feature.properties.point_count
								: 1;
					const radius = getClusterRadius(count);
					const countStr = formatClusterCount(count);
					return getClusterBadgeIcon(countStr, radius);
				},
				getSize: (d) => {
					const count =
						d.type === "backend-cluster"
							? d.cluster.count
							: d.type === "supercluster-cluster"
								? d.feature.properties.point_count
								: 1;
					const radius = getClusterRadius(count);
					return (radius + 2) * 2;
				},
				sizeUnits: "pixels",
				sizeScale: 1,
				billboard: true,
				pickable: true,
				onClick: ({ object }) => {
					if (!object) return;

					if (object.type === "backend-cluster") {
						const cluster = object.cluster;
						mapInstance?.flyTo({
							center: [cluster.longitude, cluster.latitude],
							zoom: Math.min(18, zoom + 2.5),
							duration: 500,
						});
						return;
					}

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
					}
				},
			}),
		[clusterItems, mapInstance, zoom, clientSupercluster, fontLoaded],
	);

	// ── 2. Individual Property Pins (WebGL Antialiased Circles) ───────────────
	const individualPinsLayer = useMemo(
		() =>
			new ScatterplotLayer<UnifiedRenderItem>({
				id: "geospatial-individual-pins",
				data: pinItems,
				getPosition: (d) => (d.type === "pin" ? d.coordinates : [0, 0]),
				getRadius: (d) => {
					if (d.type === "pin") {
						if (
							selectedListing &&
							d.pin.externalId === selectedListing.externalId
						) {
							return 12;
						}
						return 8;
					}
					return 8;
				},
				radiusUnits: "pixels",
				radiusScale: 1,
				radiusMinPixels: 7,
				radiusMaxPixels: 13,
				getFillColor: (d) => {
					if (d.type === "pin") {
						if (
							selectedListing &&
							d.pin.externalId === selectedListing.externalId
						) {
							return [244, 63, 94, 255]; // Rose-500 for selected
						}
						if (d.pin.dealType === "buy") {
							return [16, 185, 129, 255]; // Emerald-500
						}
						return [245, 158, 11, 255]; // Amber-500
					}
					return [245, 158, 11, 255];
				},
				getLineColor: [255, 255, 255, 255],
				lineWidthUnits: "pixels",
				lineWidthMinPixels: 2,
				stroked: true,
				filled: true,
				antialiasing: true,
				billboard: true,
				pickable: true,
				onClick: ({ object }) => {
					if (object?.type === "pin") {
						const pin = object.pin;
						void selectListingById(pin.source, pin.externalId, pin);
					}
				},
			}),
		[pinItems, selectedListing, selectListingById],
	);

	// ── 3. Pin Inner Center Dot Layer (White Vector Center) ───────────────────
	const pinCenterDotsLayer = useMemo(
		() =>
			new ScatterplotLayer<UnifiedRenderItem>({
				id: "geospatial-pin-center-dots",
				data: pinItems,
				getPosition: (d) => (d.type === "pin" ? d.coordinates : [0, 0]),
				getRadius: 2.5,
				radiusUnits: "pixels",
				radiusScale: 1,
				radiusMinPixels: 2.5,
				radiusMaxPixels: 3.5,
				getFillColor: [255, 255, 255, 255],
				stroked: false,
				filled: true,
				antialiasing: true,
				billboard: true,
				pickable: false,
			}),
		[pinItems],
	);

	const layers = useMemo(() => {
		return [
			...transitLayers,
			clustersUnifiedLayer,
			individualPinsLayer,
			pinCenterDotsLayer,
		];
	}, [
		transitLayers,
		clustersUnifiedLayer,
		individualPinsLayer,
		pinCenterDotsLayer,
	]);

	return (
		<>
			{/* Top Scanning Line & Prominent Circular DotLottie Floating HUD */}
			{(isLoading || isFetching) && (
				<>
					<div className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse z-30" />
					<div
						style={{
							left: isDesktopOverlayOpen ? "calc(50% - 190px)" : "50%",
						}}
						className="pointer-events-none absolute top-4 -translate-x-1/2 z-30 flex size-20 md:size-22 items-center justify-center rounded-full border-2 border-primary/30 bg-background/95 p-2 shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200"
					>
						<LottieLoader
							src="/animations/map-loading.lottie"
							size={76}
							className="shrink-0"
						/>
					</div>
				</>
			)}
			<DeckGLOverlay
				layers={layers}
				getCursor={getCursor}
				onHover={(info) => {
					setHoverInfo(
						info.object
							? {
									x: info.x,
									y: info.y,
									object: info.object as HoveredObject,
								}
							: null,
					);
				}}
			/>
			<MapHoverTooltip
				hoverInfo={hoverInfo}
				isDesktopOverlayOpen={isDesktopOverlayOpen}
				isMobile={isMobile}
			/>
		</>
	);
};

export default DeckMap;

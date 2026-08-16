"use client";

import * as maplibregl from "maplibre-gl";
import { useMapStore } from "@/store/map-store";
import type { BBox } from "@/types/geospatial";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useRef, useState } from "react";
import Map, {
	type MapRef,
	type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import DeckMap from "./DeckMap";
import { MapViewStateContext, type ViewState } from "./MapViewStateContext";

// Configure MapLibre v6 Web Worker and RTL Text Plugin for Persian/Arabic shaping
if (typeof window !== "undefined") {
	maplibregl.config.WORKER_URL = "/workers/maplibre-gl-worker.mjs";

	if (maplibregl.getRTLTextPluginStatus() === "unavailable") {
		maplibregl.setRTLTextPlugin("/workers/mapbox-gl-rtl-text.js", true);
	}
}

// Combined Tehran & Alborz Provinces Bounding Box with inclusive buffer:
// [minLng (West), minLat (South), maxLng (East), maxLat (North)]
// West: 50.0 (includes western Alborz, Eshtehard, Taleghan)
// South: 35.0 (includes southern Tehran province, Robat Karim, Varamin, Hasanabad)
// East: 53.3 (includes eastern Tehran province, Damavand, Firuzkuh)
// North: 36.5 (includes northern Alborz/Shemiran mountain ridges)
const TEHRAN_ALBORZ_BOUNDS: [number, number, number, number] = [
	50.0, 35.0, 53.3, 36.5,
];

const INITIAL_VIEW_STATE: ViewState = {
	longitude: 51.389,
	latitude: 35.689,
	zoom: 10,
	bbox: [50.8, 35.4, 51.9, 36.0],
};

export default function BaseMap() {
	const mapRef = useRef<MapRef | null>(null);
	const mapStyle = useMapStore((s) => s.mapStyle);
	const setViewport = useMapStore((s) => s.setViewport);
	const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	const syncViewport = useCallback(
		(targetMap: maplibregl.Map | MapRef | undefined, currentZoom: number) => {
			const map =
				(targetMap as MapRef)?.getMap?.() ??
				(targetMap as maplibregl.Map) ??
				mapRef.current?.getMap() ??
				mapRef.current;
			if (!map) return;

			const bounds = map.getBounds();
			if (!bounds) return;

			const bbox: BBox = [
				Number(bounds.getWest().toFixed(5)),
				Number(bounds.getSouth().toFixed(5)),
				Number(bounds.getEast().toFixed(5)),
				Number(bounds.getNorth().toFixed(5)),
			];

			setViewport(bbox, currentZoom);
			setViewState((prev) => ({
				...prev,
				bbox,
				zoom: currentZoom,
				isLoaded: true,
			}));
		},
		[setViewport],
	);

	// Debounce moveend (100ms) to trigger geospatial query updates
	const handleMoveEnd = useCallback(
		(e: ViewStateChangeEvent) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(() => {
				syncViewport(e.target, e.viewState.zoom);
			}, 100);
		},
		[syncViewport],
	);

	const onMove = useCallback((e: ViewStateChangeEvent) => {
		setViewState((prev) => ({
			...prev,
			longitude: e.viewState.longitude,
			latitude: e.viewState.latitude,
			zoom: e.viewState.zoom,
		}));
	}, []);

	const handleMapLoad = useCallback(
		(e: { target: maplibregl.Map }) => {
			setIsMapLoaded(true);
			syncViewport(e.target, INITIAL_VIEW_STATE.zoom);
		},
		[syncViewport],
	);

	return (
		<MapViewStateContext.Provider
			value={{ ...viewState, isLoaded: isMapLoaded }}
		>
			<Map
				ref={mapRef}
				mapLib={maplibregl}
				reuseMaps
				initialViewState={INITIAL_VIEW_STATE}
				minZoom={9}
				maxBounds={TEHRAN_ALBORZ_BOUNDS}
				style={{ width: "100%", height: "100%" }}
				mapStyle={mapStyle}
				styleDiffing={false}
				onMove={onMove}
				onMoveEnd={handleMoveEnd}
				onLoad={handleMapLoad}
			>
				<DeckMap />
			</Map>
		</MapViewStateContext.Provider>
	);
}

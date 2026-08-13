"use client";

import * as maplibregl from "maplibre-gl";
import Map, {
	type MapRef,
	type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useRef, useState } from "react";
import { useMapStore } from "@/store/map-store";
import type { BBox } from "@/types/geospatial";
import DeckMap from "./DeckMap";
import { MapViewStateContext, type ViewState } from "./MapViewStateContext";

const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

const INITIAL_VIEW_STATE: ViewState = {
	longitude: 51.389,
	latitude: 35.689,
	zoom: 10,
	bbox: [51.15, 35.55, 51.62, 35.85],
};

export default function BaseMap() {
	const mapRef = useRef<MapRef | null>(null);
	const mapStyle = useMapStore((s) => s.mapStyle);
	const setViewport = useMapStore((s) => s.setViewport);
	const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	const transformRequest = useCallback((url: string) => {
		if (API_KEY && url.includes("map.ir")) {
			return { url, headers: { "x-api-key": API_KEY } };
		}
		return { url };
	}, []);

	// Helper to extract current viewport BBox from MapLibre bounds
	const updateViewportBounds = useCallback(
		(currentZoom: number) => {
			const map = mapRef.current?.getMap();
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
			}));
		},
		[setViewport],
	);

	// Debounce moveend (150-200ms) to trigger reconciliation checks
	const handleMoveEnd = useCallback(
		(e: ViewStateChangeEvent) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(() => {
				updateViewportBounds(e.viewState.zoom);
			}, 60);
		},
		[updateViewportBounds],
	);

	const onMove = useCallback((e: ViewStateChangeEvent) => {
		setViewState({
			longitude: e.viewState.longitude,
			latitude: e.viewState.latitude,
			zoom: e.viewState.zoom,
		});
	}, []);

	const handleMapLoad = useCallback(() => {
		updateViewportBounds(INITIAL_VIEW_STATE.zoom);
	}, [updateViewportBounds]);

	return (
		<MapViewStateContext.Provider value={viewState}>
			<Map
				ref={mapRef}
				mapLib={maplibregl}
				reuseMaps
				initialViewState={INITIAL_VIEW_STATE}
				style={{ width: "100%", height: "100%" }}
				mapStyle={mapStyle}
				transformRequest={transformRequest}
				onMove={onMove}
				onMoveEnd={handleMoveEnd}
				onLoad={handleMapLoad}
			>
				<DeckMap />
			</Map>
		</MapViewStateContext.Provider>
	);
}

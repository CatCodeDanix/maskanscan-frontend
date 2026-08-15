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
				style={{ width: "100%", height: "100%" }}
				mapStyle={mapStyle}
				onMove={onMove}
				onMoveEnd={handleMoveEnd}
				onLoad={handleMapLoad}
			>
				<DeckMap />
			</Map>
		</MapViewStateContext.Provider>
	);
}

"use client";

import * as maplibregl from "maplibre-gl";
import Map, { type ViewStateChangeEvent } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useState } from "react";
import { useMapStore } from "@/store/map-store";
import DeckMap from "./DeckMap";
import { MapViewStateContext, type ViewState } from "./MapViewStateContext";

const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

const INITIAL_VIEW_STATE: ViewState = {
	longitude: 51.389,
	latitude: 35.689,
	zoom: 10,
};

export default function BaseMap() {
	const mapStyle = useMapStore((s) => s.mapStyle);
	const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

	const transformRequest = useCallback((url: string) => {
		if (API_KEY && url.includes("map.ir")) {
			return { url, headers: { "x-api-key": API_KEY } };
		}
		return { url };
	}, []);

	const onMove = useCallback((e: ViewStateChangeEvent) => {
		setViewState({
			longitude: e.viewState.longitude,
			latitude: e.viewState.latitude,
			zoom: e.viewState.zoom,
		});
	}, []);

	return (
		<MapViewStateContext.Provider value={viewState}>
			<Map
				mapLib={maplibregl}
				reuseMaps
				initialViewState={INITIAL_VIEW_STATE}
				style={{ width: "100%", height: "100%" }}
				mapStyle={mapStyle}
				transformRequest={transformRequest}
				onMove={onMove}
			>
				<DeckMap />
			</Map>
		</MapViewStateContext.Provider>
	);
}

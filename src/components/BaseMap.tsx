"use client";

import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback } from "react";
import { useMapStore } from "@/store/map-store";
import DeckMap from "./DeckMap";

const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

export default function BaseMap() {
	const mapStyle = useMapStore((s) => s.mapStyle);

	// Memoized so react-map-gl doesn't see a new prop reference every render
	const transformRequest = useCallback(
		(url: string) => ({ url, headers: { "x-api-key": API_KEY } }),
		[], // API_KEY is a module-level constant — stable forever
	);

	return (
		<Map
			RTLTextPlugin="/mapbox-gl-rtl-text.js"
			initialViewState={{
				longitude: 51.389,
				latitude: 35.689,
				zoom: 11,
			}}
			style={{ width: "100%", height: "100%" }}
			mapStyle={mapStyle}
			transformRequest={transformRequest}
		>
			<DeckMap />
		</Map>
	);
}

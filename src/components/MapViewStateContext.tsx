"use client";

import { createContext, useContext } from "react";
import type { BBox } from "@/types/geospatial";

export interface ViewState {
	longitude: number;
	latitude: number;
	zoom: number;
	bbox?: BBox | null;
	isLoaded?: boolean;
}

export const MapViewStateContext = createContext<ViewState>({
	longitude: 51.389,
	latitude: 35.689,
	zoom: 10,
	bbox: [51.15, 35.55, 51.62, 35.85],
	isLoaded: false,
});

export function useMapViewState() {
	return useContext(MapViewStateContext);
}

"use client";

import { createContext, useContext } from "react";

export interface ViewState {
	longitude: number;
	latitude: number;
	zoom: number;
}

export const MapViewStateContext = createContext<ViewState>({
	longitude: 51.389,
	latitude: 35.689,
	zoom: 10,
});

export function useMapViewState() {
	return useContext(MapViewStateContext);
}

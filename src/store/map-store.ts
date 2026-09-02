import type { StyleSpecification } from "maplibre-gl";
import { create } from "zustand";
import { VECTOR_DARK_STYLE, VECTOR_LIBERTY_STYLE } from "@/lib/map-styles";
import type { BBox } from "@/types/geospatial";

const DARK_STYLE = VECTOR_DARK_STYLE;
const DEFAULT_LIGHT_STYLE = VECTOR_LIBERTY_STYLE;

// Default Tehran BBox: [minLng, minLat, maxLng, maxLat]
const DEFAULT_TEHRAN_BBOX: BBox = [51.15, 35.55, 51.62, 35.85];

type MapStore = {
	mapStyle: string | StyleSpecification;
	setMapStyle: (url: string | StyleSpecification) => void;
	activeOverlays: string[];
	toggleOverlay: (overlayId: string) => void;
	previousStyle: string | StyleSpecification | null;
	setMapTheme: (theme: "light" | "dark") => void;

	// Viewport state for geospatial pipeline
	viewportBBox: BBox | null;
	viewportZoom: number;
	setViewport: (bbox: BBox, zoom: number) => void;
};

export const useMapStore = create<MapStore>((set, get) => ({
	// Default to high-performance Vector Light style (Liberty)
	mapStyle: DEFAULT_LIGHT_STYLE,

	setMapStyle: (style) => set({ mapStyle: style }),

	activeOverlays: [],

	toggleOverlay: (id) =>
		set((state) => ({
			activeOverlays: state.activeOverlays.includes(id)
				? state.activeOverlays.filter((o) => o !== id)
				: [...state.activeOverlays, id],
		})),

	previousStyle: null,

	setMapTheme: (theme) => {
		const { mapStyle, previousStyle } = get();

		if (theme === "dark") {
			if (mapStyle !== DARK_STYLE) {
				set({
					mapStyle: DARK_STYLE,
					previousStyle: mapStyle,
				});
			}
		} else {
			if (mapStyle === DARK_STYLE) {
				set({
					mapStyle: previousStyle ?? DEFAULT_LIGHT_STYLE,
					previousStyle: null,
				});
			}
		}
	},

	viewportBBox: DEFAULT_TEHRAN_BBOX,
	viewportZoom: 10,
	setViewport: (bbox, zoom) => set({ viewportBBox: bbox, viewportZoom: zoom }),
}));

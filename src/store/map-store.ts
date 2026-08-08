import type { StyleSpecification } from "maplibre-gl";
import { create } from "zustand";
import { MAP_STYLES } from "@/lib/map-styles";

const DARK_STYLE =
	MAP_STYLES.find((s) => s.id === "dark")?.url ?? MAP_STYLES[1].url;
const DEFAULT_STYLE = MAP_STYLES[0].url;

type MapStore = {
	mapStyle: string | StyleSpecification;
	setMapStyle: (url: string | StyleSpecification) => void;
	activeOverlays: string[];
	toggleOverlay: (overlayId: string) => void;
	previousStyle: string | StyleSpecification | null;
	setMapTheme: (theme: "light" | "dark") => void;
};

export const useMapStore = create<MapStore>((set, get) => ({
	mapStyle: DEFAULT_STYLE,

	setMapStyle: (style) => set({ mapStyle: style }),

	activeOverlays: ["metro", "brt"],

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
					mapStyle: previousStyle ?? DEFAULT_STYLE,
					previousStyle: null,
				});
			}
		}
	},
}));

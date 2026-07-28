import { create } from "zustand";
import { MAP_STYLES } from "@/lib/map-styles";

const DARK_STYLE_URL = MAP_STYLES.find((s) => s.id === "dark")?.url;
const DEFAULT_STYLE_URL = MAP_STYLES[0].url;

type MapStore = {
	mapStyle: string;
	setMapStyle: (url: string) => void;
	activeOverlays: string[];
	toggleOverlay: (overlayId: string) => void;
	previousStyle: string | null;
	setMapTheme: (theme: "light" | "dark") => void;
};

export const useMapStore = create<MapStore>((set, get) => ({
	mapStyle: DEFAULT_STYLE_URL,

	setMapStyle: (url) => set({ mapStyle: url }),

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
			// Only switch to dark if not already dark
			if (mapStyle !== DARK_STYLE_URL) {
				set({
					mapStyle: DARK_STYLE_URL,
					previousStyle: mapStyle,
				});
			}
		} else {
			// light → revert to previous or default
			if (mapStyle === DARK_STYLE_URL) {
				set({
					mapStyle: previousStyle ?? DEFAULT_STYLE_URL,
					previousStyle: null,
				});
			}
		}
	},
}));

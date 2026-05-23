import { create } from "zustand";
import { MAP_STYLES } from "@/lib/map-styles";

type MapStore = {
  mapStyle: string;
  setMapStyle: (url: string) => void;
  activeOverlays: string[];
  toggleOverlay: (overlayId: string) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  mapStyle: MAP_STYLES[0].url,
  setMapStyle: (url) => set({ mapStyle: url }),
  activeOverlays: [],
  toggleOverlay: (id) =>
    set((state) => ({
      activeOverlays: state.activeOverlays.includes(id)
        ? state.activeOverlays.filter((o) => o !== id)
        : [...state.activeOverlays, id],
    })),
}));

"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { MapProvider } from "react-map-gl/maplibre";
import { useTheme } from "@wrksz/themes/client";
import { useMapStore } from "@/store/map-store";

const Providers = ({ children }: { children: ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const setMapTheme = useMapStore((state) => state.setMapTheme);

  useEffect(() => {
    if (resolvedTheme) {
      setMapTheme(resolvedTheme);
    }
  }, [resolvedTheme, setMapTheme]);

  return <MapProvider>{children}</MapProvider>;
};

export default Providers;

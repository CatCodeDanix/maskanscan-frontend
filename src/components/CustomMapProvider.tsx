"use client";

import { useTheme } from "@wrksz/themes/client";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { MapProvider } from "react-map-gl/maplibre";
import { useMapStore } from "@/store/map-store";

const CustomMapProvider = ({ children }: { children: ReactNode }) => {
	const { resolvedTheme } = useTheme();
	const setMapTheme = useMapStore((state) => state.setMapTheme);

	useEffect(() => {
		if (resolvedTheme) {
			setMapTheme(resolvedTheme);
		}
	}, [resolvedTheme, setMapTheme]);

	return <MapProvider>{children}</MapProvider>;
};

export default CustomMapProvider;

"use client";

import { useTheme } from "@wrksz/themes/client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { MapDataLoader } from "@/components/map/MapDataLoader";
import MapStyleSelector from "@/components/map/MapStyleSelector";
import { PropertyDetailSheet } from "@/components/PropertyDetailSheet";
import { useMapStore } from "@/store/map-store";

const BaseMap = dynamic(() => import("@/components/BaseMap"), {
	ssr: false,
	loading: () => (
		<div className="bg-background text-muted-foreground flex size-full items-center justify-center font-medium text-xs">
			در حال راه‌اندازی نقشه...
		</div>
	),
});

export default function BaseMapWrapper() {
	const { resolvedTheme } = useTheme();
	const setMapTheme = useMapStore((s) => s.setMapTheme);

	// Sync vector map style with app theme (Dark vector for dark, Liberty vector for light)
	useEffect(() => {
		if (resolvedTheme === "dark" || resolvedTheme === "light") {
			setMapTheme(resolvedTheme);
		}
	}, [resolvedTheme, setMapTheme]);

	return (
		<div className="relative size-full">
			<BaseMap />
			<MapDataLoader />
			<MapStyleSelector />
			<PropertyDetailSheet />
		</div>
	);
}

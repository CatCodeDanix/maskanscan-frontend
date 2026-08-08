"use client";

import dynamic from "next/dynamic";
import { MapDataLoader } from "@/components/map/MapDataLoader";
import MapStyleSelector from "@/components/map/MapStyleSelector";
import { PropertyDetailSheet } from "@/components/PropertyDetailSheet";

const BaseMap = dynamic(() => import("@/components/BaseMap"), {
	ssr: false,
	loading: () => (
		<div className="bg-background text-muted-foreground flex size-full items-center justify-center font-medium text-xs">
			در حال راه‌اندازی نقشه...
		</div>
	),
});

export default function BaseMapWrapper() {
	return (
		<div className="relative size-full">
			<BaseMap />
			<MapDataLoader />
			<MapStyleSelector />
			<PropertyDetailSheet />
		</div>
	);
}

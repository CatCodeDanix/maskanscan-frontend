"use client";

import dynamic from "next/dynamic";
import MapStyleSelector from "@/components/map/MapStyleSelector";
import { PropertyDetailSheet } from "@/components/PropertyDetailSheet";

const BaseMap = dynamic(() => import("@/components/BaseMap"), {
	ssr: false,
	loading: () => (
		<div
			className="
        bg-background text-muted-foreground flex size-full items-center
        justify-center
      "
		>
			در حال بارگذاری نقشه...
		</div>
	),
});

export default function BaseMapWrapper() {
	return (
		<div className="relative size-full">
			<BaseMap />
			<MapStyleSelector />
			<PropertyDetailSheet />
		</div>
	);
}

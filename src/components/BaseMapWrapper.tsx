"use client";

import dynamic from "next/dynamic";
import MapStyleSelector from "@/components/map/MapStyleSelector";

const BaseMap = dynamic(() => import("@/components/BaseMap"), {
  ssr: false,
  loading: () => (
    <div
      className="
        bg-background text-muted-foreground flex h-screen w-full items-center
        justify-center
      "
    >
      در حال بارگذاری نقشه...
    </div>
  ),
});

export default function BaseMapWrapper() {
  return (
    <div className="relative h-screen w-full">
      <BaseMap />
      <MapStyleSelector />
    </div>
  );
}

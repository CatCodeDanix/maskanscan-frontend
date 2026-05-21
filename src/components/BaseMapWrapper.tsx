"use client";

import dynamic from "next/dynamic";

const BaseMap = dynamic(() => import("@/components/BaseMap"), {
  ssr: false,
  loading: () => (
    <div
      className="
        flex h-screen w-full items-center justify-center bg-gray-100
        text-gray-500
      "
    >
      در حال بارگذاری نقشه...
    </div>
  ),
});

export default function BaseMapWrapper() {
  return <BaseMap />;
}

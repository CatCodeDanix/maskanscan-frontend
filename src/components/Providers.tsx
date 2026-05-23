"use client";
import type { ReactNode } from "react";
import { MapProvider } from "react-map-gl/maplibre";

const Providers = ({ children }: { children: ReactNode }) => {
  return <MapProvider>{children}</MapProvider>;
};
export default Providers;

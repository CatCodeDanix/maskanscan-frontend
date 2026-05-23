"use client";

import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapStore } from "@/store/map-store";
import DeckMap from "./DeckMap";

const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

export default function BaseMap() {
  const mapStyle = useMapStore((s) => s.mapStyle);

  return (
    <Map
      RTLTextPlugin="/mapbox-gl-rtl-text.js"
      initialViewState={{
        longitude: 51.389,
        latitude: 35.689,
        zoom: 11,
      }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle={mapStyle}
      transformRequest={(url) => {
        return {
          url,
          headers: {
            "x-api-key": API_KEY,
          },
        };
      }}
    >
      <DeckMap />
    </Map>
  );
}

// components/BaseMap.tsx
"use client";

import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

export default function BaseMap() {
  return (
    <Map
      RTLTextPlugin="/mapbox-gl-rtl-text.js"
      initialViewState={{
        longitude: 51.389,
        latitude: 35.689,
        zoom: 11,
      }}
      style={{ width: "100%", height: "100vh", fontFamily: "sans-serif" }}
      mapStyle={`https://map.ir/vector/styles/main/mapir-xyz-style.json?x-api-key=${API_KEY}`}
      transformRequest={(url) => {
        // Add the x-api-key header to every request (tiles, fonts, sprites, etc.)
        return {
          url,
          headers: {
            "x-api-key": API_KEY,
          },
        };
      }}
    />
  );
}

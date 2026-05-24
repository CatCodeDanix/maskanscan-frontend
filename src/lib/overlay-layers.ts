"use client";

import { useMemo } from "react";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Feature, Point, LineString, MultiLineString } from "geojson";
import { useMapStore } from "@/store/map-store";
import {
  tehranMetro,
  mashhadMetro,
  shirazMetro,
  tabrizMetro,
  isfahanMetro,
  tehranBRT,
} from "@/data";
import type { TransitProperties, TransitGeometry } from "@/data";

// ── Combine features ───────────────────────────────────────────────
type TransitFeature = Feature<TransitGeometry, TransitProperties>;

const METRO_FEATURES: TransitFeature[] = [
  ...tehranMetro.features,
  ...mashhadMetro.features,
  ...shirazMetro.features,
  ...tabrizMetro.features,
  ...isfahanMetro.features,
];

const BRT_FEATURES: TransitFeature[] = [...tehranBRT.features];

// ── Type guards ────────────────────────────────────────────────────
function isLine(
  f: TransitFeature
): f is Feature<LineString | MultiLineString, TransitProperties> {
  return (
    f.geometry.type === "LineString" || f.geometry.type === "MultiLineString"
  );
}

function isPoint(f: TransitFeature): f is Feature<Point, TransitProperties> {
  return f.geometry.type === "Point";
}

// ── Helpers ─────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [128, 128, 128];
}

// ── Hook ────────────────────────────────────────────────────────────
export function useTransitLayers() {
  const activeOverlays = useMapStore((s) => s.activeOverlays);

  return useMemo(() => {
    const layers: (
      | GeoJsonLayer<TransitProperties>
      | ScatterplotLayer<Feature<Point, TransitProperties>>
    )[] = [];

    // ── Metro ────────────────────────────────────────────────────
    if (activeOverlays.includes("metro") && METRO_FEATURES.length > 0) {
      const lines = METRO_FEATURES.filter(isLine);
      const stations = METRO_FEATURES.filter(isPoint);

      if (lines.length > 0) {
        layers.push(
          new GeoJsonLayer<TransitProperties>({
            id: "metro-lines",
            data: { type: "FeatureCollection", features: lines },
            stroked: true,
            filled: false,
            lineWidthMinPixels: 2,
            getLineColor: (f) => hexToRgb(f.properties.stroke || "#E60000"),
            getLineWidth: (f) => f.properties["stroke-width"] ?? 3,
            pickable: true,
            autoHighlight: true,
          })
        );
      }

      if (stations.length > 0) {
        layers.push(
          new ScatterplotLayer<Feature<Point, TransitProperties>>({
            id: "metro-stations",
            data: stations,
            getPosition: (f): [number, number] => [
              f.geometry.coordinates[0],
              f.geometry.coordinates[1],
            ],
            pickable: true,
            radiusMinPixels: 3,
            radiusMaxPixels: 8,
            getRadius: (f) => (f.properties.type === "warning" ? 5 : 4.5),
            getFillColor: (f) =>
              hexToRgb(f.properties["marker-color"] || "#E60000"),
            getLineColor: [255, 255, 255],
            lineWidthMinPixels: 2,
            stroked: true,
          })
        );
      }
    }

    // ── BRT ──────────────────────────────────────────────────────
    if (activeOverlays.includes("brt") && BRT_FEATURES.length > 0) {
      const lines = BRT_FEATURES.filter(isLine);
      const stations = BRT_FEATURES.filter(isPoint);

      if (lines.length > 0) {
        layers.push(
          new GeoJsonLayer<TransitProperties>({
            id: "brt-lines",
            data: { type: "FeatureCollection", features: lines },
            stroked: true,
            filled: false,
            lineWidthMinPixels: 2,
            getLineColor: (f) => hexToRgb(f.properties.stroke || "#FF6600"),
            getLineWidth: (f) => f.properties["stroke-width"] ?? 3,
            pickable: true,
            autoHighlight: true,
          })
        );
      }

      if (stations.length > 0) {
        layers.push(
          new ScatterplotLayer<Feature<Point, TransitProperties>>({
            id: "brt-stations",
            data: stations,
            getPosition: (f): [number, number] => [
              f.geometry.coordinates[0],
              f.geometry.coordinates[1],
            ],
            pickable: true,
            radiusMinPixels: 3,
            radiusMaxPixels: 8,
            getRadius: (f) => (f.properties.type === "warning" ? 5 : 4.5),
            getFillColor: (f) =>
              hexToRgb(f.properties["marker-color"] || "#FF6600"),
            getLineColor: [255, 255, 255],
            lineWidthMinPixels: 2,
            stroked: true,
          })
        );
      }
    }

    return layers;
  }, [activeOverlays]);
}

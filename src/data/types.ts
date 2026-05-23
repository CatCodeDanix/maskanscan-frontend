import type { FeatureCollection, Geometry } from "geojson";

export interface MetroProperties {
  name: string;
  description: string | null;
  type: "line" | "station" | "warning";
  folder: string;
  stroke?: string;
  "stroke-width"?: number;
  "stroke-opacity"?: number;
  "marker-color"?: string;
}

export type MetroFeatureCollection = FeatureCollection<
  Geometry,
  MetroProperties
>;

import type {
  FeatureCollection,
  Point,
  LineString,
  MultiLineString,
} from "geojson";

// ── Shared base ─────────────────────────────────────────────────────
interface TransitBase {
  name: string;
  description: string | null;
  type: "line" | "station" | "warning";
  stroke?: string;
  "stroke-width"?: number;
  "stroke-opacity"?: number;
  "marker-color"?: string;
}

// ── Metro (subway) properties ───────────────────────────────────────
export interface MetroProperties extends TransitBase {
  folder: string; // always present in metro data
  city?: string; // only in multi‑city files
  system?: never; // explicitly not present
}

// ── BRT properties ──────────────────────────────────────────────────
export interface BRTProperties extends TransitBase {
  system: string; // always "BRT"
  folder?: never; // not present in BRT data
  city?: never;
}

// ── Union type (matches all features) ───────────────────────────────
export type TransitProperties = MetroProperties | BRTProperties;

// ── Geometry ────────────────────────────────────────────────────────
export type TransitGeometry = Point | LineString | MultiLineString;

export type TransitFeatureCollection = FeatureCollection<
  TransitGeometry,
  TransitProperties
>;

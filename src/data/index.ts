import type { MetroFeatureCollection } from "./types";
import _tehranMetro from "./geojson/tehran-subway.json";

export const tehranMetro = _tehranMetro as MetroFeatureCollection;

export type { MetroProperties, MetroFeatureCollection } from "./types";

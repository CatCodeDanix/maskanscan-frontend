import _isfahanMetro from "./geojson/isfahan-subway.json";
import _mashhadMetro from "./geojson/mashhad-subway.json";
import _shirazMetro from "./geojson/shiraz-subway.json";
import _tabrizMetro from "./geojson/tabriz-subway.json";
import _tehranBRT from "./geojson/tehran-brt.json";
import _tehranMetro from "./geojson/tehran-subway.json";
import type { TransitFeatureCollection } from "./types";

export const tehranMetro = _tehranMetro as TransitFeatureCollection;
export const mashhadMetro = _mashhadMetro as TransitFeatureCollection;
export const shirazMetro = _shirazMetro as TransitFeatureCollection;
export const tabrizMetro = _tabrizMetro as TransitFeatureCollection;
export const isfahanMetro = _isfahanMetro as TransitFeatureCollection;
export const tehranBRT = _tehranBRT as TransitFeatureCollection;

export type {
	BRTProperties,
	MetroProperties,
	TransitFeatureCollection,
	TransitGeometry,
	TransitProperties,
} from "./types";

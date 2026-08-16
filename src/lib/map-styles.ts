import type { StyleSpecification } from "maplibre-gl";

export type MapStyleType = "vector" | "raster" | "overlay";

export type MapStyleDef = {
	id: string;
	name: string;
	url: string | StyleSpecification;
	type: MapStyleType;
	preview?: string;
};

// ── OpenFreeMap Vector Styles (100% Free, Open-Source & Fast) ────────────────
export const VECTOR_LIBERTY_STYLE =
	"https://tiles.openfreemap.org/styles/liberty";
export const VECTOR_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";
export const VECTOR_POSITRON_STYLE =
	"https://tiles.openfreemap.org/styles/positron";
export const VECTOR_BRIGHT_STYLE =
	"https://tiles.openfreemap.org/styles/bright";
export const VECTOR_FIORD_STYLE = "https://tiles.openfreemap.org/styles/fiord";

// ── Raster Styles Specifications ─────────────────────────────────────────────
export const CARTO_LIGHT_RASTER: StyleSpecification = {
	version: 8,
	sources: {
		"carto-light-raster": {
			type: "raster",
			tiles: [
				"https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
				"https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
				"https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
				"https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
			],
			tileSize: 256,
			attribution: "&copy; CARTO &copy; OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "carto-light-layer",
			type: "raster",
			source: "carto-light-raster",
			minzoom: 0,
			maxzoom: 22,
		},
	],
};

export const CARTO_VOYAGER_RASTER: StyleSpecification = {
	version: 8,
	sources: {
		"carto-voyager-raster": {
			type: "raster",
			tiles: [
				"https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
				"https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
				"https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
				"https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
			],
			tileSize: 256,
			attribution: "&copy; CARTO &copy; OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "carto-voyager-layer",
			type: "raster",
			source: "carto-voyager-raster",
			minzoom: 0,
			maxzoom: 22,
		},
	],
};

export const CARTO_DARK_RASTER: StyleSpecification = {
	version: 8,
	sources: {
		"carto-dark-raster": {
			type: "raster",
			tiles: [
				"https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
				"https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
				"https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
				"https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
			],
			tileSize: 256,
			attribution: "&copy; CARTO &copy; OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "carto-dark-layer",
			type: "raster",
			source: "carto-dark-raster",
			minzoom: 0,
			maxzoom: 22,
		},
	],
};

export const OSM_RASTER: StyleSpecification = {
	version: 8,
	sources: {
		"osm-raster": {
			type: "raster",
			tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
			tileSize: 256,
			attribution: "&copy; OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "osm-raster-layer",
			type: "raster",
			source: "osm-raster",
			minzoom: 0,
			maxzoom: 19,
		},
	],
};

export const MAP_STYLES: MapStyleDef[] = [
	// Vector Styles (Default High Performance)
	{
		id: "vector-dark",
		name: "برداری تاریک (Dark)",
		url: VECTOR_DARK_STYLE,
		type: "vector",
		preview: "/stylespreview/mapir-style-dark.png",
	},
	{
		id: "vector-liberty",
		name: "برداری روشن (Liberty)",
		url: VECTOR_LIBERTY_STYLE,
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "vector-positron",
		name: "برداری مینیمال (Positron)",
		url: VECTOR_POSITRON_STYLE,
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "vector-bright",
		name: "برداری استاندارد (Bright)",
		url: VECTOR_BRIGHT_STYLE,
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "vector-fiord",
		name: "برداری سرمه‌ای (Fiord)",
		url: VECTOR_FIORD_STYLE,
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},

	// Raster Styles
	{
		id: "default",
		name: "رستر روشن (Carto)",
		url: CARTO_LIGHT_RASTER,
		type: "raster",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "dark",
		name: "رستر تاریک (Carto)",
		url: CARTO_DARK_RASTER,
		type: "raster",
		preview: "/stylespreview/mapir-style-dark.png",
	},
	{
		id: "voyager",
		name: "رستر رنگی (Voyager)",
		url: CARTO_VOYAGER_RASTER,
		type: "raster",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "osm",
		name: "رستر OpenStreetMap",
		url: OSM_RASTER,
		type: "raster",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
];

export type OverlayDef = {
	id: string;
	name: string;
	preview?: string;
};

export const OVERLAYS: OverlayDef[] = [
	{
		id: "metro",
		name: "خطوط مترو",
		preview: "/stylespreview/Metro-Lines.png",
	},
	{
		id: "brt",
		name: "خطوط BRT",
		preview: "/stylespreview/BRT-Lines.png",
	},
];

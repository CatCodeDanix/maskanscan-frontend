import type { StyleSpecification } from "maplibre-gl";

const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

export type MapStyleType = "vector" | "raster" | "overlay";

export type MapStyleDef = {
	id: string;
	name: string;
	url: string | StyleSpecification;
	type: MapStyleType;
	preview?: string;
};

export const CARTO_LIGHT_RASTER: StyleSpecification = {
	version: 8,
	sources: {
		"carto-raster": {
			type: "raster",
			tiles: [
				"https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
				"https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
				"https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
				"https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
			],
			tileSize: 256,
			attribution: "&copy; CARTO &copy; OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "carto-raster-layer",
			type: "raster",
			source: "carto-raster",
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
				"https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
				"https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
				"https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
				"https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
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

export const MAP_STYLES: MapStyleDef[] = [
	{
		id: "default",
		name: "نقشه روشن (Carto)",
		url: CARTO_LIGHT_RASTER,
		type: "raster",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "dark",
		name: "نقشه تاریک (Carto)",
		url: CARTO_DARK_RASTER,
		type: "raster",
		preview: "/stylespreview/mapir-style-dark.png",
	},
	{
		id: "openfreemap",
		name: "برداری (OpenFreeMap)",
		url: "https://tiles.openfreemap.org/styles/bright",
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "mapir-default",
		name: "پیش‌فرض map.ir",
		url: API_KEY
			? `https://map.ir/vector/styles/main/mapir-xyz-style.json?x-api-key=${API_KEY}`
			: CARTO_LIGHT_RASTER,
		type: "vector",
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

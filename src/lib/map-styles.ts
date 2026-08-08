const API_KEY = process.env.NEXT_PUBLIC_MAPIR_API_KEY;

export type MapStyleType = "vector" | "raster" | "overlay";

export type MapStyleDef = {
	id: string;
	name: string;
	url: string;
	type: MapStyleType;
	preview?: string;
};

export const MAP_STYLES: MapStyleDef[] = [
	{
		id: "carto-light",
		name: "نقشه روشن (Carto)",
		url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "carto-dark",
		name: "نقشه تاریک (Carto)",
		url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
		type: "vector",
		preview: "/stylespreview/mapir-style-dark.png",
	},
	{
		id: "default",
		name: "پیش‌فرض map.ir",
		url: API_KEY
			? `https://map.ir/vector/styles/main/mapir-xyz-style.json?x-api-key=${API_KEY}`
			: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "dark",
		name: "شب map.ir",
		url: API_KEY
			? `https://map.ir/vector/styles/main/mapir-style-dark.json?x-api-key=${API_KEY}`
			: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
		type: "vector",
		preview: "/stylespreview/mapir-style-dark.png",
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

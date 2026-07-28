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
		id: "default",
		name: "پیش‌فرض",
		url: `https://map.ir/vector/styles/main/mapir-xyz-style.json?x-api-key=${API_KEY}`,
		type: "vector",
		preview: "/stylespreview/mapir-xyz-no-building.png",
	},
	{
		id: "dove",
		name: "کبوتر",
		url: `https://map.ir/vector/styles/main/mapir-Dove-style.json?x-api-key=${API_KEY}`,
		type: "vector",
		preview: "/stylespreview/mapir-Dove-style.png",
	},
	{
		id: "minpoi",
		name: "کم‌جزئیات",
		url: `https://map.ir/vector/styles/main/mapir-xyz-style-min-poi.json?x-api-key=${API_KEY}`,
		type: "vector",
		preview: "/stylespreview/mapir-xyz-style-min-poi.png",
	},
	{
		id: "dark",
		name: "شب",
		url: `https://map.ir/vector/styles/main/mapir-style-dark.json?x-api-key=${API_KEY}`,
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

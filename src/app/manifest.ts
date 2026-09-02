import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "مسکن اسکن | MaskanScan",
		short_name: "مسکن اسکن",
		description:
			"سامانه یکپارچه پایش، مقایسه و جستجوی هوشمند آگهی‌های رهن و اجاره مسکونی در تهران",
		start_url: "/",
		display: "standalone",
		background_color: "#0f172a",
		theme_color: "#f59e0b",
		dir: "rtl",
		lang: "fa",
		icons: [
			{
				src: "/logo.svg",
				sizes: "any",
				type: "image/svg+xml",
			},
		],
	};
}

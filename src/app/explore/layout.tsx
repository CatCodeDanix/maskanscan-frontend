import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "نقشه تعاملی و کاوش املاک تهران",
	description:
		"جستجو و مقایسه هوشمند آگهی‌های رهن و اجاره آپارتمان در تهران روی نقشه تعاملی با فیلتر پیشرفته بودجه، ودیعه و اجاره ماهانه.",
	alternates: {
		canonical: "/explore",
	},
	openGraph: {
		title: "نقشه تعاملی و کاوش املاک تهران | مسکن اسکن",
		description:
			"جستجو و مقایسه هوشمند آگهی‌های رهن و اجاره مسکونی روی نقشه تعاملی تهران.",
		url: "https://maskanscan.ir/explore",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "نقشه تعاملی املاک تهران - مسکن اسکن",
			},
		],
	},
};

export default function ExploreLayout({ children }: { children: ReactNode }) {
	return <>{children}</>;
}

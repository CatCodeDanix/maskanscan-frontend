"use client";

import {
	ArrowLeft,
	Compass,
	Map,
	Navigation,
	SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const GEO_CAPABILITIES = [
	{
		title: "کاوش روی نقشه تعاملی تهران",
		desc: "جابجایی سریع روی نقشه با رندر پایدار و روان آگهی‌های رهن و اجاره.",
		icon: Map,
	},
	{
		title: "جستجوی محله‌ها و معابر",
		desc: "یافتن سریع آگهی‌ها بر اساس نام محله، خیابان‌های اصلی و محدوده دید نقشه.",
		icon: Navigation,
	},
	{
		title: "خوشه‌بندی هوشمند آگهی‌ها",
		desc: "تجمیع و خوشه‌بندی نقاط با تغییر زوم نقشه برای پیمایش سریع و خوانا بودن قیمت‌ها.",
		icon: Compass,
	},
	{
		title: "فیلتر بر اساس بودجه و امکانات",
		desc: "تنظیم بازه ودیعه و اجاره ماهانه، متراژ، خواب، آسانسور، پارکینگ و سال ساخت.",
		icon: SlidersHorizontal,
	},
];

export function GeospatialFeatureSection() {
	return (
		<section
			id="geospatial"
			className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md"
			dir="rtl"
		>
			<div className="max-w-7xl mx-auto space-y-12">
				{/* Section Header */}
				<div className="max-w-3xl mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
						<Navigation className="size-3" />
						<span>کاوش هوشمند روی نقشه تهران</span>
					</div>
					<h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-[1.45] sm:leading-[1.4] py-1">
						جستجوی بصری املاک روی نقشه،
						<br />
						<span className="text-primary">سریع، متمرکز و یکپارچه</span>
					</h2>
					<p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-[1.8]">
						موقعیت مکانی آگهی‌ها را مستقیماً روی نقشه بررسی کنید، محله‌های اطراف را
						ببینید و با چند کلیک به مناسب‌ترین گزینه اجاره برسید.
					</p>
				</div>

				{/* 4 Capability Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
					{GEO_CAPABILITIES.map((cap) => (
						<div
							key={cap.title}
							className="p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-3.5 group"
						>
							<div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
								<cap.icon className="size-5" />
							</div>
							<h3 className="text-sm sm:text-base font-bold text-foreground">
								{cap.title}
							</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								{cap.desc}
							</p>
						</div>
					))}
				</div>

				{/* CTA to Map */}
				<div className="text-center pt-4">
					<Button asChild size="lg" className="font-bold gap-2">
						<Link href="/explore">
							<span>ورود به نسخه دمو</span>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}

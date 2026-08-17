"use client";

import {
	ArrowLeft,
	Building,
	Calculator,
	CheckCircle2,
	Layers,
	MapPin,
	Sparkles,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TehranScene3D = dynamic(
	() =>
		import("@/components/landing/TehranScene3D").then((m) => m.TehranScene3D),
	{
		ssr: false,
		loading: () => (
			<div className="absolute inset-0 bg-background/50 flex items-center justify-center pointer-events-none" />
		),
	},
);

const METRICS = [
	{ label: "آگهی‌های ثبت‌شده در دیتابیس", value: "+۱۵۰,۰۰۰", icon: Building },
	{ label: "پلتفرم معتبر تجمیع‌شده", value: "۴ پلتفرم", icon: Layers },
	{ label: "پوشش جغرافیایی", value: "کل تهران", icon: MapPin },
	{ label: "حذف آگهی‌های تکراری", value: "۱۰۰٪ خالص", icon: CheckCircle2 },
];

export function HeroSection() {
	return (
		<section
			className="relative min-h-[96dvh] flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 pt-24 pb-20 overflow-hidden"
			dir="rtl"
		>
			{/* 3D Interactive WebGL Tehran Canvas */}
			<div className="absolute inset-0 size-full z-0 pointer-events-auto">
				<TehranScene3D />
			</div>

			{/* High-Contrast Dual Scrim Overlays for pristine readability in Light & Dark modes */}
			<div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/90 via-background/65 to-background dark:from-background/85 dark:via-background/55 dark:to-background pointer-events-none" />
			<div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_75%_55%_at_50%_45%,var(--tw-gradient-stops))] from-background/95 via-background/75 to-transparent dark:from-background/90 dark:via-background/60 dark:to-transparent pointer-events-none" />
			<div className="absolute inset-x-0 bottom-0 h-40 z-[2] bg-gradient-to-t from-background via-background/85 to-transparent pointer-events-none" />

			<div className="relative z-10 w-full max-w-4xl lg:max-w-5xl mx-auto space-y-6 pointer-events-auto">
				{/* Top Tagline / Demo Pill */}
				<div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-600/30 dark:border-amber-500/30 backdrop-blur-md shadow-xs transition-transform hover:scale-105 select-none">
					<Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
					<span className="text-xs font-bold text-amber-700 dark:text-amber-400">
						نسخه آزمایشی (دمو)
					</span>
					<span className="text-muted-foreground text-xs">•</span>
					<span className="text-xs font-semibold text-foreground/90 dark:text-foreground/85">
						سامانه یکپارچه پایش و جستجوی رهن و اجاره تهران (داده‌های آزمایشی)
					</span>
				</div>

				{/* Main Hero Headline with High-Contrast Colors */}
				<h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.4] sm:leading-[1.35] py-2">
					همه خانه‌های اجاره‌ای تهران،
					<br />
					<span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 dark:from-primary dark:via-amber-400 dark:to-primary">
						یکجا روی نقشه هوشمند
					</span>
				</h1>

				{/* Subheadline with Enhanced Readability */}
				<p className="text-sm sm:text-base lg:text-lg text-foreground/85 dark:text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed sm:leading-[1.8]">
					دیگر نیازی به گشتن در چندین سایت مختلف نیست. مسکن‌اسکن آگهی‌های رهن و
					اجاره از{" "}
					<strong className="text-foreground font-bold">
						دیوار، شیپور، کلید و مستر ملک
					</strong>{" "}
					را در یک نقشه تعاملی با فیلتر محلات و محاسبه‌گر رهن و اجاره گرد هم
					آورده است.
				</p>

				{/* Primary Call-to-Actions */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
					<Button
						asChild
						size="lg"
						className="w-full sm:w-auto font-extrabold text-sm sm:text-base gap-2 px-8 h-12 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-102 transition-all cursor-pointer"
					>
						<Link href="/explore">
							<span>ورود به نسخه دمو</span>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>

					<Button
						asChild
						variant="outline"
						size="lg"
						className="w-full sm:w-auto font-bold text-sm sm:text-base gap-2 px-6 h-12 rounded-xl bg-background/90 dark:bg-background/80 backdrop-blur-md border-border hover:bg-muted transition-all cursor-pointer shadow-xs"
					>
						<a href="#calculator">
							<Calculator className="size-4 text-primary" />
							<span>ماشین‌حساب تبدیل رهن و اجاره</span>
						</a>
					</Button>
				</div>

				{/* Key Metrics Banner */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-10 select-none">
					{METRICS.map((metric) => (
						<div
							key={metric.label}
							className="p-3.5 sm:p-4 rounded-xl bg-background/90 dark:bg-background/75 backdrop-blur-md border border-border/80 text-right shadow-xs hover:border-primary/50 transition-colors"
						>
							<div className="flex items-center gap-2 mb-1 text-primary">
								<metric.icon className="size-4" />
								<span className="text-base sm:text-lg font-black text-foreground">
									<bdi>{metric.value}</bdi>
								</span>
							</div>
							<p className="text-[11px] text-foreground/75 dark:text-muted-foreground font-medium leading-tight">
								{metric.label}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

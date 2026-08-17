"use client";

import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SOURCES = [
	{
		name: "دیوار",
		slug: "divar",
		color: "bg-red-600",
		textColor: "text-red-500",
		borderColor: "border-red-500/30",
		bgLight: "bg-red-500/10",
		description: "بزرگ‌ترین مرجع نیازمندی‌ها و آگهی‌های شخصی و املاک تهران",
		syncRate: "به‌روزرسانی هر ۵ دقیقه",
	},
	{
		name: "شیپور",
		slug: "sheypoor",
		color: "bg-blue-600",
		textColor: "text-blue-500",
		borderColor: "border-blue-500/30",
		bgLight: "bg-blue-500/10",
		description: "پوشش گسترده فایل‌های رهن و اجاره شخصی و مشاورین املاک",
		syncRate: "همگام‌سازی لحظه‌ای",
	},
	{
		name: "کلید",
		slug: "kilid",
		color: "bg-violet-600",
		textColor: "text-violet-500",
		borderColor: "border-violet-500/30",
		bgLight: "bg-violet-500/10",
		description: "فایل‌های تخصصی و تحلیل قیمت متری در مناطق مختلف تهران",
		syncRate: "پایش مداوم تغییرات",
	},
	{
		name: "مستر ملک",
		slug: "mrestate",
		color: "bg-emerald-600",
		textColor: "text-emerald-500",
		borderColor: "border-emerald-500/30",
		bgLight: "bg-emerald-500/10",
		description: "شبکه آژانس‌های املاک معتبر و فایل‌های انحصاری اجاره",
		syncRate: "به‌روزرسانی دوره‌ای",
	},
];

const COMPARISON_ITEMS = [
	{
		feature: "جستجو در تمام منابع",
		traditional: "باید در ۴ اپلیکیشن جداگانه جستجو کنید",
		maskanscan: "یک جستجوی واحد در تمام پلتفرم‌ها همزمان",
	},
	{
		feature: "دیدن آگهی‌ها روی نقشه",
		traditional: "اکثر سایت‌ها فقط لیست متنی با محدودیت نقشه دارند",
		maskanscan: "نقشه تعاملی دقیق با پوشش کامل تمام نقاط تهران",
	},
	{
		feature: "حذف موارد تکراری",
		traditional: "یک خانه با چند قیمت مختلف در چند جا تکرار می‌شود",
		maskanscan: "ادغام خودکار آگهی‌های یکسان با نمایش منابع مجزا",
	},
	{
		feature: "تبدیل رهن و اجاره",
		traditional: "محاسبه دستی و زمان‌بر فرمول‌های عرف بازار",
		maskanscan: "فیلتر بر اساس ودیعه معادل و تبدیل لحظه‌ای بودجه",
	},
];

export function AggregationSection() {
	return (
		<section
			id="aggregation"
			className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background/60 backdrop-blur-md"
			dir="rtl"
		>
			<div className="max-w-7xl mx-auto space-y-16">
				{/* Section Header */}
				<div className="max-w-3xl mx-auto text-center space-y-4">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
						<RefreshCw
							className="size-3 animate-spin"
							style={{ animationDuration: "8s" }}
						/>
						<span>تجمیع و همگام‌سازی لحظه‌ای</span>
					</div>
					<h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-[1.45] sm:leading-[1.4] py-1">
						۴ پلتفرم املاک در یک صفحه،
						<br />
						<span className="text-primary">بدون نیاز به جستجوی جداگانه</span>
					</h2>
					<p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed sm:leading-[1.8]">
						مسکن‌اسکن آگهی‌های رهن و اجاره تهران را از دیوار، شیپور، کلید و مستر
						ملک گردآوری و در ساختاری یکپارچه برای بررسی روی نقشه آماده می‌کند.
					</p>
				</div>

				{/* 4 Supported Source Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{SOURCES.map((source) => (
						<div
							key={source.slug}
							className="p-5 rounded-2xl bg-card/85 border border-border/80 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group"
						>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span
										className={`px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-xs ${source.color}`}
									>
										{source.name}
									</span>
									<span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
										<span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
										فعال
									</span>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">
									{source.description}
								</p>
							</div>

							<div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-foreground">
								<span>وضعیت:</span>
								<span className={source.textColor}>{source.syncRate}</span>
							</div>
						</div>
					))}
				</div>

				{/* Comparison Table: Traditional vs MaskanScan */}
				<div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md overflow-hidden shadow-sm">
					<div className="px-6 py-4 bg-muted/50 border-b border-border/80 flex items-center justify-between">
						<h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
							<ShieldCheck className="size-4.5 text-primary" />
							<span>تفاوت تجربه کاربری با مسکن‌اسکن</span>
						</h3>
						<Button
							asChild
							size="xs"
							variant="outline"
							className="text-xs font-semibold gap-1"
						>
							<Link href="/explore">
								<span>مشاهده در نسخه دمو</span>
								<ArrowLeft className="size-3" />
							</Link>
						</Button>
					</div>

					<div className="divide-y divide-border/60 text-xs sm:text-sm">
						{COMPARISON_ITEMS.map((item, i) => (
							<div
								key={item.feature}
								className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 gap-3 items-center hover:bg-muted/30 transition-colors"
							>
								<div className="font-bold text-foreground flex items-center gap-2">
									<span className="size-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
										{i + 1}
									</span>
									<span>{item.feature}</span>
								</div>
								<div className="text-muted-foreground flex items-center gap-2 pr-7 md:pr-0">
									<span className="text-red-500 font-bold shrink-0">✕</span>
									<span>{item.traditional}</span>
								</div>
								<div className="text-primary font-semibold flex items-center gap-2 pr-7 md:pr-0">
									<span className="text-emerald-500 font-bold shrink-0">✓</span>
									<span>{item.maskanscan}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

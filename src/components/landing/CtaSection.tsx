"use client";

import { Compass, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
	return (
		<section
			className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
			dir="rtl"
		>
			<div className="max-w-5xl mx-auto relative">
				{/* Glowing Backdrop Mesh */}
				<div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/25 via-amber-500/15 to-primary/25 blur-3xl opacity-80 rounded-3xl" />

				{/* Card Container with Tehran Skyline Photographic Backdrop */}
				<div className="relative rounded-3xl border border-amber-500/30 overflow-hidden p-8 sm:p-12 lg:p-16 text-center space-y-8 shadow-2xl bg-neutral-950 text-white">
					{/* Tehran Urban Cityscape Background Image */}
					<div className="absolute inset-0 size-full">
						<Image
							src="/images/tehran-cta-bg.jpg"
							alt="Tehran City Skyline at Twilight"
							fill
							className="object-cover object-center opacity-65 dark:opacity-60 filter brightness-90 contrast-110"
							sizes="(max-width: 1024px) 100vw, 1200px"
							priority
						/>
						{/* Multi-layer Gradient Scrim for crisp text contrast */}
						<div className="absolute inset-0 bg-gradient-to-b from-neutral-950/85 via-neutral-950/50 to-neutral-950/90" />
					</div>

					<div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/25 text-amber-300 border border-amber-400/40 text-xs font-bold shadow-md backdrop-blur-md">
						<Sparkles
							className="size-4 animate-spin text-amber-400"
							style={{ animationDuration: "10s" }}
						/>
						<span>کاوش هوشمند تمام محله‌های تهران</span>
					</div>

					<h2 className="relative z-10 text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.45] sm:leading-[1.4] py-1 drop-shadow-md">
						خانه ایده‌آل بعدی خود را
						<br />
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 drop-shadow-sm">
							روی نقشه مسکن‌اسکن پیدا کنید
						</span>
					</h2>

					<p className="relative z-10 text-sm sm:text-base text-neutral-200 font-medium max-w-2xl mx-auto leading-relaxed sm:leading-[1.8] drop-shadow-sm">
						همین حالا نقشه تعاملی را باز کنید، فیلتر ودیعه و اجاره را تنظیم
						نمایید و با یک نگاه تمام گزینه‌های فعال تهران را مقایسه کنید.
					</p>

					<div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
						<Button
							asChild
							size="lg"
							className="w-full sm:w-auto font-black text-base gap-2 px-10 h-14 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<Link href="/explore">
								<span>ورود به نسخه دمو</span>
								<Compass className="size-5" />
							</Link>
						</Button>
					</div>

					<div className="relative z-10 pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300 font-medium">
						<span className="flex items-center gap-1.5">
							<ShieldCheck className="size-4 text-amber-400" />
							بدون نیاز به ثبت‌نام اجباری
						</span>
						<span className="flex items-center gap-1.5">
							<Zap className="size-4 text-amber-400" />
							جستجوی آسان و بدون تبلیغات
						</span>
						<span className="flex items-center gap-1.5">
							<Sparkles className="size-4 text-amber-400" />
							نسخه دمو و آزمایشی
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

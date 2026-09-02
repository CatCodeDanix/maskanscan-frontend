"use client";

import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
	return (
		<footer
			className="border-t border-border/80 bg-background/95 backdrop-blur-md pt-16 pb-12 px-4 sm:px-6 lg:px-8 select-none"
			dir="rtl"
		>
			<div className="max-w-7xl mx-auto space-y-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand Column */}
					<div className="lg:col-span-2 space-y-4">
						<Link href="/" className="flex items-center gap-2">
							<span className="text-primary text-lg font-black tracking-tight">
								مسکن
							</span>
							<Image
								src="/logo.svg"
								alt="MaskanScan"
								width={32}
								height={32}
								className="size-8"
							/>
							<span className="text-primary text-lg font-black tracking-tight">
								اسکن
							</span>
						</Link>
						<p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
							مسکن‌اسکن؛ پلتفرم تجمیع هوشمند و تخصصی آگهی‌های رهن و اجاره مسکونی
							در استان تهران با تکیه بر نقشه تعاملی و تبدیل آنلاین ودیعه و
							اجاره.
						</p>
						<div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
							<MapPin className="size-3.5 text-primary" />
							<span>پوشش سراسری استان تهران</span>
						</div>
					</div>

					{/* Quick Links */}
					<div className="space-y-3">
						<h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
							بخش‌های سایت
						</h4>
						<ul className="space-y-2 text-xs text-muted-foreground">
							<li>
								<Link
									href="/explore"
									className="hover:text-primary transition-colors"
								>
									ورود به نسخه دمو
								</Link>
							</li>
							<li>
								<a
									href="#aggregation"
									className="hover:text-primary transition-colors"
								>
									تجمیع پلتفرم‌ها
								</a>
							</li>
							<li>
								<a
									href="#calculator"
									className="hover:text-primary transition-colors"
								>
									ماشین‌حساب رهن و اجاره
								</a>
							</li>
							<li>
								<a
									href="#features"
									className="hover:text-primary transition-colors"
								>
									ویژگی‌های کلیدی
								</a>
							</li>
						</ul>
					</div>

					{/* Portals & Legal Notice */}
					<div className="space-y-3">
						<h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
							شفافیت و حقوق نشر
						</h4>
						<p className="text-[11px] text-muted-foreground leading-relaxed">
							تمام آگهی‌ها با ذکر نام منبع اصلی بازنشر می‌شوند. این سامانه در حال
							حاضر در قالب نسخه نمایشی (Demo) با داده‌های نمونه و آزمایشی فعال
							است.
						</p>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
					<p>
						© {new Date().getFullYear()} مسکن‌اسکن (MaskanScan) — نسخه دمو. تمامی
						حقوق محفوظ است.
					</p>
					<div className="flex items-center gap-1">
						<span>توسعه یافته با</span>
						<Heart className="size-3 text-red-500 fill-red-500" />
						<span>برای شهروندان تهران</span>
					</div>
				</div>
			</div>
		</footer>
	);
}

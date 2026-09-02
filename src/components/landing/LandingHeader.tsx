"use client";

import { Compass, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navItems = [
		{ label: "تجمیع پلتفرم‌ها", href: "#aggregation" },
		{ label: "جستجوی فضایی", href: "#geospatial" },
		{ label: "محاسبه تبدیل رهن", href: "#calculator" },
		{ label: "ویژگی‌های کلیدی", href: "#features" },
	];

	return (
		<header
			className={cn(
				"fixed top-0 inset-x-0 z-50 transition-all duration-300 select-none",
				scrolled
					? "bg-background/90 backdrop-blur-md border-b border-border/80 shadow-xs py-2.5"
					: "bg-background/40 dark:bg-background/20 backdrop-blur-xs py-3.5",
			)}
			dir="rtl"
		>
			<div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
				{/* Right: Brand Identity */}
				<Link href="/" className="flex items-center gap-2 group">
					<span className="text-primary text-base md:text-lg font-black tracking-tight">
						مسکن
					</span>
					<Image
						src="/logo.svg"
						alt="MaskanScan"
						width={30}
						height={30}
						className="size-7 md:size-8 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
					/>
					<span className="text-primary text-base md:text-lg font-black tracking-tight">
						اسکن
					</span>
					<span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mr-1.5">
						استان تهران
					</span>
					<span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-600/25 dark:border-amber-500/25">
						دمو (داده‌های نمونه)
					</span>
				</Link>

				{/* Center: Desktop Navigation Links */}
				<nav className="hidden md:flex items-center gap-6 lg:gap-8">
					{navItems.map((item) => (
						<a
							key={item.href}
							href={item.href}
							className="text-xs lg:text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors hover:scale-105"
						>
							{item.label}
						</a>
					))}
				</nav>

				{/* Left: Actions (Theme Toggle + Launch Map CTA) */}
				<div className="flex items-center gap-2.5">
					<div className="hidden sm:block">
						<ModeToggle />
					</div>

					<Button
						asChild
						variant="default"
						size="sm"
						className="gap-1.5 font-bold shadow-md hover:shadow-primary/25 hover:shadow-lg transition-all"
					>
						<Link href="/explore">
							<span>ورود به نسخه دمو</span>
							<Compass className="size-4" />
						</Link>
					</Button>

					{/* Mobile Menu Toggle Button */}
					<button
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden size-9 flex items-center justify-center rounded-lg border border-border/80 bg-background/60 text-muted-foreground hover:text-foreground"
						aria-label="منو"
					>
						{mobileMenuOpen ? (
							<X className="size-5" />
						) : (
							<Menu className="size-5" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Dropdown Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/80 px-4 py-4 space-y-3">
					{navItems.map((item) => (
						<a
							key={item.href}
							href={item.href}
							onClick={() => setMobileMenuOpen(false)}
							className="block py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
						>
							{item.label}
						</a>
					))}
					<div className="pt-2 flex items-center justify-between border-t border-border/60">
						<span className="text-xs text-muted-foreground">تغییر تم:</span>
						<ModeToggle />
					</div>
				</div>
			)}
		</header>
	);
}

"use client";

import { Compass, Home, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground select-none"
			dir="rtl"
		>
			<div className="max-w-md w-full space-y-6 bg-card/80 backdrop-blur-xl border border-border/80 p-8 sm:p-10 rounded-3xl shadow-xl">
				<div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
					<Search className="size-8 animate-pulse" />
				</div>

				<div className="space-y-2">
					<span className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
						۴۰۴
					</span>
					<h1 className="text-xl sm:text-2xl font-bold text-foreground">
						صفحه مورد نظر یافت نشد
					</h1>
					<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						آدرس وارد شده معتبر نیست یا صفحه به نشانی دیگری منتقل شده است.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 pt-2">
					<Button asChild size="lg" className="w-full font-bold gap-2">
						<Link href="/">
							<Home className="size-4" />
							<span>صفحه اصلی</span>
						</Link>
					</Button>

					<Button
						asChild
						variant="outline"
						size="lg"
						className="w-full font-bold gap-2"
					>
						<Link href="/explore">
							<Compass className="size-4" />
							<span>ورود به نقشه</span>
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

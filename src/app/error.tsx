"use client";

import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Uncaught application error:", error);
	}, [error]);

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground select-none"
			dir="rtl"
		>
			<div className="max-w-md w-full space-y-6 bg-card/80 backdrop-blur-xl border border-destructive/30 p-8 sm:p-10 rounded-3xl shadow-xl">
				<div className="size-16 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center border border-destructive/20">
					<AlertCircle className="size-8" />
				</div>

				<div className="space-y-2">
					<h1 className="text-xl sm:text-2xl font-bold text-foreground">
						خطایی در پردازش رخ داد
					</h1>
					<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
						متأسفانه مشکلی غیرمنتظره در بارگذاری رخ داده است. لطفاً مجدداً تلاش
						فرمایید.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 pt-2">
					<Button
						onClick={() => reset()}
						size="lg"
						className="w-full font-bold gap-2"
					>
						<RefreshCcw className="size-4" />
						<span>تلاش مجدد</span>
					</Button>

					<Button
						asChild
						variant="outline"
						size="lg"
						className="w-full font-bold gap-2"
					>
						<Link href="/">
							<Home className="size-4" />
							<span>صفحه اصلی</span>
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDemoAuthStore } from "@/store/demo-auth-store";

function AnimatedHeight({ children }: { children: React.ReactNode }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const observedHeight =
					entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
				if (observedHeight > 0) {
					setHeight(observedHeight);
				}
			}
		});

		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	return (
		<div
			style={{ height: height === "auto" ? "auto" : `${height}px` }}
			className="overflow-hidden transition-[height] duration-300 ease-out"
		>
			<div ref={containerRef} className="animate-in fade-in-50 duration-200">
				{children}
			</div>
		</div>
	);
}

interface AuthDialogProps {
	isOpen: boolean;
	onClose: () => void;
	defaultTab?: "signin" | "signup";
}

export function AuthDialog({
	isOpen,
	onClose,
	defaultTab = "signin",
}: AuthDialogProps) {
	const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");

	const signIn = useDemoAuthStore((s) => s.signIn);
	const signUp = useDemoAuthStore((s) => s.signUp);

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		signIn(email || "demo@maskanscan.ir", password, name || "کاربر دمو");
		toast.success("خوش آمدید! با حساب دمو وارد شدید.");
		onClose();
	};

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();
		signUp(name || "کاربر جدید", email || "newuser@maskanscan.ir", password);
		toast.success("حساب کاربری دمو با موفقیت ایجاد شد.");
		onClose();
	};

	const handleQuickDemoLogin = () => {
		signIn("demo@maskanscan.ir", "password", "کاربر دمو");
		toast.success("خوش آمدید! با حساب دمو وارد شدید.");
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="sm:max-w-[420px] p-0 overflow-hidden bg-background border rounded-2xl shadow-2xl"
				dir="rtl"
			>
				{/* Top Header */}
				<div className="bg-primary/5 border-b p-6 pb-5 text-right space-y-2 relative">
					<div className="flex items-center gap-2">
						<div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
							<Sparkles className="size-4.5" />
						</div>
						<div className="space-y-0.5 pr-1">
							<div className="flex items-center gap-2">
								<DialogTitle className="text-base font-bold text-foreground">
									حساب کاربری مسکن‌اسکن
								</DialogTitle>
								<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 shrink-0">
									نسخه دمو
								</span>
							</div>
							<DialogDescription className="text-xs text-muted-foreground">
								دسترسی به جستجوهای ذخیره‌شده، نشان‌ها و اعلان‌ها
							</DialogDescription>
						</div>
					</div>
				</div>

				<div className="p-6 pt-4 space-y-5">
					{/* Segmented Pill Tabs */}
					<div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1 text-xs font-semibold">
						<button
							type="button"
							onClick={() => setActiveTab("signin")}
							className={`py-2 text-center rounded-lg transition-all cursor-pointer ${
								activeTab === "signin"
									? "bg-background text-foreground font-bold shadow-xs"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							ورود به حساب
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("signup")}
							className={`py-2 text-center rounded-lg transition-all cursor-pointer ${
								activeTab === "signup"
									? "bg-background text-foreground font-bold shadow-xs"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							عضویت سریع
						</button>
					</div>

					{/* 1-Click Quick Demo Login CTA */}
					<Button
						type="button"
						variant="secondary"
						onClick={handleQuickDemoLogin}
						className="w-full h-11 text-xs font-bold gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 rounded-xl shadow-2xs transition-all"
					>
						<Sparkles className="size-4" />
						ورود فوری با حساب دمو (یک کلیک)
					</Button>

					<div className="relative flex items-center justify-center">
						<div className="border-t w-full border-border/80" />
						<span className="bg-background px-3 text-[11px] text-muted-foreground shrink-0 font-medium">
							یا ورود با اطلاعات دلخواه
						</span>
					</div>

					{/* Forms with Animated Height Transition */}
					<AnimatedHeight>
						{activeTab === "signin" ? (
							<form
								key="signin-form"
								onSubmit={handleSignIn}
								className="space-y-3.5"
							>
								<div className="space-y-1.5 text-right">
									<label
										htmlFor="signin-email"
										className="text-xs font-semibold text-foreground cursor-pointer block"
									>
										ایمیل کاربری
									</label>
									<Input
										id="signin-email"
										type="email"
										placeholder="demo@maskanscan.ir"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="text-xs h-10 rounded-xl bg-card"
										dir="ltr"
									/>
								</div>

								<div className="space-y-1.5 text-right">
									<label
										htmlFor="signin-password"
										className="text-xs font-semibold text-foreground cursor-pointer block"
									>
										رمز عبور
									</label>
									<Input
										id="signin-password"
										type="password"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="text-xs h-10 rounded-xl bg-card"
										dir="ltr"
									/>
								</div>

								<Button
									type="submit"
									className="w-full h-10.5 text-xs font-bold mt-1 rounded-xl shadow-md cursor-pointer"
								>
									ورود به سامانه
								</Button>
							</form>
						) : (
							<form
								key="signup-form"
								onSubmit={handleSignUp}
								className="space-y-3.5"
							>
								<div className="space-y-1.5 text-right">
									<label
										htmlFor="signup-name"
										className="text-xs font-semibold text-foreground cursor-pointer block"
									>
										نام و نام خانوادگی
									</label>
									<Input
										id="signup-name"
										type="text"
										placeholder="مثال: کاربر جدید"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="text-xs h-10 rounded-xl bg-card"
									/>
								</div>

								<div className="space-y-1.5 text-right">
									<label
										htmlFor="signup-email"
										className="text-xs font-semibold text-foreground cursor-pointer block"
									>
										ایمیل
									</label>
									<Input
										id="signup-email"
										type="email"
										placeholder="user@maskanscan.ir"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="text-xs h-10 rounded-xl bg-card"
										dir="ltr"
									/>
								</div>

								<div className="space-y-1.5 text-right">
									<label
										htmlFor="signup-password"
										className="text-xs font-semibold text-foreground cursor-pointer block"
									>
										رمز عبور
									</label>
									<Input
										id="signup-password"
										type="password"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="text-xs h-10 rounded-xl bg-card"
										dir="ltr"
									/>
								</div>

								<Button
									type="submit"
									className="w-full h-10.5 text-xs font-bold mt-1 rounded-xl shadow-md cursor-pointer"
								>
									ثبت نام در مسکن‌اسکن
								</Button>
							</form>
						)}
					</AnimatedHeight>
				</div>
			</DialogContent>
		</Dialog>
	);
}

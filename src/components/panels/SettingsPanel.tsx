"use client";

import { useTheme } from "@wrksz/themes/client";
import {
	Check,
	Database,
	Globe,
	LogOut,
	Moon,
	Sparkles,
	Sun,
	Trash2,
	User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MAP_STYLES } from "@/lib/map-styles";
import { useDemoAuthStore } from "@/store/demo-auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useMapStore } from "@/store/map-store";
import { useSavedSearchesStore } from "@/store/saved-searches-store";

export function SettingsPanel() {
	const { theme, setTheme } = useTheme();
	const setMapTheme = useMapStore((s) => s.setMapTheme);
	const [isAuthOpen, setIsAuthOpen] = useState(false);

	const user = useDemoAuthStore((s) => s.user);
	const isAuthenticated = useDemoAuthStore((s) => s.isAuthenticated);
	const signOut = useDemoAuthStore((s) => s.signOut);

	const mapStyle = useMapStore((s) => s.mapStyle);
	const setMapStyle = useMapStore((s) => s.setMapStyle);
	const activeOverlays = useMapStore((s) => s.activeOverlays);
	const toggleOverlay = useMapStore((s) => s.toggleOverlay);

	const favoriteCount = useFavoritesStore((s) => s.favoriteListings.length);
	const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

	const savedSearchesCount = useSavedSearchesStore(
		(s) => s.savedSearches.length,
	);
	const clearAllSearches = useSavedSearchesStore((s) => s.clearAllSearches);

	const handleResetCache = () => {
		clearFavorites();
		clearAllSearches();
		toast.success("داده‌های محلی و حافظه موقت با موفقیت پاکسازی شد.");
	};

	return (
		<div className="flex h-full flex-col bg-background text-right" dir="rtl">
			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{/* 1. User Profile Section */}
				<div className="rounded-2xl border bg-card p-4 space-y-3 shadow-2xs">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="size-11 rounded-xl border">
								<AvatarImage src={user?.avatar} alt={user?.name ?? "User"} />
								<AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-sm">
									{user?.name?.[0] ?? "؟"}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-foreground">
										{user?.name ?? "کاربر مهمان"}
									</h3>
									<Badge
										variant="secondary"
										className="bg-primary/15 text-primary text-[10px] font-bold"
									>
										{user?.plan === "pro" ? "اشتراک ویژه Pro" : "کاربر رایگان"}
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground mt-0.5">
									{user?.email ?? "ورود جهت ذخیره در فضای ابری"}
								</p>
							</div>
						</div>
					</div>

					<div className="pt-2 flex gap-2">
						{isAuthenticated ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									signOut();
									toast.info("از حساب کاربری خارج شدید.");
								}}
								className="flex-1 h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5 rounded-xl"
							>
								<LogOut className="size-3.5" />
								خروج از حساب
							</Button>
						) : (
							<Button
								size="sm"
								onClick={() => setIsAuthOpen(true)}
								className="flex-1 h-8 text-xs font-bold gap-1.5 rounded-xl"
							>
								<User className="size-3.5" />
								ورود یا ایجاد حساب
							</Button>
						)}
					</div>
				</div>

				<Separator />

				{/* 2. Appearance & Theme */}
				<div className="space-y-3">
					<div className="space-y-0.5">
						<h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
							<Moon className="size-3.5 text-primary" />
							<span>پوسته و ظاهر برنامه</span>
						</h4>
						<p className="text-[11px] text-muted-foreground">
							انتخاب تم تاریک، روشن یا هماهنگ با سیستم‌عامل
						</p>
					</div>

					<div className="grid grid-cols-3 gap-2">
						{[
							{ id: "light", label: "روشن", icon: Sun },
							{ id: "dark", label: "تاریک", icon: Moon },
							{ id: "system", label: "سیستم", icon: Sparkles },
						].map((t) => {
							const Icon = t.icon;
							const isSelected = theme === t.id;
							return (
								<button
									key={t.id}
									type="button"
									onClick={() => {
										setTheme(t.id as "light" | "dark" | "system");
										if (t.id === "dark" || t.id === "light") {
											setMapTheme(t.id);
										}
									}}
									className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
										isSelected
											? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs"
											: "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
									}`}
								>
									<Icon className="size-4" />
									<span>{t.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				<Separator />

				{/* 3. Map Preferences & Overlays */}
				<div className="space-y-3">
					<div className="space-y-0.5">
						<h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
							<Globe className="size-3.5 text-primary" />
							<span>تنظیمات نقشه و لایه‌ها</span>
						</h4>
						<p className="text-[11px] text-muted-foreground">
							پوسته پیش‌فرض نقشه و وضعیت لایه‌های کمکی
						</p>
					</div>

					{/* Map Style Preset Cards */}
					<div className="grid grid-cols-2 gap-2">
						{MAP_STYLES.map((style) => {
							const isCurrent = mapStyle === style.url;
							return (
								<button
									key={style.id}
									type="button"
									onClick={() => setMapStyle(style.url)}
									className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition-all ${
										isCurrent
											? "border-primary bg-primary/10 text-primary shadow-xs"
											: "border-border bg-card text-muted-foreground hover:text-foreground"
									}`}
								>
									<span className="truncate">{style.name}</span>
									{isCurrent && (
										<Check className="size-3.5 text-primary shrink-0" />
									)}
								</button>
							);
						})}
					</div>

					{/* Transit Overlay Toggles */}
					<div className="space-y-2 pt-2">
						<div className="flex items-center justify-between rounded-xl border p-2.5 bg-card">
							<div className="space-y-0.5">
								<label
									htmlFor="metro-toggle"
									className="text-xs font-semibold cursor-pointer"
								>
									خطوط و ایستگاه‌های مترو
								</label>
								<p className="text-[10px] text-muted-foreground">
									نمایش تمام خطوط ۱ تا ۷ متروی تهران
								</p>
							</div>
							<Switch
								id="metro-toggle"
								checked={activeOverlays.includes("metro")}
								onCheckedChange={() => toggleOverlay("metro")}
							/>
						</div>

						<div className="flex items-center justify-between rounded-xl border p-2.5 bg-card">
							<div className="space-y-0.5">
								<label
									htmlFor="brt-toggle"
									className="text-xs font-semibold cursor-pointer"
								>
									خطوط اتوبوس تندرو (BRT)
								</label>
								<p className="text-[10px] text-muted-foreground">
									نمایش ایستگاه‌ها و مسیرهای بی‌آرتی تهران
								</p>
							</div>
							<Switch
								id="brt-toggle"
								checked={activeOverlays.includes("brt")}
								onCheckedChange={() => toggleOverlay("brt")}
							/>
						</div>
					</div>
				</div>

				<Separator />

				{/* 4. Data Management & Storage */}
				<div className="space-y-3">
					<div className="space-y-0.5">
						<h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
							<Database className="size-3.5 text-primary" />
							<span>مدیریت حافظه و داده‌های محلی</span>
						</h4>
						<p className="text-[11px] text-muted-foreground">
							{favoriteCount} ملک نشان‌شده • {savedSearchesCount} جستجوی ذخیره
						</p>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={handleResetCache}
						className="w-full h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5 rounded-xl"
					>
						<Trash2 className="size-3.5" />
						پاکسازی داده‌های محلی و کش مرورگر
					</Button>
				</div>

				<Separator />

				{/* 5. About & Version Info */}
				<div className="rounded-xl border bg-muted/30 p-3.5 space-y-2 text-center text-xs text-muted-foreground">
					<p className="font-bold text-foreground">
						مسکن‌اسکن (MaskanScan) — نسخه ۱.۰.۰
					</p>
					<p className="text-[11px] leading-relaxed">
						سامانه هوشمند پایش و تجمیع آگهی‌های رهن و اجاره تهران
					</p>
				</div>
			</div>

			<AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
		</div>
	);
}

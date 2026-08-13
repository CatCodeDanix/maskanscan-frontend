"use client";

import {
	Building2,
	ChevronDown,
	Home,
	Info,
	MapPin,
	Maximize2,
	RotateCcw,
	Search,
	SlidersHorizontal,
	User,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatToman } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useListingStore } from "@/store/listing-store";

function SectionHeader({
	icon: Icon,
	title,
	subtitle,
}: {
	icon?: React.ComponentType<{ className?: string }>;
	title: string;
	subtitle?: string;
}) {
	return (
		<div className="mb-2 space-y-0.5 text-right">
			<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
				{Icon && <Icon className="size-3.5 text-primary" />}
				<span>{title}</span>
			</div>
			{subtitle && (
				<p className="text-[11px] text-muted-foreground">{subtitle}</p>
			)}
		</div>
	);
}

function RangeRow({
	minValue,
	maxValue,
	onMinChange,
	onMaxChange,
	placeholderMin = "از",
	placeholderMax = "تا",
	suffix = "تومان",
}: {
	minValue?: number;
	maxValue?: number;
	onMinChange: (val: number | undefined) => void;
	onMaxChange: (val: number | undefined) => void;
	placeholderMin?: string;
	placeholderMax?: string;
	suffix?: string;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-2">
				<Input
					type="number"
					placeholder={placeholderMin}
					value={minValue ?? ""}
					onChange={(e) =>
						onMinChange(e.target.value ? Number(e.target.value) : undefined)
					}
					className="h-9 text-xs"
					dir="ltr"
				/>
				<span className="text-xs text-muted-foreground">تا</span>
				<Input
					type="number"
					placeholder={placeholderMax}
					value={maxValue ?? ""}
					onChange={(e) =>
						onMaxChange(e.target.value ? Number(e.target.value) : undefined)
					}
					className="h-9 text-xs"
					dir="ltr"
				/>
			</div>
			{(minValue !== undefined || maxValue !== undefined) && (
				<div className="flex justify-between text-[11px] text-primary font-medium px-1">
					<span>
						{minValue !== undefined
							? `${formatToman(minValue)} ${suffix}`
							: "از ۰"}
					</span>
					<span>
						{maxValue !== undefined
							? `${formatToman(maxValue)} ${suffix}`
							: "بدون سقف"}
					</span>
				</div>
			)}
		</div>
	);
}

const BEDROOM_PRESETS = [
	{ label: "همه", min: undefined, max: undefined },
	{ label: "بدون خواب", min: 0, max: 0 },
	{ label: "۱ خواب", min: 1, max: 1 },
	{ label: "۲ خواب", min: 2, max: 2 },
	{ label: "۳ خواب", min: 3, max: 3 },
	{ label: "۴+ خواب", min: 4, max: undefined },
] as const;

export function FiltersPanel() {
	const [showEquivalent, setShowEquivalent] = useState(false);

	// Staged Draft Filters
	const draft = useListingStore((s) => s.draftFilters);
	const setDraft = useListingStore((s) => s.setDraft);
	const patchDraft = useListingStore((s) => s.patchDraft);
	const applyDraftFilters = useListingStore((s) => s.applyDraftFilters);
	const resetDraftFilters = useListingStore((s) => s.resetDraftFilters);

	const locationTree = useListingStore((s) => s.locationTree);
	const isLoading = useListingStore((s) => s.isLoading);
	const total = useListingStore((s) => s.total);

	const handleApply = useCallback(() => {
		applyDraftFilters();
	}, [applyDraftFilters]);

	const handleReset = useCallback(() => {
		resetDraftFilters();
		applyDraftFilters();
	}, [resetDraftFilters, applyDraftFilters]);

	// Location hierarchy resolution based on draft city
	const selectedProvince = locationTree.find((p) =>
		p.cities.some((c) => c.cityId === draft.city),
	);
	const cities = selectedProvince?.cities ?? [];
	const selectedCity = cities.find((c) => c.cityId === draft.city);
	const districts = selectedCity?.districts ?? [];

	return (
		<div className="flex h-full flex-col bg-background text-right" dir="rtl">
			<div className="flex-1 overflow-y-auto p-4 space-y-6">
				{/* Deal Type Switcher */}
				<div>
					<SectionHeader icon={Home} title="نوع معامله" />
					<div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
						{(["rent", "buy"] as const).map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => {
									patchDraft({
										dealType: t,
										city: "",
										district: "",
										bedrooms: undefined,
										minBedrooms: undefined,
										maxBedrooms: undefined,
									});
								}}
								className={cn(
									"flex items-center justify-center rounded-lg py-2 text-xs font-semibold transition-all",
									draft.dealType === t
										? "bg-background text-primary shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{t === "rent" ? "رهن و اجاره" : "خرید و فروش"}
							</button>
						))}
					</div>
				</div>

				<Separator />

				{/* Location taxonomy */}
				<div className="space-y-3">
					<SectionHeader
						icon={MapPin}
						title="استان و شهر"
						subtitle="انتخاب محدوده جغرافیایی جستجو"
					/>
					<div className="space-y-2">
						<select
							className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary"
							value={selectedProvince?.provinceId ?? ""}
							onChange={(e) => {
								const prov = locationTree.find(
									(p) => p.provinceId === e.target.value,
								);
								patchDraft({
									city: prov?.cities[0]?.cityId ?? "",
									district: "",
								});
							}}
						>
							<option value="">همه استان‌ها (سراسر کشور)</option>
							{locationTree.map((p) => (
								<option key={p.provinceId} value={p.provinceId}>
									{p.provinceName}
								</option>
							))}
						</select>

						{cities.length > 0 && (
							<select
								className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary"
								value={draft.city}
								onChange={(e) => {
									patchDraft({ city: e.target.value, district: "" });
								}}
							>
								<option value="">همه شهرهای استان</option>
								{cities.map((c) => (
									<option key={c.cityId} value={c.cityId}>
										{c.cityName}
									</option>
								))}
							</select>
						)}

						{districts.length > 0 && (
							<select
								className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary"
								value={draft.district}
								onChange={(e) => setDraft("district", e.target.value)}
							>
								<option value="">همه محله‌ها</option>
								{districts.map((d) => (
									<option key={d.districtId} value={d.districtId}>
										{d.districtName}
									</option>
								))}
							</select>
						)}
					</div>
				</div>

				<Separator />

				{/* Primary Pricing Filters: Exact Deposit & Rent */}
				{draft.dealType === "rent" && (
					<div className="space-y-4">
						{/* Exact Deposit */}
						<div>
							<SectionHeader
								title="مبلغ رهن / ودیعه مستقیم (تومان)"
								subtitle="تعیین دقیق حداقل و حداکثر رهن"
							/>
							<RangeRow
								minValue={draft.minDeposit}
								maxValue={draft.maxDeposit}
								onMinChange={(val) => setDraft("minDeposit", val)}
								onMaxChange={(val) => setDraft("maxDeposit", val)}
								placeholderMin="حداقل رهن (تومان)"
								placeholderMax="حداکثر رهن (تومان)"
							/>
						</div>

						{/* Exact Monthly Rent */}
						<div>
							<SectionHeader
								title="اجاره ماهانه مستقیم (تومان)"
								subtitle="تعیین دقیق حداقل و حداکثر اجاره ماهانه"
							/>
							<RangeRow
								minValue={draft.minRent}
								maxValue={draft.maxRent}
								onMinChange={(val) => setDraft("minRent", val)}
								onMaxChange={(val) => setDraft("maxRent", val)}
								placeholderMin="حداقل اجاره"
								placeholderMax="حداکثر اجاره"
							/>
						</div>

						{/* Optional Equivalent Deposit Accordion */}
						<div className="rounded-xl border border-border bg-card p-3 space-y-2">
							<button
								type="button"
								onClick={() => setShowEquivalent(!showEquivalent)}
								className="flex w-full items-center justify-between text-xs font-semibold"
							>
								<div className="flex items-center gap-1.5 text-primary">
									<Info className="size-3.5" />
									<span>فیلتر اختیاری: رهن کامل معادل (معادل‌سازی)</span>
								</div>
								<ChevronDown
									className={cn(
										"size-4 transition-transform",
										showEquivalent && "rotate-180",
									)}
								/>
							</button>

							{(showEquivalent ||
								draft.minEquivalentDeposit !== undefined ||
								draft.maxEquivalentDeposit !== undefined) && (
								<div className="pt-2 space-y-2">
									<p className="text-[11px] text-muted-foreground">
										تبدیل خودکار اجاره ماهانه به رهن کامل جهت جستجو بر اساس
										بودجه کلی:
									</p>
									<RangeRow
										minValue={draft.minEquivalentDeposit}
										maxValue={draft.maxEquivalentDeposit}
										onMinChange={(val) => setDraft("minEquivalentDeposit", val)}
										onMaxChange={(val) => setDraft("maxEquivalentDeposit", val)}
										placeholderMin="حداقل رهن معادل (تومان)"
										placeholderMax="حداکثر رهن معادل (تومان)"
									/>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Buy Pricing Filters */}
				{draft.dealType === "buy" && (
					<div className="space-y-4">
						<div>
							<SectionHeader title="قیمت کل (تومان)" />
							<RangeRow
								minValue={draft.minPrice}
								maxValue={draft.maxPrice}
								onMinChange={(val) => setDraft("minPrice", val)}
								onMaxChange={(val) => setDraft("maxPrice", val)}
								placeholderMin="حداقل قیمت کل"
								placeholderMax="حداکثر قیمت کل"
							/>
						</div>

						<div>
							<SectionHeader title="قیمت هر متر مربع (تومان)" />
							<RangeRow
								minValue={draft.minPricePerSqMeter}
								maxValue={draft.maxPricePerSqMeter}
								onMinChange={(val) => setDraft("minPricePerSqMeter", val)}
								onMaxChange={(val) => setDraft("maxPricePerSqMeter", val)}
								placeholderMin="حداقل هر متر"
								placeholderMax="حداکثر هر متر"
							/>
						</div>
					</div>
				)}

				{/* Exclude Agreed / Negotiable Price Switch */}
				<div className="flex items-center justify-between rounded-xl border bg-card p-3 shadow-2xs">
					<div className="space-y-0.5 text-right">
						<label
							htmlFor="exclude-agreed-switch"
							className="text-xs font-semibold text-foreground cursor-pointer"
						>
							حذف آگهی‌های قیمت توافقی
						</label>
						<p className="text-[11px] text-muted-foreground">
							فقط آگهی‌های دارای قیمت و رهن دقیق نمایش داده شوند
						</p>
					</div>
					<Switch
						id="exclude-agreed-switch"
						checked={draft.excludeAgreed}
						onCheckedChange={(val) => setDraft("excludeAgreed", val)}
					/>
				</div>

				<Separator />

				{/* Bedrooms Range Filter */}
				<div className="space-y-3">
					<SectionHeader
						icon={Building2}
						title="تعداد اتاق خواب"
						subtitle="انتخاب تعداد یا تعیین بازه دلخواه"
					/>
					<div className="flex flex-wrap gap-1.5">
						{BEDROOM_PRESETS.map((preset) => {
							const isSelected =
								draft.bedrooms === preset.min && preset.min === preset.max;
							return (
								<button
									key={preset.label}
									type="button"
									onClick={() => {
										if (preset.min === undefined) {
											patchDraft({
												bedrooms: undefined,
												minBedrooms: undefined,
												maxBedrooms: undefined,
											});
										} else {
											patchDraft({
												bedrooms: preset.min,
												minBedrooms: undefined,
												maxBedrooms: undefined,
											});
										}
									}}
									className={cn(
										"rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
										isSelected
											? "border-primary bg-primary text-primary-foreground shadow-xs"
											: "border-input bg-background hover:border-primary/50 hover:bg-accent",
									)}
								>
									{preset.label}
								</button>
							);
						})}
					</div>

					<div className="pt-2">
						<p className="mb-1 text-[11px] text-muted-foreground font-medium">
							تعیین بازه حداقل و حداکثر اتاق:
						</p>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								placeholder="حداقل خواب"
								value={draft.minBedrooms ?? ""}
								onChange={(e) =>
									setDraft(
										"minBedrooms",
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								className="h-8 text-xs"
								dir="ltr"
							/>
							<span className="text-xs text-muted-foreground">تا</span>
							<Input
								type="number"
								placeholder="حداکثر خواب"
								value={draft.maxBedrooms ?? ""}
								onChange={(e) =>
									setDraft(
										"maxBedrooms",
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								className="h-8 text-xs"
								dir="ltr"
							/>
						</div>
					</div>
				</div>

				<Separator />

				{/* Area Filter */}
				<div>
					<SectionHeader icon={Maximize2} title="متراژ زیربنا (متر مربع)" />
					<div className="flex items-center gap-2">
						<Input
							type="number"
							placeholder="حداقل متر"
							value={draft.minArea ?? ""}
							onChange={(e) =>
								setDraft(
									"minArea",
									e.target.value ? Number(e.target.value) : undefined,
								)
							}
							className="h-9 text-xs"
							dir="ltr"
						/>
						<span className="text-xs text-muted-foreground">تا</span>
						<Input
							type="number"
							placeholder="حداکثر متر"
							value={draft.maxArea ?? ""}
							onChange={(e) =>
								setDraft(
									"maxArea",
									e.target.value ? Number(e.target.value) : undefined,
								)
							}
							className="h-9 text-xs"
							dir="ltr"
						/>
					</div>
				</div>

				<Separator />

				{/* Publisher Type */}
				<div>
					<SectionHeader icon={User} title="آگهی‌دهنده" />
					<div className="grid grid-cols-3 gap-1.5">
						{[
							{ id: "all", label: "همه" },
							{ id: "personal", label: "شخصی" },
							{ id: "agency", label: "آژانس املاک" },
						].map((p) => (
							<button
								key={p.id}
								type="button"
								onClick={() =>
									setDraft(
										"publisherType",
										p.id as "all" | "personal" | "agency",
									)
								}
								className={cn(
									"rounded-lg border py-1.5 text-xs font-medium transition-all",
									draft.publisherType === p.id
										? "border-primary bg-primary text-primary-foreground"
										: "border-input bg-background hover:bg-accent",
								)}
							>
								{p.label}
							</button>
						))}
					</div>
				</div>

				<Separator />

				{/* Amenities & Toggles */}
				<div className="space-y-3">
					<SectionHeader icon={SlidersHorizontal} title="امکانات کلیدی ملک" />
					<div className="space-y-2.5">
						<div className="flex items-center justify-between rounded-lg border p-2.5">
							<label
								className="text-xs font-medium cursor-pointer"
								htmlFor="filter-parking"
							>
								پارکینگ اختصاصی
							</label>
							<Switch
								id="filter-parking"
								checked={draft.hasParking}
								onCheckedChange={(val) => setDraft("hasParking", val)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-2.5">
							<label
								className="text-xs font-medium cursor-pointer"
								htmlFor="filter-elevator"
							>
								آسانسور
							</label>
							<Switch
								id="filter-elevator"
								checked={draft.hasElevator}
								onCheckedChange={(val) => setDraft("hasElevator", val)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-2.5">
							<label
								className="text-xs font-medium cursor-pointer"
								htmlFor="filter-storage"
							>
								انباری
							</label>
							<Switch
								id="filter-storage"
								checked={draft.hasStorage}
								onCheckedChange={(val) => setDraft("hasStorage", val)}
							/>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-2.5">
							<label
								className="text-xs font-medium cursor-pointer"
								htmlFor="filter-balcony"
							>
								بالکن / تراس
							</label>
							<Switch
								id="filter-balcony"
								checked={draft.hasBalcony}
								onCheckedChange={(val) => setDraft("hasBalcony", val)}
							/>
						</div>

						{draft.dealType === "rent" && (
							<div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
								<label
									className="text-xs font-medium text-emerald-700 dark:text-emerald-400 cursor-pointer"
									htmlFor="filter-convertible"
								>
									امکان تبدیل رهن و اجاره (قابل تبدیل)
								</label>
								<Switch
									id="filter-convertible"
									checked={draft.isConvertible}
									onCheckedChange={(val) => setDraft("isConvertible", val)}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Footer buttons */}
			<div className="sticky bottom-0 flex gap-2 border-t bg-background/95 p-3 backdrop-blur-xs">
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5 text-xs"
					onClick={handleReset}
				>
					<RotateCcw className="size-3.5" />
					پاکسازی
				</Button>
				<Button
					size="sm"
					className="flex-1 gap-1.5 text-xs font-bold"
					onClick={handleApply}
					disabled={isLoading}
				>
					<Search className="size-3.5" />
					{isLoading
						? "در حال جستجو..."
						: `مشاهده (${total.toLocaleString("fa-IR")}) آگهی`}
				</Button>
			</div>
		</div>
	);
}

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
		<div className="mb-3 space-y-0.5">
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
	placeholderMin,
	placeholderMax,
	suffix = "",
}: {
	minValue: number | undefined;
	maxValue: number | undefined;
	onMinChange: (v: number | undefined) => void;
	onMaxChange: (v: number | undefined) => void;
	placeholderMin: string;
	placeholderMax: string;
	suffix?: string;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Input
						type="number"
						placeholder={placeholderMin}
						value={minValue ?? ""}
						onChange={(e) =>
							onMinChange(e.target.value ? Number(e.target.value) : undefined)
						}
						className="h-9 text-xs ltr text-left pl-2 pr-2"
						dir="ltr"
					/>
				</div>
				<span className="shrink-0 text-xs font-medium text-muted-foreground">
					تا
				</span>
				<div className="relative flex-1">
					<Input
						type="number"
						placeholder={placeholderMax}
						value={maxValue ?? ""}
						onChange={(e) =>
							onMaxChange(e.target.value ? Number(e.target.value) : undefined)
						}
						className="h-9 text-xs ltr text-left pl-2 pr-2"
						dir="ltr"
					/>
				</div>
			</div>
			{(minValue !== undefined || maxValue !== undefined) && (
				<div className="flex items-center justify-between text-[11px] text-primary font-medium px-1">
					<span>
						{minValue !== undefined
							? `${formatToman(minValue)} ${suffix}`
							: "از ابتدا"}
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

	// Granular Zustand selectors
	const dealType = useListingStore((s) => s.dealType);
	const city = useListingStore((s) => s.city);
	const district = useListingStore((s) => s.district);
	const bedrooms = useListingStore((s) => s.bedrooms);
	const minBedrooms = useListingStore((s) => s.minBedrooms);
	const maxBedrooms = useListingStore((s) => s.maxBedrooms);
	const hasParking = useListingStore((s) => s.hasParking);
	const hasElevator = useListingStore((s) => s.hasElevator);
	const hasStorage = useListingStore((s) => s.hasStorage);
	const hasBalcony = useListingStore((s) => s.hasBalcony);
	const isConvertible = useListingStore((s) => s.isConvertible);
	const publisherType = useListingStore((s) => s.publisherType);
	const minArea = useListingStore((s) => s.minArea);
	const maxArea = useListingStore((s) => s.maxArea);

	// Exact Rent & Deposit
	const minDeposit = useListingStore((s) => s.minDeposit);
	const maxDeposit = useListingStore((s) => s.maxDeposit);
	const minRent = useListingStore((s) => s.minRent);
	const maxRent = useListingStore((s) => s.maxRent);

	// Optional Converted Full Deposit
	const minEquivalentDeposit = useListingStore((s) => s.minEquivalentDeposit);
	const maxEquivalentDeposit = useListingStore((s) => s.maxEquivalentDeposit);

	// Buy
	const minPrice = useListingStore((s) => s.minPrice);
	const maxPrice = useListingStore((s) => s.maxPrice);
	const minPricePerSqMeter = useListingStore((s) => s.minPricePerSqMeter);
	const maxPricePerSqMeter = useListingStore((s) => s.maxPricePerSqMeter);

	const locationTree = useListingStore((s) => s.locationTree);
	const isLoading = useListingStore((s) => s.isLoading);
	const total = useListingStore((s) => s.total);

	// Action selectors
	const setDealType = useListingStore((s) => s.setDealType);
	const setCity = useListingStore((s) => s.setCity);
	const setDistrict = useListingStore((s) => s.setDistrict);
	const setBedrooms = useListingStore((s) => s.setBedrooms);
	const setMinBedrooms = useListingStore((s) => s.setMinBedrooms);
	const setMaxBedrooms = useListingStore((s) => s.setMaxBedrooms);
	const setHasParking = useListingStore((s) => s.setHasParking);
	const setHasElevator = useListingStore((s) => s.setHasElevator);
	const setHasStorage = useListingStore((s) => s.setHasStorage);
	const setHasBalcony = useListingStore((s) => s.setHasBalcony);
	const setIsConvertible = useListingStore((s) => s.setIsConvertible);
	const setPublisherType = useListingStore((s) => s.setPublisherType);
	const setMinArea = useListingStore((s) => s.setMinArea);
	const setMaxArea = useListingStore((s) => s.setMaxArea);
	const setMinDeposit = useListingStore((s) => s.setMinDeposit);
	const setMaxDeposit = useListingStore((s) => s.setMaxDeposit);
	const setMinRent = useListingStore((s) => s.setMinRent);
	const setMaxRent = useListingStore((s) => s.setMaxRent);
	const setMinEquivalentDeposit = useListingStore(
		(s) => s.setMinEquivalentDeposit,
	);
	const setMaxEquivalentDeposit = useListingStore(
		(s) => s.setMaxEquivalentDeposit,
	);
	const setMinPrice = useListingStore((s) => s.setMinPrice);
	const setMaxPrice = useListingStore((s) => s.setMaxPrice);
	const setMinPricePerSqMeter = useListingStore((s) => s.setMinPricePerSqMeter);
	const setMaxPricePerSqMeter = useListingStore((s) => s.setMaxPricePerSqMeter);

	const applyFilters = useListingStore((s) => s.applyFilters);
	const resetFilters = useListingStore((s) => s.resetFilters);

	const handleApply = useCallback(() => {
		void applyFilters();
	}, [applyFilters]);

	const handleReset = useCallback(() => {
		resetFilters();
		void applyFilters();
	}, [resetFilters, applyFilters]);

	// Location hierarchy resolution
	const selectedProvince = locationTree.find((p) =>
		p.cities.some((c) => c.cityId === city),
	);
	const cities = selectedProvince?.cities ?? [];
	const selectedCity = cities.find((c) => c.cityId === city);
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
								onClick={() => setDealType(t)}
								className={cn(
									"flex items-center justify-center rounded-lg py-2 text-xs font-semibold transition-all",
									dealType === t
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
								setCity(prov?.cities[0]?.cityId ?? "");
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
								value={city}
								onChange={(e) => setCity(e.target.value)}
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
								value={district}
								onChange={(e) => setDistrict(e.target.value)}
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
				{dealType === "rent" && (
					<div className="space-y-4">
						{/* Exact Deposit */}
						<div>
							<SectionHeader
								title="مبلغ رهن / ودیعه مستقیم (تومان)"
								subtitle="تعیین دقیق حداقل و حداکثر رهن"
							/>
							<RangeRow
								minValue={minDeposit}
								maxValue={maxDeposit}
								onMinChange={setMinDeposit}
								onMaxChange={setMaxDeposit}
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
								minValue={minRent}
								maxValue={maxRent}
								onMinChange={setMinRent}
								onMaxChange={setMaxRent}
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
								minEquivalentDeposit !== undefined ||
								maxEquivalentDeposit !== undefined) && (
								<div className="pt-2 space-y-2">
									<p className="text-[11px] text-muted-foreground">
										تبدیل خودکار اجاره ماهانه به رهن کامل جهت جستجو بر اساس
										بودجه کلی:
									</p>
									<RangeRow
										minValue={minEquivalentDeposit}
										maxValue={maxEquivalentDeposit}
										onMinChange={setMinEquivalentDeposit}
										onMaxChange={setMaxEquivalentDeposit}
										placeholderMin="حداقل رهن معادل (تومان)"
										placeholderMax="حداکثر رهن معادل (تومان)"
									/>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Buy Pricing Filters */}
				{dealType === "buy" && (
					<div className="space-y-4">
						<div>
							<SectionHeader title="قیمت کل (تومان)" />
							<RangeRow
								minValue={minPrice}
								maxValue={maxPrice}
								onMinChange={setMinPrice}
								onMaxChange={setMaxPrice}
								placeholderMin="حداقل قیمت کل"
								placeholderMax="حداکثر قیمت کل"
							/>
						</div>

						<div>
							<SectionHeader title="قیمت هر متر مربع (تومان)" />
							<RangeRow
								minValue={minPricePerSqMeter}
								maxValue={maxPricePerSqMeter}
								onMinChange={setMinPricePerSqMeter}
								onMaxChange={setMaxPricePerSqMeter}
								placeholderMin="حداقل هر متر"
								placeholderMax="حداکثر هر متر"
							/>
						</div>
					</div>
				)}

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
								bedrooms === preset.min && preset.min === preset.max;
							return (
								<button
									key={preset.label}
									type="button"
									onClick={() => {
										if (preset.min === undefined) {
											setBedrooms(undefined);
											setMinBedrooms(undefined);
											setMaxBedrooms(undefined);
										} else {
											setBedrooms(preset.min);
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
								value={minBedrooms ?? ""}
								onChange={(e) =>
									setMinBedrooms(
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
								value={maxBedrooms ?? ""}
								onChange={(e) =>
									setMaxBedrooms(
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
							value={minArea ?? ""}
							onChange={(e) =>
								setMinArea(e.target.value ? Number(e.target.value) : undefined)
							}
							className="h-9 text-xs"
							dir="ltr"
						/>
						<span className="text-xs text-muted-foreground">تا</span>
						<Input
							type="number"
							placeholder="حداکثر متر"
							value={maxArea ?? ""}
							onChange={(e) =>
								setMaxArea(e.target.value ? Number(e.target.value) : undefined)
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
									setPublisherType(p.id as "all" | "personal" | "agency")
								}
								className={cn(
									"rounded-lg border py-1.5 text-xs font-medium transition-all",
									publisherType === p.id
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
								checked={hasParking}
								onCheckedChange={setHasParking}
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
								checked={hasElevator}
								onCheckedChange={setHasElevator}
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
								checked={hasStorage}
								onCheckedChange={setHasStorage}
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
								checked={hasBalcony}
								onCheckedChange={setHasBalcony}
							/>
						</div>

						{dealType === "rent" && (
							<div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5">
								<label
									className="text-xs font-medium text-emerald-700 dark:text-emerald-400 cursor-pointer"
									htmlFor="filter-convertible"
								>
									امکان تبدیل رهن و اجاره (قابل تبدیل)
								</label>
								<Switch
									id="filter-convertible"
									checked={isConvertible}
									onCheckedChange={setIsConvertible}
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

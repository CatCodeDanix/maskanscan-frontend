"use client";

import { RotateCcw, Search } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useListingStore } from "@/store/listing-store";

// ── Small sub-components ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="mb-2 text-xs font-semibold text-muted-foreground">
			{children}
		</p>
	);
}

function RangeRow({
	minValue,
	maxValue,
	onMinChange,
	onMaxChange,
	placeholderMin,
	placeholderMax,
}: {
	minValue: number | undefined;
	maxValue: number | undefined;
	onMinChange: (v: number | undefined) => void;
	onMaxChange: (v: number | undefined) => void;
	placeholderMin: string;
	placeholderMax: string;
}) {
	const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value ? Number(e.target.value) : undefined;
		onMinChange(v);
	};
	const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value ? Number(e.target.value) : undefined;
		onMaxChange(v);
	};

	return (
		<div className="flex items-center gap-2">
			<Input
				type="number"
				placeholder={placeholderMin}
				value={minValue ?? ""}
				onChange={handleMin}
				className="h-8 text-sm"
				dir="ltr"
			/>
			<span className="shrink-0 text-xs text-muted-foreground">تا</span>
			<Input
				type="number"
				placeholder={placeholderMax}
				value={maxValue ?? ""}
				onChange={handleMax}
				className="h-8 text-sm"
				dir="ltr"
			/>
		</div>
	);
}

const BEDROOM_OPTIONS = [
	{ label: "همه", value: undefined },
	{ label: "استودیو", value: 0 },
	{ label: "۱", value: 1 },
	{ label: "۲", value: 2 },
	{ label: "۳", value: 3 },
	{ label: "۴+", value: 4 },
] as const;

// ── Main component ─────────────────────────────────────────────────────────────
// Each selector is granular so this component only re-renders when the specific
// slice it cares about changes — NOT on every isLoading / listings update.

export function FiltersPanel() {
	// ── Filter state (granular selectors = only re-render when THIS value changes)
	const dealType = useListingStore((s) => s.dealType);
	const city = useListingStore((s) => s.city);
	const district = useListingStore((s) => s.district);
	const bedrooms = useListingStore((s) => s.bedrooms);
	const hasParking = useListingStore((s) => s.hasParking);
	const hasElevator = useListingStore((s) => s.hasElevator);
	const hasStorage = useListingStore((s) => s.hasStorage);
	const minArea = useListingStore((s) => s.minArea);
	const maxArea = useListingStore((s) => s.maxArea);
	const minDeposit = useListingStore((s) => s.minDeposit);
	const maxDeposit = useListingStore((s) => s.maxDeposit);
	const minRent = useListingStore((s) => s.minRent);
	const maxRent = useListingStore((s) => s.maxRent);
	const minPrice = useListingStore((s) => s.minPrice);
	const maxPrice = useListingStore((s) => s.maxPrice);
	const locationTree = useListingStore((s) => s.locationTree);
	const isLoading = useListingStore((s) => s.isLoading);
	const total = useListingStore((s) => s.total);

	// ── Stable action selectors (Zustand actions are referentially stable)
	const setDealType = useListingStore((s) => s.setDealType);
	const setCity = useListingStore((s) => s.setCity);
	const setDistrict = useListingStore((s) => s.setDistrict);
	const setBedrooms = useListingStore((s) => s.setBedrooms);
	const setHasParking = useListingStore((s) => s.setHasParking);
	const setHasElevator = useListingStore((s) => s.setHasElevator);
	const setHasStorage = useListingStore((s) => s.setHasStorage);
	const setMinArea = useListingStore((s) => s.setMinArea);
	const setMaxArea = useListingStore((s) => s.setMaxArea);
	const setMinDeposit = useListingStore((s) => s.setMinDeposit);
	const setMaxDeposit = useListingStore((s) => s.setMaxDeposit);
	const setMinRent = useListingStore((s) => s.setMinRent);
	const setMaxRent = useListingStore((s) => s.setMaxRent);
	const setMinPrice = useListingStore((s) => s.setMinPrice);
	const setMaxPrice = useListingStore((s) => s.setMaxPrice);
	const applyFilters = useListingStore((s) => s.applyFilters);
	const resetFilters = useListingStore((s) => s.resetFilters);
	const fetchListings = useListingStore((s) => s.fetchListings);

	// Stable callbacks (actions are already stable refs — useCallback is just safety)
	const handleApply = useCallback(() => {
		void applyFilters();
	}, [applyFilters]);

	const handleReset = useCallback(() => {
		resetFilters();
		void fetchListings();
	}, [resetFilters, fetchListings]);

	// Cascading location
	const selectedProvince = locationTree.find((p) =>
		p.cities.some((c) => c.cityId === city),
	);
	const cities = selectedProvince?.cities ?? [];
	const selectedCity = cities.find((c) => c.cityId === city);
	const districts = selectedCity?.districts ?? [];

	return (
		<div className="flex flex-col">
			<ScrollArea className="flex-1">
				<div className="space-y-5 p-4">
					{/* Deal Type */}
					<div>
						<SectionLabel>نوع معامله</SectionLabel>
						<div className="flex gap-2">
							{(["rent", "buy"] as const).map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setDealType(t)}
									className={cn(
										"flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
										dealType === t
											? "border-primary bg-primary text-primary-foreground shadow-sm"
											: "hover:border-primary/50 hover:bg-accent",
									)}
								>
									{t === "rent" ? "اجاره" : "خرید"}
								</button>
							))}
						</div>
					</div>

					<Separator />

					{/* Location */}
					<div className="space-y-2">
						<SectionLabel>موقعیت</SectionLabel>

						<select
							className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
							value={selectedProvince?.provinceId ?? ""}
							onChange={(e) => {
								const prov = locationTree.find(
									(p) => p.provinceId === e.target.value,
								);
								setCity(prov?.cities[0]?.cityId ?? "");
							}}
						>
							<option value="">همه استان‌ها</option>
							{locationTree.map((p) => (
								<option key={p.provinceId} value={p.provinceId}>
									{p.provinceName}
								</option>
							))}
						</select>

						{cities.length > 0 && (
							<select
								className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
								value={city}
								onChange={(e) => setCity(e.target.value)}
							>
								<option value="">همه شهرها</option>
								{cities.map((c) => (
									<option key={c.cityId} value={c.cityId}>
										{c.cityName}
									</option>
								))}
							</select>
						)}

						{districts.length > 0 && (
							<select
								className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
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

					<Separator />

					{/* Area */}
					<div>
						<SectionLabel>متراژ (متر مربع)</SectionLabel>
						<RangeRow
							minValue={minArea}
							maxValue={maxArea}
							onMinChange={setMinArea}
							onMaxChange={setMaxArea}
							placeholderMin="حداقل"
							placeholderMax="حداکثر"
						/>
					</div>

					{/* Bedrooms */}
					<div>
						<SectionLabel>تعداد خواب</SectionLabel>
						<div className="flex flex-wrap gap-1.5">
							{BEDROOM_OPTIONS.map((opt) => (
								<button
									key={String(opt.value)}
									type="button"
									onClick={() => setBedrooms(opt.value)}
									className={cn(
										"rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
										bedrooms === opt.value
											? "border-primary bg-primary text-primary-foreground"
											: "hover:border-primary/40 hover:bg-accent",
									)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>

					<Separator />

					{/* Price — rent */}
					{dealType === "rent" && (
						<>
							<div>
								<SectionLabel>رهن (تومان)</SectionLabel>
								<RangeRow
									minValue={minDeposit}
									maxValue={maxDeposit}
									onMinChange={setMinDeposit}
									onMaxChange={setMaxDeposit}
									placeholderMin="حداقل"
									placeholderMax="حداکثر"
								/>
							</div>
							<div>
								<SectionLabel>اجاره ماهانه (تومان)</SectionLabel>
								<RangeRow
									minValue={minRent}
									maxValue={maxRent}
									onMinChange={setMinRent}
									onMaxChange={setMaxRent}
									placeholderMin="حداقل"
									placeholderMax="حداکثر"
								/>
							</div>
						</>
					)}

					{/* Price — buy */}
					{dealType === "buy" && (
						<div>
							<SectionLabel>قیمت کل (تومان)</SectionLabel>
							<RangeRow
								minValue={minPrice}
								maxValue={maxPrice}
								onMinChange={setMinPrice}
								onMaxChange={setMaxPrice}
								placeholderMin="حداقل"
								placeholderMax="حداکثر"
							/>
						</div>
					)}

					<Separator />

					{/* Amenities */}
					<div className="space-y-3">
						<SectionLabel>امکانات</SectionLabel>
						<div className="flex items-center justify-between">
							<label className="text-sm" htmlFor="filter-hasParking">
								پارکینگ
							</label>
							<Switch
								id="filter-hasParking"
								checked={hasParking}
								onCheckedChange={setHasParking}
							/>
						</div>
						<div className="flex items-center justify-between">
							<label className="text-sm" htmlFor="filter-hasElevator">
								آسانسور
							</label>
							<Switch
								id="filter-hasElevator"
								checked={hasElevator}
								onCheckedChange={setHasElevator}
							/>
						</div>
						<div className="flex items-center justify-between">
							<label className="text-sm" htmlFor="filter-hasStorage">
								انباری
							</label>
							<Switch
								id="filter-hasStorage"
								checked={hasStorage}
								onCheckedChange={setHasStorage}
							/>
						</div>
					</div>
				</div>
			</ScrollArea>

			{/* Action buttons — sticky footer */}
			<div className="flex gap-2 border-t p-3">
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5"
					onClick={handleReset}
				>
					<RotateCcw className="size-3.5" />
					پاکسازی
				</Button>
				<Button
					size="sm"
					className="flex-1 gap-1.5"
					onClick={handleApply}
					disabled={isLoading}
				>
					<Search className="size-3.5" />
					{isLoading
						? "در حال جستجو..."
						: `جستجو (${total.toLocaleString("fa-IR")})`}
				</Button>
			</div>
		</div>
	);
}

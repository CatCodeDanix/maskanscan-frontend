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

// ── Small sub-components ────────────────────────────────────────────────────────

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
	suffix,
}: {
	minValue: number | undefined;
	maxValue: number | undefined;
	onMinChange: (v: number | undefined) => void;
	onMaxChange: (v: number | undefined) => void;
	placeholderMin: string;
	placeholderMax: string;
	suffix?: string;
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
			{suffix && (
				<span className="shrink-0 text-xs text-muted-foreground">{suffix}</span>
			)}
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
];

// ── Main component ───────────────────────────────────────────────────────────────

export function FiltersPanel() {
	const store = useListingStore();

	const handleApply = useCallback(() => {
		void store.applyFilters();
	}, [store]);

	const handleReset = useCallback(() => {
		store.resetFilters();
		void store.fetchListings();
	}, [store]);

	// Get cities for selected province
	const selectedProvince = store.locationTree.find((p) =>
		p.cities.some((c) => c.cityId === store.city),
	);
	const cities = selectedProvince?.cities ?? [];
	const selectedCity = cities.find((c) => c.cityId === store.city);
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
									onClick={() => store.setDealType(t)}
									className={cn(
										"flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
										store.dealType === t
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

						{/* Province selector */}
						<select
							className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
							value={selectedProvince?.provinceId ?? ""}
							onChange={(e) => {
								const prov = store.locationTree.find(
									(p) => p.provinceId === e.target.value,
								);
								const firstCity = prov?.cities[0];
								store.setCity(firstCity?.cityId ?? "");
							}}
						>
							<option value="">همه استانها</option>
							{store.locationTree.map((p) => (
								<option key={p.provinceId} value={p.provinceId}>
									{p.provinceName}
								</option>
							))}
						</select>

						{/* City selector */}
						{cities.length > 0 && (
							<select
								className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
								value={store.city}
								onChange={(e) => store.setCity(e.target.value)}
							>
								<option value="">همه شهرها</option>
								{cities.map((c) => (
									<option key={c.cityId} value={c.cityId}>
										{c.cityName}
									</option>
								))}
							</select>
						)}

						{/* District selector */}
						{districts.length > 0 && (
							<select
								className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
								value={store.district}
								onChange={(e) => store.setDistrict(e.target.value)}
							>
								<option value="">همه محلهها</option>
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
							minValue={store.minArea}
							maxValue={store.maxArea}
							onMinChange={store.setMinArea}
							onMaxChange={store.setMaxArea}
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
									onClick={() => store.setBedrooms(opt.value)}
									className={cn(
										"rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
										store.bedrooms === opt.value
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

					{/* Price section — rent */}
					{store.dealType === "rent" && (
						<>
							<div>
								<SectionLabel>رهن (تومان)</SectionLabel>
								<RangeRow
									minValue={store.minDeposit}
									maxValue={store.maxDeposit}
									onMinChange={store.setMinDeposit}
									onMaxChange={store.setMaxDeposit}
									placeholderMin="حداقل"
									placeholderMax="حداکثر"
								/>
							</div>
							<div>
								<SectionLabel>اجاره ماهانه (تومان)</SectionLabel>
								<RangeRow
									minValue={store.minRent}
									maxValue={store.maxRent}
									onMinChange={store.setMinRent}
									onMaxChange={store.setMaxRent}
									placeholderMin="حداقل"
									placeholderMax="حداکثر"
								/>
							</div>
						</>
					)}

					{/* Price section — buy */}
					{store.dealType === "buy" && (
						<div>
							<SectionLabel>قیمت کل (تومان)</SectionLabel>
							<RangeRow
								minValue={store.minPrice}
								maxValue={store.maxPrice}
								onMinChange={store.setMinPrice}
								onMaxChange={store.setMaxPrice}
								placeholderMin="حداقل"
								placeholderMax="حداکثر"
							/>
						</div>
					)}

					<Separator />

					{/* Amenities */}
					<div className="space-y-3">
						<SectionLabel>امکانات</SectionLabel>
						{(
							[
								{
									label: "پارکینگ",
									key: "hasParking",
									value: store.hasParking,
									set: store.setHasParking,
								},
								{
									label: "آسانسور",
									key: "hasElevator",
									value: store.hasElevator,
									set: store.setHasElevator,
								},
								{
									label: "انباری",
									key: "hasStorage",
									value: store.hasStorage,
									set: store.setHasStorage,
								},
							] as const
						).map(({ label, key, value, set }) => (
							<div key={key} className="flex items-center justify-between">
								<label className="text-sm" htmlFor={`filter-${key}`}>
									{label}
								</label>
								<Switch
									id={`filter-${key}`}
									checked={value}
									onCheckedChange={set}
								/>
							</div>
						))}
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
					disabled={store.isLoading}
				>
					<Search className="size-3.5" />
					{store.isLoading
						? "در حال جستجو..."
						: `جستجو (${store.total.toLocaleString("fa-IR")})`}
				</Button>
			</div>
		</div>
	);
}

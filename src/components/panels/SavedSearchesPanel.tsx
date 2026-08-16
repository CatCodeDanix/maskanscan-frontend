"use client";

import {
	Bell,
	BellOff,
	Bookmark,
	Check,
	Edit2,
	Play,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatToman, toPersianDigits } from "@/lib/format";
import { useListingStore } from "@/store/listing-store";
import { useMapStore } from "@/store/map-store";
import { useNavigationStore } from "@/store/navigation-store";
import {
	type SavedSearchItem,
	useSavedSearchesStore,
} from "@/store/saved-searches-store";

export function SavedSearchesPanel() {
	const { current: mapInstance } = useMap();
	const savedSearches = useSavedSearchesStore((s) => s.savedSearches);
	const addSavedSearch = useSavedSearchesStore((s) => s.addSavedSearch);
	const removeSavedSearch = useSavedSearchesStore((s) => s.removeSavedSearch);
	const toggleAlert = useSavedSearchesStore((s) => s.toggleAlert);
	const updateSearchTitle = useSavedSearchesStore((s) => s.updateSearchTitle);
	const clearAllSearches = useSavedSearchesStore((s) => s.clearAllSearches);

	const appliedFilters = useListingStore((s) => s.appliedFilters);
	const patchDraft = useListingStore((s) => s.patchDraft);
	const applyDraftFilters = useListingStore((s) => s.applyDraftFilters);
	const viewportBBox = useMapStore((s) => s.viewportBBox);
	const viewportZoom = useMapStore((s) => s.viewportZoom);
	const setActiveItemId = useNavigationStore((s) => s.setActiveItemId);

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitleValue, setEditTitleValue] = useState("");

	const handleSaveCurrent = () => {
		addSavedSearch(appliedFilters, undefined, viewportBBox, viewportZoom);
		toast.success("جستجوی فعلی با موفقیت ذخیره شد.");
	};

	const handleApplySearch = (item: SavedSearchItem) => {
		patchDraft(item.filters);
		applyDraftFilters();

		if (item.zoom && mapInstance) {
			mapInstance.flyTo({
				zoom: item.zoom,
				duration: 800,
				essential: true,
			});
		}

		toast.success(`فیلترهای «${item.title}» روی نقشه اعمال شد.`);
		setActiveItemId("listings");
	};

	const handleStartEdit = (item: SavedSearchItem) => {
		setEditingId(item.id);
		setEditTitleValue(item.title);
	};

	const handleSaveEdit = (id: string) => {
		updateSearchTitle(id, editTitleValue);
		setEditingId(null);
		toast.success("عنوان جستجو به‌روزرسانی شد.");
	};

	const renderFilterChips = (item: SavedSearchItem) => {
		const f = item.filters;
		const chips: string[] = [];

		if (f.district) chips.push(`محله ${f.district}`);
		if (f.maxDeposit) chips.push(`ودیعه تا ${formatToman(f.maxDeposit)}`);
		if (f.minDeposit) chips.push(`ودیعه از ${formatToman(f.minDeposit)}`);
		if (f.maxRent) chips.push(`اجاره تا ${formatToman(f.maxRent)}`);
		if (f.minRent) chips.push(`اجاره از ${formatToman(f.minRent)}`);
		if (f.bedrooms !== undefined) {
			chips.push(
				f.bedrooms === 0 ? "بدون خواب" : `${toPersianDigits(f.bedrooms)} خواب`,
			);
		}
		if (f.minArea) chips.push(`متراژ +${toPersianDigits(f.minArea)}م`);
		if (f.hasParking) chips.push("پارکینگ");
		if (f.hasElevator) chips.push("آسانسور");
		if (f.hasStorage) chips.push("انباری");
		if (f.hasBalcony) chips.push("بالکن");
		if (f.isConvertible) chips.push("قابل تبدیل");

		return chips.map((chip) => (
			<span
				key={chip}
				className="inline-flex items-center rounded-md bg-muted/90 px-2 py-0.5 text-[11px] font-medium text-foreground/80 border border-border/40"
			>
				{chip}
			</span>
		));
	};

	return (
		<div className="flex h-full flex-col bg-background text-right" dir="rtl">
			{/* Top Action Bar */}
			<div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b bg-background/95 p-3 text-xs backdrop-blur-xs shadow-2xs gap-2">
				<Button
					size="sm"
					onClick={handleSaveCurrent}
					className="flex-1 h-8 text-xs font-bold gap-1.5 rounded-xl shadow-xs"
				>
					<Plus className="size-3.5" />
					ذخیره جستجوی فعلی
				</Button>

				{savedSearches.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAllSearches}
						className="h-8 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
					>
						<Trash2 className="size-3" />
						پاکسازی
					</Button>
				)}
			</div>

			{/* List Content or Empty State */}
			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{savedSearches.length === 0 ? (
					<div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
						<div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
							<Bookmark className="size-6 stroke-1.5" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-bold text-foreground">
								هنوز جستجویی ذخیره نکرده‌اید
							</p>
							<p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
								فیلترهای دلخواه خود را روی نقشه اعمال کرده و با دکمه بالا آن را
								ذخیره کنید.
							</p>
						</div>
					</div>
				) : (
					savedSearches.map((item) => (
						<div
							key={item.id}
							className="rounded-xl border bg-card/80 hover:bg-card p-3.5 space-y-3 shadow-2xs transition-all border-border/70 hover:border-primary/40"
						>
							{/* Search Header & Title */}
							<div className="flex items-start justify-between gap-2">
								<div className="flex-1 min-w-0">
									{editingId === item.id ? (
										<div className="flex items-center gap-1.5">
											<Input
												size={1}
												value={editTitleValue}
												onChange={(e) => setEditTitleValue(e.target.value)}
												className="h-7 text-xs font-bold"
												autoFocus
											/>
											<Button
												size="icon"
												variant="ghost"
												className="size-7 shrink-0 text-primary"
												onClick={() => handleSaveEdit(item.id)}
											>
												<Check className="size-3.5" />
											</Button>
										</div>
									) : (
										<div className="flex items-center gap-1.5 group">
											<h4 className="text-xs font-bold text-foreground truncate">
												{item.title}
											</h4>
											<button
												type="button"
												onClick={() => handleStartEdit(item)}
												className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
												aria-label="ویرایش عنوان"
											>
												<Edit2 className="size-3" />
											</button>
										</div>
									)}
									<span className="text-[10px] text-muted-foreground block mt-0.5">
										تاریخ ایجاد: {item.createdAt}
									</span>
								</div>

								{item.matchCount && (
									<Badge
										variant="secondary"
										className="bg-primary/10 text-primary text-[10px] font-bold shrink-0"
									>
										{toPersianDigits(item.matchCount)} ملک
									</Badge>
								)}
							</div>

							{/* Filter Chips */}
							<div className="flex flex-wrap gap-1">
								{renderFilterChips(item)}
							</div>

							{/* Footer Actions */}
							<div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
								<TooltipProvider delayDuration={150}>
									<div className="flex items-center gap-1">
										{/* Alert Toggle */}
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => toggleAlert(item.id)}
													className={`h-7 px-2 text-[11px] gap-1 rounded-lg ${
														item.hasAlert
															? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
															: "text-muted-foreground hover:bg-muted"
													}`}
												>
													{item.hasAlert ? (
														<Bell className="size-3" />
													) : (
														<BellOff className="size-3" />
													)}
													<span>
														{item.hasAlert ? "هشدار فعال" : "بدون هشدار"}
													</span>
												</Button>
											</TooltipTrigger>
											<TooltipContent side="bottom" className="text-xs">
												{item.hasAlert
													? "ارسال خودکار اعلان هنگام ثبت آگهی جدید"
													: "فعال‌سازی هشدار آگهی جدید"}
											</TooltipContent>
										</Tooltip>

										{/* Delete Search */}
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														removeSavedSearch(item.id);
														toast.info("جستجو حذف شد.");
													}}
													className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
													aria-label="حذف جستجو"
												>
													<Trash2 className="size-3.5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent side="bottom" className="text-xs">
												حذف این جستجو
											</TooltipContent>
										</Tooltip>
									</div>
								</TooltipProvider>

								{/* Apply Button */}
								<Button
									size="sm"
									variant="default"
									onClick={() => handleApplySearch(item)}
									className="h-7 px-3 text-[11px] font-bold gap-1 rounded-lg"
								>
									<Play className="size-3 fill-current" />
									اعمال روی نقشه
								</Button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
	BedDouble,
	Building2,
	Calendar,
	Car,
	Check,
	ChevronLeft,
	ChevronRight,
	Compass,
	Copy,
	ExternalLink,
	Flame,
	Heart,
	ImageIcon,
	Info,
	Layers,
	Maximize2,
	Phone,
	ShieldAlert,
	Snowflake,
	Sparkles,
	User,
	Wind,
	X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	formatBedrooms,
	formatRelativeDate,
	formatToman,
	getSourceColor,
	getSourceLabel,
	toPersianDigits,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";

function AttributeRow({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string | number | undefined | null;
	icon?: React.ComponentType<{ className?: string }>;
}) {
	if (value === undefined || value === null || value === "") return null;
	return (
		<div className="flex items-center justify-between gap-2 py-2 text-xs border-b border-border/50 last:border-0">
			<span className="flex items-center gap-1.5 text-muted-foreground">
				{Icon && <Icon className="size-3.5 shrink-0 text-primary/70" />}
				{label}
			</span>
			<span className="font-medium text-foreground">{value}</span>
		</div>
	);
}

function BoolBadge({
	label,
	value,
}: {
	label: string;
	value: boolean | undefined;
}) {
	if (!value) return null;
	return (
		<div className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
			<Check className="size-3 shrink-0" />
			<span>{label}</span>
		</div>
	);
}

// ── Native RTL Image Carousel Component (Powered by Embla) ─────────────────────

function SwipeableImageGallery({
	images,
	title,
}: {
	images: string[];
	title: string;
}) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		direction: "rtl",
		loop: images.length > 1,
		skipSnaps: false,
		dragFree: false,
	});

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
			emblaApi.off("reInit", onSelect);
		};
	}, [emblaApi, onSelect]);

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	const scrollTo = useCallback(
		(index: number) => {
			if (emblaApi) emblaApi.scrollTo(index);
		},
		[emblaApi],
	);

	const total = images.length;

	return (
		<div className="space-y-2 select-none" dir="rtl">
			{/* Main Carousel Viewport */}
			<div className="group relative h-56 sm:h-60 w-full overflow-hidden rounded-xl bg-muted border border-border/70 shadow-2xs">
				<div className="h-full w-full overflow-hidden" ref={emblaRef}>
					<div className="flex h-full w-full touch-pan-y">
						{images.map((src, i) => (
							<div
								key={src}
								className="relative h-full w-full min-w-0 flex-[0_0_100%]"
							>
								{!imageErrors[i] ? (
									<Image
										src={src}
										alt={`${title} - تصویر ${toPersianDigits(i + 1)}`}
										fill
										draggable={false}
										sizes="(max-width: 768px) 100vw, 440px"
										className="object-cover pointer-events-none select-none"
										priority={i < 2}
										onError={() => {
											setImageErrors((prev) => ({ ...prev, [i]: true }));
										}}
									/>
								) : (
									<div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground bg-muted select-none">
										<ImageIcon className="size-8 opacity-40" />
										<span className="text-xs">تصویر در دسترس نیست</span>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Floating Counter Badge */}
				{total > 1 && (
					<div className="absolute top-2.5 right-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md pointer-events-none z-10 select-none">
						{toPersianDigits(selectedIndex + 1)} از {toPersianDigits(total)}
					</div>
				)}

				{/* Next / Previous Navigation Controls (RTL-aware) */}
				{total > 1 && (
					<>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								scrollPrev();
							}}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md shadow-md transition-all hover:bg-black/80 hover:scale-110 active:scale-95 z-10 cursor-pointer"
							aria-label="تصویر قبلی"
						>
							<ChevronRight className="size-4" />
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								scrollNext();
							}}
							className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md shadow-md transition-all hover:bg-black/80 hover:scale-110 active:scale-95 z-10 cursor-pointer"
							aria-label="تصویر بعدی"
						>
							<ChevronLeft className="size-4" />
						</button>
					</>
				)}
			</div>

			{/* Thumbnails Row */}
			{total > 1 && (
				<div className="flex items-center gap-1.5 overflow-x-auto px-0.5 py-0.5 no-scrollbar select-none">
					{images.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => scrollTo(i)}
							className={cn(
								"relative h-11 w-15 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
								i === selectedIndex
									? "border-primary ring-2 ring-primary/30 scale-105"
									: "border-transparent opacity-60 hover:opacity-100",
							)}
						>
							<Image
								src={src}
								alt={`بند انگشتی ${toPersianDigits(i + 1)}`}
								fill
								draggable={false}
								sizes="60px"
								className="object-cover pointer-events-none select-none"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// ── Detail Content Component ──────────────────────────────────────────────────

function DetailContent({ listing }: { listing: UnifiedListing }) {
	const [copiedPhone, setCopiedPhone] = useState(false);
	const isLoadingDetail = useListingStore((s) => s.isLoadingDetail);
	const isFav = useFavoritesStore((s) =>
		s.isFavorite(listing.source, listing.externalId),
	);
	const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

	const handleCopyPhone = (phone: string) => {
		void navigator.clipboard.writeText(phone);
		setCopiedPhone(true);
		setTimeout(() => setCopiedPhone(false), 2000);
	};

	const attrs = listing.attributes || {};

	return (
		<div
			className="relative flex h-full flex-col overflow-hidden bg-background"
			dir="rtl"
		>
			{/* Top Scanning Line (0px height impact, flush under header) */}
			{isLoadingDetail && (
				<div className="pointer-events-none absolute top-0 left-0 right-0 z-30 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
			)}

			<div className="flex-1 overflow-y-auto px-3.5 pt-2.5 pb-12 space-y-4">
				{/* Images Gallery */}
				{listing.images && listing.images.length > 0 ? (
					<SwipeableImageGallery
						images={listing.images}
						title={listing.title}
					/>
				) : isLoadingDetail ? (
					<div className="relative h-56 sm:h-60 w-full shrink-0 overflow-hidden rounded-xl bg-muted/60 flex items-center justify-center border border-border/40 shadow-2xs">
						<Skeleton className="absolute inset-0" />
						<ImageIcon className="size-8 text-muted-foreground/30 z-10" />
					</div>
				) : null}

				{/* Title & Location Header */}
				<div className="flex items-start justify-between gap-3 pt-0.5">
					<div className="flex-1 space-y-1">
						<h2 className="text-sm sm:text-base font-bold leading-snug text-foreground">
							{listing.title}
						</h2>
						<p className="text-xs font-medium text-muted-foreground">
							{listing.districtPersian
								? `${listing.cityPersian} • ${listing.districtPersian}`
								: listing.cityPersian}
						</p>
					</div>
					<div className="flex items-center gap-1.5 shrink-0">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className="size-8.5 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/40 cursor-pointer"
										onClick={() => toggleFavorite(listing)}
										aria-label="نشان کردن آگهی"
									>
										<Heart
											className={cn(
												"size-4 transition-all",
												isFav
													? "fill-red-500 text-red-500 scale-110"
													: "text-muted-foreground",
											)}
										/>
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="text-[11px]">
									{isFav ? "حذف از نشان‌شده‌ها" : "نشان کردن آگهی"}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>

				{/* Fallback Location Alert */}
				{listing.location?.isFallback && (
					<div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
						<ShieldAlert className="size-4 shrink-0 text-amber-500" />
						<span>موقعیت مکانی ثبت‌شده تقریبی و در محدوده کلی محله است.</span>
					</div>
				)}

				{/* Pricing Card */}
				<div className="rounded-xl border border-border bg-card p-3 space-y-2 shadow-2xs">
					<div className="flex items-center justify-between text-xs font-semibold text-muted-foreground border-b pb-2">
						<span>نوع معامله</span>
						<span className="text-primary font-bold">
							{listing.dealType === "rent" ? "رهن و اجاره" : "خرید و فروش"}
						</span>
					</div>

					{listing.dealType === "rent" ? (
						<div className="space-y-1.5 pt-1">
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">مبلغ رهن (ودیعه)</span>
								<span className="font-bold text-foreground">
									{listing.isAgreedDeposit
										? "توافقی"
										: formatToman(listing.depositTomans)}
								</span>
							</div>
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">اجاره ماهانه</span>
								<span className="font-bold text-primary">
									{listing.isAgreedRent
										? "توافقی"
										: formatToman(listing.rentTomans)}
								</span>
							</div>
							{listing.equivalentFullDepositTomans && (
								<div className="flex justify-between border-t border-dashed pt-1.5 text-[11px]">
									<span className="text-muted-foreground">رهن کامل معادل</span>
									<span className="font-medium text-foreground">
										{formatToman(listing.equivalentFullDepositTomans)}
									</span>
								</div>
							)}
						</div>
					) : (
						<div className="space-y-1.5 pt-1">
							<div className="flex justify-between text-xs">
								<span className="text-muted-foreground">قیمت کل</span>
								<span className="font-bold text-primary text-sm">
									{listing.isAgreedPrice
										? "توافقی"
										: formatToman(listing.totalPriceTomans)}
								</span>
							</div>
							{listing.pricePerSqMeterTomans && (
								<div className="flex justify-between border-t border-dashed pt-1.5 text-xs">
									<span className="text-muted-foreground">هر متر مربع</span>
									<span className="font-medium">
										{formatToman(listing.pricePerSqMeterTomans)}
									</span>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Contact / Phone section */}
				{listing.publisherPhone ? (
					<div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
						<div className="flex items-center gap-2 text-xs">
							<Phone className="size-4 text-primary" />
							<div>
								<p className="text-[11px] text-muted-foreground">شماره تماس</p>
								<p className="font-bold text-primary ltr text-left" dir="ltr">
									{listing.publisherPhone}
								</p>
							</div>
						</div>
						<Button
							size="sm"
							variant="outline"
							className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
							onClick={() => {
								if (listing.publisherPhone) {
									handleCopyPhone(listing.publisherPhone);
								}
							}}
						>
							{copiedPhone ? (
								<>
									<Check className="size-3.5 text-emerald-500" />
									کپی شد
								</>
							) : (
								<>
									<Copy className="size-3.5" />
									کپی شماره
								</>
							)}
						</Button>
					</div>
				) : isLoadingDetail ? (
					<Skeleton className="h-12 w-full rounded-xl" />
				) : null}

				{/* Description Text */}
				{listing.description ? (
					<div className="space-y-1.5 rounded-xl border bg-card p-3">
						<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
							<Info className="size-3.5 text-primary" />
							<span>توضیحات آگهی</span>
						</div>
						<p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
							{listing.description}
						</p>
					</div>
				) : isLoadingDetail ? (
					<div className="space-y-2 rounded-xl border bg-card p-3">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-4/5" />
					</div>
				) : null}

				{/* Key Features Badges */}
				<div className="space-y-2">
					<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
						<Sparkles className="size-3.5 text-amber-500" />
						<span>امکانات و ویژگی‌ها</span>
					</div>
					<div className="flex flex-wrap gap-1.5">
						<BoolBadge label="پارکینگ" value={Boolean(attrs.hasParking)} />
						<BoolBadge label="آسانسور" value={attrs.hasElevator} />
						<BoolBadge label="انباری" value={attrs.hasStorage} />
						<BoolBadge label="بالکن / تراس" value={attrs.hasBalcony} />
						<BoolBadge label="قابل تبدیل" value={attrs.isConvertible} />
						<BoolBadge label="مبله" value={attrs.isFurnished} />
						<BoolBadge label="لابی" value={attrs.hasLobby} />
						<BoolBadge label="استخر" value={attrs.hasPool} />
						<BoolBadge label="سونا" value={attrs.hasSauna} />
						<BoolBadge label="جکوزی" value={attrs.hasJacuzzi} />
						<BoolBadge label="سالن ورزشی" value={attrs.hasGym} />
						<BoolBadge label="روف گاردن" value={attrs.hasRoofGarden} />
					</div>
				</div>

				{/* Physical & Technical Specs */}
				<div className="space-y-2">
					<div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
						<Building2 className="size-3.5 text-primary" />
						<span>مشخصات فنی ملک</span>
					</div>
					<div className="rounded-xl border bg-card px-3 py-1">
						<AttributeRow
							label="متراژ زیربنا"
							icon={Maximize2}
							value={
								attrs.areaSqMeters !== undefined
									? `${toPersianDigits(attrs.areaSqMeters)} متر مربع`
									: undefined
							}
						/>
						<AttributeRow
							label="تعداد اتاق خواب"
							icon={BedDouble}
							value={formatBedrooms(attrs.bedrooms) || undefined}
						/>
						<AttributeRow
							label="طبقه"
							icon={Layers}
							value={
								attrs.floor !== undefined
									? toPersianDigits(attrs.floor)
									: undefined
							}
						/>
						<AttributeRow
							label="تعداد کل طبقات"
							icon={Building2}
							value={toPersianDigits(attrs.totalFloorsInBuilding)}
						/>
						<AttributeRow
							label="تعداد واحد در طبقه"
							value={toPersianDigits(attrs.unitsPerFloor)}
						/>
						<AttributeRow
							label="سال ساخت"
							icon={Calendar}
							value={
								attrs.yearBuilt ? toPersianDigits(attrs.yearBuilt) : undefined
							}
						/>
						<AttributeRow
							label="تعداد ظرفیت پارکینگ"
							icon={Car}
							value={
								attrs.parkingSpots !== undefined
									? `${toPersianDigits(attrs.parkingSpots)} خودرو`
									: undefined
							}
						/>
						<AttributeRow
							label="سیستم سرمایش"
							icon={Snowflake}
							value={attrs.coolingSystem}
						/>
						<AttributeRow
							label="سیستم گرمایش"
							icon={Flame}
							value={attrs.heatingSystem}
						/>
						<AttributeRow
							label="تأمین آب گرم"
							icon={Wind}
							value={attrs.waterHeater}
						/>
						<AttributeRow label="پوشش کف" value={attrs.flooringType} />
						<AttributeRow label="نمای ساختمان" value={attrs.buildingFacade} />
						<AttributeRow
							label="موقعیت جغرافیایی / جهت"
							icon={Compass}
							value={attrs.unitDirection}
						/>
						<AttributeRow label="سرویس بهداشتی" value={attrs.wcType} />
						<AttributeRow
							label="تعداد سرویس بهداشتی"
							value={toPersianDigits(attrs.wcCount)}
						/>
					</div>
				</div>

				{/* Publisher Info */}
				{listing.publisherType && (
					<div className="flex items-center gap-2 rounded-xl border bg-card p-3 text-xs">
						<User className="size-4 text-muted-foreground shrink-0" />
						<span className="text-muted-foreground">نوع آگهی‌دهنده:</span>
						<span className="font-bold text-foreground">
							{listing.publisherType === "agency" ? "آژانس املاک" : "شخصی"}
						</span>
					</div>
				)}

				{/* Source Links */}
				<div className="space-y-2 rounded-xl border bg-card p-3">
					<p className="text-xs font-bold text-foreground">لینک‌های منبع آگهی</p>
					<div className="flex flex-wrap gap-2">
						{listing.url && (
							<a
								href={listing.url}
								target="_blank"
								rel="noreferrer"
								className={cn(
									"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90 shadow-2xs",
									getSourceColor(listing.source),
								)}
							>
								{getSourceLabel(listing.source)}
								<ExternalLink className="size-3.5" />
							</a>
						)}
						{listing.alternateSources?.map((alt) => (
							<a
								key={alt.externalId}
								href={alt.url}
								target="_blank"
								rel="noreferrer"
								className={cn(
									"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium opacity-85 transition-opacity hover:opacity-100",
									getSourceColor(alt.source),
								)}
							>
								{getSourceLabel(alt.source)}
								<ExternalLink className="size-3.5" />
							</a>
						))}
					</div>
				</div>

				{/* Timestamps */}
				{listing.publishedAt && (
					<div className="text-[11px] text-muted-foreground/80 text-center pb-2">
						تاریخ انتشار: {formatRelativeDate(listing.publishedAt)}
					</div>
				)}
			</div>
		</div>
	);
}

export function PropertyDetailSheet() {
	const selectedListing = useListingStore((s) => s.selectedListing);
	const setSelectedListing = useListingStore((s) => s.setSelectedListing);
	const isMobile = useIsMobile();

	const open = selectedListing !== null;
	const onClose = () => setSelectedListing(null);

	if (isMobile) {
		return (
			<Drawer
				open={open}
				onOpenChange={(o) => {
					if (!o) onClose();
				}}
				modal={false}
				shouldScaleBackground={false}
			>
				<DrawerContent
					showOverlay={false}
					className="mb-14 h-[85dvh] max-h-[85dvh] border-t shadow-2xl gap-0 p-0 bg-background"
				>
					<DrawerHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4 py-2.5 bg-background">
						<DrawerTitle className="text-sm font-bold text-foreground">
							جزئیات کامل آگهی
						</DrawerTitle>
						<DrawerClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-7.5 rounded-lg cursor-pointer"
								onClick={onClose}
							>
								<X className="size-4" />
							</Button>
						</DrawerClose>
					</DrawerHeader>
					{selectedListing && <DetailContent listing={selectedListing} />}
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Sheet
			open={open}
			onOpenChange={(o) => {
				if (!o) onClose();
			}}
		>
			<SheetContent
				side="left"
				showOverlay={false}
				showCloseButton={false}
				className="flex w-[420px] sm:w-[440px] flex-col gap-0 p-0 border-r shadow-2xl bg-background"
			>
				<SheetHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4 py-2.5 bg-background">
					<SheetTitle className="text-sm font-bold text-foreground">
						جزئیات کامل آگهی
					</SheetTitle>
					<Button
						variant="ghost"
						size="icon"
						className="size-7.5 rounded-lg cursor-pointer"
						onClick={onClose}
					>
						<X className="size-4" />
					</Button>
				</SheetHeader>
				{selectedListing && <DetailContent listing={selectedListing} />}
			</SheetContent>
		</Sheet>
	);
}

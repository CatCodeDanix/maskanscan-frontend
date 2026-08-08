"use client";

import {
	BedDouble,
	Building2,
	Calendar,
	Car,
	ExternalLink,
	Heart,
	Layers,
	Maximize2,
	User,
	Warehouse,
	X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	formatBedrooms,
	formatRelativeDate,
	formatToman,
	getSourceColor,
	getSourceLabel,
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
		<div className="flex items-center justify-between gap-2 py-2 text-sm">
			<span className="flex items-center gap-1.5 text-muted-foreground">
				{Icon && <Icon className="size-3.5 shrink-0" />}
				{label}
			</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}

function BoolRow({
	label,
	value,
}: {
	label: string;
	value: boolean | undefined;
}) {
	if (!value) return null;
	return (
		<div className="flex items-center justify-between py-2 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="text-emerald-600 dark:text-emerald-400 font-medium">
				✓ دارد
			</span>
		</div>
	);
}

function DetailContent({ listing }: { listing: UnifiedListing }) {
	const [activeImage, setActiveImage] = useState(0);
	const isFav = useFavoritesStore((s) =>
		s.isFavorite(listing.source, listing.externalId),
	);
	const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

	return (
		<div className="flex flex-col">
			{/* Images */}
			{listing.images.length > 0 && (
				<div className="relative h-52 w-full shrink-0 bg-muted">
					<Image
						src={listing.images[activeImage] ?? listing.images[0]}
						alt={listing.title}
						fill
						sizes="400px"
						className="object-cover"
						priority
					/>
					{/* Thumbnail strip */}
					{listing.images.length > 1 && (
						<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
							{listing.images.slice(0, 8).map((src, i) => (
								<button
									key={src}
									type="button"
									onClick={() => setActiveImage(i)}
									className={cn(
										"size-2 rounded-full transition-all",
										i === activeImage
											? "scale-125 bg-white"
											: "bg-white/50 hover:bg-white/75",
									)}
								/>
							))}
						</div>
					)}
				</div>
			)}

			<ScrollArea className="flex-1">
				<div className="space-y-4 p-4">
					{/* Title & Location */}
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<h2 className="text-base font-semibold leading-snug">
								{listing.title}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								{listing.districtPersian
									? `${listing.cityPersian} • ${listing.districtPersian}`
									: listing.cityPersian}
							</p>
						</div>
						<Button
							variant="outline"
							size="icon"
							className="size-9 shrink-0 rounded-full"
							onClick={() => toggleFavorite(listing)}
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
					</div>

					{/* Fallback badge */}
					{listing.location?.isFallback && (
						<div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
							⚠️ موقعیت تقریبی (محدوده محله)
						</div>
					)}

					{/* Price */}
					<div className="rounded-xl bg-primary/5 p-3">
						<p className="mb-1 text-xs text-muted-foreground">
							{listing.dealType === "rent" ? "اجاره" : "خرید"}
						</p>
						{listing.dealType === "rent" ? (
							<div className="space-y-1">
								{(listing.depositTomans !== undefined ||
									listing.isAgreedDeposit) && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">رهن</span>
										<span className="font-semibold">
											{listing.isAgreedDeposit
												? "توافقی"
												: formatToman(listing.depositTomans)}
										</span>
									</div>
								)}
								{(listing.rentTomans !== undefined || listing.isAgreedRent) && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">اجاره ماهانه</span>
										<span className="font-semibold text-primary">
											{listing.isAgreedRent
												? "توافقی"
												: formatToman(listing.rentTomans)}
										</span>
									</div>
								)}
								{listing.equivalentFullDepositTomans && (
									<div className="flex justify-between border-t pt-1 text-xs">
										<span className="text-muted-foreground">
											رهن کامل معادل
										</span>
										<span>
											{formatToman(listing.equivalentFullDepositTomans)}
										</span>
									</div>
								)}
							</div>
						) : (
							<div className="space-y-1">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">قیمت کل</span>
									<span className="font-semibold text-primary">
										{listing.isAgreedPrice
											? "توافقی"
											: formatToman(listing.totalPriceTomans)}
									</span>
								</div>
								{listing.pricePerSqMeterTomans && (
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">هر متر مربع</span>
										<span>{formatToman(listing.pricePerSqMeterTomans)}</span>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Attributes */}
					<div className="divide-y rounded-xl border px-3">
						<AttributeRow
							label="متراژ"
							icon={Maximize2}
							value={
								listing.attributes.areaSqMeters !== undefined
									? `${listing.attributes.areaSqMeters} م²`
									: undefined
							}
						/>
						<AttributeRow
							label="تعداد خواب"
							icon={BedDouble}
							value={formatBedrooms(listing.attributes.bedrooms) || undefined}
						/>
						<AttributeRow
							label="طبقه"
							icon={Layers}
							value={
								listing.attributes.floor !== undefined
									? String(listing.attributes.floor)
									: undefined
							}
						/>
						<AttributeRow
							label="تعداد طبقات"
							icon={Building2}
							value={listing.attributes.totalFloorsInBuilding}
						/>
						<AttributeRow
							label="سال ساخت"
							icon={Calendar}
							value={listing.attributes.yearBuilt}
						/>
						<AttributeRow
							label="پارکینگ"
							icon={Car}
							value={
								listing.attributes.parkingSpots !== undefined
									? `${listing.attributes.parkingSpots} جای`
									: undefined
							}
						/>
						<AttributeRow
							label="انباری"
							icon={Warehouse}
							value={listing.attributes.hasStorage ? "دارد" : undefined}
						/>
						<BoolRow label="آسانسور" value={listing.attributes.hasElevator} />
						<BoolRow label="بالکن" value={listing.attributes.hasBalcony} />
						<BoolRow label="استخر" value={listing.attributes.hasPool} />
						<BoolRow label="ساونا" value={listing.attributes.hasSauna} />
						<BoolRow label="جکوزی" value={listing.attributes.hasJacuzzi} />
						<BoolRow label="سالن ورزش" value={listing.attributes.hasGym} />
					</div>

					{/* Publisher */}
					{listing.publisherType && (
						<div className="flex items-center gap-2 text-sm">
							<User className="size-4 text-muted-foreground" />
							<span className="text-muted-foreground">نوع آگهیدهنده:</span>
							<span className="font-medium">
								{listing.publisherType === "agency" ? "آیژانس" : "شخصی"}
							</span>
						</div>
					)}

					{/* Source links */}
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">
							مشاهده در
						</p>
						<div className="flex flex-wrap gap-2">
							<a
								href={listing.url}
								target="_blank"
								rel="noreferrer"
								className={cn(
									"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80",
									getSourceColor(listing.source),
								)}
							>
								{getSourceLabel(listing.source)}
								<ExternalLink className="size-3" />
							</a>
							{listing.alternateSources?.map((alt) => (
								<a
									key={alt.externalId}
									href={alt.url}
									target="_blank"
									rel="noreferrer"
									className={cn(
										"inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium opacity-80 transition-opacity hover:opacity-100",
										getSourceColor(alt.source),
									)}
								>
									{getSourceLabel(alt.source)}
									<ExternalLink className="size-3" />
								</a>
							))}
						</div>
					</div>

					{/* Dates */}
					{listing.publishedAt && (
						<p className="text-xs text-muted-foreground">
							ثبت آگهی: {formatRelativeDate(listing.publishedAt)}
						</p>
					)}
				</div>
			</ScrollArea>
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
					className="mb-14"
					style={
						{
							maxHeight: "calc(100dvh - 10rem)",
							"--initial-transform": "calc(100% + 3.5rem)",
						} as React.CSSProperties
					}
				>
					<DrawerHeader className="flex flex-row items-center justify-between border-b p-4">
						<DrawerTitle className="text-sm">جزئیات آگهی</DrawerTitle>
						<DrawerClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-7"
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
				showCloseButton={false}
				className="flex w-[380px] flex-col p-0 sm:max-w-[380px]"
			>
				<SheetHeader className="flex flex-row items-center justify-between border-b p-4">
					<SheetTitle className="text-sm">جزئیات آگهی</SheetTitle>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
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

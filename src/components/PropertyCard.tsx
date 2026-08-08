"use client";

import { BedDouble, Heart, MapPin, Maximize2 } from "lucide-react";
import Image from "next/image";
import {
	formatBedrooms,
	formatToman,
	getSourceColor,
	getSourceLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/store/favorites-store";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";

interface PropertyCardProps {
	listing: UnifiedListing;
	className?: string;
}

export function PropertyCard({ listing, className }: PropertyCardProps) {
	const selectedListing = useListingStore((s) => s.selectedListing);
	const setSelectedListing = useListingStore((s) => s.setSelectedListing);

	const isFav = useFavoritesStore((s) =>
		s.isFavorite(listing.source, listing.externalId),
	);
	const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

	const isSelected =
		selectedListing?.externalId === listing.externalId &&
		selectedListing?.source === listing.source;

	const thumbnail = listing.images[0];
	const area = listing.attributes.areaSqMeters;
	const bedrooms = listing.attributes.bedrooms;
	const totalSources = 1 + (listing.alternateSources?.length ?? 0);

	const handleCardClick = () => {
		setSelectedListing(isSelected ? null : listing);
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={handleCardClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleCardClick();
				}
			}}
			className={cn(
				"group relative w-full text-right transition-all overflow-hidden cursor-pointer select-none",
				"rounded-xl border bg-card text-card-foreground shadow-2xs",
				"hover:shadow-md hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary",
				isSelected && "border-primary shadow-md ring-1 ring-primary/30",
				className,
			)}
		>
			{/* Thumbnail */}
			<div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-muted">
				{thumbnail ? (
					<Image
						src={thumbnail}
						alt={listing.title}
						fill
						sizes="(max-width: 768px) 100vw, 350px"
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground">
						<Maximize2 className="size-8 opacity-30" />
					</div>
				)}

				{/* Source badge */}
				<div className="absolute top-2 right-2 flex items-center gap-1">
					<span
						className={cn(
							"rounded-md px-1.5 py-0.5 text-[10px] font-semibold shadow-xs",
							getSourceColor(listing.source),
						)}
					>
						{getSourceLabel(listing.source)}
					</span>
					{totalSources > 1 && (
						<span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white font-medium">
							+{totalSources - 1}
						</span>
					)}
				</div>

				{/* Favorite Heart Button OVER Image (Top-Left) */}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						toggleFavorite(listing);
					}}
					aria-label="افزودن به علاقه‌مندی‌ها"
					className="absolute top-2 left-2 z-10 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-xs shadow-md transition-all hover:bg-black/70 hover:scale-110"
				>
					<Heart
						className={cn(
							"size-4 transition-all",
							isFav ? "fill-red-500 text-red-500 scale-110" : "text-white/90",
						)}
					/>
				</button>

				{/* Fallback badge */}
				{listing.location?.isFallback && (
					<div className="absolute bottom-2 right-2">
						<span className="rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-xs">
							محدوده محله
						</span>
					</div>
				)}
			</div>

			{/* Body */}
			<div className="space-y-2 p-3">
				{/* Title */}
				<h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
					{listing.title}
				</h3>

				{/* Location */}
				<div className="flex items-center gap-1 text-[11px] text-muted-foreground">
					<MapPin className="size-3 shrink-0 text-primary" />
					<span className="truncate">
						{listing.districtPersian
							? `${listing.cityPersian} • ${listing.districtPersian}`
							: listing.cityPersian}
					</span>
				</div>

				{/* Stats */}
				{(area !== undefined || bedrooms !== undefined) && (
					<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
						{area !== undefined && (
							<span className="flex items-center gap-0.5 font-medium">
								<Maximize2 className="size-3 text-primary/70" />
								{area} م²
							</span>
						)}
						{bedrooms !== undefined && (
							<span className="flex items-center gap-0.5 font-medium">
								<BedDouble className="size-3 text-primary/70" />
								{formatBedrooms(bedrooms)}
							</span>
						)}
					</div>
				)}

				{/* Structured 2-Row Pricing */}
				<div className="mt-1 rounded-lg bg-muted/50 p-2 border border-border/40 space-y-1">
					{listing.dealType === "rent" ? (
						<>
							<div className="flex items-center justify-between text-xs">
								<span className="text-[11px] text-muted-foreground">رهن:</span>
								<span className="font-bold text-foreground">
									{listing.isAgreedDeposit
										? "توافقی"
										: listing.depositTomans
											? formatToman(listing.depositTomans)
											: "—"}
								</span>
							</div>
							<div className="flex items-center justify-between text-xs">
								<span className="text-[11px] text-muted-foreground">
									اجاره ماهانه:
								</span>
								<span className="font-bold text-primary">
									{listing.isAgreedRent
										? "توافقی"
										: listing.rentTomans
											? formatToman(listing.rentTomans)
											: "—"}
								</span>
							</div>
						</>
					) : (
						<>
							<div className="flex items-center justify-between text-xs">
								<span className="text-[11px] text-muted-foreground">
									قیمت کل:
								</span>
								<span className="font-bold text-primary text-xs">
									{listing.isAgreedPrice
										? "توافقی"
										: listing.totalPriceTomans
											? formatToman(listing.totalPriceTomans)
											: "—"}
								</span>
							</div>
							<div className="flex items-center justify-between text-[10px] text-muted-foreground">
								<span>قیمت هر متر:</span>
								<span>
									{listing.pricePerSqMeterTomans
										? formatToman(listing.pricePerSqMeterTomans)
										: "—"}
								</span>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

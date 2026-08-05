"use client";

import { BedDouble, MapPin, Maximize2 } from "lucide-react";
import Image from "next/image";
import {
	formatBedrooms,
	formatListingPriceShort,
	getSourceColor,
	getSourceLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useListingStore } from "@/store/listing-store";
import type { UnifiedListing } from "@/types/listing";

interface PropertyCardProps {
	listing: UnifiedListing;
	className?: string;
}

export function PropertyCard({ listing, className }: PropertyCardProps) {
	const selectedListing = useListingStore((s) => s.selectedListing);
	const setSelectedListing = useListingStore((s) => s.setSelectedListing);

	const isSelected =
		selectedListing?.externalId === listing.externalId &&
		selectedListing?.source === listing.source;

	const thumbnail = listing.images[0];
	const price = formatListingPriceShort(listing);
	const area = listing.attributes.areaSqMeters;
	const bedrooms = listing.attributes.bedrooms;
	const totalSources = 1 + (listing.alternateSources?.length ?? 0);

	return (
		<button
			type="button"
			onClick={() => setSelectedListing(isSelected ? null : listing)}
			className={cn(
				"group w-full text-right transition-all",
				"rounded-xl border bg-card text-card-foreground",
				"hover:shadow-md hover:border-primary/40",
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
							"rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
							getSourceColor(listing.source),
						)}
					>
						{getSourceLabel(listing.source)}
					</span>
					{totalSources > 1 && (
						<span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
							+{totalSources - 1}
						</span>
					)}
				</div>

				{/* Fallback badge */}
				{listing.location?.isFallback && (
					<div className="absolute bottom-2 left-2">
						<span className="rounded-md bg-amber-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
							محدوده محله
						</span>
					</div>
				)}
			</div>

			{/* Body */}
			<div className="space-y-2 p-3">
				{/* Title */}
				<h3 className="line-clamp-2 text-sm font-medium leading-snug">
					{listing.title}
				</h3>

				{/* Location */}
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<MapPin className="size-3 shrink-0" />
					<span className="truncate">
						{listing.districtPersian
							? `${listing.cityPersian} • ${listing.districtPersian}`
							: listing.cityPersian}
					</span>
				</div>

				{/* Stats */}
				{(area !== undefined || bedrooms !== undefined) && (
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						{area !== undefined && (
							<span className="flex items-center gap-0.5">
								<Maximize2 className="size-3" />
								{area} م²
							</span>
						)}
						{bedrooms !== undefined && (
							<span className="flex items-center gap-0.5">
								<BedDouble className="size-3" />
								{formatBedrooms(bedrooms)}
							</span>
						)}
					</div>
				)}

				{/* Price */}
				<div className="text-sm font-semibold text-primary">{price}</div>
			</div>
		</button>
	);
}

"use client";

import type { Feature, LineString, MultiLineString, Point } from "geojson";
import {
	AlertTriangle,
	BedDouble,
	Bus,
	Layers,
	MapPin,
	Maximize2,
	Train,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type Supercluster from "supercluster";
import type { TransitProperties } from "@/data";
import {
	formatBedrooms,
	formatToman,
	getSourceColor,
	getSourceLabel,
	toPersianDigits,
} from "@/lib/format";
import { formatClusterPriceSummary } from "@/lib/geospatial";
import { cn } from "@/lib/utils";
import type { BackendClusterItem } from "@/types/geospatial";
import type { MapPinItem, UnifiedListing } from "@/types/listing";

type ClusterFeature = Supercluster.ClusterFeature<Record<string, never>>;

export type HoveredObject =
	| { type: "backend-cluster"; cluster: BackendClusterItem }
	| { type: "supercluster-cluster"; feature: ClusterFeature }
	| {
			type: "pin";
			pin: MapPinItem | UnifiedListing;
			coordinates: [number, number];
	  }
	| Feature<Point | LineString | MultiLineString, TransitProperties>;

export interface HoverInfo {
	x: number;
	y: number;
	object: HoveredObject;
}

interface MapHoverTooltipProps {
	hoverInfo: HoverInfo | null;
	isDesktopOverlayOpen?: boolean;
	isMobile?: boolean;
}

function isTransitFeature(
	obj: HoveredObject,
): obj is Feature<Point | LineString | MultiLineString, TransitProperties> {
	return "type" in obj && obj.type === "Feature" && "properties" in obj;
}

function getIsFallback(pin: MapPinItem | UnifiedListing): boolean {
	if ("location" in pin && pin.location) {
		return Boolean(pin.location.isFallback);
	}
	if ("isFallback" in pin) {
		return Boolean(pin.isFallback);
	}
	return false;
}

export function MapHoverTooltip({
	hoverInfo,
	isDesktopOverlayOpen = false,
	isMobile = false,
}: MapHoverTooltipProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// Synchronously calculate clamped coordinates to eliminate any visual jump
	const [position, setPosition] = useState<{
		left: number;
		top: number;
		flipped: boolean;
	} | null>(null);

	useLayoutEffect(() => {
		if (!hoverInfo || !containerRef.current) {
			setPosition(null);
			return;
		}

		const containerRect = containerRef.current.getBoundingClientRect();
		// Use rendered size or standard fallback estimate
		const tooltipWidth = tooltipRef.current?.offsetWidth ?? 260;
		const tooltipHeight = tooltipRef.current?.offsetHeight ?? 120;

		const PADDING = 12;
		const OFFSET_Y = 12;

		// In RTL layout, the desktop overlay drawer is on the right side (~380px)
		const rightBound =
			containerRect.width - (isDesktopOverlayOpen ? 380 : 0) - PADDING;
		const leftBound = PADDING;
		const topBound = PADDING;
		const bottomBound = containerRect.height - (isMobile ? 56 : 0) - PADDING;

		// Horizontal: centered over cursor, clamped within viewport bounds
		let left = hoverInfo.x - tooltipWidth / 2;
		left = Math.max(leftBound, Math.min(left, rightBound - tooltipWidth));

		// Vertical: default above cursor. If overflowing top boundary, flip below cursor.
		let top = hoverInfo.y - tooltipHeight - OFFSET_Y;
		let flipped = false;
		if (top < topBound) {
			top = hoverInfo.y + OFFSET_Y;
			flipped = true;
		}

		// Clamp to bottom if needed
		if (top + tooltipHeight > bottomBound) {
			top = Math.max(topBound, bottomBound - tooltipHeight);
		}

		setPosition({ left, top, flipped });
	}, [hoverInfo, isDesktopOverlayOpen, isMobile]);

	if (!hoverInfo) return null;

	const obj = hoverInfo.object;
	const isPin = "type" in obj && obj.type === "pin";
	const pin = isPin ? obj.pin : null;
	const isUnified = pin && "attributes" in pin;
	const unifiedListing = isUnified ? (pin as UnifiedListing) : null;

	// Initial fallback position before useLayoutEffect measures DOM
	const initialLeft = Math.max(12, hoverInfo.x - 130);
	const initialTop = Math.max(12, hoverInfo.y - 130);

	const left = position ? position.left : initialLeft;
	const top = position ? position.top : initialTop;

	return (
		<div
			ref={containerRef}
			className="pointer-events-none absolute inset-0 overflow-hidden z-40 select-none font-sans"
			dir="rtl"
		>
			<div
				ref={tooltipRef}
				style={{
					left: `${left}px`,
					top: `${top}px`,
					fontFamily:
						"var(--font-iran-sans), var(--font-sans), system-ui, sans-serif",
				}}
				className="absolute max-w-[280px] w-max rounded-2xl border border-border/80 bg-background/95 p-3 text-right shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ease-out font-sans"
			>
				{/* 1. Backend Cluster Tooltip */}
				{"type" in obj && obj.type === "backend-cluster" && (
					<div className="space-y-2">
						<div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Layers className="size-3.5" />
							</div>
							<span className="text-xs font-bold text-foreground">
								مجموعه {toPersianDigits(obj.cluster.count)} آگهی ملک
							</span>
						</div>

						<div className="rounded-lg bg-primary/5 px-2 py-1.5 border border-primary/15 text-center">
							<span className="text-xs font-bold text-primary">
								{formatClusterPriceSummary(obj.cluster)}
							</span>
						</div>

						<p className="text-[10px] text-muted-foreground text-center">
							برای بزرگ‌نمایی و مشاهده تفکیکی کلیک کنید
						</p>
					</div>
				)}

				{/* 2. Supercluster Tooltip */}
				{"type" in obj && obj.type === "supercluster-cluster" && (
					<div className="space-y-1.5">
						<div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<Layers className="size-3.5" />
							</div>
							<span className="text-xs font-bold text-foreground">
								{toPersianDigits(obj.feature.properties.point_count)} آگهی ملک
							</span>
						</div>
						<p className="text-[10px] text-muted-foreground text-center">
							برای بزرگ‌نمایی کلیک کنید
						</p>
					</div>
				)}

				{/* 3. Single Pin Tooltip */}
				{isPin && pin && (
					<div className="space-y-2">
						{/* Header: Source Badge & Location */}
						<div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
							<div className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
								<MapPin className="size-3 shrink-0 text-primary" />
								<span className="truncate">
									{pin.districtPersian
										? `${pin.cityPersian} • ${pin.districtPersian}`
										: pin.cityPersian}
								</span>
							</div>

							<span
								className={cn(
									"shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold shadow-xs",
									getSourceColor(pin.source),
								)}
							>
								{getSourceLabel(pin.source)}
							</span>
						</div>

						{/* Title */}
						<h4 className="text-xs font-bold leading-snug text-foreground line-clamp-2">
							{pin.title}
						</h4>

						{/* Attributes if available */}
						{unifiedListing &&
							(unifiedListing.attributes.areaSqMeters !== undefined ||
								unifiedListing.attributes.bedrooms !== undefined) && (
								<div className="flex items-center gap-3 text-[11px] text-muted-foreground">
									{unifiedListing.attributes.areaSqMeters !== undefined && (
										<span className="flex items-center gap-0.5 font-medium">
											<Maximize2 className="size-3 text-primary/70" />
											{toPersianDigits(unifiedListing.attributes.areaSqMeters)}{" "}
											م²
										</span>
									)}
									{unifiedListing.attributes.bedrooms !== undefined && (
										<span className="flex items-center gap-0.5 font-medium">
											<BedDouble className="size-3 text-primary/70" />
											{formatBedrooms(unifiedListing.attributes.bedrooms)}
										</span>
									)}
								</div>
							)}

						{/* Structured Pricing Box */}
						<div className="rounded-lg bg-muted/60 p-2 border border-border/40 space-y-1">
							{pin.dealType === "rent" ? (
								<>
									<div className="flex items-center justify-between text-xs">
										<span className="text-[11px] text-muted-foreground">
											رهن:
										</span>
										<span className="font-bold text-foreground">
											{pin.depositTomans
												? formatToman(pin.depositTomans)
												: "توافقی"}
										</span>
									</div>
									<div className="flex items-center justify-between text-xs">
										<span className="text-[11px] text-muted-foreground">
											اجاره ماهانه:
										</span>
										<span className="font-bold text-primary">
											{pin.rentTomans ? formatToman(pin.rentTomans) : "توافقی"}
										</span>
									</div>
								</>
							) : (
								<div className="flex items-center justify-between text-xs">
									<span className="text-[11px] text-muted-foreground">
										قیمت کل:
									</span>
									<span className="font-bold text-primary">
										{pin.totalPriceTomans
											? formatToman(pin.totalPriceTomans)
											: "توافقی"}
									</span>
								</div>
							)}
						</div>

						{/* Fallback Location Alert */}
						{getIsFallback(pin) && (
							<div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
								<AlertTriangle className="size-3 shrink-0" />
								<span>موقعیت تقریبی بر اساس محله</span>
							</div>
						)}
					</div>
				)}

				{/* 4. Transit Feature Tooltip */}
				{isTransitFeature(obj) && obj.properties && (
					<div className="space-y-1.5 min-w-[160px]">
						<div className="flex items-center gap-1.5 border-b border-border/60 pb-1.5">
							<div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								{obj.properties.description?.includes("بی‌آر‌تی") ||
								obj.properties.description?.includes("BRT") ? (
									<Bus className="size-3.5" />
								) : (
									<Train className="size-3.5" />
								)}
							</div>
							<span className="text-xs font-bold text-foreground">
								{obj.properties.name}
							</span>
						</div>
						{obj.properties.description && (
							<p className="text-[11px] text-muted-foreground">
								{obj.properties.description}
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

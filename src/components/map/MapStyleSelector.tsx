// components/map/MapStyleSelector.tsx
"use client";

import { Layers } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { MAP_STYLES, type MapStyleDef, OVERLAYS } from "@/lib/map-styles";
import { useMapStore } from "@/store/map-store";

export default function MapStyleSelector() {
	const [open, setOpen] = useState(false);
	const mapStyle = useMapStore((s) => s.mapStyle);
	const setMapStyle = useMapStore((s) => s.setMapStyle);
	const activeOverlays = useMapStore((s) => s.activeOverlays);
	const toggleOverlay = useMapStore((s) => s.toggleOverlay);

	const currentStyle = useMemo(
		() => MAP_STYLES.find((s) => s.url === mapStyle) ?? MAP_STYLES[0],
		[mapStyle],
	);

	const vectorStyles = MAP_STYLES.filter((s) => s.type === "vector");
	const rasterStyles = MAP_STYLES.filter((s) => s.type === "raster");

	const handleSelect = useCallback(
		(style: MapStyleDef) => {
			setMapStyle(style.url);
			setOpen(false);
		},
		[setMapStyle],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className="
            bg-background absolute bottom-6 left-6
            z-10 overflow-hidden rounded-xl border border-solid border-border shadow-lg transition hover:shadow-xl hover:scale-105
          "
					style={{ bottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px))` }}
				>
					{/* Thumbnail */}
					<div className="relative h-[70px] w-[71px]">
						{currentStyle.preview ? (
							<Image
								src={currentStyle.preview}
								alt={currentStyle.name}
								fill
								sizes="71px"
								loading="eager"
								className="object-cover"
							/>
						) : (
							<div
								className="
                  size-full bg-linear-to-br from-blue-200 to-purple-200
                  dark:from-blue-900 dark:to-purple-900
                "
							/>
						)}
						{/* Solid label bar at bottom */}
						<div
							className="
                absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/75
                px-1.5 py-1 text-white
              "
						>
							<Layers className="size-3.5 shrink-0" />
							<span className="text-[11px] leading-tight font-medium">
								نقشه‌ها
							</span>
						</div>
					</div>
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				side="top"
				sideOffset={12}
				className="flex max-h-[80vh] w-72 flex-col overflow-hidden p-3 shadow-2xl border-border bg-background/95 backdrop-blur-md"
				dir="rtl"
			>
				{/* Sticky header */}
				<div className="mb-2 flex shrink-0 items-center gap-2 border-b pb-2">
					<div className="bg-border h-px flex-1" />
					<h3 className="text-foreground/90 text-xs font-bold whitespace-nowrap">
						لایه‌های پس‌زمینه
					</h3>
					<div className="bg-border h-px flex-1" />
				</div>

				{/* Responsive native scroll container */}
				<div className="max-h-[360px] w-full overflow-y-auto p-1 space-y-4 text-right">
					{vectorStyles.length > 0 && (
						<section>
							<h4 className="text-foreground/80 mb-2 px-1 text-xs font-semibold">
								استایل‌های برداری
							</h4>
							<div className="grid grid-cols-2 gap-2">
								{vectorStyles.map((style) => (
									<StyleCard
										key={style.id}
										style={style}
										isSelected={mapStyle === style.url}
										onSelect={handleSelect}
									/>
								))}
							</div>
						</section>
					)}

					{/* Public transport overlays */}
					{OVERLAYS.length > 0 && (
						<section>
							<h4 className="text-foreground/80 mb-2 px-1 text-xs font-semibold">
								نقشه حمل و نقل عمومی
							</h4>
							<div className="grid grid-cols-2 gap-2">
								{OVERLAYS.map((overlay) => {
									const isActive = activeOverlays.includes(overlay.id);
									return (
										<OverlayCard
											key={overlay.id}
											overlay={overlay}
											isActive={isActive}
											onToggle={() => toggleOverlay(overlay.id)}
										/>
									);
								})}
							</div>
						</section>
					)}

					{rasterStyles.length > 0 && (
						<section>
							<h4 className="text-foreground/80 mb-2 px-1 text-xs font-semibold">
								استایل‌های تصویری
							</h4>
							<div className="grid grid-cols-2 gap-2">
								{rasterStyles.map((style) => (
									<StyleCard
										key={style.id}
										style={style}
										isSelected={mapStyle === style.url}
										onSelect={handleSelect}
									/>
								))}
							</div>
						</section>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

function StyleCard({
	style,
	isSelected,
	onSelect,
}: {
	style: MapStyleDef;
	isSelected: boolean;
	onSelect: (style: MapStyleDef) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onSelect(style)}
			className={`
        flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition text-right
        ${
					isSelected
						? "border-primary bg-primary/5 shadow-xs"
						: "border-border hover:border-primary/50"
				}
      `}
		>
			<div className="bg-muted relative aspect-[1.2/1] w-full overflow-hidden rounded-lg">
				{style.preview ? (
					<Image
						src={style.preview}
						alt={style.name}
						fill
						sizes="100px"
						className="object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center bg-linear-to-br from-blue-200 to-purple-200 text-[11px] text-gray-600 dark:from-blue-900 dark:to-purple-900 dark:text-white/70">
						{style.name}
					</div>
				)}
			</div>
			<span className="text-foreground text-center text-[11px] leading-tight font-medium">
				{style.name}
			</span>
		</button>
	);
}

function OverlayCard({
	overlay,
	isActive,
	onToggle,
}: {
	overlay: { id: string; name: string; preview?: string };
	isActive: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`
        flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition text-right
        ${
					isActive
						? "border-rose-500 bg-rose-500/5 shadow-xs"
						: "border-border hover:border-rose-500/50"
				}
      `}
		>
			<div className="bg-muted relative aspect-[1.2/1] w-full overflow-hidden rounded-lg">
				{overlay.preview ? (
					<Image
						src={overlay.preview}
						alt={overlay.name}
						fill
						sizes="100px"
						className="object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center bg-linear-to-br from-yellow-100 to-yellow-200 text-[11px] text-gray-600 dark:from-yellow-900 dark:to-yellow-800 dark:text-white/70">
						{overlay.name}
					</div>
				)}
			</div>
			<span className="text-foreground text-center text-[11px] leading-tight font-medium">
				{overlay.name}
			</span>
		</button>
	);
}

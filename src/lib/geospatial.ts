import type { BackendClusterItem, BBox, ZoomTier } from "@/types/geospatial";
import { formatToman } from "./format";

export const ZOOM_THRESHOLD = 14;

/**
 * Returns whether the zoom level belongs to the backend live aggregation tier (<14)
 * or the frontend superclustering tier (>=14).
 */
export function getZoomTier(zoom: number): ZoomTier {
	return zoom < ZOOM_THRESHOLD ? "clustered" : "raw";
}

/**
 * Rounds bounding box coordinates to a coarse grid (default 0.01 degrees)
 * for stable TanStack Query cache keys.
 */
export function snapBBox(bbox: BBox, precision = 0.01): BBox {
	const minLng = Number(
		(Math.floor(bbox[0] / precision) * precision).toFixed(4),
	);
	const minLat = Number(
		(Math.floor(bbox[1] / precision) * precision).toFixed(4),
	);
	const maxLng = Number(
		(Math.ceil(bbox[2] / precision) * precision).toFixed(4),
	);
	const maxLat = Number(
		(Math.ceil(bbox[3] / precision) * precision).toFixed(4),
	);
	return [minLng, minLat, maxLng, maxLat];
}

/**
 * Expands bounding box coordinates by a percentage margin (default 25%)
 * to provide a client-side panning buffer at zoom >= 14.
 */
export function expandBBox(bbox: BBox, marginPercent = 0.25): BBox {
	const width = bbox[2] - bbox[0];
	const height = bbox[3] - bbox[1];
	const padX = Math.max(0.002, width * marginPercent);
	const padY = Math.max(0.002, height * marginPercent);

	return [
		Math.max(-180, Number((bbox[0] - padX).toFixed(5))),
		Math.max(-85, Number((bbox[1] - padY).toFixed(5))),
		Math.min(180, Number((bbox[2] + padX).toFixed(5))),
		Math.min(85, Number((bbox[3] + padY).toFixed(5))),
	];
}

/**
 * Checks if the inner bounding box is completely contained inside the outer bounding box.
 */
export function isBBoxContained(inner: BBox, outer: BBox): boolean {
	// [minLng, minLat, maxLng, maxLat]
	const EPS = 0.00001;
	return (
		inner[0] >= outer[0] - EPS &&
		inner[1] >= outer[1] - EPS &&
		inner[2] <= outer[2] + EPS &&
		inner[3] <= outer[3] + EPS
	);
}

/**
 * Computes grid cell size (in degrees) for live backend aggregation per zoom level.
 */
export function getGridSizeForZoom(zoom: number): number {
	const z = Math.floor(zoom);
	if (z <= 6) return 0.5;
	if (z === 7) return 0.25;
	if (z === 8) return 0.12;
	if (z === 9) return 0.06;
	if (z === 10) return 0.03;
	if (z === 11) return 0.015;
	if (z === 12) return 0.008;
	if (z === 13) return 0.004;
	return 0.002;
}

/**
 * Formats cluster summary price range for UI tooltips
 */
export function formatClusterPriceSummary(cluster: BackendClusterItem): string {
	if (cluster.dealType === "rent") {
		if (cluster.minDeposit != null && cluster.maxDeposit != null) {
			if (cluster.minDeposit === cluster.maxDeposit) {
				return `رهن: ${formatToman(cluster.minDeposit)}`;
			}
			return `رهن: ${formatToman(cluster.minDeposit)} تا ${formatToman(cluster.maxDeposit)}`;
		}
		if (cluster.minRent != null && cluster.maxRent != null) {
			if (cluster.minRent === cluster.maxRent) {
				return `اجاره: ${formatToman(cluster.minRent)}`;
			}
			return `اجاره: ${formatToman(cluster.minRent)} تا ${formatToman(cluster.maxRent)}`;
		}
		return "توافقی";
	}

	if (cluster.minPrice != null && cluster.maxPrice != null) {
		if (cluster.minPrice === cluster.maxPrice) {
			return `قیمت: ${formatToman(cluster.minPrice)}`;
		}
		return `قیمت: ${formatToman(cluster.minPrice)} تا ${formatToman(cluster.maxPrice)}`;
	}

	return "توافقی";
}

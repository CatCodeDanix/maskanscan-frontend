import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatToman, toPersianDigits } from "@/lib/format";
import type { BBox } from "@/types/geospatial";
import type { ListingFilters } from "@/types/listing";

export interface SavedSearchItem {
	id: string;
	title: string;
	createdAt: string;
	filters: ListingFilters;
	bbox?: BBox | null;
	zoom?: number;
	hasAlert: boolean;
	matchCount?: number;
}

export function generateAutoSearchTitle(filters: ListingFilters): string {
	const parts: string[] = [];

	if (filters.district) {
		parts.push(`محله ${filters.district}`);
	}

	if (filters.maxDeposit) {
		parts.push(`رهن تا ${formatToman(filters.maxDeposit)}`);
	} else if (filters.minDeposit) {
		parts.push(`رهن از ${formatToman(filters.minDeposit)}`);
	}

	if (filters.maxRent) {
		parts.push(`اجاره تا ${formatToman(filters.maxRent)}`);
	}

	if (filters.bedrooms !== undefined) {
		parts.push(
			filters.bedrooms === 0
				? "بدون خواب"
				: `${toPersianDigits(filters.bedrooms)} خواب`,
		);
	}

	if (filters.minArea) {
		parts.push(`متراژ +${toPersianDigits(filters.minArea)}`);
	}

	if (filters.hasParking) parts.push("پارکینگ");
	if (filters.hasElevator) parts.push("آسانسور");
	if (filters.isConvertible) parts.push("قابل تبدیل");

	if (parts.length === 0) {
		return "همه آگهی‌های رهن و اجاره تهران";
	}

	return parts.join(" • ");
}

const INITIAL_SAVED_SEARCHES: SavedSearchItem[] = [
	{
		id: "saved-search-1",
		title: "آپارتمان ۲ خواب با پارکینگ و آسانسور",
		createdAt: "۱۴۰۳/۰۵/۱۰",
		filters: {
			dealType: "rent",
			bedrooms: 2,
			hasParking: true,
			hasElevator: true,
			maxDeposit: 600000000,
			maxRent: 15000000,
		},
		zoom: 12,
		hasAlert: true,
		matchCount: 142,
	},
	{
		id: "saved-search-2",
		title: "رهن کامل تا ۸۰۰ میلیون (قابل تبدیل)",
		createdAt: "۱۴۰۳/۰۵/۱۸",
		filters: {
			dealType: "rent",
			maxDeposit: 800000000,
			isConvertible: true,
			minArea: 75,
		},
		zoom: 11,
		hasAlert: false,
		matchCount: 89,
	},
];

interface SavedSearchesState {
	savedSearches: SavedSearchItem[];
	addSavedSearch: (
		filters: ListingFilters,
		title?: string,
		bbox?: BBox | null,
		zoom?: number,
	) => string;
	removeSavedSearch: (id: string) => void;
	toggleAlert: (id: string) => void;
	updateSearchTitle: (id: string, newTitle: string) => void;
	clearAllSearches: () => void;
}

export const useSavedSearchesStore = create<SavedSearchesState>()(
	persist(
		(set) => ({
			savedSearches: INITIAL_SAVED_SEARCHES,

			addSavedSearch: (filters, customTitle, bbox, zoom) => {
				const id = `search-${Date.now()}`;
				const title = customTitle?.trim() || generateAutoSearchTitle(filters);
				const newItem: SavedSearchItem = {
					id,
					title,
					createdAt: new Date().toLocaleDateString("fa-IR"),
					filters: { ...filters },
					bbox: bbox ? [...bbox] : null,
					zoom: zoom ?? 12,
					hasAlert: true,
					matchCount: Math.floor(Math.random() * 80) + 15,
				};

				set((state) => ({
					savedSearches: [newItem, ...state.savedSearches],
				}));

				return id;
			},

			removeSavedSearch: (id) => {
				set((state) => ({
					savedSearches: state.savedSearches.filter((s) => s.id !== id),
				}));
			},

			toggleAlert: (id) => {
				set((state) => ({
					savedSearches: state.savedSearches.map((s) =>
						s.id === id ? { ...s, hasAlert: !s.hasAlert } : s,
					),
				}));
			},

			updateSearchTitle: (id, newTitle) => {
				if (!newTitle.trim()) return;
				set((state) => ({
					savedSearches: state.savedSearches.map((s) =>
						s.id === id ? { ...s, title: newTitle.trim() } : s,
					),
				}));
			},

			clearAllSearches: () => {
				set({ savedSearches: [] });
			},
		}),
		{
			name: "maskanscan-saved-searches",
		},
	),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UnifiedListing } from "@/types/listing";

interface FavoritesState {
	favoriteListings: UnifiedListing[];
	favoriteKeys: Set<string>;
	addFavorite: (listing: UnifiedListing) => void;
	removeFavorite: (source: string, externalId: string) => void;
	toggleFavorite: (listing: UnifiedListing) => void;
	isFavorite: (source: string, externalId: string) => boolean;
	clearFavorites: () => void;
}

function getKey(source: string, externalId: string) {
	return `${source}:${externalId}`;
}

export const useFavoritesStore = create<FavoritesState>()(
	persist(
		(set, get) => ({
			favoriteListings: [],
			favoriteKeys: new Set<string>(),

			addFavorite: (listing) => {
				const key = getKey(listing.source, listing.externalId);
				const current = get().favoriteListings;
				if (current.some((l) => getKey(l.source, l.externalId) === key)) return;

				const nextListings = [listing, ...current];
				const nextKeys = new Set(get().favoriteKeys);
				nextKeys.add(key);

				set({
					favoriteListings: nextListings,
					favoriteKeys: nextKeys,
				});
			},

			removeFavorite: (source, externalId) => {
				const key = getKey(source, externalId);
				const nextListings = get().favoriteListings.filter(
					(l) => getKey(l.source, l.externalId) !== key,
				);
				const nextKeys = new Set(get().favoriteKeys);
				nextKeys.delete(key);

				set({
					favoriteListings: nextListings,
					favoriteKeys: nextKeys,
				});
			},

			toggleFavorite: (listing) => {
				if (get().isFavorite(listing.source, listing.externalId)) {
					get().removeFavorite(listing.source, listing.externalId);
				} else {
					get().addFavorite(listing);
				}
			},

			isFavorite: (source, externalId) => {
				const key = getKey(source, externalId);
				return (
					get().favoriteKeys.has(key) ||
					get().favoriteListings.some(
						(l) => l.source === source && l.externalId === externalId,
					)
				);
			},

			clearFavorites: () => {
				set({ favoriteListings: [], favoriteKeys: new Set() });
			},
		}),
		{
			name: "maskanscan-favorites-storage",
			partialize: (state) => ({
				favoriteListings: state.favoriteListings,
			}),
			onRehydrateStorage: () => (state) => {
				if (state?.favoriteListings) {
					const keys = new Set<string>(
						state.favoriteListings.map((l) => getKey(l.source, l.externalId)),
					);
					state.favoriteKeys = keys;
				}
			},
		},
	),
);

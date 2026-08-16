import { beforeEach, describe, expect, it } from "vitest";
import {
	generateAutoSearchTitle,
	useSavedSearchesStore,
} from "./saved-searches-store";

describe("SavedSearchesStore", () => {
	beforeEach(() => {
		useSavedSearchesStore.setState({
			savedSearches: [],
		});
	});

	it("should generate descriptive Persian titles from rent filters", () => {
		const title = generateAutoSearchTitle({
			dealType: "rent",
			bedrooms: 2,
			hasParking: true,
			maxDeposit: 500000000,
		});

		expect(title).toContain("۵۰۰ میلیون");
		expect(title).toContain("۲ خواب");
		expect(title).toContain("پارکینگ");
	});

	it("should add a new saved search", () => {
		const id = useSavedSearchesStore.getState().addSavedSearch(
			{
				dealType: "rent",
				maxDeposit: 400000000,
				bedrooms: 1,
			},
			"جستجوی تستی",
		);

		const state = useSavedSearchesStore.getState();
		expect(state.savedSearches.length).toBe(1);
		expect(state.savedSearches[0].id).toBe(id);
		expect(state.savedSearches[0].title).toBe("جستجوی تستی");
		expect(state.savedSearches[0].hasAlert).toBe(true);
	});

	it("should toggle alerts and delete searches", () => {
		const id = useSavedSearchesStore.getState().addSavedSearch({
			dealType: "rent",
		});

		// Toggle alert off
		useSavedSearchesStore.getState().toggleAlert(id);
		expect(useSavedSearchesStore.getState().savedSearches[0].hasAlert).toBe(
			false,
		);

		// Toggle alert on
		useSavedSearchesStore.getState().toggleAlert(id);
		expect(useSavedSearchesStore.getState().savedSearches[0].hasAlert).toBe(
			true,
		);

		// Delete search
		useSavedSearchesStore.getState().removeSavedSearch(id);
		expect(useSavedSearchesStore.getState().savedSearches.length).toBe(0);
	});
});

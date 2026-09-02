import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useNotificationsStore } from "@/store/notifications-store";
import { useSavedSearchesStore } from "@/store/saved-searches-store";
import { NotificationsPanel } from "./NotificationsPanel";
import { SavedSearchesPanel } from "./SavedSearchesPanel";
import { SettingsPanel } from "./SettingsPanel";

describe("Drawer Panels Suite", () => {
	beforeEach(() => {
		useSavedSearchesStore.setState({
			savedSearches: [],
		});
		useNotificationsStore.setState({
			notifications: [],
			unreadCount: 0,
		});
	});

	describe("SavedSearchesPanel", () => {
		it("renders empty state when no saved searches exist", () => {
			render(<SavedSearchesPanel />);
			expect(
				screen.getByText("هنوز جستجویی ذخیره نکرده‌اید"),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /ذخیره جستجوی فعلی/i }),
			).toBeInTheDocument();
		});

		it("saves current search and renders card", () => {
			render(<SavedSearchesPanel />);
			const saveBtn = screen.getByRole("button", {
				name: /ذخیره جستجوی فعلی/i,
			});
			fireEvent.click(saveBtn);

			expect(useSavedSearchesStore.getState().savedSearches.length).toBe(1);
			expect(screen.getByText("اعمال روی نقشه")).toBeInTheDocument();
		});
	});

	describe("NotificationsPanel", () => {
		it("renders empty state when no notifications exist", () => {
			render(<NotificationsPanel />);
			expect(
				screen.getByText("اعلانی در این بخش وجود ندارد"),
			).toBeInTheDocument();
		});

		it("renders notification items and allows marking all as read", () => {
			useNotificationsStore.setState({
				notifications: [
					{
						id: "test-notif-1",
						type: "system",
						title: "تست اعلان سیستم",
						description: "توضیحات تستی برای اعلان",
						createdAt: "الان",
						isRead: false,
					},
				],
				unreadCount: 1,
			});

			render(<NotificationsPanel />);
			expect(screen.getByText("تست اعلان سیستم")).toBeInTheDocument();

			const markAllBtn = screen.getByRole("button", {
				name: /خواندن همه/i,
			});
			fireEvent.click(markAllBtn);

			expect(useNotificationsStore.getState().unreadCount).toBe(0);
		});
	});

	describe("SettingsPanel", () => {
		it("renders settings sections including theme, map styles, and user profile", () => {
			render(<SettingsPanel />);
			expect(screen.getByText("پوسته و ظاهر برنامه")).toBeInTheDocument();
			expect(screen.getByText("تنظیمات نقشه و لایه‌ها")).toBeInTheDocument();
			expect(
				screen.getByText("مدیریت حافظه و داده‌های محلی"),
			).toBeInTheDocument();
			expect(screen.getByText(/مسکن‌اسکن/i)).toBeInTheDocument();
		});
	});
});

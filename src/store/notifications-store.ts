import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ListingFilters } from "@/types/listing";

export type NotificationType = "price_drop" | "new_match" | "system";

export interface NotificationItem {
	id: string;
	type: NotificationType;
	title: string;
	description: string;
	createdAt: string;
	isRead: boolean;
	source?: string;
	externalId?: string;
	oldDeposit?: number;
	newDeposit?: number;
	oldRent?: number;
	newRent?: number;
	district?: string;
	filters?: ListingFilters;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
	{
		id: "notif-1",
		type: "price_drop",
		title: "کاهش ودیعه در آگهی نشان‌شده",
		description:
			"ودیعه آپارتمان ۹۰ متری در سعادت‌آباد از ۷۰۰ به ۶۰۰ میلیون تومان کاهش یافت.",
		createdAt: "۱۰ دقیقه پیش",
		isRead: false,
		source: "divar",
		externalId: "demo-notif-listing-1",
		oldDeposit: 700000000,
		newDeposit: 600000000,
		district: "سعادت‌آباد",
	},
	{
		id: "notif-2",
		type: "new_match",
		title: "۳ آگهی جدید مطابق جستجوی شما",
		description:
			"آگهی‌های جدید مطابق با «آپارتمان ۲ خواب با پارکینگ و آسانسور» منتشر شد.",
		createdAt: "۲ ساعت پیش",
		isRead: false,
		filters: {
			dealType: "rent",
			bedrooms: 2,
			hasParking: true,
			hasElevator: true,
			maxDeposit: 600000000,
		},
	},
	{
		id: "notif-3",
		type: "system",
		title: "پوشش کامل خطوط مترو و BRT تهران",
		description:
			"لایه‌های دسترسی به ایستگاه‌های مترو و بی‌آرتی تهران به نقشه مسکن‌اسکن اضافه شد.",
		createdAt: "دیروز",
		isRead: true,
	},
	{
		id: "notif-4",
		type: "price_drop",
		title: "تخفیف در اجاره ماهانه",
		description:
			"اجاره ماهانه آپارتمان ۱۱۰ متری در پونک از ۱۸ به ۱۵ میلیون تومان کاهش پیدا کرد.",
		createdAt: "۳ روز پیش",
		isRead: true,
		source: "sheypoor",
		externalId: "demo-notif-listing-2",
		oldRent: 18000000,
		newRent: 15000000,
		district: "پونک",
	},
];

interface NotificationsState {
	notifications: NotificationItem[];
	unreadCount: number;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	deleteNotification: (id: string) => void;
	clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
	persist(
		(set, get) => ({
			notifications: INITIAL_NOTIFICATIONS,
			unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,

			markAsRead: (id) => {
				const next = get().notifications.map((n) =>
					n.id === id ? { ...n, isRead: true } : n,
				);
				set({
					notifications: next,
					unreadCount: next.filter((n) => !n.isRead).length,
				});
			},

			markAllAsRead: () => {
				const next = get().notifications.map((n) => ({
					...n,
					isRead: true,
				}));
				set({
					notifications: next,
					unreadCount: 0,
				});
			},

			deleteNotification: (id) => {
				const next = get().notifications.filter((n) => n.id !== id);
				set({
					notifications: next,
					unreadCount: next.filter((n) => !n.isRead).length,
				});
			},

			clearAll: () => {
				set({
					notifications: [],
					unreadCount: 0,
				});
			},
		}),
		{
			name: "maskanscan-notifications",
		},
	),
);

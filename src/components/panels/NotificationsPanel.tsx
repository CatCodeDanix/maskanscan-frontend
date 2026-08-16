"use client";

import {
	ArrowLeft,
	Bell,
	CheckCheck,
	Info,
	Sparkles,
	Trash2,
	TrendingDown,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/format";
import { useListingStore } from "@/store/listing-store";
import { useNavigationStore } from "@/store/navigation-store";
import {
	type NotificationItem,
	useNotificationsStore,
} from "@/store/notifications-store";

export function NotificationsPanel() {
	const [activeTab, setActiveTab] = useState<"all" | "unread" | "price_drops">(
		"all",
	);

	const notifications = useNotificationsStore((s) => s.notifications);
	const unreadCount = useNotificationsStore((s) => s.unreadCount);
	const markAsRead = useNotificationsStore((s) => s.markAsRead);
	const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
	const deleteNotification = useNotificationsStore((s) => s.deleteNotification);
	const clearAll = useNotificationsStore((s) => s.clearAll);

	const selectListingById = useListingStore((s) => s.selectListingById);
	const patchDraft = useListingStore((s) => s.patchDraft);
	const applyDraftFilters = useListingStore((s) => s.applyDraftFilters);
	const setActiveItemId = useNavigationStore((s) => s.setActiveItemId);

	const filteredNotifications = notifications.filter((n) => {
		if (activeTab === "unread") return !n.isRead;
		if (activeTab === "price_drops") return n.type === "price_drop";
		return true;
	});

	const handleNotificationClick = (item: NotificationItem) => {
		markAsRead(item.id);

		if (item.source && item.externalId) {
			void selectListingById(item.source, item.externalId);
			toast.success("آگهی انتخاب شد.");
		} else if (item.filters) {
			patchDraft(item.filters);
			applyDraftFilters();
			setActiveItemId("listings");
			toast.success("فیلترهای آگهی جدید روی نقشه اعمال شد.");
		}
	};

	const getIcon = (type: NotificationItem["type"]) => {
		switch (type) {
			case "price_drop":
				return <TrendingDown className="size-4 text-emerald-500" />;
			case "new_match":
				return <Sparkles className="size-4 text-primary" />;
			case "system":
				return <Info className="size-4 text-amber-500" />;
		}
	};

	return (
		<div className="flex h-full flex-col bg-background text-right" dir="rtl">
			{/* Header with Tabs & Mark All as Read */}
			<div className="sticky top-0 z-10 border-b bg-background/95 p-3 backdrop-blur-xs space-y-2.5 shadow-2xs">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<span className="text-xs font-bold text-foreground">
							مرکز اعلان‌ها
						</span>
						{unreadCount > 0 && (
							<Badge
								variant="default"
								className="h-5 px-1.5 text-[10px] font-bold rounded-full bg-primary"
							>
								{unreadCount} جدید
							</Badge>
						)}
					</div>

					{notifications.length > 0 && (
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									markAllAsRead();
									toast.success("همه اعلان‌ها به عنوان خوانده‌شده علامت خوردند.");
								}}
								className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
							>
								<CheckCheck className="size-3.5" />
								خواندن همه
							</Button>

							<Button
								variant="ghost"
								size="icon"
								onClick={() => {
									clearAll();
									toast.info("تمام اعلان‌ها پاک شدند.");
								}}
								className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
								aria-label="پاکسازی همه"
							>
								<Trash2 className="size-3.5" />
							</Button>
						</div>
					)}
				</div>

				{/* Filter Tabs */}
				<div className="flex rounded-xl bg-muted/60 p-0.5 text-xs font-semibold">
					<button
						type="button"
						onClick={() => setActiveTab("all")}
						className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
							activeTab === "all"
								? "bg-background text-foreground shadow-2xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						همه ({notifications.length})
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("unread")}
						className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
							activeTab === "unread"
								? "bg-background text-foreground shadow-2xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						خوانده‌نشده ({unreadCount})
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("price_drops")}
						className={`flex-1 py-1.5 text-center rounded-lg transition-all ${
							activeTab === "price_drops"
								? "bg-background text-foreground shadow-2xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						کاهش قیمت
					</button>
				</div>
			</div>

			{/* Notifications List */}
			<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
				{filteredNotifications.length === 0 ? (
					<div className="flex h-64 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
						<div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
							<Bell className="size-6 stroke-1.5 opacity-50" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-bold text-foreground">
								اعلانی در این بخش وجود ندارد
							</p>
							<p className="text-xs text-muted-foreground max-w-[220px]">
								تغییرات قیمت ملک‌های نشان‌شده و آگهی‌های جدید در اینجا نمایش داده
								می‌شوند.
							</p>
						</div>
					</div>
				) : (
					filteredNotifications.map((item) => (
						<div
							key={item.id}
							onClick={() => handleNotificationClick(item)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									handleNotificationClick(item);
								}
							}}
							role="button"
							tabIndex={0}
							className={`group relative rounded-xl border p-3.5 space-y-2 cursor-pointer transition-all ${
								item.isRead
									? "bg-card/60 border-border/50 opacity-85 hover:opacity-100 hover:border-border"
									: "bg-card border-primary/30 shadow-2xs ring-1 ring-primary/10"
							}`}
						>
							<div className="flex items-start justify-between gap-2">
								<div className="flex items-center gap-2">
									<div className="size-8 rounded-xl bg-muted/80 flex items-center justify-center shrink-0 border border-border/40">
										{getIcon(item.type)}
									</div>
									<div>
										<h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
											{!item.isRead && (
												<span className="size-2 rounded-full bg-primary shrink-0" />
											)}
											{item.title}
										</h4>
										<span className="text-[10px] text-muted-foreground block">
											{item.createdAt}
										</span>
									</div>
								</div>

								{/* Delete Single Item */}
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										deleteNotification(item.id);
									}}
									className="size-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
									aria-label="حذف اعلان"
								>
									<X className="size-3" />
								</Button>
							</div>

							<p className="text-xs text-muted-foreground leading-relaxed pr-10">
								{item.description}
							</p>

							{/* Price comparison badge for price drops */}
							{item.oldDeposit && item.newDeposit && (
								<div className="flex items-center gap-1.5 pr-10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
									<span>ودیعه:</span>
									<span className="line-through text-muted-foreground font-normal">
										{formatToman(item.oldDeposit)}
									</span>
									<ArrowLeft className="size-3 text-emerald-500 shrink-0" />
									<span>{formatToman(item.newDeposit)}</span>
								</div>
							)}
							{item.oldRent && item.newRent && (
								<div className="flex items-center gap-1.5 pr-10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
									<span>اجاره:</span>
									<span className="line-through text-muted-foreground font-normal">
										{formatToman(item.oldRent)}
									</span>
									<ArrowLeft className="size-3 text-emerald-500 shrink-0" />
									<span>{formatToman(item.newRent)}</span>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}

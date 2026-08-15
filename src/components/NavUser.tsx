"use client";

import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "؟";
	return parts
		.slice(0, 2)
		.map((part) => part[0])
		.join("");
}

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar?: string;
	};
}) {
	const initials = getInitials(user.name);

	return (
		<DropdownMenu dir="rtl">
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="group relative flex size-9.5 items-center justify-center rounded-xl p-0 transition-all duration-200 hover:scale-105 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95"
						>
							<Avatar className="size-8.5 rounded-lg border border-border/80 shadow-xs transition-shadow group-hover:shadow-md">
								<AvatarImage src={user.avatar || undefined} alt={user.name} />
								<AvatarFallback className="rounded-lg bg-primary/15 text-primary font-bold text-xs">
									{initials}
								</AvatarFallback>
							</Avatar>
						</button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="left" className="text-xs">
					حساب کاربری ({user.name})
				</TooltipContent>
			</Tooltip>

			<DropdownMenuContent
				className="w-60 rounded-xl p-1.5 shadow-2xl border bg-popover/98 backdrop-blur-md z-50"
				side="left"
				align="end"
				sideOffset={12}
			>
				<DropdownMenuLabel className="p-2 font-normal">
					<div className="flex items-center gap-3">
						<Avatar className="size-9 rounded-lg border shrink-0">
							<AvatarImage src={user.avatar || undefined} alt={user.name} />
							<AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col text-right overflow-hidden">
							<span className="truncate text-xs font-bold text-foreground">
								{user.name}
							</span>
							<span className="truncate text-[11px] text-muted-foreground">
								{user.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem className="cursor-pointer gap-2 py-2 text-xs">
					<User className="size-4 text-muted-foreground shrink-0" />
					<span>پروفایل من</span>
				</DropdownMenuItem>

				<DropdownMenuItem className="cursor-pointer gap-2 py-2 text-xs">
					<CreditCard className="size-4 text-muted-foreground shrink-0" />
					<span>اشتراک و پلن‌ها</span>
				</DropdownMenuItem>

				<DropdownMenuItem className="cursor-pointer gap-2 py-2 text-xs">
					<Settings className="size-4 text-muted-foreground shrink-0" />
					<span>تنظیمات حساب</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem className="cursor-pointer gap-2 py-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10">
					<LogOut className="size-4 shrink-0" />
					<span>خروج از حساب</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

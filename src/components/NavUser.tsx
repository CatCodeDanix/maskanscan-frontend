"use client";

import { CreditCard, LogOut, UserRound } from "lucide-react";

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
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) {
		return "؟";
	}

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
		avatar: string;
	};
}) {
	const { isMobile } = useSidebar();

	const initials = getInitials(user.name);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="
                data-[state=open]:bg-sidebar-accent
                data-[state=open]:text-sidebar-accent-foreground
                md:h-8
                md:p-0
              "
						>
							<Avatar className="size-8 rounded-lg">
								<AvatarImage src={user.avatar} alt={user.name} />

								<AvatarFallback className="rounded-lg">
									{initials}
								</AvatarFallback>
							</Avatar>

							<div className="grid flex-1 text-right text-sm/tight">
								<span className="truncate font-medium">{user.name}</span>

								<span className="truncate text-xs">{user.email}</span>
							</div>

							<LogOut
								className="
                  ms-auto
                  size-4
                  rotate-180
                  opacity-70
                "
							/>
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="
              w-(--radix-dropdown-menu-trigger-width)
              min-w-56
              rounded-lg
            "
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div
								className="
                  flex
                  items-center
                  gap-2
                  px-1
                  py-1.5
                  text-right
                  text-sm
                "
							>
								<Avatar className="size-8 rounded-lg">
									<AvatarImage src={user.avatar} alt={user.name} />

									<AvatarFallback className="rounded-lg">
										{initials}
									</AvatarFallback>
								</Avatar>

								<div className="grid flex-1 text-right text-sm/tight">
									<span className="truncate font-medium">{user.name}</span>

									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem>
							<UserRound />
							پروفایل و تنظیمات
						</DropdownMenuItem>

						<DropdownMenuItem>
							<CreditCard />
							اشتراک من
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem>
							<LogOut />
							خروج از حساب
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

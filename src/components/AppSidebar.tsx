"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useNavigationStore } from "@/store/navigation-store";

import type { NavItem } from "@/store/navigation-store";
import { useMemo } from "react";

export const placeholderUser = {
  name: "کاربر",
  email: "user@example.com",
  avatar: "/avatars/default.jpg",
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onItemClick: (itemId: string) => void;
}

export function AppSidebar({ onItemClick, ...props }: AppSidebarProps) {
  const router = useRouter();

  const { open, setOpen } = useSidebar();

  const items = useNavigationStore((s) => s.items);
  const activeItemId = useNavigationStore((s) => s.activeItemId);

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];

  const activeTitle = activeItem?.title ?? "ناوبری";

  const panelContent = useMemo(() => {
    if (activeItem?.type === "panel") {
      const Component = activeItem.component;

      return <Component />;
    }

    return null;
  }, [activeItem]);

  const handleClick = (item: NavItem) => {
    if (item.type === "link") {
      router.push(item.url);

      return;
    }

    if (item.type === "action") {
      item.onClick();

      return;
    }

    // Toggle current panel
    if (item.id === activeItemId) {
      setOpen(!open);

      return;
    }

    // Open new panel
    onItemClick(item.id);
    setOpen(true);
  };

  return (
    <Sidebar
      dir="rtl"
      side="right"
      collapsible="icon"
      className="
        overflow-hidden
        *:data-[sidebar=sidebar]:flex-row
      "
      {...props}
    >
      {/* Icon rail */}
      <Sidebar
        collapsible="none"
        className="
         bg-background
          w-[calc(var(--sidebar-width-icon)+1px)]!
          border-r
        "
      >
        <SidebarHeader className="mt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/" aria-label="صفحه اصلی مسکن‌اسکن">
                  <div
                    className="
                      bg-primary
                      text-foreground
                      flex
                      aspect-square
                      size-8
                      items-center
                      justify-center
                      rounded-lg
                    "
                  >
                    <Home className="size-5" />
                  </div>

                  <div className="grid flex-1 text-right text-sm/tight">
                    <span className="truncate font-medium">مسکن‌اسکن</span>

                    <span className="truncate text-xs">جست‌وجوی ملک</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent
              className="
                px-1.5
                md:px-0
              "
            >
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => handleClick(item)}
                      isActive={item.id === activeItemId}
                      className="
                        px-2.5
                        py-2
                        md:px-2
                      "
                    >
                      <item.icon className="size-4 shrink-0" />

                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={placeholderUser} />
        </SidebarFooter>
      </Sidebar>

      {/* Content panel */}
      <Sidebar
        collapsible="none"
        className="
          hidden
          flex-1
          md:flex
        "
      >
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="text-foreground text-base font-medium">
            {activeTitle}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>{panelContent}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}

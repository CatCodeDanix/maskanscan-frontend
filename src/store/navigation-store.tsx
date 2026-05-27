import {
  Bell,
  Bookmark,
  Heart,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { create } from "zustand";

// Panel components
import { FiltersPanel } from "@/components/panels/FiltersPanel";
import { FavoritesPanel } from "@/components/panels/FavoritesPanel";
import { SavedSearchesPanel } from "@/components/panels/SavedSearchesPanel";
import { NotificationsPanel } from "@/components/panels/NotificationsPanel";
import { SettingsPanel } from "@/components/panels/SettingsPanel";

// ── Discriminated union types ──

interface BaseNavItem {
  id: string;
  title: string;
  icon: LucideIcon;
}

interface LinkNavItem extends BaseNavItem {
  type: "link";
  url: string;
}

interface ActionNavItem extends BaseNavItem {
  type: "action";
  onClick: () => void;
}

interface PanelNavItem extends BaseNavItem {
  type: "panel";
  component: React.ComponentType;
}

export type NavItem = LinkNavItem | ActionNavItem | PanelNavItem;

// ── Default configuration ──

export const defaultNavItems: NavItem[] = [
  {
    id: "filters",
    title: "فیلترها",
    icon: Search,
    type: "panel",
    component: FiltersPanel,
  },

  {
    id: "saved-searches",
    title: "جستجوهای ذخیره‌شده",
    icon: Bookmark,
    type: "panel",
    component: SavedSearchesPanel,
  },

  {
    id: "favorites",
    title: "علاقه‌مندی‌ها",
    icon: Heart,
    type: "panel",
    component: FavoritesPanel,
  },

  {
    id: "notifications",
    title: "اعلان‌ها",
    icon: Bell,
    type: "panel",
    component: NotificationsPanel,
  },

  {
    id: "settings",
    title: "تنظیمات",
    icon: Settings,
    type: "panel",
    component: SettingsPanel,
  },
];

// ── Store ──

interface NavigationState {
  items: NavItem[];

  activeItemId: string;

  setActiveItemId: (id: string) => void;

  getItemById: (id: string) => NavItem | undefined;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  items: defaultNavItems,

  activeItemId: "filters",

  setActiveItemId: (id) => set({ activeItemId: id }),

  getItemById: (id) => get().items.find((item) => item.id === id),
}));

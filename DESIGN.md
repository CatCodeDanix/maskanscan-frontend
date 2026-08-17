---
name: MaskanScan
description: The Urban Navigator — Tehran's real-time rental aggregation and geospatial discovery platform
colors:
  primary: "oklch(0.697 0.148 71)"
  primary-foreground: "oklch(0.145 0 0)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.697 0.148 71 / 0.5)"
typography:
  display:
    fontFamily: "var(--font-iran-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  headline:
    fontFamily: "var(--font-iran-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: "var(--font-iran-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: "var(--font-iran-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-iran-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
---

# Design System: MaskanScan

## Overview

**Creative North Star: "The Urban Navigator"**

MaskanScan is a high-density, spatial instrument built specifically for rapid exploration and analysis of Tehran's rental market. The interface recedes cleanly into the background, prioritizing the geospatial map canvas while floating glassmorphic panels and drawer controls afford effortless filtering, price conversion, and listing inspection.

The visual language balances utility-grade precision with warm civic character. Warm saffron-orange accents punch through clean neutral backdrops to guide user focus toward interactive points, selected map clusters, and primary actions without visual clutter or loud ornamentation.

**Key Characteristics:**
- Spatial-first canvas with layered translucent glass interfaces (`backdrop-blur-md`).
- High-contrast Persian typography driven by IRANSansX with strict RTL spatial rhythm.
- Vibrant saffron-orange brand accent deployed with disciplined rarity for actionable elements.
- Information-dense cards with clear visual hierarchy, badge attribution, and instant spatial feedback.

## Colors

The palette pairs high-legibility neutral surfaces with a high-visibility Persian saffron orange accent, complemented by distinct portal source badges.

### Primary
- **Saffron Orange** (`oklch(0.697 0.148 71)` / `#e58a13`): The brand's signature accent. Used selectively on active map markers, primary buttons, selected tabs, active toggles, and conversion callouts.

### Secondary
- **Subtle Surface Tint** (`oklch(0.97 0 0)` light / `oklch(0.269 0 0)` dark): Used for secondary buttons, active drawer items, and elevated pill filters.

### Neutral
- **Canvas Background** (`oklch(1 0 0)` light / `oklch(0.145 0 0)` dark): Pure light background and deep charcoal dark surface.
- **Card & Popover Surface** (`oklch(1 0 0)` light / `oklch(0.205 0 0)` dark): Clean card containers with subtle borders.
- **Border & Input Stroke** (`oklch(0.922 0 0)` light / `oklch(1 0 0 / 10%)` dark): Delicate boundary lines that structure dense content without heavy visual weight.
- **Muted Text & Metadata** (`oklch(0.556 0 0)` light / `oklch(0.708 0 0)` dark): Used for secondary labels, dates, neighborhood names, and inactive states.

### Named Rules
**The Rarity of Orange Rule.** The primary saffron-orange accent is reserved strictly for interactive state, selected pins, and confirmed CTA actions. It covers ≤ 10% of any viewport.

**The Portal Attribution Rule.** Scraped listings must retain their distinct portal badges (Divar: Red `#dc2626`, Sheypoor: Blue `#2563eb`, Kilid: Violet `#7c3aed`, MrEstate: Emerald `#059669`) to guarantee source authenticity.

## Typography

**Display Font:** IRANSansX (with fallback to ui-sans-serif, system-ui, sans-serif)  
**Body Font:** IRANSansX (with fallback to ui-sans-serif, system-ui, sans-serif)  
**Numerical / Metric:** IRANSansX with Persian digits (`font-feature-settings: "ss01", "ss02"`)

**Character:** Balanced modern Persian geometry with clear letterform distinction, optimized for rapid scanning of property specs, currency figures, and district names.

### Hierarchy
- **Display** (Bold 700, 1.5rem / 24px, line-height 1.3): Major modal titles and splash screen headers.
- **Headline** (Bold 700, 1.125rem / 18px, line-height 1.4): Panel headers, section dividers, and key metrics.
- **Title** (SemiBold 600, 1rem / 16px, line-height 1.5): Property card titles, neighborhood names, and dialog headers.
- **Body** (Regular 400, 0.875rem / 14px, line-height 1.6): Listing descriptions, filter options, and user inputs.
- **Label** (Medium 500, 0.75rem / 12px, line-height 1.4): Badges, price sub-labels (رهن / اجاره), tags, and metadata captions.

### Named Rules
**The Native Persian Digits Rule.** All numerical figures (prices in Tomans, areas in sq.m, bedroom counts, dates) must render with Persian digits (۰-۹) to provide an authentic, fluent RTL reading experience.

## Layout

MaskanScan employs an interactive dual-state spatial layout:
- **Desktop Layout:** Full-bleed interactive MapLibre/Deck.gl canvas underneath a fixed navigation rail (`w-13` / 52px) on the right (RTL start), with a collapsible 360–380px drawer panel offering both "Push" (side-by-side) and "Overlay" (floating glass) presentation modes.
- **Mobile Layout:** Full-viewport interactive map with a floating top search bar and a bottom navigation bar (`h-16`) paired with a bottom touch-swipeable Content Drawer.
- **Spacing Scale:** Built on a tight 4px geometric progression (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`), maintaining high informational density suitable for real estate listings.

## Elevation & Depth

Depth is achieved through translucent glassmorphic surfaces (`backdrop-blur-md` with 90–95% background opacity) combined with razor-thin boundary strokes (`border-border`) and layered ambient shadows.

### Shadow Vocabulary
- **Ambient Micro** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): Used on rest cards and small action buttons.
- **Card Hover** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Used when hovering over listing cards and floating map controls.
- **Drawer Overlay** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): Used on floating drawer panels in overlay mode to separate controls from map pins.

### Named Rules
**The Glass-Over-Map Rule.** Any panel or widget that hovers over the map canvas must feature background opacity (`bg-background/95`) and backdrop blur (`backdrop-blur-md`) to maintain geographic spatial context.

## Shapes

- **Form Language:** Rounded, modern, softened rectangular geometry.
- **Radius Scale:**
  - Micro (`rounded-sm` / 6px): Badges, small chips, and inline code/tags.
  - Standard (`rounded-md` / 8px): Buttons, input fields, dropdown items, tooltips.
  - Container (`rounded-xl` / 12px): Property cards, floating controls, dialogs, and drawer sheets.
  - Circular (`rounded-full`): Avatar badges, map pin badges, and toggle switches.
- **Borders:** Consistent 1px subtle boundary (`border-border` / `oklch(0.922 0 0)`) without heavy outlines.

## Components

### Buttons
- **Shape:** Rounded-lg (8px to 10px radius)
- **Primary:** Background `oklch(0.697 0.148 71)` with dark foreground text `oklch(0.145 0 0)`, font-medium, padding `6px 12px`.
- **Secondary / Outline:** Background `oklch(0.97 0 0)` or transparent with 1px border.
- **Ghost:** Transparent background with subtle hover fill.

### Property Cards
- **Structure:** Rounded-xl container with 144px thumbnail top, source pill overlay on top-right, favorite heart button on top-left, title, formatted Toman price (رهن / اجاره), and attribute chips (متراژ، خواب، سال ساخت).
- **Hover:** `scale-105` on thumbnail, subtle border glow with `border-primary/40` and ambient shadow lift.
- **Selected State:** Ring accent `ring-1 ring-primary/30` with solid `border-primary`.

### Filter Chips & Sliders
- **Chips:** Rounded-md pills with subtle border, active state fills with primary amber or accent gray.
- **Inputs:** Dual-range min/max numeric fields with Toman formatted labels beneath.

### Navigation Rail (Desktop)
- **Structure:** Right-aligned 52px rail (`w-13`) housing brand icon, tool icons with instant tooltips, and user profile avatar.
- **Active Tab:** Highlighted with solid primary background and subtle ring accent.

## Do's and Don'ts

### Do:
- **Do** format all currencies in Persian Tomans using `formatToman()` with Persian digits.
- **Do** preserve strict RTL alignment across all layout containers, drawer transitions, and text elements.
- **Do** display original source attribution badges (Divar, Sheypoor, etc.) with accurate portal colors on listing cards.
- **Do** use `backdrop-blur-md` on floating navigation and drawer panels.

### Don't:
- **Don't** use standard English digits (0-9) inside Persian text copy or price tags.
- **Don't** flood entire panels with solid orange backgrounds; keep accent usage disciplined (≤ 10%).
- **Don't** use heavy dark drop shadows that obscure map details underneath translucent drawers.
- **Don't** mix left-to-right alignment in form fields except for raw phone number or English URL inputs.

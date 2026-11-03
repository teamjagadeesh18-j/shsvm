# HEADER SPECIFICATION & MEASUREMENTS (Measured from https://heedhive.in at 1440px)

## 1. Overall Header Architecture & Positioning
- **Position**: `static` / `relative` in normal page document flow (Inside `<header>` with inner bar at `pt-14`).
- **Scroll Behavior**: **NOT fixed, NOT sticky**. When the page scrolls down, the header scrolls away with the page content and does not reappear until the user scrolls back to the top.
- **Background**: `transparent` (`rgba(0, 0, 0, 0)`). NO background fill, NO white strip, NO bottom border, NO box-shadow, NO backdrop-filter.
- **Backdrop / Seam**: The faint background grid pattern of the page (`.bg-grid`) runs continuously behind the entire header from the very top of the page with zero seams.
- **Page Wrapper**: Outer dark container (`bg-black`) framing the inner canvas with rounded top corners (`rounded-t-2xl` / 16-24px radius), or clean full-bleed canvas with continuous grid.
- **Max Width**: `max-w-7xl` (1280px / 1240px container) with `px-6 lg:px-8` padding.

## 2. Center Nav Container (Navigation Box)
- **Tag**: Rounded container (`<div>` or `<nav>`).
- **Dimensions**: Height = `38px` (computed height 38px to 44px), padding = `6px 32px` (`px-8 py-1.5`).
- **Background**: Solid black (`#000000` / `rgb(0, 0, 0)`).
- **Border**: Thin 1px subtle border (`border: 1px solid rgba(255, 255, 255, 0.2)` / `border-white`).
- **Border Radius**: `12px` to `14px` (`rounded-xl`), NOT a full pill.
- **Box Shadow**: `none` (flat design, zero drop shadow).
- **Flex Layout**: `display: flex; align-items: center; gap: 32px;` (`gap-8`).

## 3. Nav Links & Dividers
- **Links Typography**:
  - `font-family`: `Montserrat, sans-serif`
  - `font-size`: `16px` (`1rem` / `text-base`)
  - `font-weight`: `500` (Medium)
  - `color`: `rgb(255, 255, 255)` (`#FFFFFF`)
  - Hover: `hover:text-gray-300` / smooth transition.
  - Links: `Home` | `About` | `Academics` | `Admissions` | `Contact`.
- **Dividers**:
  - Thin vertical line between each link: `<div class="h-6 w-px bg-gray-400">`
  - Height = `24px` (~60% of the 38px container height).
  - Width = `1px`.
  - Color = semi-transparent light gray (`rgba(255, 255, 255, 0.35)` or `rgb(156, 163, 175)`).
  - Position: centered vertically between links, appears only *between* items (never before the first or after the last).

## 4. CTA Button ("Apply for Admission")
- **Tag**: Pill button (`<Link>` or `<button>`).
- **Dimensions**: Height = `32px` to `36px`, padding = `6px 16px` (`px-4 py-1.5`).
- **Border Radius**: `9999px` (`rounded-full`, fully rounded pill).
- **Background**: Solid near-black (`#0A0A0A` / `rgb(10, 10, 10)`).
- **Border**: `none` (or `1px solid transparent`).
- **Box Shadow**: `none`.
- **Typography**:
  - `font-family`: `Montserrat, sans-serif`
  - `font-size`: `14px` (`text-sm`)
  - `font-weight`: `500`
  - `color`: `rgb(255, 255, 255)`
- **Hover**: Background transitions to `#1F1F1F` / `hover:bg-neutral-800`.

## 5. Hamburger Button (Desktop & Mobile)
- **Tag**: `<button aria-label="Toggle menu">`
- **Dimensions**: `44px × 44px` tap target (with `padding: 10px`, icon size `20px × 20px`).
- **Icon**: Two horizontal bars (two lines, no third bar), 2px stroke width, rounded caps.
- **Position**: Aligned to the far right, matching the reference desktop layout.
- **Action**: Opens the existing fully accessible drawer on both mobile and desktop.

## 6. Logo Lockup (Far Left)
- **Tag**: `<Link to="/">`
- **Icon**: School crest tile with rounded corners (`12px` radius).
- **Typography**: "SHSVM" bold primary title + "SREE HARI SARADHA VIDHYALAYA" sub-label.
- **Alignment**: Perfectly vertically aligned with center nav and right actions.


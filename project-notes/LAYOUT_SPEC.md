# Layout Specification: Section System & Tokens
*Measured directly from https://heedhive.in at 1440px and 390px viewports via Headless Chrome CDP*

## 1. Measured Reference Dimensions (https://heedhive.in)

| Element / Property | Reference Computed (1440px Desktop) | Reference Computed (390px Mobile) | Token Name | Token Value |
| :--- | :--- | :--- | :--- | :--- |
| **Full-Bleed Black Section** | `width: 100%`, `left: 0`, `padding: 96px 0` | `width: 100%`, `left: 0`, `padding: 96px 0` | `--section-pad-y` | `96px` (desktop), `64px` (mobile) |
| **Full-Bleed Background** | `rgb(0, 0, 0)` | `rgb(0, 0, 0)` | `--color-surface-black` | `#000000` |
| **Dark Inset Panel Background** | `rgb(10, 10, 10)` | `rgb(10, 10, 10)` | `--color-surface-dark` | `#0A0A0A` |
| **Dark Panel Border Radius** | `24px` (`rounded-3xl`) | `24px` (`rounded-3xl`) | `--radius-panel` | `24px` |
| **Dark Panel Side Inset (Margin)** | `48px` (`mx-6 lg:mx-12`) | `24px` (`mx-6`) | `--panel-inset` | `48px` (desktop), `24px` (tablet), `16px` (mobile) |
| **Dark Panel Width** | `1340px` (`left: 48px`, `right: 1388px`) | `342px` (`left: 24px`, `right: 366px`) | Derived: `calc(100% - 2 * var(--panel-inset))` |
| **Dark Panel Inside Padding** | `48px 0` (inner content `px-6 lg:px-12` = 48px) | `48px 0` (inner content `px-6` = 24px) | `--panel-pad` | `48px` (desktop), `24px` (mobile) |
| **White Wrapper Padding (Dark Panel)** | `padding-block: 48px` to `96px` | `padding-block: 48px` | `--panel-wrap-pad-y` | `80px` (desktop), `56px` (tablet), `40px` (mobile) |
| **Grid Cell Size** | `10%` / approx `140px - 180px` | `10%` / approx `35px` | `--grid-cell` | `160px` |
| **Grid Line Color & Opacity** | `rgba(255, 255, 255, 0.05)` | `rgba(255, 255, 255, 0.05)` | `--color-grid-line` | `rgba(255, 255, 255, 0.05)` |
| **Section Pill Height & Padding** | Height: `30px`, Padding: `6px 12px` | Height: `30px`, Padding: `6px 12px` | `--pill-height`, `--pill-pad` | `30px`, `6px 14px` |
| **Section Pill Dot** | `6px × 6px`, `border-radius: 9999px`, white | `6px × 6px`, white | `--pill-dot-size` | `6px` |
| **Section Pill Border & Background** | `1px solid rgba(255, 255, 255, 0.1)`, `bg: rgba(255, 255, 255, 0.05)` | Same | `--pill-border`, `--pill-bg` | `1px solid rgba(255, 255, 255, 0.12)`, `rgba(255, 255, 255, 0.05)` |
| **Outlined Button Height & Padding**| Height: `42px`, Padding: `10px 20px` | Height: `40px`, Padding: `8px 16px` | `--btn-outline-pad` | `10px 20px` |
| **Outlined Button Border & Radius** | `1px solid rgba(255, 255, 255, 0.2)`, `radius: 9999px` | Same | `--btn-outline-border` | `1px solid rgba(255, 255, 255, 0.2)` |

---

## 2. Reference Home Page Section Sequence & Types

1. **Header**: In normal page flow, transparent background, grid shows through, scrolls off with page.
2. **Hero (Section 2)**: Full-bleed white (`bg-white`), faint background grid, centered headline & consultation CTA.
3. **Marquee Band (Section 3)**: Full-bleed high-contrast band (`border-y border-neutral-900`), animated continuous text marquee.
4. **Programs / Levels of Schooling (Section 4)**: **Type 1: Full-Bleed Dark Section** (`bg-black py-24`), width 100%, edge-to-edge black, 3-card grid.
5. **Photo Gallery Marquee / Showcase (Section 5)**: **Type 1: Full-Bleed Light Section** (`py-8 bg-white overflow-hidden`), pure white background, continuous scrolling photos.
6. **Social Media Marketing / Holistic Mentorship (Section 6)**: **Type 2: Inset Dark Panel Section** (white full-bleed wrapper with `overflow-hidden bg-neutral-950 rounded-3xl mx-6 lg:mx-12 relative`, faint background grid, section pill, outline button).
7. **Next Section (Section 7)**: Full-Bleed Light or Inset Panel.
8. **Footer (Section 11)**: Full-Bleed Dark (`bg-neutral-950`).

---
name: QueueMirror System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#0051b1'
  on-tertiary: '#ffffff'
  tertiary-container: '#0f69dc'
  on-tertiary-container: '#edf0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for **Enterprise Intelligence**, prioritizing clarity, precision, and trust. It sits at the intersection of utility and premium aesthetics, drawing inspiration from high-performance developer tools and financial platforms.

The style is **Corporate Modern**, characterized by a refined use of whitespace, a rigorous grid, and subtle depth. The interface avoids unnecessary decoration to focus the user's attention on real-time data and actionable insights. The emotional response should be one of "controlled transparency"—complex queue data rendered into an effortless, manageable experience.

## Colors
The palette is rooted in a professional blue spectrum to communicate reliability. 

- **Primary Brand Colors:** Uses a triple-blue stack for hierarchy. `#2563EB` is the standard action color, while the darker `#1D4ED8` handles hover states and the brighter `#3B82F6` is reserved for accents and active data highlights.
- **Semantic Status:** Traffic-light logic is applied to queue density. These colors must always be accompanied by labels or icons to ensure accessibility.
- **Neutrals:** A slate-tinted neutral scale prevents the UI from feeling "dead" grey, maintaining a crisp, cool-toned professional atmosphere.

## Typography
This design system utilizes a dual-font strategy:
- **Manrope (Headlines):** Used for structural hierarchy and data headers. Its slightly geometric nature provides a modern, tech-forward character.
- **Inter (Body & UI):** Used for all functional text, inputs, and dense data tables. Inter's tall x-height ensures maximum legibility for real-time monitoring.

For numerical data in queue mirrors, ensure tabular lining figures are used so that columns of numbers align vertically.

## Layout & Spacing
The layout follows a **4px baseline grid** to ensure mathematical harmony. 

- **Desktop:** A 12-column fluid grid with 24px gutters. Use wide side-margins (min 40px) to maintain focus.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Content should be grouped into logical "Modules" using consistent `md` (16px) or `lg` (24px) padding. Real-time dashboards should prioritize a "modular masonry" approach where cards can reflow based on screen width.

## Elevation & Depth
Elevation is communicated through **Ambient Shadows** and surface-leveling rather than heavy color shifts. 

- **Level 0 (Background):** `#F8FAFC`. The canvas for all elements.
- **Level 1 (Cards/Surface):** `#FFFFFF`. Uses a very soft, diffused shadow: `0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover/Active):** Slightly more pronounced depth: `0 10px 15px -3px rgba(15, 23, 42, 0.08)`.
- **Level 3 (Modals/Popovers):** Focused elevation with a neutral backdrop dim (20% opacity).

Borders are strictly `#E2E8F0` and are used to define structure on Level 1 elements.

## Shapes
The design system uses a **Rounded** aesthetic to soften the technical nature of the data. 

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px).
- **Large Containers (Cards, Modals):** 1rem (16px).
- **Badges/Status Tags:** Fully rounded (pill) to distinguish them from interactive buttons.

This consistent radius creates a "friendly-enterprise" look that feels modern yet approachable.

## Components
- **Buttons:** Primary buttons use a solid `#2563EB` fill with white text. Secondary buttons use a white fill with a `#E2E8F0` border and `#475569` text. High-density views should use "Small" button variants (32px height).
- **Cards:** Always white background with a 1px border. Title areas should be separated by a subtle horizontal rule or a light grey header background (`#F1F5F9`).
- **Input Fields:** 1px `#E2E8F0` border, 8px padding. On focus, the border transitions to Primary Blue with a 3px soft blue glow.
- **Status Chips:** Use a light background version of the semantic colors (e.g., Low Queue uses green text on 10% opacity green background).
- **Data Visualizations:** Use the Primary Blue for standard metrics. Use the Status colors only when a specific threshold (Low/Medium/High) is crossed.
- **Lists:** Use `border-b` for separation with `16px` vertical padding. Ensure active states are indicated by a 3px vertical "Primary Blue" bar on the left edge.
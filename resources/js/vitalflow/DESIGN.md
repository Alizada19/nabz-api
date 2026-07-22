---
name: VitalFlow
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5b403d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8f6f6c'
  outline-variant: '#e4beba'
  surface-tint: '#ba1a20'
  primary: '#af101a'
  on-primary: '#ffffff'
  primary-container: '#d32f2f'
  on-primary-container: '#fff2f0'
  inverse-primary: '#ffb3ac'
  secondary: '#005faf'
  on-secondary: '#ffffff'
  secondary-container: '#54a0fe'
  on-secondary-container: '#003567'
  tertiary: '#005f7b'
  on-tertiary: '#ffffff'
  tertiary-container: '#00799c'
  on-tertiary-container: '#e9f7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#930010'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a5c8ff'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#004786'
  tertiary-fixed: '#bee9ff'
  tertiary-fixed-dim: '#7bd1f8'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#004d65'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  mono-sm:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  sidebar-width: 260px
  sidebar-collapsed: 72px
  max-width: 1440px
  gutter: 1.5rem
---

## Brand & Style

The design system is engineered for high-stakes healthcare administration, specifically blood donation logistics. The brand personality is **reliable, efficient, and clinically precise**. It balances the urgency of "Blood Red" with the calming, structured nature of "Medical Blue" to ensure administrators remain focused and calm under pressure.

The design style follows a **Modern Minimalist** aesthetic with a **Tactile** edge. It draws inspiration from high-end administrative frameworks, utilizing generous whitespace, subtle depth, and a logical information hierarchy. The interface prioritizes clarity over decoration, ensuring that life-saving data is never obscured by unnecessary visual noise. The emotional response is one of trust and professional competence.

## Colors

The color palette is functionally driven to facilitate rapid scanning of dashboard metrics:
- **Primary (Blood Red):** Reserved for critical actions, branding, and life-essential data points (e.g., "Urgent Need," "Critical Inventory").
- **Secondary (Medical Blue):** Used for navigation, primary interactive elements, and information-heavy utility areas to provide a calming contrast.
- **Semantic Colors:** Success (Green), Warning (Amber), and Danger (Deep Red) follow strict accessibility standards to denote status updates and health alerts.
- **Neutrals:** A cool-toned slate gray palette is used for text and borders to maintain a clinical, clean appearance against the #F8FAFC background.

## Typography

The typography system uses **Inter** for its exceptional legibility in data-dense environments. It employs a systematic scale to differentiate between navigation, data visualization, and content.
- **Headlines:** Use semi-bold weights with slight negative letter-spacing to appear modern and authoritative.
- **Body Text:** Standardizes on 14px for administrative tables and 16px for general content to maximize information density without sacrificing readability.
- **Labels:** Uppercase or medium-weight labels are used for form headers and table headers.
- **Monospace:** JetBrains Mono is utilized sparingly for ID numbers, blood unit barcodes, and technical timestamps.

## Layout & Spacing

The design system utilizes a **Fluid Grid** with fixed-width constraints for dashboard containers.
- **Sidebar:** A collapsible left-hand navigation persists across all views. It transitions from 260px to 72px on collapse.
- **Dashboard Grid:** A 12-column system is used for desktop. Metrics cards usually span 3 columns (4 per row), while primary tables span 8-12 columns.
- **Rhythm:** An 8px linear scale (4, 8, 16, 24, 32, 48, 64) governs all padding and margins to ensure visual harmony.
- **Responsive:** On mobile devices, the sidebar transforms into a bottom-sheet or overlay drawer, and grid columns stack vertically with 16px horizontal margins.

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Ambient Shadows** to create a clean, modern administrative feel similar to Laravel Nova.
- **Level 0 (Background):** #F8FAFC - The base canvas.
- **Level 1 (Cards/Sidebar):** White (#FFFFFF) with a 1px border (#E2E8F0) and a very soft, diffused shadow (Y: 1px, Blur: 3px, Opacity: 0.05).
- **Level 2 (Dropdowns/Modals):** White with a more pronounced shadow (Y: 4px, Blur: 6px, Opacity: 0.1) to signify interaction priority.
- **Interactive States:** Buttons and clickable rows use a subtle Y-axis shift or a slight darkening of the background tint rather than heavy shadows.

## Shapes

The shape language is **Rounded (Level 2)**, conveying a modern and approachable healthcare environment.
- **Small Elements:** Buttons and Input fields use a 0.5rem (8px) radius.
- **Medium Elements:** Cards, Dialogs, and Data Tables use a 1rem (16px) radius for the outer container.
- **Large Elements:** Dashboard metric hero sections use a 1.5rem (24px) radius.
- **Status Pills:** Badges and chips always use a full "pill" radius (9999px) to distinguish them from interactive buttons.

## Components

Components follow the **Shadcn UI** philosophy—functional, unstyled-but-refined, and highly consistent.

- **Buttons:**
  - **Primary:** Solid #D32F2F with white text. 8px radius.
  - **Secondary:** Ghost style with Medical Blue text or solid #1976D2.
  - **Destructive:** Solid #C62828 for critical donor record deletions.
- **Data Tables:** Clean rows with 1px bottom borders (#F1F5F9). Zebra striping is avoided; instead, use a subtle hover state (#F8FAFC). Headers are 12px Medium, Uppercase, Slate 500.
- **Cards:** White background, 1px border, 16px radius. Dashboard cards feature a top-accent border (2px) in Primary or Secondary colors to denote category.
- **Input Fields:** 8px radius, Slate 200 border. On focus, the border transitions to Medical Blue with a 2px soft outer glow.
- **Badges:** Lightly tinted backgrounds with high-contrast text (e.g., Success Badge: Background #DCFCE7, Text #166534).
- **Dashboard Metrics:** Large display-font numbers with secondary "trend" indicators (percentage up/down) located in the bottom-right of the card.
- **Sidebar Items:** Clear active state using a vertical 4px bar on the left and a light background tint (#EFF6FF).
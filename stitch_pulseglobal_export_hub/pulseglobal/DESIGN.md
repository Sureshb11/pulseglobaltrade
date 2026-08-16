---
name: PulseGlobal
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#90efef'
  on-secondary-container: '#006e6e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002115'
  on-tertiary-container: '#339471'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#93f2f2'
  secondary-fixed-dim: '#76d6d5'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f4f'
  tertiary-fixed: '#97f5cc'
  tertiary-fixed-dim: '#7bd8b1'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#00513a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for the high-stakes world of international trade and B2B logistics. It evokes a sense of global authority, institutional stability, and modern efficiency. The aesthetic is **Corporate / Modern** with a lean toward **Minimalism**, prioritizing high-density information clarity while maintaining a premium, editorial feel.

The visual narrative centers on "The Horizon"—utilizing expansive whitespace, thin structural lines, and sophisticated gold accents to guide the user through complex workflows with calm confidence. It avoids unnecessary decoration, relying instead on precise alignment and a refined color story to signal quality and trust.

## Colors
The palette is anchored by **Deep Navy (#0A192F)**, used for primary navigation and high-level typography to establish authority. **Rich Teal (#008080)** acts as the primary action color, providing a modern bridge between the conservative Navy and the organic **Emerald (#047857)**, which is reserved for success states and growth indicators.

**Subtle Warm Gold (#C5A059)** is used sparingly as a "Highlight" token. It should only appear on premium status badges, specialized secondary buttons, or thin decorative accents to denote exclusivity or high-priority items. Surfaces primarily utilize **White (#FFFFFF)** with **Soft Off-white (#F8FAFC)** used for section differentiation and background layering.

## Typography
This design system utilizes **Inter** across all levels to maintain a systematic, utilitarian, yet modern feel. Headlines use tighter letter-spacing and heavier weights to command attention, while body text is optimized for readability with generous line heights.

Large "Display" sizes should be used for landing hero sections and major dashboard overviews. For data-heavy interfaces, prioritize `label-md` and `body-md` to maintain a professional, high-density information hierarchy. Gold accents may be applied to `label-sm` when indicating premium membership or verified trade status.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop (12 columns) to ensure professional alignment of complex data tables and trade forms. On mobile, the system shifts to a fluid 4-column layout. 

A 8px baseline rhythm governs all spacing. Generous vertical "Stack" spacing is used between sections to create an editorial, premium feel, preventing the interface from feeling cluttered despite the complexity of B2B trade data. Horizontal margins are intentionally wide on desktop to center the user's focus.

## Elevation & Depth
The system uses **Tonal Layers** combined with **Ambient Shadows** to create a subtle hierarchy. 
- **Level 0 (Background):** Soft Off-white (#F8FAFC) for the canvas.
- **Level 1 (Cards/Containers):** Pure White (#FFFFFF) with a very diffused, 4% opacity Navy shadow (Blur: 12px, Y: 4px).
- **Level 2 (Hover/Modals):** Pure White with a slightly more pronounced 8% opacity Navy shadow and a 1px border of the same shadow color to define edges.

Avoid heavy shadows or dark overlays. Depth is suggested through color shifts and the contrast between the off-white background and white containers.

## Shapes
The shape language is **Rounded**, balancing professional structure with a modern, approachable feel. Standard components (buttons, inputs) use a 0.5rem (8px) radius. 

**Cards** and primary containers use `rounded-lg` (16px) to create a distinct, premium framing for imagery and data. This softer container radius contrasts with the sharp, thin-line iconography to create a sophisticated visual tension.

## Components

### Buttons
- **Primary:** Deep Navy (#0A192F) background with White text. Hover state shifts background to Rich Teal (#008080) with a smooth 200ms transition.
- **Secondary (Premium):** Gold (#C5A059) 1px outline or text-only with a trailing "arrow-right" icon. Used for high-value calls to action like "Consult Expert."
- **Ghost:** Transparent background with Navy text, used for secondary dashboard actions.

### Cards & Imagery
- **Trade Cards:** Feature a 16px corner radius. On hover, apply a subtle elevation increase and a 1.05x smooth scale zoom on the background image.
- **Imagery:** Use high-quality photography of shipping vessels, architectural skylines, or macro logistics details, treated with a subtle cool-tone overlay to harmonize with the Navy palette.

### Navigation
- **Header:** Sticky, pure white background with a thin #E2E8F0 bottom border. Links use `label-md` in Navy, shifting to Teal on hover.
- **Breadcrumbs:** Small, uppercase `label-sm` text using the Gold highlight for the active page to maintain the premium narrative.

### Form Elements
- **Inputs:** 1px border in a light grey-blue. Focus state uses a 1px Rich Teal border and a very soft Teal outer glow.
- **Chips:** Small, rounded-full badges. Use Emerald for "In Transit" or "Verified" and Gold for "Premium Shipment."

### Data Visualization
- **Charts:** Use a palette of Navy, Teal, and Emerald. Use Gold exclusively for "Target" or "Projected" lines to draw focus to growth.
# Inventrio Analytics Design System

## Brand Identity
**Inventrio Analytics** - Professional business intelligence and administration interface with a data-driven, analytical aesthetic. Distinct from user interfaces to clearly differentiate administrative functions.

## Color Palette

### Primary Colors
- **Analytics Navy**: #1e40af
  - Usage: Admin navigation, primary actions, data highlights
  - Hover state: #1e3a8a
  - Applied to: Admin controls, critical metrics, system alerts

### Secondary Colors
- **Data Purple**: #7c3aed
  - Usage: Data visualization, charts, graphs
  - Hover state: #6d28d9
- **Admin Teal**: #0d9488
  - Usage: System status, configuration panels
  - Hover state: #0f766e

### Neutral Colors
- **Background Admin**: #f8fafc (light blue-gray)
- **Background Card**: #ffffff
- **Background Panel**: #f1f5f9
- **Border Admin**: #e2e8f0
- **Border Strong**: #cbd5e1
- **Text Admin Primary**: #0f172a (dark slate)
- **Text Admin Secondary**: #475569 (slate gray)
- **Text Admin Tertiary**: #64748b (light slate)
- **Code Background**: #1e293b (dark for code blocks)

### Semantic Colors (Admin Focus)
- **Critical Alert**: #dc2626 (red) - system errors, severe warnings
- **Warning**: #f59e0b (amber) - performance alerts, thresholds
- **Success**: #059669 (green) - system health, successful operations
- **Info**: #3b82f6 (blue) - informational notices, help text
- **Neutral**: #6b7280 (gray) - default status

## Typography

### Font Family
- **Primary**: IBM Plex Sans (technical, data-focused)
- **Monospace**: JetBrains Mono (for code, metrics, data display)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Text Hierarchy

#### Headings (More Technical)
- **Page Title**: 2.5rem (mobile: 2rem), 700 weight, navy color
- **Section Headers**: 2rem, 600 weight, slate color
- **Panel Titles**: 1.5rem, 600 weight, admin teal
- **Card Headers**: 1.25rem, 600 weight, data purple

#### Body Text
- **Panel Description**: 1.125rem, secondary color, regular weight
- **Body Text**: 1rem, normal weight, primary color
- **Data Labels**: 0.875rem, 500 weight, secondary color
- **Metric Values**: 0.875rem, 600 weight, code/monospace
- **Code/Data**: 0.875rem, monospace, code background

### Data Typography
- **Large Metrics**: 2.5rem, 700 weight, data purple
- **Medium Metrics**: 1.75rem, 600 weight, analytics navy
- **Small Metrics**: 1.25rem, 600 weight, admin teal

## Layout & Spacing

### Admin Layout
- **Dashboard Grid**: 24-column system for complex layouts
- **Sidebar Width**: 280px (collapsed: 64px)
- **Content Area**: Flexible width with minimum 1024px
- **Panel Spacing**: 1.5rem standard, 2rem for sections

### Spacing Scale (More Technical)
Based on 4px grid system for precise alignment:
- **2px**: Ultra fine spacing
- **4px**: Fine spacing (data cells, small elements)
- **8px**: Small spacing (compact components)
- **12px**: Medium spacing (standard padding)
- **16px**: Regular spacing (default)
- **20px**: Large spacing (section gaps)
- **24px**: Extra large (major sections)
- **32px**: XXL spacing (between major panels)
- **48px**: 3XL spacing (page sections)
- **64px**: 4XL spacing (full sections)

### Section Architecture
- **Admin Header**: 4rem height, fixed position
- **Sidebar**: 100vh, sticky
- **Content Padding**: 2rem minimum
- **Card Grid**: 1.5rem gaps

## Components (Admin Specific)

### Admin Buttons
**Primary Admin Button**
- Background: Analytics navy
- Text: White
- Border: 1px solid #1e3a8a
- Padding: 0.5rem 1rem
- Border radius: 6px (slightly sharper)
- Font weight: 600, monospace preferred
- Shadow: Subtle, functional
- Hover: Darker navy, slight brightness reduction

**Secondary Admin Button**
- Background: Transparent
- Text: Analytics navy
- Border: 2px solid analytics navy
- Hover: Background: #eff6ff (light blue)

**Danger Admin Button**
- Background: #dc2626
- Text: White
- Border: 1px solid #b91c1c
- Hover: Darker red

**Data Action Button**
- Background: Data purple
- Text: White
- Icon: Right-aligned
- Padding: 0.5rem 1rem 0.5rem 1.25rem

### Admin Cards
**Dashboard Cards**
- Background: White
- Border: 1px solid border-admin
- Border radius: 12px (functional, not rounded)
- Padding: 1.5rem
- Shadow: Subtle, functional (0 1px 3px rgba(0,0,0,0.1))
- Hover: Slight elevation increase, border darkens

**Metric Cards**
- Background: White with subtle gradient (top: white, bottom: #f8fafc)
- Border: 2px solid border-strong
- Border radius: 8px
- Padding: 1.25rem
- Highlight: Left border 4px solid analytics navy

**Data Panel Cards**
- Background: #f1f5f9
- Border: 1px solid #cbd5e1
- Border radius: 8px
- Padding: 1.5rem
- Title: Admin teal with bottom border

### Forms (Admin)
**Admin Input Fields**
- Background: White
- Border: 1px solid #cbd5e1
- Border radius: 4px (functional)
- Padding: 0.5rem 0.75rem
- Font: Monospace for data entry
- Focus: Analytics navy border with functional glow

**Select/Dropdown**
- Background: White
- Border: 1px solid #cbd5e1
- Padding: 0.5rem 2rem 0.5rem 0.75rem
- Arrow: Analytics navy

**Checkbox/Radio**
- Color: Analytics navy
- Size: Functional, not decorative
- Label: Secondary text, 500 weight

### Navigation (Admin)
**Admin Sidebar**
- Background: #0f172a (dark slate)
- Width: 280px (collapsed: 64px)
- Text Color: #94a3b8 (light slate)
- Active Item: Analytics navy background, white text
- Hover: #1e293b background
- Icons: 20px, #cbd5e1

**Admin Topbar**
- Background: White
- Height: 4rem
- Border Bottom: 1px solid #e2e8f0
- Search: Functional, minimal design
- User Menu: Compact, with status indicators

### Data Tables
**Header Row**
- Background: #f1f5f9
- Text: Admin teal, 600 weight
- Border Bottom: 2px solid analytics navy
- Padding: 0.75rem 1rem

**Data Rows**
- Background: White (alternating: #f8fafc)
- Border Bottom: 1px solid #e2e8f0
- Padding: 0.75rem 1rem
- Hover: #eff6ff background

**Cell Types**
- Text Cell: Primary color, normal weight
- Numeric Cell: Monospace, right-aligned, 600 weight
- Status Cell: Badge with semantic colors
- Action Cell: Icon buttons, compact

### Badges & Indicators
**Status Badges**
- Success: Green background, white text, 600 weight
- Warning: Amber background, dark text, 600 weight
- Error: Red background, white text, 600 weight
- Info: Blue background, white text, 600 weight
- Neutral: Gray background, dark text, 600 weight

**Metric Indicators**
- Positive: Green with ↑ icon
- Negative: Red with ↓ icon
- Neutral: Gray with ↔ icon
- Size: 0.75rem, monospace

## Data Visualization

### Chart Colors
- **Primary Data**: #3b82f6 (blue)
- **Secondary Data**: #10b981 (green)
- **Tertiary Data**: #f59e0b (amber)
- **Quaternary Data**: #8b5cf6 (purple)
- **Quinary Data**: #ef4444 (red)

### Chart Components
**Axes**
- Color: #64748b
- Weight: 300
- Font: 0.75rem, sans-serif

**Grid Lines**
- Color: #e2e8f0
- Style: Solid, 1px

**Data Points**
- Size: Functional based on data density
- Border: White, 1px
- Hover: Enlarged with tooltip

**Tooltips**
- Background: #0f172a (dark)
- Text: White, 0.875rem
- Border: None
- Shadow: Medium
- Padding: 0.5rem 0.75rem

### Graph Types
**Line Charts**
- Line: 2px, solid
- Area: 20% opacity of line color
- Points: 4px diameter on hover

**Bar Charts**
- Bar: 75% opacity, rounded top corners (2px)
- Hover: 100% opacity, slight elevation
- Spacing: 20% between bars

**Pie/Donut Charts**
- Stroke: White, 1px
- Labels: Outside with connector lines
- Legend: Horizontal below chart

## Visual Effects (Functional)

### Shadows
- **Level 0**: None (for performance tables)
- **Level 1**: 0 1px 2px rgba(0,0,0,0.05) (cards, panels)
- **Level 2**: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06) (hover states)
- **Level 3**: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) (modals, dialogs)

### Transitions
- **Fast**: 150ms (interactive elements)
- **Normal**: 200ms (state changes)
- **Slow**: 300ms (complex animations)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) (material design)

### Animations
**Data Loading**
- Skeleton: #f1f5f9 background, subtle pulse animation
- Progress: Analytics navy, linear animation
- Success: Quick fade-in with scale

**Data Updates**
- Highlight: Yellow background that fades to normal
- Transition: Smooth interpolation for values

## Grid Systems (Admin)

### Dashboard Grid
- **Columns**: 24 (allows precise layout control)
- **Gutters**: 1.5rem
- **Breakpoints**: 
  - XXL: 1920px+ (24 columns)
  - XL: 1440px (20 columns)
  - LG: 1200px (16 columns)
  - MD: 992px (12 columns)
  - SM: 768px (8 columns)
  - XS: 576px (4 columns)

### Component Grids
**Metric Grid**: 2-4 columns, auto-sizing
**Chart Grid**: Flexible based on importance
**Table Grid**: Full width, scrollable on mobile

## Iconography (Admin)

### Sizes
- **XS**: 12px (dense tables, compact spaces)
- **S**: 16px (default, inline with text)
- **M**: 20px (navigation, buttons)
- **L**: 24px (card headers, section icons)
- **XL**: 32px (feature icons, empty states)

### Styles
- **Outlined**: Default for actions
- **Filled**: Selected states, primary actions
- **Two-tone**: Data categories, status

### Categories
- **Navigation**: Simple, monochrome
- **Actions**: Clear, actionable
- **Status**: Color-coded by semantic meaning
- **Data**: Representing chart types, metrics

## Responsive Behavior (Admin Focus)

### Mobile Adaptations
- **Sidebar**: Collapses to icon-only, overlay on mobile
- **Tables**: Horizontal scroll with sticky headers
- **Charts**: Simplified, focus on key metrics
- **Actions**: Stack vertically, full width

### Touch Targets
- **Minimum**: 44px × 44px
- **Spacing**: 8px minimum between touch targets
- **Feedback**: Visual indication of touch

### Breakpoint Strategy
- **Administrative**: Optimized for desktop (1024px+)
- **Tablet**: Functional but simplified (768px-1023px)
- **Mobile**: Critical functions only (<768px)

## Content Style (Analytics Focus)

### Tone & Voice
- **Authoritative**: Confident, data-backed statements
- **Precise**: Exact metrics, clear thresholds
- **Concise**: Eliminate fluff, focus on insights
- **Actionable**: Clear next steps based on data

### Messaging Hierarchy
1. Critical alerts and system status
2. Key performance indicators
3. Detailed metrics and trends
4. Configuration and management options

### Data Presentation
- **Numbers**: Always formatted consistently (commas, decimals)
- **Percentages**: Include ± sign, context
- **Dates**: ISO format in data, friendly format in UI
- **Currency**: Consistent symbol placement, decimal places

## Accessibility (Admin Focus)

### Contrast Ratios
- **Normal Text**: 7:1 minimum
- **Large Text**: 4.5:1 minimum
- **UI Components**: 3:1 minimum
- **Disabled States**: Still readable

### Focus Management
- **Focus Rings**: Analytics navy, 2px, offset
- **Tab Order**: Logical, following visual layout
- **Skip Links**: For bypassing navigation

### Screen Reader Support
- **ARIA Labels**: All interactive elements
- **Live Regions**: For dynamic data updates
- **Status Messages**: For async operations

## Performance Considerations

### Data Loading
- **Skeleton Screens**: For initial load
- **Progressive Loading**: Critical data first
- **Virtual Scrolling**: For large datasets
- **Debounced Search**: 300ms delay

### Chart Performance
- **Data Limits**: Reasonable dataset sizes
- **Simplified Views**: Option for performance mode
- **Web Workers**: For complex calculations

This design system creates a distinct administrative interface that clearly differentiates from user-facing pages while maintaining professional, data-focused aesthetics optimized for analytics and system management.
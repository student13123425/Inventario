# Inventrio Design System

## Brand Identity
**Inventrio** - Modern inventory management for retail businesses with a clean, professional, and trustworthy aesthetic.

## Color Palette

### Primary Colors
- **Primary Indigo**: #4f46e5
  - Usage: Primary actions, logo, key highlights
  - Hover state: #4338ca
  - Applied to: Main buttons, active links, premium features

### Neutral Colors
- **Text Primary**: #111827 (near black)
- **Text Secondary**: #6b7280 (medium gray)
- **Text Tertiary**: #9ca3af (light gray)
- **Background White**: #ffffff
- **Background Light**: #f9fafb (off-white)
- **Background Dark**: #111827 (dark theme)
- **Background Dark Secondary**: #1f2937 (dark cards)
- **Border Light**: #f3f4f6
- **Border Medium**: #e5e7eb
- **Border Dark**: #374151

### Semantic Colors
- **Success**: #059669 (green) - confirmations, positive actions
- **Error**: #dc2626 (red) - errors, warnings
- **Warning**: #f59e0b (amber) - ratings, alerts
- **Info**: #3b82f6 (blue) - information boxes

## Typography

### Font Family
- **Primary**: Inter (sans-serif)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)

### Text Hierarchy

#### Headings
- **Hero Title**: 3.5rem (mobile: 2.5rem), 900 weight, tight spacing
- **Section Headers**: 2.25rem, 800 weight
- **Card Titles**: 1.5rem, 700 weight
- **Subsection Titles**: 1.25rem, 700 weight

#### Body Text
- **Hero Subtitle**: 1.25rem, normal weight, secondary color
- **Section Description**: 1.125rem, secondary color
- **Body Text**: 1rem, normal weight
- **Small Text**: 0.875rem, secondary color
- **Extra Small**: 0.75rem, tertiary color

## Layout & Spacing

### Content Width
- **Maximum Content Width**: 1200px
- **Side Padding**: 5% (reduces to 1rem on mobile)
- **Mobile Breakpoint**: 768px

### Spacing Scale
Based on 1rem = 16px standard:
- **Extra Small**: 0.25rem (4px)
- **Small**: 0.5rem (8px)
- **Medium**: 0.75rem (12px)
- **Regular**: 1rem (16px)
- **Large**: 1.25rem (20px)
- **Extra Large**: 1.5rem (24px)
- **2XL**: 2rem (32px)
- **3XL**: 2.5rem (40px)
- **4XL**: 3rem (48px)
- **5XL**: 4rem (64px)
- **6XL**: 6rem (96px)

### Section Spacing
- **Hero Section**: 6rem top, 4rem bottom
- **Standard Section**: 4-6rem vertical
- **Card Padding**: 2-2.5rem
- **Component Gutters**: 1-2rem

## Components

### Buttons
**Primary Button**
- Background: Primary indigo
- Text: White
- Border: None
- Padding: 0.75rem vertical, 1.5rem horizontal
- Border radius: 8px
- Font weight: 600
- Shadow: Subtle indigo glow
- Hover: Darker indigo, slight upward movement

**Secondary Button**
- Background: Transparent
- Text: Primary indigo
- Border: 1px light gray
- Hover: Light gray background

**Pricing Button**
- Highlight variant: White text on colored background
- Regular: Standard primary button styling

### Cards
**Feature Cards**
- Background: White
- Border: 1px light gray
- Border radius: 16px
- Padding: 2rem
- Hover: Lift effect with enhanced shadow

**Testimonial Cards**
- Background: Off-white
- Border radius: 16px
- Padding: 2rem

**Pricing Cards**
- Background: Dark gray (highlight: primary indigo)
- Border radius: 20px
- Padding: 2.5rem
- Highlight: Scaled up slightly with prominent shadow

### Forms
**Input Fields**
- Background: White
- Border: 1px medium gray
- Border radius: 8px
- Padding: 0.75rem
- Focus: Primary indigo border with subtle glow

**Labels**
- Color: Primary text
- Font weight: 500
- Size: Small

**Messages**
- Error: Red background with red border
- Success: Green background with green border
- Info: Blue background with blue border

### Navigation
**Navbar**
- Background: Semi-transparent white with blur
- Position: Sticky top
- Border: Bottom light gray
- Logo: Primary indigo, 1.5rem, 800 weight

## Visual Effects

### Shadows
- **Subtle**: For regular elevation
- **Medium**: For hover states and important elements
- **Prominent**: For highlighted components (pricing cards)
- **Glow**: For primary actions and focus states

### Transitions
- **Duration**: 0.2s for simple interactions, 0.3s for complex animations
- **Easing**: Standard ease function
- **Properties**: Transform, background-color, box-shadow

### Transformations
- **Button Hover**: Translate upward 1-2px
- **Card Hover**: Translate upward 5px with shadow enhancement
- **Scale**: Used for pricing card highlights (5% increase)

## Grid Systems

### Feature Grid
- **Columns**: 3 equal columns (desktop)
- **Gap**: 2rem
- **Mobile**: Single column

### Testimonial Grid
- **Layout**: Auto-fit minmax 300px
- **Gap**: 2rem

### Pricing Grid
- **Layout**: Flex wrap with min-width 300px
- **Justification**: Center aligned
- **Gap**: 2rem

## Iconography

### Sizes
- **Small**: 16px (inline icons, ratings)
- **Medium**: 20px (feature lists)
- **Large**: 48px (feature cards)

### Colors
- **Primary**: Primary indigo
- **White**: White (on dark backgrounds)
- **Accent**: Warning amber for ratings
- **Success**: Primary indigo for checkmarks

## Responsive Behavior

### Mobile Adaptations
- **Typography**: Scale down heading sizes proportionally
- **Layout**: Single column for all grids
- **Spacing**: Reduce padding and margins
- **Navigation**: Hide links (replace with mobile menu)

### Interactive Elements
- **Touch Targets**: Minimum 44px height
- **Button Sizes**: Maintain comfortable tap targets
- **Text Readability**: Ensure legibility on small screens

## Content Style

### Tone & Voice
- **Professional**: Clear, business-appropriate language
- **Supportive**: Helpful and encouraging
- **Concise**: Direct and to the point
- **Benefit-focused**: Emphasize user value

### Messaging Hierarchy
1. Primary value proposition
2. Key features and benefits
3. Social proof and testimonials
4. Clear call-to-action

This design system ensures visual consistency while maintaining flexibility for component variations. All new components should adhere to these guidelines unless specifically designed as exceptions.
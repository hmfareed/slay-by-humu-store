# Add to Cart Behavior & Fly-to-Cart Animation Design

**Date:** 2026-11-09  
**Status:** Approved  

## 1. Intent & The Why
When a customer adds a product to their cart, the cart drawer automatically opened via `window.dispatchEvent(new Event('open-mini-cart'))`. This interrupted user browsing and caused unnecessary friction/distraction. The goal is to decouple adding an item from opening the cart drawer, while introducing high-delight visual confirmation: an animated product thumbnail that flies from the trigger point directly into the cart icon, followed by an impact bounce on the cart badge.

## 2. Goals, Non-Goals & Anti-Goals
- **Goals:**
  - Prevent the cart drawer from automatically opening when items are added to cart.
  - Animate an item representation (image thumbnail) flying from the clicked add button / product card into the visible cart icon.
  - Trigger a satisfying cart icon badge pop / bump on arrival to confirm receipt.
  - Maintain manual cart opening behavior when user intentionally clicks the cart icon in headers or navigation.
  - Support responsive layouts (desktop header cart icon and mobile bottom nav / header).
  - Respect `prefers-reduced-motion` accessibility settings (subtle fade/badge bump without heavy flight path).
- **Non-Goals:**
  - Redesigning the entire cart drawer or checkout flow.
  - Changing how cart state is stored in Zustand (`cartStore.ts`) or synced with backend.
- **Anti-Goals:**
  - Opening any drawer or modal upon add-to-cart.
  - Slowing down user interaction (animation must be non-blocking and under 600ms).
  - Obstructing clicking or navigation during the flight animation (`pointer-events-none`).

## 3. Constraints
- Framework: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion (`framer-motion` ^12.38.0).
- Must work across desktop and mobile screens.
- Must run cleanly with zero runtime exceptions if the cart icon is momentarily off-screen or animating.

## 4. Approaches Considered
- **Approach A (Global Animation Manager via Event / Context):**  
  Add a lightweight event-driven animation orchestrator (`CartAnimationOverlay`) mounted at root layout (`app/layout.tsx`). A simple helper `triggerFlyToCart({ startRect, imageUrl })` emits a custom event or store update. The overlay renders the flying element using Framer Motion fixed overlay and curves towards the visible cart target `[data-cart-target]`.  
  *Verdict: Selected.* Clean, zero prop drilling, completely decoupled from page templates.
- **Approach B (Ad-hoc component animation in each page):**  
  Implement independent animation logic inside each page (`app/page.tsx`, `app/products/page.tsx`, etc.).  
  *Verdict: Rejected.* Duplicates coordinate calculations and Framer Motion code across 4+ files.
- **Approach C (Plain toast notification only):**  
  *Verdict: Rejected.* User specifically requested the animation of the product moving into the cart.

## 5. Implementation Details
1. **Target Identification:**
   - Add `data-cart-target` attribute to the shopping bag cart buttons/badges in desktop headers (`app/page.tsx`, `app/products/page.tsx`, `app/products/[id]/page.tsx`) and mobile bottom nav (`components/BottomNav.tsx`).
   - Add a subtle bounce animation (`cart-bump` or Framer Motion / CSS class) triggered on arrival.
2. **Fly-to-Cart Orchestrator Component (`components/CartFlyAnimation.tsx`):**
   - Listens to custom event `'cart-fly-start'` containing `{ startX, startY, imageUrl }` (or derives from mouse event / bounding rect).
   - Dynamically locates the active `[data-cart-target]` in viewport to determine destination coordinates `(endX, endY)`.
   - Renders a floating, curved particle/thumbnail that glides to destination in ~550ms with ease-out curve.
   - Triggers `'cart-icon-bump'` custom event upon arrival so cart badge pulses.
3. **Trigger Cleanup:**
   - Remove `window.dispatchEvent(new Event('open-mini-cart'))` from:
     - `app/page.tsx` (desktop & mobile quick add)
     - `app/products/page.tsx` (desktop & mobile quick add)
     - `app/products/[id]/page.tsx` (`handleAddToCart`)
     - `components/QuickViewModal.tsx` (`handleAddToCart`)
   - Replace with call to trigger fly-to-cart animation.
   - Keep manual cart drawer open triggers when cart icon itself is clicked.

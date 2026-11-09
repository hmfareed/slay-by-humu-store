# Add to Cart Fly-to-Cart Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent automatic cart opening on product addition and introduce a smooth, curved fly-to-cart animation of the product thumbnail into the shopping cart icon with a destination bump effect.

**Architecture:** A lightweight event-driven fly-to-cart coordinator (`CartFlyAnimation`) rendered globally at root layout. Triggers emit `cart-fly-start` with origin coordinates and image source; the overlay animates a floating miniature into the visible cart target `[data-cart-target]`, then dispatches `cart-icon-bump` to trigger an impact bounce on the cart badge. All automatic `open-mini-cart` dispatches are removed from Add to Cart buttons.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion (`framer-motion`).

**Spec:** `docs/superpowers/specs/2026-11-09-add-to-cart-fly-animation-design.md`

## Global Constraints
- Decouple Add to Cart from drawer opening: never open the cart drawer automatically on product add.
- Maintain manual drawer opening: clicking cart icons in navigation must continue to open the cart.
- Motion duration under 600ms, non-blocking with `pointer-events-none`.
- Respect `prefers-reduced-motion` with graceful non-spatial fallback.
- Support both desktop header cart icon and mobile navigation cart targets.

## Review Focus
1. Rapid consecutive clicks on Add to Cart: Multiple flying items should animate independently without crashing or locking state.
2. Missing or off-screen cart icon: Fallback cleanly to top-right viewport coordinates if `[data-cart-target]` is not found.
3. Missing or invalid product image: Render an elegant fallback luxury bag icon inside the flying pill if no image URL is provided.
4. Mobile viewport with bottom navigation: Target the visible cart icon (bottom nav or header) accurately based on screen layout.
5. Reduced motion: Skip flying translate coordinates and immediately trigger the badge bump feedback.

---

### Task 1: Create CartFlyAnimation Component & Helper Utility

**Files:**
- Create: `my-ecommerce-frontend/components/CartFlyAnimation.tsx`
- Modify: `my-ecommerce-frontend/app/layout.tsx:40-48`

**Interfaces:**
- Consumes: Custom DOM event `'cart-fly-start'` with detail `{ startX: number, startY: number, imageUrl?: string }`.
- Produces: Exported helper `triggerFlyToCart(sourceEventOrRect: React.MouseEvent | DOMRect | { x: number, y: number }, imageUrl?: string): void`.
- Produces: Custom DOM event `'cart-icon-bump'` emitted on arrival.

- [ ] **Step 1: Implement `triggerFlyToCart` and `CartFlyAnimation` in `components/CartFlyAnimation.tsx`**
  - Extract start `x, y` from event or rect.
  - Listen for `'cart-fly-start'` events and maintain active flying items array `{ id, startX, startY, targetX, targetY, imageUrl }`.
  - Calculate `targetX, targetY` by finding `document.querySelectorAll('[data-cart-target]')` and picking the visible element. Fallback to `window.innerWidth - 40, 40` if none visible.
  - Render each item using Framer Motion (`motion.div` with luxury rounded styling, shadow, and small thumbnail).
  - Use `easeOut` motion curve over 550ms, shrinking from scale 1.0 to 0.2 and fading out as it reaches the cart target.
  - On animation complete, remove item from state and dispatch `window.dispatchEvent(new CustomEvent('cart-icon-bump'))`.
  - Support `prefers-reduced-motion`: if active, immediately dispatch `'cart-icon-bump'` without rendering moving DOM node.

- [ ] **Step 2: Mount `CartFlyAnimation` in `my-ecommerce-frontend/app/layout.tsx`**
  - Import `CartFlyAnimation` and place inside `<RootLayout>` next to other global overlays (`<SlideOutCart />`, `<Toaster />`).

- [ ] **Step 3: Verify TypeScript compilation of the new component**
  - Run `node my-ecommerce-frontend/node_modules/typescript/bin/tsc --noEmit -p my-ecommerce-frontend/tsconfig.json` to ensure clean types.

- [ ] **Step 4: Commit**
  - `git add my-ecommerce-frontend/components/CartFlyAnimation.tsx my-ecommerce-frontend/app/layout.tsx`
  - `git commit -m "feat: add CartFlyAnimation coordinator and mount in root layout"`

---

### Task 2: Add Cart Target Identifiers & Bump Animations to Cart Icons

**Files:**
- Modify: `my-ecommerce-frontend/app/page.tsx:174-183`
- Modify: `my-ecommerce-frontend/app/products/page.tsx:110-120`
- Modify: `my-ecommerce-frontend/app/products/[id]/page.tsx:195-205`
- Modify: `my-ecommerce-frontend/components/BottomNav.tsx:35-55`

**Interfaces:**
- Consumes: Custom event `'cart-icon-bump'`.
- Produces: `data-cart-target="true"` DOM attribute on visible cart buttons and bouncy spring scale when bumped.

- [ ] **Step 1: Add `data-cart-target` and bump listener hook / state to header cart buttons**
  - In `app/page.tsx`: add `data-cart-target="true"` to cart button. Listen for `'cart-icon-bump'` to set `isBumped = true` for 300ms, applying spring bounce animation `scale-125` / `transition-transform`.
  - In `app/products/page.tsx`: add `data-cart-target="true"` and bump effect.
  - In `app/products/[id]/page.tsx`: add `data-cart-target="true"` and bump effect.

- [ ] **Step 2: Add `data-cart-target` and bump effect to mobile BottomNav**
  - In `components/BottomNav.tsx`: on the tab where `tab.badge === 'cart'`, add `data-cart-target="true"` and apply the bump animation on `'cart-icon-bump'`.

- [ ] **Step 3: Verify TypeScript compilation**
  - Run `node my-ecommerce-frontend/node_modules/typescript/bin/tsc --noEmit -p my-ecommerce-frontend/tsconfig.json`.

- [ ] **Step 4: Commit**
  - `git add my-ecommerce-frontend/app/page.tsx my-ecommerce-frontend/app/products/page.tsx my-ecommerce-frontend/app/products/[id]/page.tsx my-ecommerce-frontend/components/BottomNav.tsx`
  - `git commit -m "feat: tag cart icons with data-cart-target and bump reaction"`

---

### Task 3: Decouple Add to Cart from Cart Drawer & Wire Up Fly Animation

**Files:**
- Modify: `my-ecommerce-frontend/app/page.tsx:404-442`
- Modify: `my-ecommerce-frontend/app/products/page.tsx:260-299`
- Modify: `my-ecommerce-frontend/app/products/[id]/page.tsx:147-160`
- Modify: `my-ecommerce-frontend/components/QuickViewModal.tsx:31-48`

**Interfaces:**
- Consumes: `triggerFlyToCart` from `components/CartFlyAnimation`.
- Modifies: Removes `window.dispatchEvent(new Event('open-mini-cart'))` from add-to-cart actions.

- [ ] **Step 1: Update Homepage (`app/page.tsx`)**
  - In desktop hover `Add To Bag`: replace `window.dispatchEvent(new Event('open-mini-cart'))` with `triggerFlyToCart(e, product.images?.[0])`.
  - In mobile quick-add button: replace `window.dispatchEvent(new Event('open-mini-cart'))` with `triggerFlyToCart(e, product.images?.[0])`.

- [ ] **Step 2: Update Products Catalog (`app/products/page.tsx`)**
  - In desktop hover `Add to Bag`: replace `open-mini-cart` with `triggerFlyToCart(e, product.images?.[0])`.
  - In mobile quick-add button: replace `open-mini-cart` with `triggerFlyToCart(e, product.images?.[0])`.

- [ ] **Step 3: Update Product Detail Page (`app/products/[id]/page.tsx`)**
  - In `handleAddToCart`: remove `window.dispatchEvent(new Event('open-mini-cart'))`. Pass the button click event (or button element rect) and product image to `triggerFlyToCart`. Keep notification toast.

- [ ] **Step 4: Update Quick View Modal (`components/QuickViewModal.tsx`)**
  - In `handleAddToCart`: remove `window.dispatchEvent(new Event('open-mini-cart'))`. Call `triggerFlyToCart`. Keep auto-close modal behavior after 1s.

- [ ] **Step 5: Verify TypeScript compilation**
  - Run `node my-ecommerce-frontend/node_modules/typescript/bin/tsc --noEmit -p my-ecommerce-frontend/tsconfig.json`.

- [ ] **Step 6: Commit**
  - `git add my-ecommerce-frontend/app/page.tsx my-ecommerce-frontend/app/products/page.tsx my-ecommerce-frontend/app/products/[id]/page.tsx my-ecommerce-frontend/components/QuickViewModal.tsx`
  - `git commit -m "feat: decouple add-to-cart from cart drawer and trigger fly-to-cart animation"`

---

### Task 4: Full Build Verification & Edge Case Testing

**Files:**
- Verification only

- [ ] **Step 1: Run production build**
  - Run `npm --prefix my-ecommerce-frontend run build`.
  - Verify zero build or bundling errors.

- [ ] **Step 2: Verify edge cases**
  - Check clicking the shopping bag in header directly still opens the slide-out cart drawer.
  - Verify graceful handling when rapid clicking happens.
  - Verify no memory leaks or dangling event listeners.

- [ ] **Step 3: Final Commit & Summary**
  - Commit any remaining polish and prepare final delivery.

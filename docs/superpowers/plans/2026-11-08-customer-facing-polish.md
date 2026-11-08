# Customer-Facing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the customer-facing storefront with paced hero transitions, clean header search ergonomics, unobstructed mobile product cards, interactive hair length/density variant selectors with dynamic pricing, and a sticky mobile "Add to Bag" action bar.

**Architecture & Impacted Files:**
- `my-ecommerce-frontend/app/page.tsx`: Hero rotation pacing (6.5s + pause on hover/touch + animated indicator), header layout without wasted search vertical space, and mobile card clean-up.
- `my-ecommerce-frontend/components/SearchBar.tsx`: Clean inline and expandable search experience that fits into the top navigation.
- `my-ecommerce-frontend/app/products/page.tsx`: Mobile card layout clean-up (remove permanent obscuring overlay, unobtrusive quick add).
- `my-ecommerce-frontend/src/store/cartStore.ts`: Support variant attributes (`selectedLength`, `selectedDensity`, customized unit price, unique cart key per variant combination).
- `my-ecommerce-frontend/components/SlideOutCart.tsx`: Display selected length & density details in cart drawer items.
- `my-ecommerce-frontend/app/products/[id]/page.tsx`: Interactive hair length & density selectors, dynamic pricing, and scroll-triggered floating sticky mobile "Add to Bag" bar.

---

### Task 1: Hero Slideshow Pacing, Indicator & Header Search Ergonomics

- [ ] **Step 1: Update hero timer and hover/touch interaction in `my-ecommerce-frontend/app/page.tsx`**
  - Increase timer from 3000ms to 6500ms.
  - Add `isHovered` state so hovering or touching the hero stops the timer.
  - Add an animated progress bar to the active indicator dot.
- [ ] **Step 2: Refactor header search placement in `my-ecommerce-frontend/app/page.tsx` and `my-ecommerce-frontend/components/SearchBar.tsx`**
  - Remove the separate full-width `pb-5` block beneath the logo bar in `app/page.tsx`.
  - Add search toggle / inline search to the top header bar alongside user and cart icons.
- [ ] **Step 3: Verification**
  - Verify hero timing, hover pause, and search open/close without layout shift.

---

### Task 2: Mobile Product Card Usability

- [ ] **Step 1: Clean up mobile cards in `my-ecommerce-frontend/app/page.tsx`**
  - Change overlay buttons from `opacity-100 md:opacity-0` to desktop-only hover overlay (`opacity-0 group-hover:opacity-100`).
  - Add a sleek, discrete quick-add `+` button in the card meta area or floating cleanly in the corner without blocking the hair photo.
- [ ] **Step 2: Clean up mobile cards in `my-ecommerce-frontend/app/products/page.tsx`**
  - Apply the same unobstructed photo presentation to the catalog page.
- [ ] **Step 3: Verification**
  - Check cards at mobile viewport widths (<768px) and desktop viewports (>=768px).

---

### Task 3: Hair Customization & Dynamic Pricing on PDP

- [ ] **Step 1: Enhance `CartItem` in `my-ecommerce-frontend/src/store/cartStore.ts`**
  - Extend item definition to store `selectedLength?: string`, `selectedDensity?: string`, and `selectedPrice?: number`.
  - Update `addItem`, `removeItem`, and `updateQuantity` so that items with different variants are treated as distinct cart items (using composite ID `productId-length-density`).
- [ ] **Step 2: Update `my-ecommerce-frontend/components/SlideOutCart.tsx`**
  - Display the chosen length (e.g. `24"`) and density (e.g. `180%`) under the product name in the cart drawer.
- [ ] **Step 3: Add interactive variant pickers to `my-ecommerce-frontend/app/products/[id]/page.tsx`**
  - Define standard luxury lengths (`18"`, `22"`, `26"`, `30"`) and densities (`180% Natural Glam`, `200% Full Regal`).
  - Calculate dynamic price: base price + length offset (e.g., 18" +0, 22" +150, 26" +300, 30" +450).
  - Add visual chip selectors with active gold borders and badge indicators.
- [ ] **Step 4: Verification**
  - Verify selecting variants updates price dynamically and adding to bag reflects the chosen length and price in the cart drawer.

---

### Task 4: Sticky Mobile "Add to Bag" Floating Bar on PDP

- [ ] **Step 1: Implement scroll intersection observer or scroll listener in `my-ecommerce-frontend/app/products/[id]/page.tsx`**
  - Track when the primary "Add To Bag" button scrolls out of the viewport.
- [ ] **Step 2: Render floating mobile sticky bar**
  - Fixed at the bottom of the screen above `BottomNav` on mobile (`md:hidden`).
  - Display product thumbnail, active variant summary, current price, and "Add to Bag" action.
- [ ] **Step 3: Verification**
  - Scroll down PDP on mobile viewport to verify smooth slide-in/slide-out of the sticky bar and functional cart addition.

---

### Task 5: End-to-End Build & Validation

- [ ] **Step 1: Run Next.js production build (`npm run build`)**
  - Confirm TypeScript compiles cleanly with zero errors across all modified components.
- [ ] **Step 2: Commit all changes with descriptive commit messages**

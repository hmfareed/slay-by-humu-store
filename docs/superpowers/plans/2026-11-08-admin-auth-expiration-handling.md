# Admin Authentication, Expiry & Error Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the admin panel properly detects expired/invalid tokens, handles 401/403 responses gracefully with clear user feedback and redirection, and ensures the developer's account has admin privileges.

**Architecture:** 
1. Create a centralized JWT validation utility (`isTokenValid`, `decodeToken`) in `my-ecommerce-frontend/src/lib/jwt.ts`.
2. Update `AdminLayout` and `AuthContext` to check token expiration against `Date.now()`.
3. Harden admin pages (`customers`, `orders`, `dashboard`, `messages`) to check response status and handle 401/403 explicitly with user notification and redirection instead of silently defaulting to empty arrays.
4. Promote admin user account to `admin` role in MongoDB Atlas.

**Tech Stack:** Next.js (App Router), TypeScript, React Context, Node.js, Mongoose.

**Spec:** Identified in root cause investigation — token expiration silently causes `Array.isArray` fallback to `[]` across all admin routes.

## Global Constraints
- Do not alter existing styling or design layouts.
- Preserve all existing routes and permissions.
- Maintain compatibility with Next.js App Router client components.

## Review Focus
- Expired token: Redirects to `/login` with an informative message.
- Malformed token: Caught cleanly without crashing and redirected to `/login`.
- 401 Unauthorized API response: Clears stale token, shows message, and redirects to `/login`.
- 403 Forbidden API response: Alerts non-admin user and redirects to `/`.
- Valid non-expired admin token: Renders customers and orders without regression.

---

### Task 1: JWT Validation Utility

**Files:**
- Create: `my-ecommerce-frontend/src/lib/jwt.ts`
- Test: `my-ecommerce-frontend/src/lib/jwt.test.ts` (or standalone node test)

**Interfaces:**
- Produces:
  - `decodeToken(token: string | null): any | null`
  - `isTokenValid(token: string | null): boolean`
  - `isTokenExpired(token: string | null): boolean`

- [ ] **Step 1: Write test for token validation utility**
- [ ] **Step 2: Implement `my-ecommerce-frontend/src/lib/jwt.ts`**
- [ ] **Step 3: Run test to verify it passes**

---

### Task 2: Token Expiration Check in `AdminLayout` and `AuthContext`

**Files:**
- Modify: `my-ecommerce-frontend/app/admin/layout.tsx`
- Modify: `my-ecommerce-frontend/src/context/AuthContext.tsx`

**Interfaces:**
- Consumes: `isTokenValid`, `decodeToken` from `jwt.ts`

- [ ] **Step 1: Update `AdminLayout` to verify `isTokenValid(token)` and `user.role === 'admin'`**
- [ ] **Step 2: Update `AuthContext` to discard expired tokens on startup and handle 401 in `authFetch`**
- [ ] **Step 3: Verify with unit test / node check**

---

### Task 3: Graceful Error Handling in Admin Pages

**Files:**
- Modify: `my-ecommerce-frontend/app/admin/customers/page.tsx`
- Modify: `my-ecommerce-frontend/app/admin/orders/page.tsx`
- Modify: `my-ecommerce-frontend/app/admin/page.tsx`
- Modify: `my-ecommerce-frontend/app/admin/messages/page.tsx`

**Interfaces:**
- Check `res.status === 401 || res.status === 403`: clear token if 401, redirect to `/login` or display error alert.

- [ ] **Step 1: Update `customers/page.tsx` with response status check and error state**
- [ ] **Step 2: Update `orders/page.tsx` with response status check and error state**
- [ ] **Step 3: Update `admin/page.tsx` with response status check and error state**
- [ ] **Step 4: Update `messages/page.tsx` with response status check and error state**

---

### Task 4: Promote Admin Account to Admin Role

**Files:**
- Modify: `scripts/makeAdmin.js` to accept CLI email argument

- [ ] **Step 1: Use `scripts/makeAdmin.js <email>` to promote designated administrator account**
- [ ] **Step 2: Execute `scripts/makeAdmin.js <email>` to ensure the account has `admin` role in MongoDB**
- [ ] **Step 3: Verify the account role in database**

---

### Task 5: End-to-End Verification

- [ ] **Step 1: Verify Next.js build (`npm run build` in `my-ecommerce-frontend`)**
- [ ] **Step 2: Verify API endpoint responses and token expiration behavior**

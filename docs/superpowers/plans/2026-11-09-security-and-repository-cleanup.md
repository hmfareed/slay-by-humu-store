# Security and Repository Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the repository by removing privilege escalation risks, scrubbing hardcoded sensitive emails/paths, relocating loose maintenance scripts into a protected directory with production guards, harmonizing package lockfiles, and sanitizing documentation.

**Architecture:** 
1. Relocate all one-off migration and database scripts from the repository root into a structured `scripts/` directory.
2. Harden `makeAdmin.js` by removing hardcoded admin emails and requiring explicit CLI arguments with email validation.
3. Add environment safeguards (`NODE_ENV === 'production'` checks) to destructive scripts (`cleanupProducts.js`, `updateWigs.js`, `testReview.js`).
4. Replace local machine paths in `uploadWigs.js` with configurable environment variables or CLI inputs.
5. Scrub personal email addresses from planning documents in `docs/superpowers/plans/`.
6. Remove obsolete `package-lock.json` from `my-ecommerce-frontend/` to standardize on Bun lockfiles as configured in `.vscode/settings.json`.

**Tech Stack:** Node.js, Bun, Mongoose, MongoDB Atlas, Next.js.

**Spec:** Remediation of security and information disclosure risks identified in GitHub repository audit.

## Global Constraints
- Do not break existing API, database connectivity, or frontend build.
- Maintain existing database models and server configuration in `src/`.
- Ensure all moved scripts correctly resolve `.env` and `src/models` from their new location.

## Review Focus
- `makeAdmin.js` without arguments exits with an error code and a usage message (no hardcoded fallback email).
- `makeAdmin.js` with an email updates the database only when explicitly targeted.
- Relocated scripts in `scripts/` correctly locate `.env` and `src/models/`.
- Destructive scripts fail safe if executed without explicit confirmation.
- Frontend build passes cleanly without lockfile discrepancies.

---

### Task 1: Reorganize and Harden Root Maintenance Scripts

**Files:**
- Create: `scripts/makeAdmin.js` (migrated & hardened from `makeAdmin.js`)
- Create: `scripts/uploadWigs.js` (migrated & hardened from `uploadWigs.js`)
- Create: `scripts/cleanupProducts.js` (migrated & guarded from `cleanupProducts.js`)
- Create: `scripts/updateWigs.js` (migrated & guarded from `updateWigs.js`)
- Create: `scripts/testReview.js` (migrated & guarded from `testReview.js`)
- Create: `scripts/checkProducts.js` (migrated from `checkProducts.js`)
- Create: `scripts/migrateCategories.js` (migrated from `migrateCategories.js`)
- Create: `scripts/makeSolid.js` (migrated from `makeSolid.js`)
- Create: `scripts/removeBlur.js` (migrated from `removeBlur.js`)
- Delete loose `.js` scripts from root directory.

- [x] **Step 1: Create `scripts/makeAdmin.js` with CLI argument requirement, no hardcoded email fallback, and relative path fixes**
- [x] **Step 2: Create `scripts/uploadWigs.js` removing hardcoded Windows paths, accepting directory via argument or env**
- [x] **Step 3: Create `scripts/cleanupProducts.js`, `scripts/updateWigs.js`, `scripts/testReview.js` with production guardrails**
- [x] **Step 4: Create `scripts/checkProducts.js`, `scripts/migrateCategories.js`, `scripts/makeSolid.js`, and `scripts/removeBlur.js` in `scripts/`**
- [x] **Step 5: Remove the old root-level `.js` scripts**

---

### Task 2: Sanitize Sensitive Identity Exposure in Documentation

**Files:**
- Modify: `docs/superpowers/plans/2026-11-08-admin-auth-expiration-handling.md`

- [x] **Step 1: Replace hardcoded developer email with generic placeholder (`admin@example.com`)**
- [x] **Step 2: Update references in documentation to point to the new `scripts/makeAdmin.js` usage**

---

### Task 3: Resolve Lockfile & Package Manager Inconsistency

**Files:**
- Modify: `my-ecommerce-frontend/package-lock.json` (Delete obsolete lockfile)
- Modify: `.gitignore` (Add lockfile hygiene and temporary file rules)
- Modify: `package.json` (Add npm/bun helper scripts for admin utilities)

- [x] **Step 1: Remove `my-ecommerce-frontend/package-lock.json` so Bun lockfile (`bun.lock`) is authoritative**
- [x] **Step 2: Add script aliases in root `package.json` (e.g. `"make-admin": "node scripts/makeAdmin.js"`)**
- [x] **Step 3: Update `.gitignore` if needed to prevent accidental tracking of scratch files**

---

### Task 4: Verification and Build Validation

- [x] **Step 1: Execute `node scripts/makeAdmin.js` without arguments and verify usage error**
- [x] **Step 2: Verify `node scripts/cleanupProducts.js` safety guard works**
- [x] **Step 3: Run `bun run build` in `my-ecommerce-frontend` to confirm build integrity**
- [x] **Step 4: Verify git status shows clean file organization**

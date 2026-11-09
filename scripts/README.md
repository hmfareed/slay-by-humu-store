# Internal Utility & Maintenance Scripts

This directory contains database migration, maintenance, and administrative scripts. These scripts are intended for authorized administrators and developers only.

## Scripts Overview

### `makeAdmin.js`
Elevates an existing user account to the `admin` role.
```bash
node scripts/makeAdmin.js <user-email>
```
*Note: A valid user email must be provided as an argument. The script will not execute without an explicit email.*

### `checkProducts.js`
Inspects products in the connected MongoDB database and displays their texture, lace, and styling metadata.
```bash
node scripts/checkProducts.js
```

### `cleanupProducts.js`
Performs product renaming and removes obsolete/placeholder test items.
*Includes production safeguard (`ALLOW_DESTRUCTIVE_CLEANUP=true` required in production).*
```bash
node scripts/cleanupProducts.js
```

### `updateWigs.js`
Updates pricing and descriptions for newly seeded wig products.
*Includes production safeguard (`ALLOW_PROD_MUTATIONS=true` required in production).*
```bash
node scripts/updateWigs.js
```

### `uploadWigs.js`
Uploads images to Cloudinary and seeds wig product records in the database.
```bash
node scripts/uploadWigs.js <path-to-images-folder>
```

### `migrateCategories.js`
Migrates category ObjectId references to category string names on products.
*Includes production safeguard (`ALLOW_PROD_MIGRATIONS=true` required in production).*
```bash
node scripts/migrateCategories.js
```

### `testReview.js`
Creates a test review on an existing product for verification.
*Includes production safeguard (`ALLOW_TEST_MUTATIONS=true` required in production).*
```bash
node scripts/testReview.js
```

### `makeSolid.js` / `removeBlur.js`
Frontend styling codemods for adjusting background transparencies and blur effects across frontend components.
```bash
node scripts/makeSolid.js
node scripts/removeBlur.js
```

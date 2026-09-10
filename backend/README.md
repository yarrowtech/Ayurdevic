# Backend and admin setup

Keep your existing `.env`. Add `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`
using `.env.example` as a reference. Use a separate admin email and a unique
password of at least 12 characters. Never commit `.env`.

From `backend`, run:

```powershell
npm.cmd run seed:admin
npm.cmd run dev
```

The Atlas cluster must be reachable before seeding. The seed hashes the password
and creates an administrator. Rerunning it leaves an existing administrator
unchanged; it will not promote an existing customer or reset their password.
Public registration always creates a regular user.

Start the frontend and visit `http://localhost:5173/admin`. Sign in with the seeded
credentials. The panel shows account/product counts, the latest 100 accounts,
and product creation, editing, availability and deletion. Admin API routes verify
the current user's role in MongoDB on every request. Write requests also check
the Origin header; set `FRONTEND_URL` to the exact frontend origin (no trailing slash).

Products are now loaded from MongoDB, replacing the demo catalog. The catalog
starts empty until products are added. Image fields accept HTTP/HTTPS URLs,
one per line, or multiple image uploads (JPEG, PNG, GIF, WebP; 5 MB per file;
eight images total per product). Uploaded files are stored in `backend/uploads`
and served at `/uploads`. Keep that directory on persistent storage and include
it in backups when deploying. Prices use the storefront currency.
Orders and payments are not part of this panel yet.

The Categories sidebar manages category names, images, promotional offer text,
and storefront visibility. Categories are stored in MongoDB and replace the
storefront's static demo categories. Add categories here before creating products.
Existing products can be linked by creating a category matching their current
category name. Renaming a category preserves its routing key and product links.
Hiding or deleting a category removes its category card, not its products.
Offer text is promotional only; it does not change product prices.

The public `/api/user/is-auth` endpoint returns `{ success: true, user: null }`
for a signed-out or expired session. Protected admin endpoints still require a
valid session and admin role.

The storefront `/contact` page reads `VITE_SUPPORT_EMAIL` and
`VITE_SUPPORT_PHONE` from the frontend environment. Set the store's real contact
details and restart/rebuild the frontend to show them. Until configured, the page
states that contact details are not yet available.

Run backend checks with `npm.cmd test` and frontend build with `npm.cmd run build`
from the respective directories.

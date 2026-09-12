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

Customers can open Login in the storefront and choose Create account. Registration
requires a name, email, password of at least 8 characters (up to 72 UTF-8 bytes),
and matching password confirmation in the form. Emails are normalized and matched
case-insensitively. Registration signs the customer in immediately; the HTTP-only
session cookie restores their session on refresh. The account menu provides sign-out.

The Login dialog also offers Continue with Google. Set `GOOGLE_CLIENT_ID` in the
backend `.env` to a Google OAuth 2.0 Web client ID whose authorized JavaScript
origin is the frontend origin, and set `FRONTEND_URL` to that same origin (no
trailing slash) so the sign-in POST passes the Origin check. The frontend needs
no key; it reads the client ID from `/api/user/google/config` at runtime and
hides the Google button when it is unset. Google sign-in creates a regular user
on first use and links to an existing password account only when Google is
authoritative for that verified email (a `@gmail.com` or Workspace address) and
the account is not an admin; otherwise the customer keeps using their original
sign-in method.

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

In Products, enable **Show in homepage banner** and save to promote a product
in the top homepage slider. Selected, in-stock products replace the default
promotional slides, using their first image, name, first description point,
and price. Unchecking the option removes that product from the slider; if none
qualify, the default promotional slides return.

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

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
one per line; uploads are not implemented. Prices use the storefront currency.
Orders and payments are not part of this panel yet.

Run backend checks with `npm.cmd test` and frontend build with `npm.cmd run build`
from the respective directories.

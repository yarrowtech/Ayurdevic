import User from "../model/User.modal.js";

// Allows full admins and product admins alike; use for product/category
// management routes. Use authAdmin instead for account management routes.
export default async function authStaff(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || !["admin", "product_admin"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  } catch {
    res.status(500).json({ success: false, message: "Unable to verify admin access" });
  }
}

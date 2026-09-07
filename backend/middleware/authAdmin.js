import User from "../model/User.modal.js";

export default async function authAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role");
    if (user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  } catch {
    res.status(500).json({ success: false, message: "Unable to verify admin access" });
  }
}

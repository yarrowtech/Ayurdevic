import { OAuth2Client } from "google-auth-library";
import User from "../model/User.modal.js";
import { createToken, setTokenCookie, logLoginEvent } from "./user.Controller.js";

const client = new OAuth2Client();
export const googleConfig = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ success: true, clientId: process.env.GOOGLE_CLIENT_ID?.trim() || null });
};

export const googleLogin = async (req, res) => {
  // The credential is sent by our own JavaScript callback, not Google's redirect POST.
  if (req.get("origin") !== (process.env.FRONTEND_URL || "http://localhost:5173")) {
    return res.status(403).json({ success: false, message: "Invalid request origin." });
  }
  const audience = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!audience) return res.status(503).json({ success: false, message: "Google sign-in is currently unavailable." });
  const credential = req.body?.credential;
  if (typeof credential !== "string" || !credential || credential.length > 16000) return res.status(400).json({ success: false, message: "Choose a Google account to continue." });
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience });
    payload = ticket.getPayload();
    if (!payload?.sub || typeof payload.sub !== "string" || payload.email_verified !== true || typeof payload.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error("Invalid identity");
  } catch {
    return res.status(401).json({ success: false, message: "Unable to verify your Google account. Please try again." });
  }
  try {
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      const email = payload.email.trim().toLowerCase();
      const existing = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
      if (existing) {
        // Only link when Google is authoritative for this email; never auto-link an admin.
        const authoritative = email.endsWith("@gmail.com") || Boolean(payload.hd);
        if (existing.googleId || !authoritative || existing.role === "admin") {
          return res.status(409).json({ success: false, message: "This email already has an account. Please sign in using its existing sign-in method." });
        }
        user = await User.findOneAndUpdate({ _id: existing._id, googleId: { $exists: false }, role: { $ne: "admin" } }, { $set: { googleId: payload.sub } }, { new: true, runValidators: true });
        if (!user) return res.status(409).json({ success: false, message: "Your account changed. Please try signing in again." });
      } else {
        user = await User.create({ googleId: payload.sub, email, name: (typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : email.split("@")[0]).slice(0, 100), role: "user" });
      }
    }
    setTokenCookie(res, createToken(user._id));
    await logLoginEvent(user);
    return res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "This account was just created. Please try signing in again." });
    return res.status(500).json({ success: false, message: "Unable to sign in with Google. Please try again." });
  }
};

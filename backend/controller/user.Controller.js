import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.modal.js";
import Visit from "../model/Visit.js";
import logger from "../configs/logger.js";

export const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// Records a session start for admin analytics. Never allowed to break auth.
export const logLoginEvent = async user => {
  try { await Visit.create({ type: "login", user: user._id, userName: user.name }); }
  catch (error) { logger.error({ err: error, userId: user._id }, "Unable to record login event"); }
};

// POST /api/user/register
export const register = async (req, res) => {
  try {
    const { name: rawName, email: rawEmail, password } = req.body ?? {};
    if (typeof rawName !== "string" || rawName.trim().length < 2 || rawName.trim().length > 100) return res.status(400).json({ success: false, message: "Enter a name between 2 and 100 characters." });
    if (typeof rawEmail !== "string" || rawEmail.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail.trim())) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) return res.status(400).json({ success: false, message: "Use at least 8 characters and no more than 72 bytes for your password." });
    const name = rawName.trim();
    const email = rawEmail.trim().toLowerCase();

    const existingUser = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please sign in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: "user" });

    const token = createToken(user._id);
    setTokenCookie(res, token);
    await logLoginEvent(user);

    return res.status(201).json({
      success: true,
      user: { _id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "An account with this email already exists. Please sign in." });
    req.log.error({ err: error }, "Registration failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/user/login
export const login = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body ?? {};
    if (typeof rawEmail !== "string" || rawEmail.length > 254 || typeof password !== "string" || password.length > 1024) return res.status(400).json({ success: false, message: "Enter your email and password." });
    const email = rawEmail.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).collation({ locale: "en", strength: 2 });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (!user.password) return res.status(401).json({ success: false, message: "Use Continue with Google to sign in to this account." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    setTokenCookie(res, token);
    await logLoginEvent(user);

    return res.json({
      success: true,
      user: { _id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    req.log.error({ err: error }, "Login failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Public session status. Protected routes still require authUser.
export const isAuth = async (req, res) => {
  const token = req.cookies?.token;
  const guest = () => res.json({ success: true, user: null });
  if (!token) return guest();
  let userId;
  try { userId = jwt.verify(token, process.env.JWT_SECRET).id; }
  catch { return guest(); }
  if (!userId || typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) return guest();
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return guest();
    }
    return res.json({ success: true, user });
  } catch (error) {
    req.log.error({ err: error }, "Session check failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    req.log.error({ err: error }, "Logout failed");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

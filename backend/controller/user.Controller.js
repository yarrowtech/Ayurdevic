import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.modal.js";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password should be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = createToken(user._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    setTokenCookie(res, token);

    return res.json({
      success: true,
      user: { email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

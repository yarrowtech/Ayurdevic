import jwt from "jsonwebtoken";

// Like authUser, but never rejects the request: sets req.userId when a
// valid session cookie is present, otherwise leaves it unset (anonymous
// visitor). Used by public routes that behave differently for signed-in
// users without requiring sign-in, such as visit tracking.
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try { req.userId = jwt.verify(token, process.env.JWT_SECRET).id; }
    catch { /* invalid/expired token: treat as anonymous */ }
  }
  next();
};

export default optionalAuth;

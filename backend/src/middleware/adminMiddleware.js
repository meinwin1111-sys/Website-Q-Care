function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden — chỉ admin mới được phép." });
  }
  return next();
}

module.exports = adminMiddleware;

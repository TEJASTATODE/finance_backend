
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {

  
    if (!req.user) {
      return res.status(401).json({ message: "Login required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Your role '${req.user.role}' cannot perform this action.`,
        requiredRoles: allowedRoles,
      });
    }
    next();
  };
};
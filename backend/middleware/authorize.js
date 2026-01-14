export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Make sure the user is logged in and role exists
      if (!req.user || !req.user.role) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No user information found" });
      }

      // Check if the user's role is in the allowed list
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      // Proceed if authorized
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Server error during authorization" });
    }
  };
};

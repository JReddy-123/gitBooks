export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error('Forbidden: insufficient permission');
      error.status = 403;
      throw error;
    }
    return next();
  };
}
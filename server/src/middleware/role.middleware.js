import { AppError } from '../utils/AppError.js';

/** Must run after `authenticateUser`. */
export const requireRole =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }
    next();
  };

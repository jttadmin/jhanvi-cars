const jwt = require('jsonwebtoken');

const {query} = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required.',
      });
    }

    const parts = authorization.split(' ');

    if (
      parts.length !== 2 ||
      parts[0] !== 'Bearer' ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication header.',
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    const result = await query(
      `
      SELECT
        id,
        name,
        mobile,
        role,
        is_active
      FROM users
      WHERE id = $1
      `,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive.',
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(
      'Authentication error:',
      error.message,
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource.',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};

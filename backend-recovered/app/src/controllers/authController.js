const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {query} = require('../config/database');

const generateToken = user => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      mobile: user.mobile,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
};

const register = async (req, res) => {
  try {
    const {
      name,
      mobile,
      password,
      role = 'customer',
    } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile and password are required.',
      });
    }

    if (!['customer', 'driver'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this mobile number already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      INSERT INTO users (
        name,
        mobile,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        mobile,
        role,
        is_active,
        created_at
      `,
      [
        name.trim(),
        mobile.trim(),
        passwordHash,
        role,
      ],
    );

    const user = result.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to register user.',
    });
  }
};

const login = async (req, res) => {
  try {
    const {
      mobile,
      password,
    } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile and password are required.',
      });
    }

    const result = await query(
      `
      SELECT
        id,
        name,
        mobile,
        password_hash,
        role,
        is_active
      FROM users
      WHERE mobile = $1
      `,
      [mobile.trim()],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password.',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password.',
      });
    }

    delete user.password_hash;

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      user,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to login.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        name,
        mobile,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve user profile.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};

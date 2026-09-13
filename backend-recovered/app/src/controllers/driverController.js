const {query} = require('../config/database');

const getDriverStatus = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        id,
        name,
        mobile,
        role,
        is_active,
        is_online,
        current_latitude,
        current_longitude,
        location_updated_at
      FROM users
      WHERE id = $1
        AND role = 'driver'
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver account not found.',
      });
    }

    return res.json({
      success: true,
      driver: result.rows[0],
    });
  } catch (error) {
    console.error('Get driver status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve driver status.',
    });
  }
};

const updateDriverStatus = async (req, res) => {
  try {
    const {isOnline} = req.body;

    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isOnline must be true or false.',
      });
    }

    const result = await query(
      `
      UPDATE users
      SET
        is_online = $1,
        updated_at = NOW()
      WHERE id = $2
        AND role = 'driver'
        AND is_active = true
      RETURNING
        id,
        name,
        mobile,
        role,
        is_active,
        is_online,
        current_latitude,
        current_longitude,
        location_updated_at
      `,
      [isOnline, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active driver account not found.',
      });
    }

    return res.json({
      success: true,
      message: isOnline
        ? 'Driver is now online.'
        : 'Driver is now offline.',
      driver: result.rows[0],
    });
  } catch (error) {
    console.error('Update driver status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to update driver status.',
    });
  }
};

const updateDriverLocation = async (req, res) => {
  try {
    const {latitude, longitude} = req.body;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude must be numbers.',
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude.',
      });
    }

    const result = await query(
      `
      UPDATE users
      SET
        current_latitude = $1,
        current_longitude = $2,
        location_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = $3
        AND role = 'driver'
        AND is_active = true
      RETURNING
        id,
        current_latitude,
        current_longitude,
        location_updated_at
      `,
      [
        latitude,
        longitude,
        req.user.id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active driver account not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Driver location updated successfully.',
      location: result.rows[0],
    });
  } catch (error) {
    console.error('Update driver location error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to update driver location.',
    });
  }
};

module.exports = {
  getDriverStatus,
  updateDriverStatus,
  updateDriverLocation,
};

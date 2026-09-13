const express = require('express');

const {
  getDriverStatus,
  updateDriverStatus,
  updateDriverLocation,
} = require('../controllers/driverController');

const {
  authenticate,
  authorize,
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('driver'));

router.get(
  '/status',
  getDriverStatus,
);

router.post(
  '/status',
  updateDriverStatus,
);

router.post(
  '/location',
  updateDriverLocation,
);

module.exports = router;

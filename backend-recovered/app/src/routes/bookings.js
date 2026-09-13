const express = require('express');

const {
  createBooking,
  getMyBookings,
  getBookingById,
  getDriverRideRequests,
  acceptRideRequest,
  updateDriverRideStatus,
} = require('../controllers/bookingController');

const {
  authenticate,
  authorize,
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

/*
 * DRIVER ROUTES
 */

router.get(
  '/driver/requests',
  authorize('driver'),
  getDriverRideRequests,
);

router.post(
  '/driver/:id/accept',
  authorize('driver'),
  acceptRideRequest,
);

router.post(
  '/driver/:id/status',
  authorize('driver'),
  updateDriverRideStatus,
);

/*
 * CUSTOMER ROUTES
 */

router.post(
  '/',
  authorize('customer'),
  createBooking,
);

router.get(
  '/',
  authorize('customer'),
  getMyBookings,
);

router.get(
  '/:id',
  authorize('customer'),
  getBookingById,
);

module.exports = router;

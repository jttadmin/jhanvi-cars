const {query} = require('../config/database');

const {
  calculateDrivingRoute,
} = require('../services/googleRoutes');

const VEHICLE_FARES = {
  Auto: {
    baseFare: 50,
    perKm: 15,
    minimumFare: 80,
  },

  Sedan: {
    baseFare: 100,
    perKm: 18,
    minimumFare: 150,
  },

  SUV: {
    baseFare: 150,
    perKm: 22,
    minimumFare: 220,
  },
};

const calculateFare = (vehicleType, distanceKm) => {
  const fareConfig = VEHICLE_FARES[vehicleType];

  if (!fareConfig) {
    throw new Error('Invalid vehicle type.');
  }

  const calculatedFare =
    fareConfig.baseFare +
    fareConfig.perKm * distanceKm;

  return Math.max(
    calculatedFare,
    fareConfig.minimumFare,
  );
};

/*
 * CUSTOMER
 * CREATE BOOKING
 */

const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;

    const {
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      destinationAddress,
      destinationLatitude,
      destinationLongitude,
      vehicleType,
    } = req.body;

    if (
      !pickupAddress ||
      pickupLatitude === undefined ||
      pickupLongitude === undefined ||
      !destinationAddress ||
      destinationLatitude === undefined ||
      destinationLongitude === undefined ||
      !vehicleType
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Pickup, destination and vehicle type are required.',
      });
    }

    if (!VEHICLE_FARES[vehicleType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle type.',
      });
    }

    const origin = {
      latitude: Number(pickupLatitude),
      longitude: Number(pickupLongitude),
    };

    const destination = {
      latitude: Number(destinationLatitude),
      longitude: Number(destinationLongitude),
    };

    if (
      Number.isNaN(origin.latitude) ||
      Number.isNaN(origin.longitude) ||
      Number.isNaN(destination.latitude) ||
      Number.isNaN(destination.longitude)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup or destination coordinates.',
      });
    }

    /*
     * Calculate the real driving route on the backend.
     */

    const route = await calculateDrivingRoute({
      origin,
      destination,
    });

    const distanceKm = Number(route.distanceKm);
    const durationMinutes = Number(
      route.durationMinutes,
    );

    if (
      Number.isNaN(distanceKm) ||
      Number.isNaN(durationMinutes)
    ) {
      return res.status(500).json({
        success: false,
        message: 'Unable to calculate route details.',
      });
    }

    const estimatedFare = calculateFare(
      vehicleType,
      distanceKm,
    );

    const result = await query(
      `
      INSERT INTO bookings (
        customer_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        vehicle_type,
        distance_km,
        duration_minutes,
        estimated_fare,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        'requested'
      )
      RETURNING
        id,
        customer_id,
        driver_id,
        vehicle_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        vehicle_type,
        distance_km,
        duration_minutes,
        estimated_fare,
        status,
        created_at,
        updated_at
      `,
      [
        customerId,
        pickupAddress.trim(),
        origin.latitude,
        origin.longitude,
        destinationAddress.trim(),
        destination.latitude,
        destination.longitude,
        vehicleType,
        distanceKm,
        durationMinutes,
        estimatedFare,
      ],
    );

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(
      'Create booking error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to create booking.',
    });
  }
};

/*
 * CUSTOMER
 * GET MY BOOKINGS
 */

const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const result = await query(
      `
      SELECT
        b.id,
        b.customer_id,
        b.driver_id,
        d.name AS driver_name,
        d.mobile AS driver_mobile,
        b.vehicle_id,
        b.pickup_address,
        b.pickup_latitude,
        b.pickup_longitude,
        b.destination_address,
        b.destination_latitude,
        b.destination_longitude,
        b.vehicle_type,
        b.distance_km,
        b.duration_minutes,
        b.estimated_fare,
        b.status,
        b.created_at,
        b.updated_at
      FROM bookings b
      LEFT JOIN users d
        ON d.id = b.driver_id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
      `,
      [customerId],
    );

    return res.json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    console.error(
      'Get bookings error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve bookings.',
    });
  }
};

/*
 * CUSTOMER
 * GET BOOKING BY ID
 */

const getBookingById = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {id} = req.params;

    const result = await query(
      `
      SELECT
        b.id,
        b.customer_id,
        b.driver_id,
        d.name AS driver_name,
        d.mobile AS driver_mobile,
        b.vehicle_id,
        b.pickup_address,
        b.pickup_latitude,
        b.pickup_longitude,
        b.destination_address,
        b.destination_latitude,
        b.destination_longitude,
        b.vehicle_type,
        b.distance_km,
        b.duration_minutes,
        b.estimated_fare,
        b.status,
        b.created_at,
        b.updated_at
      FROM bookings b
      LEFT JOIN users d
        ON d.id = b.driver_id
      WHERE b.id = $1
        AND b.customer_id = $2
      `,
      [id, customerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    return res.json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(
      'Get booking error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve booking.',
    });
  }
};

/*
 * DRIVER
 * GET AVAILABLE RIDE REQUESTS
 */

const getDriverRideRequests = async (req, res) => {
  try {
    const driverId = req.user.id;

    const driverResult = await query(
      `
      SELECT
        id,
        is_online
      FROM users
      WHERE id = $1
        AND role = 'driver'
        AND is_active = true
      `,
      [driverId],
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active driver account not found.',
      });
    }

    if (!driverResult.rows[0].is_online) {
      return res.json({
        success: true,
        bookings: [],
      });
    }

    const result = await query(
      `
      SELECT
        b.id,
        b.customer_id,
        u.name AS customer_name,
        u.mobile AS customer_mobile,
        b.pickup_address,
        b.pickup_latitude,
        b.pickup_longitude,
        b.destination_address,
        b.destination_latitude,
        b.destination_longitude,
        b.vehicle_type,
        b.distance_km,
        b.duration_minutes,
        b.estimated_fare,
        b.status,
        b.created_at
      FROM bookings b
      INNER JOIN users u
        ON u.id = b.customer_id
      WHERE b.status = 'requested'
        AND b.driver_id IS NULL
      ORDER BY b.created_at ASC
      `,
    );

    return res.json({
      success: true,
      bookings: result.rows,
    });
  } catch (error) {
    console.error(
      'Get driver ride requests error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve ride requests.',
    });
  }
};

/*
 * DRIVER
 * ACCEPT RIDE REQUEST
 */

const acceptRideRequest = async (req, res) => {
  try {
    const driverId = req.user.id;
    const {id} = req.params;

    const driverResult = await query(
      `
      SELECT
        id,
        is_online
      FROM users
      WHERE id = $1
        AND role = 'driver'
        AND is_active = true
      `,
      [driverId],
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Active driver account not found.',
      });
    }

    if (!driverResult.rows[0].is_online) {
      return res.status(403).json({
        success: false,
        message: 'You must be online to accept a ride.',
      });
    }

    const result = await query(
      `
      UPDATE bookings
      SET
        driver_id = $1,
        status = 'driver_assigned',
        updated_at = NOW()
      WHERE id = $2
        AND status = 'requested'
        AND driver_id IS NULL
      RETURNING
        id,
        customer_id,
        driver_id,
        vehicle_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        vehicle_type,
        distance_km,
        duration_minutes,
        estimated_fare,
        status,
        created_at,
        updated_at
      `,
      [driverId, id],
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message:
          'This ride request is no longer available.',
      });
    }

    return res.json({
      success: true,
      message: 'Ride accepted successfully.',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(
      'Accept ride request error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to accept ride request.',
    });
  }
};

/*
 * DRIVER
 * UPDATE RIDE STATUS
 */

const updateDriverRideStatus = async (req, res) => {
  try {
    const driverId = req.user.id;
    const {id} = req.params;
    const {status} = req.body;

    const allowedStatuses = [
      'driver_arriving',
      'ride_started',
      'ride_completed',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ride status.',
      });
    }

    const currentBookingResult = await query(
      `
      SELECT
        id,
        driver_id,
        status
      FROM bookings
      WHERE id = $1
        AND driver_id = $2
      `,
      [id, driverId],
    );

    if (currentBookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    const currentStatus =
      currentBookingResult.rows[0].status;

    const validTransitions = {
      driver_assigned: 'driver_arriving',
      driver_arriving: 'ride_started',
      ride_started: 'ride_completed',
    };

    if (validTransitions[currentStatus] !== status) {
      return res.status(409).json({
        success: false,
        message:
          `Invalid status transition from ` +
          `${currentStatus} to ${status}.`,
      });
    }

    const result = await query(
      `
      UPDATE bookings
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
        AND driver_id = $3
      RETURNING
        id,
        customer_id,
        driver_id,
        vehicle_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        vehicle_type,
        distance_km,
        duration_minutes,
        estimated_fare,
        status,
        created_at,
        updated_at
      `,
      [status, id, driverId],
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: 'Unable to update ride status.',
      });
    }

    return res.json({
      success: true,
      message: 'Ride status updated successfully.',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(
      'Update driver ride status error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to update ride status.',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getDriverRideRequests,
  acceptRideRequest,
  updateDriverRideStatus,
};

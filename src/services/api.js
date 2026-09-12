const API_BASE_URL = 'http://192.168.1.6:30080';

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const rawResponse = await response.text();

    let data;

    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      throw new Error(
        `Server returned non-JSON response (${response.status}). URL: ${url}`,
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(data?.message || 'Something went wrong.');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/*
 * AUTH
 */

const loginUser = async ({mobile, password}) => {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mobile,
      password,
    }),
  });
};

const registerUser = async ({name, mobile, password, role = 'customer'}) => {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      mobile,
      password,
      role,
    }),
  });
};

const getCurrentUser = async token => {
  return request('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/*
 * ROUTES
 */

const calculateDrivingRoute = async ({origin, destination}) => {
  const data = await request('/api/routes/calculate', {
    method: 'POST',
    body: JSON.stringify({
      origin,
      destination,
    }),
  });

  return data.route;
};

/*
 * CUSTOMER BOOKINGS
 */

const createBooking = async ({
  token,
  pickupAddress,
  pickupLatitude,
  pickupLongitude,
  destinationAddress,
  destinationLatitude,
  destinationLongitude,
  vehicleType,
}) => {
  const data = await request('/api/bookings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pickupAddress,
      pickupLatitude,
      pickupLongitude,
      destinationAddress,
      destinationLatitude,
      destinationLongitude,
      vehicleType,
    }),
  });

  return data.booking;
};

const getMyBookings = async token => {
  const data = await request('/api/bookings', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.bookings;
};

const getBookingById = async ({token, bookingId}) => {
  const data = await request(`/api/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.booking;
};

/*
 * DRIVER RIDE REQUESTS
 */

const getDriverRideRequests = async token => {
  const data = await request('/api/bookings/driver/requests', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.bookings;
};

const acceptRideRequest = async ({token, bookingId}) => {
  const data = await request(`/api/bookings/driver/${bookingId}/accept`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.booking;
};

const updateDriverRideStatus = async ({token, bookingId, status}) => {
  const data = await request(`/api/bookings/driver/${bookingId}/status`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  return data.booking;
};

/*
 * DRIVER ONLINE / OFFLINE STATUS
 */

const getDriverStatus = async token => {
  const data = await request('/api/driver/status', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.driver;
};

const updateDriverStatus = async ({token, isOnline}) => {
  const data = await request('/api/driver/status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      isOnline,
    }),
  });

  return data.driver;
};

/*
 * DRIVER LOCATION
 */

const updateDriverLocation = async ({token, latitude, longitude}) => {
  const data = await request('/api/driver/location', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  });

  return data.location;
};

/*
 * EXPORTS
 */

export {
  API_BASE_URL,
  loginUser,
  registerUser,
  getCurrentUser,
  calculateDrivingRoute,
  createBooking,
  getMyBookings,
  getBookingById,
  getDriverRideRequests,
  acceptRideRequest,
  updateDriverRideStatus,
  getDriverStatus,
  updateDriverStatus,
  updateDriverLocation,
};

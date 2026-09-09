import RazorpayCheckout from 'react-native-razorpay';

const API_BASE_URL = 'http://10.0.2.2:30080';

// Public API helper
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

// Find pricing for a Bangalore → destination route
export async function findRoute(toCity) {
  return apiRequest(`/routes/${encodeURIComponent(toCity)}`);
}

// Get available Bangalore destinations
export async function getAvailableDestinations() {
  const data = await apiRequest('/routes');

  // Backend returns an array of destination city strings.
  return Array.isArray(data) ? data : data.destinations || [];
}

// Create a Razorpay Test Mode order through the backend
export async function collectPayment({
  amount,
  bookerName,
  bookerEmail,
  bookerContact,
  token,
}) {
  if (!token) {
    throw new Error('Authentication required');
  }

  // 1. Ask backend to create Razorpay order
  const order = await apiRequest('/payments/create-order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
    }),
  });

  // 2. Open Razorpay Test Mode checkout
  const options = {
    description: 'Cab/SUV booking payment',
    currency: 'INR',
    key: 'rzp_test_TYWcwtOBlwQ90',
    amount: order.amount,
    order_id: order.id,
    name: 'Bangalore Cab Booking',
    prefill: {
      email: bookerEmail,
      contact: bookerContact,
      name: bookerName,
    },
  };

  const paymentResult = await RazorpayCheckout.open(options);

  // 3. Verify payment signature on backend
  const verification = await apiRequest('/payments/verify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      razorpay_order_id: paymentResult.razorpay_order_id,
      razorpay_payment_id: paymentResult.razorpay_payment_id,
      razorpay_signature: paymentResult.razorpay_signature,
    }),
  });

  if (!verification.verified) {
    throw new Error('Payment verification failed');
  }

  return paymentResult;
}

// Create booking through the Kubernetes backend
export async function createBooking({
  userId,
  fromCity,
  toCity,
  date,
  time,
  vehicleType,
  price,
  bookerName,
  bookerContact,
  bookerEmail,
  paymentId,
  token,
}) {
  if (!token) {
    throw new Error('Authentication required');
  }

  const booking = await apiRequest('/bookings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      toCity,
      date,
      time,
      vehicleType,
      price,
      bookerName,
      bookerContact,
      bookerEmail,
      paymentId: paymentId || null,
    }),
  });

  return booking.id;
}

// Get current user's bookings
export async function getUserBookings(token) {
  if (!token) {
    throw new Error('Authentication required');
  }

  const data = await apiRequest('/bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return Array.isArray(data) ? data : data.bookings || [];
}

// Cancel current user's booking
export async function cancelBooking(bookingId, token) {
  if (!token) {
    throw new Error('Authentication required');
  }

  return apiRequest(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const GOOGLE_ROUTES_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const calculateDrivingRoute = async ({ origin, destination }) => {
  const apiKey = process.env.GOOGLE_ROUTES_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_ROUTES_API_KEY is not configured.");
  }

  const response = await fetch(GOOGLE_ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Google Routes API error:", data);

    throw new Error(
      data?.error?.message || "Google Routes API request failed.",
    );
  }

  const route = data?.routes?.[0];

  if (!route) {
    throw new Error(
      "No driving route was found between the selected locations.",
    );
  }

  const distanceMeters = route.distanceMeters || 0;

  const durationSeconds = Number(
    String(route.duration || "0s").replace("s", ""),
  );

  return {
    distanceKm: Number((distanceMeters / 1000).toFixed(1)),
    distanceMeters,
    durationMinutes: Math.ceil(durationSeconds / 60),
    encodedPolyline: route.polyline?.encodedPolyline || null,
  };
};

module.exports = {
  calculateDrivingRoute,
};

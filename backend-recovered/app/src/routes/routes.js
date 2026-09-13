const express = require("express");

const { calculateDrivingRoute } = require("../services/googleRoutes");

const router = express.Router();

router.post("/calculate", async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (
      !origin ||
      typeof origin.latitude !== "number" ||
      typeof origin.longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid origin coordinates are required.",
      });
    }

    if (
      !destination ||
      typeof destination.latitude !== "number" ||
      typeof destination.longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid destination coordinates are required.",
      });
    }

    const route = await calculateDrivingRoute({
      origin,
      destination,
    });

    return res.json({
      success: true,
      route,
    });
  } catch (error) {
    console.error("Route calculation failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to calculate driving route.",
    });
  }
});

module.exports = router;

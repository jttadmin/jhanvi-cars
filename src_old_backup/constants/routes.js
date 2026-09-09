// Sample seed data — copy these into your Firestore "routes" collection
// to start testing search & booking before you build the admin panel.

export const SAMPLE_ROUTES = [
  {
    from: 'Bangalore',
    to: 'Mysore',
    // "driver" is optional per route — a route can omit it if you don't
    // want to offer a driver-only (customer's own vehicle) option there.
    vehiclePricing: { cab: 1800, sedan: 2200, suv: 3000, driver: 1200 },
  },
  {
    from: 'Bangalore',
    to: 'Coorg',
    vehiclePricing: { cab: 3500, sedan: 4200, suv: 5500, driver: 2000 },
  },
  {
    from: 'Bangalore',
    to: 'Ooty',
    vehiclePricing: { cab: 4000, sedan: 4800, suv: 6200, driver: 2200 },
  },
  {
    from: 'Bangalore',
    to: 'Chennai',
    vehiclePricing: { cab: 3800, sedan: 4500, suv: 5800, driver: 2000 },
  },
];

export const VEHICLE_LABELS = {
  cab: 'Cab',
  sedan: 'Sedan',
  suv: 'SUV',
  driver: 'Driver Only (your vehicle)',
};

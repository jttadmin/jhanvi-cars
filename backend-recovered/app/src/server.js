require('dotenv').config();

const express = require('express');
const cors = require('cors');

const routesRouter = require('./routes/routes');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const driverRoutes = require('./routes/driver');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/driver', driverRoutes);
app.use('/api/routes', routesRouter);
app.use('/api/bookings', bookingsRouter);
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Jhanvi Car Backend',
    status: 'healthy',
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Jhanvi Car Backend',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================');
  console.log('       Jhanvi Car Backend');
  console.log('==========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

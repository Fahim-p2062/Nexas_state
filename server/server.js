require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigins = new Set(
  (process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []).concat([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ])
);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser clients (curl/postman) with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes (no auth required — for visitors)
app.use('/api/public', require('./routes/publicRoutes'));

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Protected routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/leases', require('./routes/leaseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/tenant-portal', require('./routes/tenantPortalRoutes'));
app.use('/api/utility-bills', require('./routes/utilityBillRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Objections/complaints
app.use('/api/objections', require('./routes/complaintRoutes'));
// Backward compatibility
app.use('/api/complaints', require('./routes/complaintRoutes'));

// Admin routes (Admin role only)
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NexasEstate API is running.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

const PORT = process.env.PORT || 5002;

const startServer = (port, attempt = 0) => {
  const server = app.listen(port, () => {
    console.log(`🚀 NexasEstate server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attempt < 10) {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️ Port ${port} is in use. Retrying on ${nextPort}...`);
      setTimeout(() => startServer(nextPort, attempt + 1), 200);
      return;
    }
    console.error('Server failed to start:', err);
    process.exit(1);
  });
};

startServer(Number(PORT));

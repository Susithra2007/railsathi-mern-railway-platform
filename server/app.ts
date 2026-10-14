import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/authRoutes';
import trainRoutes from './routes/trainRoutes';
import bookingRoutes from './routes/bookingRoutes';
import adminRoutes from './routes/adminRoutes';
import aiRoutes from './routes/aiRoutes';

export const apiApp = express();

// Parse JSON bodies
apiApp.use(express.json());

// CORS & Preflight handling
apiApp.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-user-role');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
apiApp.use('/api/auth', authRoutes);
apiApp.use('/api/trains', trainRoutes);
apiApp.use('/api/bookings', bookingRoutes);
apiApp.use('/api/admin', adminRoutes);
apiApp.use('/api/ai', aiRoutes);

// Health check endpoint
apiApp.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    platform: 'RailSathi MERN Digital Railway System',
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
apiApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default apiApp;

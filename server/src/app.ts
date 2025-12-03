import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes';
import testRoutes from './routes/test.routes';

export const app: Application = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8060',
  credentials: true, // สำคัญ: ต้องเป็น true เพื่อให้ cookie ทำงาน
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['Content-Type', 'Content-Length'],
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);   // ถ้ามี reverse proxy

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', routes);

// global error handler
app.use('/error', testRoutes);
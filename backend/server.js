import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import newsletterRoutes from './routes/newsletter.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(origin => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1); // Vercel sits behind a proxy; needed for rate limiting
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') return callback(null, true);
  return callback(new Error('This origin is not allowed by CORS.'));
}, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many requests. Please wait a little and try again.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many account attempts. Please try again later.' } });
// Connect to MongoDB before any API route (cached, so only the first request pays the cost).
app.use('/api', async (_req, _res, next) => {
  try { await connectDB(); next(); } catch (error) { next(error); }
});
app.use('/api', generalLimiter);
app.get('/', (_req, res) => res.json({ ok: true, service: 'ember-oud-api', docs: '/api/health' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ember-oud-api', time: new Date().toISOString() }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);

// Local development: start a normal server. On Vercel the exported app is used instead.
if (!process.env.VERCEL) {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Ember / Oud API listening at http://localhost:${port}`));
  } catch (error) {
    console.error(`Backend could not start: ${error.message}`);
    console.error('Check backend/.env and make sure MongoDB is running/reachable.');
    process.exit(1);
  }
}

export default app;

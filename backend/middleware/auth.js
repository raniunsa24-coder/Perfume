import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'Authentication is not configured on the server.' });
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: 'This account is unavailable. Please sign in again.' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    next(error);
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  next();
}

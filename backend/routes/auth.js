import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tokenFor(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing in backend/.env.');
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const fragranceProfile = String(req.body.fragranceProfile || 'WOODY & WARM').trim();
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: 'Name must contain between 2 and 80 characters.' });
    if (!emailPattern.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 72) return res.status(400).json({ message: 'Password must contain between 8 and 72 characters.' });
    if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash, fragranceProfile });
    return res.status(201).json({ message: 'Account created successfully.', token: tokenFor(user), user: user.toJSON() });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!emailPattern.test(email) || !password) return res.status(400).json({ message: 'Enter your email and password.' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    return res.json({ message: 'Signed in successfully.', token: tokenFor(user), user: user.toJSON() });
  } catch (error) { next(error); }
});

router.get('/me', protect, (req, res) => res.json({ user: req.user.toJSON() }));

router.patch('/me', protect, async (req, res, next) => {
  try {
    const allowed = {};
    if (typeof req.body.name === 'string' && req.body.name.trim().length >= 2) allowed.name = req.body.name.trim().slice(0, 80);
    if (typeof req.body.fragranceProfile === 'string') allowed.fragranceProfile = req.body.fragranceProfile.trim().slice(0, 60);
    const user = await User.findByIdAndUpdate(req.user._id, { $set: allowed }, { new: true, runValidators: true });
    res.json({ message: 'Profile updated.', user });
  } catch (error) { next(error); }
});

export default router;

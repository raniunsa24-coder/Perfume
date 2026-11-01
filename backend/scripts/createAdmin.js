import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

try {
  await connectDB();
  const name = process.env.ADMIN_NAME || 'Ember Oud Admin';
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in backend/.env.');
  const hash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate({ email }, { $set: { name, email, password: hash, role: 'admin', isActive: true } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  console.log(`Admin account ready for ${user.email}. Keep the password private.`);
} catch (error) {
  console.error('Admin setup failed:', error.message);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }

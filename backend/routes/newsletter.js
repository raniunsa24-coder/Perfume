import { Router } from 'express';
import Newsletter from '../models/Newsletter.js';
const router = Router();
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/subscribe', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!validEmail.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    const existing = await Newsletter.findOne({ email });
    if (existing?.isActive) return res.status(200).json({ message: 'You are already on the list.' });
    if (existing) { existing.isActive = true; await existing.save(); }
    else await Newsletter.create({ email, source: String(req.body.source || 'homepage').slice(0, 50) });
    res.status(201).json({ message: 'You are on the list. Keep your senses open.' });
  } catch (error) { next(error); }
});
export default router;

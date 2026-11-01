import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const { search = '', family = '', featured, limit = '50', page = '1' } = req.query;
    const filter = { isActive: true };
    if (family) filter.family = { $regex: String(family).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (featured === 'true') filter.featured = true;
    if (search.trim()) filter.$or = [
      { name: { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { notes: { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      { family: { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
    ];
    const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ featured: -1, createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
      Product.countDocuments(filter)
    ]);
    res.json({ products, pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
  } catch (error) { next(error); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug.toLowerCase(), isActive: true }).lean();
    if (!product) return res.status(404).json({ message: 'This fragrance could not be found.' });
    res.json({ product });
  } catch (error) { next(error); }
});
export default router;

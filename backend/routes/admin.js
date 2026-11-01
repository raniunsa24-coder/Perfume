import { Router } from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Newsletter from '../models/Newsletter.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
router.use(protect, adminOnly);

router.get('/stats', async (_req, res, next) => {
  try {
    const [products, users, orders, newsletter, revenue, recentOrders] = await Promise.all([
      Product.countDocuments({ isActive: true }), User.countDocuments({ role: 'customer' }), Order.countDocuments(),
      Newsletter.countDocuments({ isActive: true }),
      Order.aggregate([{ $match: { status: { $ne: 'cancelled' }, paymentStatus: { $in: ['paid', 'pending'] } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(8).select('orderNumber shipping.fullName total status paymentStatus createdAt').lean()
    ]);
    res.json({ stats: { products, customers: users, orders, subscribers: newsletter, orderValue: revenue[0]?.total || 0 }, recentOrders });
  } catch (error) { next(error); }
});

router.post('/products', async (req, res, next) => {
  try {
    const payload = productPayload(req.body);
    if (!payload.name || !payload.image || !payload.family || !payload.notes || !payload.productCode || !Number.isFinite(payload.price)) return res.status(400).json({ message: 'Name, code, image, family, notes and price are required.' });
    payload.slug = payload.slug || slugify(payload.name);
    const product = await Product.create(payload);
    res.status(201).json({ product });
  } catch (error) { next(error); }
});
router.patch('/products/:id', async (req, res, next) => {
  try {
    const payload = productPayload(req.body);
    if (payload.name && !req.body.slug) payload.slug = slugify(payload.name);
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (error) { next(error); }
});
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product archived.', product });
  } catch (error) { next(error); }
});
router.get('/orders', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).limit(200).lean();
    res.json({ orders });
  } catch (error) { next(error); }
});
router.patch('/orders/:id', async (req, res, next) => {
  try {
    const allowedStatus = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const allowedPayment = ['pending', 'paid', 'failed', 'refunded'];
    const updates = {};
    if (allowedStatus.includes(req.body.status)) updates.status = req.body.status;
    if (allowedPayment.includes(req.body.paymentStatus)) updates.paymentStatus = req.body.paymentStatus;
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide a valid order status or payment status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (error) { next(error); }
});
router.get('/customers', async (_req, res, next) => {
  try { const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).select('name email fragranceProfile createdAt isActive').limit(500).lean(); res.json({ customers }); }
  catch (error) { next(error); }
});
router.get('/newsletter', async (_req, res, next) => {
  try { const subscribers = await Newsletter.find({ isActive: true }).sort({ createdAt: -1 }).limit(1000).lean(); res.json({ subscribers }); }
  catch (error) { next(error); }
});

function slugify(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function productPayload(body) {
  const fields = ['productCode','name','slug','family','price','notes','volume','tag','image','imageAlt','tone','mood','stock','isActive','featured'];
  const result = {};
  for (const field of fields) if (body[field] !== undefined) result[field] = body[field];
  if (result.name && !result.slug) result.slug = slugify(result.name);
  if (result.productCode) result.productCode = String(result.productCode).trim().toUpperCase();
  return result;
}
export default router;

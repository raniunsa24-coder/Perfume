import { Router } from 'express';
import crypto from 'node:crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';
const router = Router();

router.use(protect);
router.post('/', async (req, res, next) => {
  const reserved = [];
  try {
    const { items, shipping, paymentMethod = 'cash_on_delivery', customerNote = '' } = req.body;
    if (!Array.isArray(items) || items.length < 1 || items.length > 30) return res.status(400).json({ message: 'Your bag must contain between 1 and 30 items.' });
    const requiredShipping = ['fullName', 'email', 'phone', 'address', 'city'];
    if (!shipping || requiredShipping.some(key => !String(shipping[key] || '').trim())) return res.status(400).json({ message: 'Complete your shipping name, email, phone, address and city.' });
    if (!['cash_on_delivery', 'manual_transfer'].includes(paymentMethod)) return res.status(400).json({ message: 'Choose a supported payment method.' });
    const quantities = new Map();
    for (const item of items) {
      const identifier = String(item.productCode || item.id || item.productId || '').trim();
      const quantity = Number(item.quantity || item.qty);
      if (!identifier || identifier.length > 80) return res.status(400).json({ message: 'One of the selected products is invalid.' });
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: 'Each item quantity must be between 1 and 20.' });
      quantities.set(identifier, (quantities.get(identifier) || 0) + quantity);
    }
    const identifiers = [...quantities.keys()];
    const objectIds = identifiers.filter(value => /^[a-f\d]{24}$/i.test(value));
    const productCodes = identifiers.filter(value => !/^[a-f\d]{24}$/i.test(value));
    const products = await Product.find({ isActive: true, $or: [
      ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
      ...(productCodes.length ? [{ productCode: { $in: productCodes } }] : [])
    ] });
    const byIdentifier = new Map();
    for (const product of products) {
      byIdentifier.set(product._id.toString(), product);
      byIdentifier.set(product.productCode, product);
    }
    const orderItems = [];
    let subtotal = 0;
    for (const identifier of identifiers) {
      const product = byIdentifier.get(identifier);
      if (!product) return res.status(400).json({ message: `A selected product (${identifier}) is unavailable. Run the product seed script and try again.` });
      const quantity = quantities.get(identifier);
      if (product.stock < quantity) return res.status(409).json({ message: `${product.name} does not have enough stock.` });
      orderItems.push({ product: product._id, productCode: product.productCode, name: product.name, image: product.image, unitPrice: product.price, quantity });
      subtotal += product.price * quantity;
    }
    // Reserve stock atomically, restoring earlier reservations if any item is out of stock.
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) throw Object.assign(new Error(`${item.name} just went out of stock. Refresh your bag and try again.`), { status: 409 });
      reserved.push(item);
    }
    const shippingFee = subtotal >= 150 ? 0 : 8;
    const order = await Order.create({
      orderNumber: `EO-${Date.now().toString().slice(-7)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      user: req.user._id, items: orderItems, shipping: {
        fullName: String(shipping.fullName).trim().slice(0, 100), email: String(shipping.email).trim().toLowerCase(),
        phone: String(shipping.phone).trim().slice(0, 40), address: String(shipping.address).trim().slice(0, 250),
        city: String(shipping.city).trim().slice(0, 100), postalCode: String(shipping.postalCode || '').trim().slice(0, 30),
        country: String(shipping.country || 'Pakistan').trim().slice(0, 80)
      }, subtotal, shippingFee, total: subtotal + shippingFee, paymentMethod, customerNote: String(customerNote).slice(0, 500)
    });
    return res.status(201).json({ message: 'Your order has been placed.', order });
  } catch (error) {
    await Promise.all(reserved.map(item => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }).catch(() => null)));
    next(error);
  }
});

router.get('/my-orders', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ orders });
  } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (error) { next(error); }
});
export default router;

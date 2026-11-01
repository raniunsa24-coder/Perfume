import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productCode: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true },
  shipping: {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, default: '', trim: true },
    country: { type: String, default: 'Pakistan', trim: true }
  },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cash_on_delivery', 'manual_transfer'], default: 'cash_on_delivery' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  customerNote: { type: String, default: '', maxlength: 500 }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

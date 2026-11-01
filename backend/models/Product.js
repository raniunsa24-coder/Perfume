import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  family: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  notes: { type: String, required: true, trim: true },
  volume: { type: String, default: '50 ml · Eau de parfum' },
  tag: { type: String, default: 'THE SIGNATURE' },
  image: { type: String, required: true },
  imageAlt: { type: String, default: 'Perfume bottle' },
  tone: { type: String, default: '#b77b42' },
  mood: { type: String, default: '' },
  stock: { type: Number, default: 25, min: 0 },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ name: 'text', notes: 'text', family: 'text' });
export default mongoose.model('Product', productSchema);

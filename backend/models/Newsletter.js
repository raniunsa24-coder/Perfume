import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
  source: { type: String, default: 'homepage' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Newsletter', newsletterSchema);

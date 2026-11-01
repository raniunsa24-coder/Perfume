import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
  password: { type: String, required: true, select: false },
  fragranceProfile: { type: String, default: 'WOODY & WARM', maxlength: 60 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.set('toJSON', { transform(_doc, ret) { delete ret.password; delete ret.__v; return ret; } });
export default mongoose.model('User', userSchema);

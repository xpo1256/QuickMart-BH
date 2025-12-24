import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String },
  description: { type: String },
  descriptionAr: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'BHD' },
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  category: { type: String },
  categoryAr: { type: String },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  reviewsList: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    userId: { type: String },
    name: { type: String },
    email: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;

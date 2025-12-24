import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isArabic } = useLanguage();
  const { user } = useAuth();
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent): void => {
    e.preventDefault();
    
    if (!user) {
      toast.error(isArabic ? 'يجب تسجيل الدخول لإضافة المنتجات إلى السلة' : 'Please login to add items to cart');
      navigate('/login');
      return;
    }

    addToCart(product);
    const productName = isArabic ? product.nameAr : product.name;
    toast.success(`${productName} تمت إضافته إلى السلة!`);
  };

  const handleWishlist = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success(isArabic ? 'تمت إزالته من قائمة الرغبات' : 'Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success(isArabic ? 'تمت إضافته إلى قائمة الرغبات!' : 'Added to wishlist!');
    }
  };

  const productName = isArabic ? product.nameAr : product.name;
  const productDescription = isArabic ? product.descriptionAr : product.description;
  const productCategory = isArabic ? product.categoryAr : product.category;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative overflow-hidden aspect-square bg-gray-50 flex items-center justify-center">
        <ImageWithFallback
          src={product.images[0]}
          alt={product.name}
          className="max-w-full max-h-full object-contain transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
          {productCategory}
        </div>
        <button
          onClick={handleWishlist}
          className={`absolute top-2 left-2 p-2 rounded-full transition-all ${
            inWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{productName}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{productDescription}</p>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm">{product.rating}</span>
          </div>
          <span className="text-gray-400 text-sm ml-2">({product.reviews} reviews)</span>
        </div>

        <div className="mb-3 text-sm">
          <span className={`font-semibold ${product.stock > 20 ? 'text-green-600' : product.stock > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {product.price.toFixed(2)} BHD
          </span>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="flex items-center gap-2"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
}

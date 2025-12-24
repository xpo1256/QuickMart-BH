import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (productId: number): void => {
    const product = wishlistItems.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      removeFromWishlist(productId);
      toast.success('Item moved to cart and removed from wishlist');
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">Save products you love for later!</p>
          <Link to="/products">
            <Button size="lg" className="gap-2">
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Wishlist</h1>
          <p className="text-gray-600">{wishlistItems.length} items saved</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-200">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {product.price.toFixed(2)} BHD
                  </span>
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-gray-700">{product.rating}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToCart(product.id)}
                  size="sm"
                  className="w-full gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Move to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={clearWishlist}
          >
            Clear Wishlist
          </Button>
          <Link to="/products">
            <Button className="gap-2">
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

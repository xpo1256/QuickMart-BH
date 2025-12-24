import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { postProductReview } from '../services/api';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isArabic } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProductById(id)
      .then((p) => setProduct(p))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setReviewName(user.name || '');
      setReviewEmail(user.email || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error(isArabic ? 'يجب تسجيل الدخول لإضافة المنتجات إلى السلة' : 'Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      setQuantity(product.stock);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    const productName = isArabic ? product.nameAr : product.name;
    toast.success(`${quantity} × ${productName} added to cart!`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="mb-4 rounded-lg overflow-hidden aspect-square">
              {(() => {
                const media = [
                  ...(Array.isArray(product.images) ? product.images.map((s: string) => ({ type: 'image', src: s })) : []),
                  ...(Array.isArray(product.videos) ? product.videos.map((s: string) => ({ type: 'video', src: s })) : [])
                ];
                const sel = Math.min(Math.max(0, selectedImage), Math.max(0, media.length - 1));
                const item = media[sel];
                if (!item) return <div className="w-full h-full bg-gray-100" />;
                return item.type === 'video' ? (
                  <video src={item.src} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={item.src} alt={product.name} className="w-full h-full object-cover" />
                );
              })()}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const media = [
                  ...(Array.isArray(product.images) ? product.images.map((s: string) => ({ type: 'image', src: s })) : []),
                  ...(Array.isArray(product.videos) ? product.videos.map((s: string) => ({ type: 'video', src: s })) : [])
                ];
                return media.map((m: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <video src={m.src} className="w-full aspect-square object-cover" preload="metadata" muted />
                    ) : (
                      <img src={m.src} alt={`${product.name} ${index + 1}`} className="w-full aspect-square object-cover" />
                    )}
                  </button>
                ));
              })()}
            </div>
          </div>

          <div>
            <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mb-4">
              {product.category}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="text-4xl font-bold text-blue-600 mb-6">
              {(product.price ?? 0).toFixed(2)} {(product.currency || 'BHD')}
            </div>

            <div className={`text-lg font-semibold mb-6 ${product.stock > 20 ? 'text-green-600' : product.stock > 10 ? 'text-yellow-600' : product.stock > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">{product.description}</p>

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button onClick={handleAddToCart} size="lg" className="flex-1 gap-2" disabled={product.stock === 0}>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Free shipping across Bahrain</li>
                <li>• 7-day return policy</li>
                <li>• Genuine products guaranteed</li>
                <li>• Secure online payment</li>
              </ul>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Customer Reviews</h3>
              {Array.isArray(product.reviewsList) && product.reviewsList.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {product.reviewsList.slice().reverse().map((r:any, idx:number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                            {r.avatar ? (
                              <img src={r.avatar} alt={r.name || 'avatar'} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm text-gray-600">{(r.name||'G').split(' ').map((n:any)=>n[0]).slice(0,2).join('')}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{r.name || 'Guest'}</div>
                            <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(r.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{r.rating}★</span>
                      </div>
                      <div className="mt-2 text-gray-700">{r.comment}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 mb-4">No reviews yet. Be the first to review.</p>
              )}

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Write a review</h4>
                <input className="w-full border rounded p-2 mb-2" placeholder="Your name" value={reviewName} onChange={(e)=>setReviewName(e.target.value)} disabled={!!user} />
                <input className="w-full border rounded p-2 mb-2" placeholder="Email (optional)" value={reviewEmail} onChange={(e)=>setReviewEmail(e.target.value)} disabled={!!user} />
                <div className="mb-2">
                  <label className="block text-sm mb-1">Rating</label>
                  <select className="border rounded p-2" value={reviewRating} onChange={(e)=>setReviewRating(Number(e.target.value))}>
                    <option value={5}>5</option>
                    <option value={4}>4</option>
                    <option value={3}>3</option>
                    <option value={2}>2</option>
                    <option value={1}>1</option>
                  </select>
                </div>
                <textarea className="w-full border rounded p-2 mb-2" rows={4} placeholder="Write your review" value={reviewComment} onChange={(e)=>setReviewComment(e.target.value)} />
                <div>
                  <Button onClick={async ()=>{
                    if (!user) { navigate('/login'); return; }
                    try {
                        const payload:any = { userId: user.id, name: user.name || reviewName || 'Guest', email: user.email || reviewEmail || '', rating: reviewRating, comment: reviewComment };
                        if ((user as any).avatar) payload.avatar = (user as any).avatar;
                        // optimistic UI: append review locally so avatar/name show immediately
                        const newReview = { userId: user.id, name: payload.name, email: payload.email, rating: payload.rating, comment: payload.comment, avatar: payload.avatar, createdAt: new Date().toISOString() };
                        setProduct((prev:any)=>{
                          if (!prev) return prev;
                          const copy = { ...prev };
                          copy.reviewsList = copy.reviewsList ? copy.reviewsList.concat([newReview]) : [newReview];
                          copy.reviews = (copy.reviews || 0) + 1;
                          // update average rating locally
                          const avg = (copy.rating * (copy.reviews - 1) + newReview.rating) / copy.reviews;
                          copy.rating = Math.round(avg * 10) / 10;
                          return copy;
                        });
                        await postProductReview(String(id), payload);
                        toast.success('Review submitted');
                        setReviewComment(''); setReviewRating(5);
                    } catch (err:any) {
                      toast.error('Failed to submit review: ' + (err.message||err));
                    } finally { setLoading(false); }
                  }}>Submit Review</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

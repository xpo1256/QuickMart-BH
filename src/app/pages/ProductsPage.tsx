import { useState, useMemo, useEffect } from 'react';
import { Search, Sliders } from 'lucide-react';
import { Product } from '../data/products';
import { fetchProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts()
      .then((data) => {
        if (mounted) {
          console.debug('[ProductsPage] fetched products count:', Array.isArray(data) ? data.length : 0, data && data[0]);
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError(String(err));
      })
      .finally(() => mounted && setLoading(false));

    const onProductsUpdated = () => {
      // refetch when admin saves a product
      setLoading(true);
      fetchProducts().then(d => { if (mounted) setProducts(d); }).catch(e=>{ console.error(e); if (mounted) setError(String(e)); }).finally(()=> mounted && setLoading(false));
    };
    window.addEventListener('products-updated', onProductsUpdated as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('products-updated', onProductsUpdated as EventListener);
    };
  }, []);

  

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'Uncategorized')))]

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const name = (product.name || '').toString().toLowerCase();
      const desc = (product.description || '').toString().toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
      const prodCategory = (product.category || 'Uncategorized').toString();
      const matchesCategory = selectedCategory === 'All' || prodCategory === selectedCategory;
      const price = Number(product.price || 0);
      const matchesPrice = price >= Number(priceRange.min) && price <= Number(priceRange.max);
      const rating = Number(product.rating || 0);
      const matchesRating = rating >= Number(minRating);

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // Sort results
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // featured
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  useEffect(() => {
    console.debug('[ProductsPage] filteredProducts count:', filteredProducts.length);
  }, [filteredProducts]);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Filters</h2>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Category</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Price Range</label>
                  <div className="space-y-2">
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">Min: {priceRange.min} BHD</span>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-600">Max: {priceRange.max} BHD</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Minimum Rating</label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`px-3 py-2 rounded text-sm transition-colors ${
                          minRating === rating
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rating === 0 ? 'All' : `${rating}★`}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setPriceRange({ min: 0, max: 1000 });
                    setMinRating(0);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
                <p className="text-gray-600">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>

                {loading && <span className="text-sm text-gray-500 ml-4">Loading...</span>}
                {error && <span className="text-sm text-red-500 ml-4">Error loading products</span>}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

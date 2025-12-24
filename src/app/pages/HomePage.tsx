import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../components/ui/carousel';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowRight, Truck, Shield, Headphones, Star } from 'lucide-react';
import { Product } from '../data/products';
import { fetchProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((data) => {
        if (mounted) setFeaturedProducts(data.slice(0, 6));
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, []);

  const testimonials = [
    {
      name: 'Ahmed Al-Khalifa',
      rating: 5,
      text: 'Excellent service and fast delivery across Bahrain. Highly recommended!',
    },
    {
      name: 'Fatima Hassan',
      rating: 5,
      text: 'Great quality products and amazing customer support. Will buy again!',
    },
    {
      name: 'Mohammed Ali',
      rating: 4,
      text: 'Very satisfied with my purchase. Genuine products at competitive prices.',
    },
  ];

  // using local Carousel (embla) via ui/carousel

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to QuickMart-BH
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Your trusted online marketplace for quality products in Bahrain. Fast delivery, secure payments, and excellent customer service.
            </p>
            <Link to="/products">
              <Button size="lg" variant="secondary" className="gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">Quick shipping across Bahrain</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Payment</h3>
                <p className="text-gray-600 text-sm">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Always here to help you</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Carousel>
              <CarouselPrevious />
              <CarouselContent className="flex items-stretch">
                {featuredProducts.slice(0, 3).map((product) => (
                  <CarouselItem key={product.id}>
                    <div className="px-2">
                      <div className="relative h-96 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                        <ImageWithFallback
                          src={product.images[0]}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                          <div className="p-8 text-white">
                            <h3 className="text-3xl font-bold mb-2">{product.name}</h3>
                            <p className="text-lg mb-4">{product.description}</p>
                            <Link to={`/product/${product.id}`}>
                              <Button variant="secondary">View Product</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium products available for fast delivery in Bahrain
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button size="lg" className="gap-2">
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
            <p className="text-gray-600">See what our customers say about us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">About QuickMart-BH</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            We are your trusted online shopping destination in Bahrain, offering a wide range of quality products
            with fast delivery across the Kingdom. Our mission is to provide excellent customer service and
            authentic products at competitive prices.
          </p>
          <Link to="/about">
            <Button variant="outline" size="lg">Learn More About Us</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

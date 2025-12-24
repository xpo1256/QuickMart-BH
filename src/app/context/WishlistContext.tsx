import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../data/products';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  getTotalWishlistItems: () => number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Use per-user storage key when logged in, otherwise use guest key
  const storageKey = user && user.email ? `wishlist:${user.email}` : 'wishlist:guest';

  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // If user changes (login/logout), reload wishlist from the appropriate storage key
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setWishlistItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setWishlistItems([]);
    }
  }, [storageKey]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev: Product[]) => {
      if (prev.find((item: Product) => item.id === product.id)) {
        return prev;
      }
      const updated = [...prev, product];
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const removeFromWishlist = (productId: number) => {
    setWishlistItems((prev: Product[]) => {
      const updated = prev.filter((item: Product) => item.id !== productId);
      try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item: Product) => item.id === productId);
  };

  const getTotalWishlistItems = () => {
    return wishlistItems.length;
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    try { localStorage.removeItem(storageKey); } catch (e) {}
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getTotalWishlistItems,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

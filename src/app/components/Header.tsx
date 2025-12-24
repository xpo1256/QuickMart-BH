import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Heart, User, LogOut, Globe, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { checkAdmin } from '../services/api';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { getTotalWishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const { language, setLanguage, isArabic } = useLanguage();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('theme');
      if (v) return v === 'dark';
      return document.documentElement.classList.contains('dark');
    } catch (e) { return false; }
  });

  useEffect(()=>{
    try{
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }catch(e){}
  },[isDark]);

  useEffect(() => {
    let mounted = true;
    checkAdmin().then(ok => { if (mounted) setIsAdmin(!!ok); }).catch(()=>{ if (mounted) setIsAdmin(false); });
    return () => { mounted = false; };
  }, []);

  const navLinks = [
    { name: 'Home', nameAr: 'الرئيسية', path: '/' },
    { name: 'Products', nameAr: 'المنتجات', path: '/products' },
    { name: 'About Us', nameAr: 'عن الموقع', path: '/about' },
    { name: 'Contact', nameAr: 'اتصل بنا', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">QM</span>
            </div>
            <span className="text-xl font-bold text-gray-900">QuickMart-BH</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {isArabic ? link.nameAr : link.name}
              </Link>
            ))}
            {/* Admin links hidden — show small badge after login */}
            {isAdmin && (
              <Link to="/admin/products" className="text-sm text-gray-600 ml-2 px-2 py-1 border rounded">Admin</Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">{isArabic ? 'EN' : 'AR'}</span>
            </button>

            <button
              onClick={() => setIsDark(d => !d)}
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isDark ? 'Switch to light' : 'Switch to dark'}
            >
              {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
            </button>

            <Link
              to="/wishlist"
              className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-6 h-6" />
              {getTotalWishlistItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalWishlistItems()}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 pl-4 border-l">
                <Link to="/profile" className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-gray-700">{(user.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('')}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-4 border-l">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 ${
                  isActive(link.path)
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
                {/* Admin links intentionally hidden from normal users */}
            <Link
              to="/wishlist"
              className="block py-2 text-gray-700 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="w-5 h-5" />
              Wishlist ({getTotalWishlistItems()})
            </Link>
            <Link
              to="/cart"
              className="block py-2 text-gray-700 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              Cart ({getTotalItems()})
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-gray-700 flex items-center gap-2 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

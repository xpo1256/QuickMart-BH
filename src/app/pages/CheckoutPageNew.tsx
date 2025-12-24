import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Banknote, Building2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cash'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create order on backend
  async function createOrder() {
    try {
      setIsProcessing(true);

      const response = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          deliveryAddress: formData.address,
          items: cartItems,
          totalPrice: getTotalPrice(),
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(isArabic ? 'فشل إنشاء الطلب' : 'Failed to create order');
      setIsProcessing(false);
      return null;
    }
  }

  // Process PayPal payment
  async function processPayPal(orderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/paypal/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          totalPrice: getTotalPrice(),
          customerEmail: formData.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // safety: ensure paymentUrl is a PayPal URL, not a frontend URL
        const url: string = String(data.paymentUrl || '');
        const origin = window.location.origin;
        if (url.startsWith(origin) || url.includes('/payment-success')) {
          console.error('Suspicious paymentUrl returned from server (points to frontend):', url, data);
          toast.error(isArabic ? 'خطأ في إعداد PayPal. الرجاء المحاولة لاحقًا.' : 'PayPal setup error — please try again later');
          setIsProcessing(false);
          return;
        }
        // redirect user to PayPal approval URL
        toast.success(isArabic ? 'جاري إعادة التوجيه إلى PayPal...' : 'Redirecting to PayPal...');
        setTimeout(() => { window.location.href = url; }, 800);
      } else {
        const err = data && (data.error || data.message) ? (data.error || data.message) : 'Unknown';
        console.error('PayPal create failed', err, data);
        toast.error(isArabic ? 'فشل إعداد الدفع' : 'Failed to prepare PayPal payment');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('PayPal error:', error);
      toast.error(isArabic ? 'خطأ في معالجة الدفع' : 'Payment processing error');
      setIsProcessing(false);
    }
  }

  // Process credit-card payment (server will route to a supported gateway)
  async function processCardPayment(orderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/credit/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, totalPrice: getTotalPrice(), customerEmail: formData.email }),
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => '');
        console.error('Credit create failed', response.status, txt);
        toast.error(isArabic ? 'خطأ في إعداد الدفع' : 'Failed to prepare card payment');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      if (data && data.paymentUrl) {
        // Redirect to gateway-hosted page
        toast.success(isArabic ? 'جاري إعادة التوجيه لصفحة الدفع الآمنة...' : 'Redirecting to secure payment page...');
        setTimeout(() => { window.location.href = String(data.paymentUrl); }, 700);
      } else if (data && data.clientSecret) {
        // Potential client-side integration (Stripe-like) — not implemented here
        toast.error(isArabic ? 'خيار الدفع غير متوفر حالياً' : 'Card payment method not available');
        setIsProcessing(false);
      } else {
        toast.error(isArabic ? 'خطأ في إعداد الدفع' : 'Failed to prepare card payment');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Card payment error:', error);
      toast.error(isArabic ? 'خطأ في معالجة الدفع' : 'Payment processing error');
      setIsProcessing(false);
    }
  }

  // Process Cash on Delivery
  async function processCashOnDelivery(orderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/cash-on-delivery/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        clearCart();
        toast.success(isArabic ? 'تم تأكيد طلبك. الدفع عند التسليم.' : 'Order confirmed. Pay on delivery.');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('COD error:', error);
      toast.error(isArabic ? 'خطأ في تأكيد الطلب' : 'Order confirmation error');
      setIsProcessing(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    // No additional validation required for credit/cash/paypal here

    setIsProcessing(true);

    // Create order first
    const orderId = await createOrder();
    if (!orderId) return;

    // Process based on payment method
    switch (paymentMethod) {
      case 'paypal':
        await processPayPal(orderId);
        break;
      case 'bank':
        await processBankTransfer(orderId);
        break;
      case 'cash':
        await processCashOnDelivery(orderId);
        break;
    }
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{isArabic ? 'الدفع' : 'Checkout'}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">{isArabic ? 'معلومات التوصيل' : 'Shipping Information'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{isArabic ? 'الاسم الكامل *' : 'Full Name *'}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={isArabic ? 'أحمد الخليفة' : 'Ahmed Al-Khalifa'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">{isArabic ? 'عنوان البريد الإلكتروني *' : 'Email Address *'}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={isArabic ? 'ahmed@example.com' : 'ahmed@example.com'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{isArabic ? 'رقم الهاتف *' : 'Phone Number *'}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={isArabic ? '+973 1234 5678' : '+973 1234 5678'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">{isArabic ? 'عنوان التوصيل *' : 'Delivery Address *'}</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={isArabic ? 'البناء 123، الطريق 45، الجنة، المنامة، البحرين' : 'Building 123, Road 45, Block 678, Manama, Bahrain'}
                    rows={3}
                    required
                  />
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</h2>

              <div className="space-y-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span className="font-semibold">PayPal</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-8">
                    {isArabic ? 'ادفع بأمان باستخدام حساب PayPal الخاص بك' : 'Pay securely with your PayPal account'}
                  </p>
                </div>

                {/* Credit card payments hidden for publication */}

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="mr-3"
                    />
                    <Banknote className="w-5 h-5 mr-2" />
                    <span className="font-semibold">{isArabic ? 'دفع عند التسليم' : 'Cash on Delivery'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-8">
                    {isArabic ? 'ادفع نقداً عند وصول طلبك إلى باب منزلك' : 'Pay in cash when your order arrives at your door'}
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">{isArabic ? 'دفع آمن' : 'Secure Payment'}</p>
                    <p className="text-sm text-blue-700">
                      {isArabic 
                        ? 'معلومات الدفع الخاصة بك مشفرة وآمنة. لا نخزن تفاصيل بطاقتك الائتمانية أبداً.'
                        : 'Your payment information is encrypted and secure. We never store your card details.'}
                    </p>
                  </div>
                </div>
              </div>

              {paymentMethod === 'bank' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-semibold text-amber-900 mb-3">
                      {isArabic ? 'تفاصيل البنك' : 'Bank Transfer Details'}
                    </p>
                    <div className="space-y-2 text-sm text-amber-800">
                      <div>
                        <p className="font-semibold">{isArabic ? 'اسم المستقبل:' : 'Recipient Name:'}</p>
                        <p className="text-amber-700">QuickMart Bahrain LLC</p>
                      </div>
                      <div>
                        <p className="font-semibold">{isArabic ? 'رقم الحساب:' : 'Account Number:'}</p>
                        <p className="text-amber-700 font-mono">123456789</p>
                      </div>
                      <div>
                        <p className="font-semibold">{isArabic ? 'رمز البنك (IBAN):' : 'IBAN:'}</p>
                        <p className="text-amber-700 font-mono">BH94BBKM0000123456789</p>
                      </div>
                      <div>
                        <p className="font-semibold">{isArabic ? 'البنك:' : 'Bank:'}</p>
                        <p className="text-amber-700">Bank of Bahrain</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-4">
                      {isArabic ? 'تأكيد التحويل البنكي' : 'Bank Transfer Confirmation'}
                    </p>
                    <div>
                      <Label htmlFor="bankRef" className="mb-2">
                        {isArabic ? 'رقم المرجعية / رقم التحويل *' : 'Transfer Reference Number *'}
                      </Label>
                      <Input
                        id="bankRef"
                        type="text"
                        value={bankTransferRef}
                        onChange={(e) => setBankTransferRef(e.target.value)}
                        placeholder={isArabic ? 'أدخل رقم التحويل من بنكك' : 'Enter the transfer number from your bank'}
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700 mt-2">
                        {isArabic 
                          ? 'أدخل رقم المرجعية من تأكيد التحويل البنكي الخاص بك'
                          : 'Enter the reference number from your bank transfer confirmation'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">{isArabic ? 'ملخص الطلب' : 'Order Summary'}</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-gray-600 text-sm">{isArabic ? 'الكمية:' : 'Qty:'} {item.quantity}</p>
                      <p className="text-blue-600 font-semibold text-sm">
                        {(item.price * item.quantity).toFixed(2)} BHD
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{isArabic ? 'المجموع الجزئي' : 'Subtotal'}</span>
                  <span className="font-semibold">{getTotalPrice().toFixed(2)} BHD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isArabic ? 'الشحن' : 'Shipping'}</span>
                  <span className="font-semibold text-green-600">{isArabic ? 'مجاني' : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isArabic ? 'الضريبة' : 'Tax'}</span>
                  <span className="font-semibold">{isArabic ? 'مضمنة' : 'Included'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">{isArabic ? 'الإجمالي' : 'Total'}</span>
                  <span className="font-bold text-lg text-blue-600">
                    {getTotalPrice().toFixed(2)} BHD
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                size="lg" 
                className="w-full gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {isArabic ? 'تقديم الطلب' : 'Place Order'}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {isArabic 
                  ? 'بتقديم طلبك، فإنك توافق على شروطنا وأحكامنا'
                  : 'By placing your order, you agree to our terms and conditions'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

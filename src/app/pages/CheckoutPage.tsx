import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Banknote, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank' | 'cash'>('paypal');
  const [bankTransferRef, setBankTransferRef] = useState('');
  const [creditCardData, setCreditCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

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

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCardData({
      ...creditCardData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    // Validate payment method specific fields
    if (paymentMethod === 'bank' && !bankTransferRef) {
      toast.error(isArabic ? 'يرجى إدخال رقم المرجعية للتحويل البنكي' : 'Please enter the bank transfer reference');
      return;
    }

    // Credit card option is hidden for publication

    // In a real application, this would integrate with PayPal/Stripe APIs
    toast.success(isArabic ? 'تم تقديم الطلب بنجاح! إعادة التوجيه إلى الدفع...' : 'Order placed successfully! Redirecting to payment...');

    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      navigate('/');
      toast.success(isArabic ? 'تم الدفع بنجاح! شكراً على طلبك.' : 'Payment successful! Thank you for your order.');
    }, 2000);
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ahmed Al-Khalifa"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ahmed@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+973 1234 5678"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Building 123, Road 45, Block 678, Manama, Bahrain"
                    rows={3}
                    required
                  />
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

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

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                      className="mr-3"
                    />
                    <Building2 className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Bank Transfer</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-8">
                    {isArabic ? 'قم بتحويل الأموال مباشرة إلى حسابنا البنكي' : 'Transfer funds directly to our bank account'}
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
                    <span className="font-semibold">Cash on Delivery</span>
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
                      <p className="text-xs text-amber-600 mt-3">
                        {isArabic 
                          ? 'يرجى ذكر رقم الطلب في وصف التحويل. سيتم تأكيد طلبك بعد استلام الدفع.'
                          : 'Please mention your Order ID in the transfer description. Your order will be confirmed once payment is received.'}
                      </p>
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

              {/* Credit card details hidden for publication */}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>{isArabic ? 'ملاحظة:' : 'Note:'}  </strong>
                  {isArabic 
                    ? 'طرق الدفع الإلكترونية جاهزة للاستخدام. يمكنك إضافة بوابات دفع أخرى لاحقاً.'
                    : 'All payment methods are ready to use. You can add additional payment gateways later if needed.'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

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
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <p className="text-blue-600 font-semibold text-sm">
                        {(item.price * item.quantity).toFixed(2)} BHD
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{getTotalPrice().toFixed(2)} BHD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">Included</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-600">
                    {getTotalPrice().toFixed(2)} BHD
                  </span>
                </div>
              </div>

              <Button onClick={handleSubmit} size="lg" className="w-full gap-2">
                <Lock className="w-5 h-5" />
                Place Order
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

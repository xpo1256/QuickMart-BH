import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const REDIRECT_DELAY = 1200;
const MAX_RETRIES = 3;

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];

    async function verifyPayment() {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('orderId');
        const paymentId = params.get('paymentId') || params.get('paymentID') || params.get('PaymentId');
        const payerId = params.get('PayerID') || params.get('payerId') || params.get('payerID');

        // Mock flow
        if (params.get('mock') === '1') {
          toast.success('Payment confirmed (mock) — thank you!');
          clearCart();
          const id = setTimeout(() => navigate('/orders'), 800);
          timeoutIds.push(id);
          setLoading(false);
          return;
        }

        // PayPal verification
        if (orderId && paymentId && payerId) {
          const res = await fetch(`${API_BASE}/payments/paypal/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentId, payerId }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${res.status}`);
          }

          const result = await res.json();
          
          if (result.success) {
            toast.success('Payment confirmed — thank you!');
            clearCart();
            const id = setTimeout(() => navigate('/orders'), REDIRECT_DELAY);
            timeoutIds.push(id);
            setLoading(false);
            return;
          } else {
            throw new Error(result.error || 'Payment verification failed');
          }
        }

        // Check order status directly
        if (orderId) {
          const res = await fetch(`${API_BASE}/orders/${orderId}`);
          if (res.ok) {
            const order = await res.json();
            if (order.paymentStatus === 'completed' || order.orderStatus === 'confirmed') {
              toast.success('Payment confirmed — thank you!');
              clearCart();
              const id = setTimeout(() => navigate('/orders'), REDIRECT_DELAY);
              timeoutIds.push(id);
              setLoading(false);
              return;
            }
          }
        }

        throw new Error('Missing or invalid payment confirmation parameters');
      } catch (err: any) {
        console.error('Payment verification error:', err);
        
        if (retryCount < MAX_RETRIES) {
          toast.error(`Verification failed. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          const id = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
          timeoutIds.push(id);
        } else {
          toast.error('Unable to verify payment. Please check your order history.');
          setLoading(false);
          const id = setTimeout(() => navigate('/orders'), 2000);
          timeoutIds.push(id);
        }
      }
    }

    verifyPayment();

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [navigate, clearCart, retryCount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
        {loading ? (
          <div className="space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{retryCount + 1}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
              <p className="text-gray-600">We're confirming your payment details...</p>
              {retryCount > 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  Attempt {retryCount + 1} of {MAX_RETRIES + 1}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-green-500 text-5xl">✓</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Thank you for your purchase.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
              >
                View Your Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
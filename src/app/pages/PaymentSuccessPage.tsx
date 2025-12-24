import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('orderId');
        const paymentId = params.get('paymentId') || params.get('paymentID') || params.get('PaymentId');
        const payerId = params.get('PayerID') || params.get('payerId') || params.get('payerID');

        // Development/mock flow: backend may redirect to frontend with ?mock=1
        if (params.get('mock') === '1') {
          toast.success('Payment confirmed (mock) — thank you!');
          clearCart();
          setTimeout(() => navigate('/orders'), 800);
          setLoading(false);
          return;
        }

        // PayPal verification (requires paymentId + payerId)
        if (orderId && paymentId && payerId) {
          const res = await fetch(`${API_BASE}/payments/paypal/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentId, payerId }),
          });
          const j = await res.json().catch(() => null);
          if (!res.ok) {
            toast.error('Payment verification failed: ' + (j && j.error ? j.error : res.statusText));
            setLoading(false);
            return;
          }

          toast.success('Payment confirmed — thank you!');
          clearCart();
          setTimeout(() => navigate('/orders'), 1200);
          setLoading(false);
          return;
        }

        // If orderId present but no PayPal params, check order status (useful for other gateways)
        if (orderId) {
          try {
            const r = await fetch(`${API_BASE}/orders/${orderId}`);
            if (r.ok) {
              const ord = await r.json().catch(() => null);
              if (ord && (ord.paymentStatus === 'completed' || ord.orderStatus === 'confirmed')) {
                toast.success('Payment confirmed — thank you!');
                clearCart();
                setTimeout(() => navigate('/orders'), 1200);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            // ignore and fallthrough to error
          }
        }

        toast.error('Missing or invalid payment confirmation parameters');
        setLoading(false);
      } catch (err: any) {
        toast.error('Error verifying payment');
        console.error(err);
        setLoading(false);
      }
    }
    verify();
  }, [navigate, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {loading ? <div>Verifying payment...</div> : <div>Payment processed. Redirecting...</div>}
      </div>
    </div>
  );
}

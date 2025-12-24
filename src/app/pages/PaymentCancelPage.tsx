import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  useEffect(() => {
    toast.error('Payment cancelled');
    setTimeout(() => navigate('/checkout'), 800);
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Payment cancelled. Returning to checkout...</div>
    </div>
  );
}

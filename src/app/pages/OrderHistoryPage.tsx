import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { useEffect } from 'react';

interface Order {
  id: string;
  date: Date;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
}

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Mock orders for demo
  const orders: Order[] = [
    {
      id: 'ORD-001',
      date: new Date(2025, 11, 15),
      total: 250.5,
      status: 'delivered',
      items: 3,
    },
    {
      id: 'ORD-002',
      date: new Date(2025, 11, 10),
      total: 180.0,
      status: 'shipped',
      items: 2,
    },
    {
      id: 'ORD-003',
      date: new Date(2025, 11, 5),
      total: 95.75,
      status: 'pending',
      items: 1,
    },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-8">Start shopping to place your first order!</p>
          <Link to="/products">
            <Button size="lg" className="gap-2">
              <Package className="w-5 h-5" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Order History</h1>
        <p className="text-gray-600 mb-8">View and track all your orders</p>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-lg">{order.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Order Date
                  </p>
                  <p className="font-semibold">
                    {order.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold text-lg text-blue-600">
                    {order.total.toFixed(2)} BHD
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">{order.items} item(s)</p>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

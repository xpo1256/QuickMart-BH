import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminOrders, updateOrderAdmin, exportAdminOrders, exportSingleOrder, logoutAdmin } from '../services/api';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAdminOrders({ paymentStatus: paymentFilter || undefined, orderStatus: statusFilter || undefined, from: fromDate || undefined, to: toDate || undefined });
      setOrders(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally { setLoading(false); }
  }

  function applyFilters() {
    load();
  }

  async function doExport() {
    try {
      const blob = await exportAdminOrders({ paymentStatus: paymentFilter || undefined, orderStatus: statusFilter || undefined, from: fromDate || undefined, to: toDate || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Export failed: ' + (err.message || err));
    }
  }

  async function setStatus(orderId: string, status: string) {
    try {
      await updateOrderAdmin(orderId, { orderStatus: status });
      await load();
    } catch (err: any) {
      alert('Update failed: ' + (err.message || err));
    }
  }

  async function setTracking(orderId: string) {
    const provider = prompt('Tracking provider (e.g., Aramex):');
    if (!provider) return;
    const number = prompt('Tracking number:');
    if (!number) return;
    try {
      await updateOrderAdmin(orderId, { trackingProvider: provider, trackingNumber: number });
      await load();
    } catch (err: any) {
      alert('Update failed: ' + (err.message || err));
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Admin: Orders</h1>
          <div className="flex gap-2 items-center">
            <Link to="/admin/products" className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Products</Link>
            <Link to="/admin/orders" className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Orders</Link>
            <Link to="/admin/categories" className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Categories</Link>
            <button
              onClick={async () => { try { await logoutAdmin(); alert('Logged out'); window.location.href = '/admin/login'; } catch (e:any) { alert('Logout failed: ' + (e.message||e)); } }}
              className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
            >Logout</button>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs">Payment status</label>
            <select className="border rounded p-1" value={paymentFilter} onChange={(e)=>setPaymentFilter(e.target.value)}>
              <option value="">Any</option>
              <option value="pending">pending</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs">Order status</label>
            <select className="border rounded p-1" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="">Any</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="processing">processing</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs">From</label>
            <input type="date" className="border rounded p-1" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs">To</label>
            <input type="date" className="border rounded p-1" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={applyFilters}>Apply</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={doExport}>Export CSV</button>
          </div>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-4">
          {orders.map((o: any) => (
            <div key={o.id || o._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">Order: {o.id}</p>
                  <p className="text-sm">Customer: {o.customerName} · {o.customerEmail}</p>
                  <p className="text-sm">Phone: {o.customerPhone}</p>
                  <p className="text-sm">Payment: {o.paymentMethod} {o.paymentProvider ? `(${o.paymentProvider})` : ''} {o.paymentId ? `- ${o.paymentId}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{o.orderStatus}</p>
                  <p className="text-sm">{o.paymentStatus}</p>
                  <p className="text-xs text-gray-500">Placed: {new Date(o.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm">Items: {Array.isArray(o.items) ? o.items.length : 0}</p>
                <p className="text-sm">Total: {o.totalPrice}</p>
                <p className="text-sm">Tracking: {o.trackingProvider || '-'} / {o.trackingNumber || '-'}</p>
                <div className="mt-2">
                  <details>
                    <summary className="cursor-pointer text-sm text-blue-600">View items & address</summary>
                    <div className="mt-2">
                      <ul className="list-disc pl-5">
                        {Array.isArray(o.items) && o.items.map((it:any)=>(
                          <li key={it.id} className="text-sm">{it.name} × {it.quantity} — {it.price}</li>
                        ))}
                      </ul>
                      <div className="mt-2 text-sm">
                        <div><strong>Address:</strong> {o.customerAddress?.street || ''} {o.customerAddress?.city || ''} {o.customerAddress?.postalCode || ''} {o.customerAddress?.country || ''}</div>
                        <div><strong>Notes:</strong> {o.notes || '-'}</div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setStatus(o.id, 'confirmed')}>Set Confirmed</button>
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => setStatus(o.id, 'completed')}>Set Completed</button>
                <button className="px-3 py-1 bg-yellow-600 text-white rounded" onClick={() => setStatus(o.id, 'shipped')}>Set Shipped</button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => setStatus(o.id, 'processing')}>Set Processing</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => setStatus(o.id, 'cancelled')}>Set Cancelled</button>
                <button className="px-3 py-1 bg-gray-600 text-white rounded" onClick={() => setTracking(o.id)}>Set Tracking</button>
                <button className="px-3 py-1 bg-purple-600 text-white rounded" onClick={() => { const ps = prompt('Payment status (pending/processing/completed/failed):', o.paymentStatus || 'pending'); if(ps) setStatus(o.id, ps); }}>Set Payment Status</button>
                <button className="px-3 py-1 bg-teal-600 text-white rounded" onClick={async () => {
                  try {
                    const blob = await exportSingleOrder(o.id);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `order-${o.id}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (err: any) {
                    alert('Export failed: ' + (err.message || err));
                  }
                }}>Export</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

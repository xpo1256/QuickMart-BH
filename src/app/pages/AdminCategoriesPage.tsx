import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, createCategory, deleteCategoryAdmin, logoutAdmin } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function AdminCategoriesPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCats(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally { setLoading(false); }
  }

  async function add() {
    if (!name.trim()) return;
    try {
      await createCategory({ name: name.trim() });
      setName('');
      await load();
    } catch (err: any) {
      alert('Create failed: ' + (err.message || err));
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategoryAdmin(id);
      await load();
    } catch (err: any) {
      alert('Delete failed: ' + (err.message || err));
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Admin: Categories</h1>
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
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4 flex gap-2">
          <Input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="New category name" />
          <Button onClick={add}>Add</Button>
        </div>
        <div className="grid gap-2">
          {cats.map(c => (
            <div key={c._id} className="flex items-center justify-between bg-white p-2 rounded shadow">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500">{c.slug}</div>
              </div>
              <div>
                <Button variant="destructive" onClick={()=>remove(c._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

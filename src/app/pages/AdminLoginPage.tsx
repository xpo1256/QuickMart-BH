import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function AdminLoginPage() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    try {
      setLoading(true);
      await loginAdmin(key);
      // successful login -> go to admin products
      navigate('/admin/products');
    } catch (err: any) {
      alert('Login failed: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Admin login</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the admin key to access admin pages (kept private).</p>
        <Input type="password" value={key} onChange={(e: any) => setKey(e.target.value)} placeholder="Admin key" />
        <div className="mt-4 flex gap-2">
          <Button onClick={submit} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        </div>
      </div>
    </div>
  );
}

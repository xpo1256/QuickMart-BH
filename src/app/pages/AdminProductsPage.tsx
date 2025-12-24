import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../services/api';
import { fetchProducts, createProduct, updateProductAdmin, deleteProductAdmin, loginAdmin, checkAdmin, fetchCategories } from '../services/api';
import { Product } from '../data/products';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({ name: '', price: 0, currency: 'BHD', stock: 0, images: [''], videos: [] });
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    verifyAdmin();
    load();
    fetchCategories().then((c:any)=>{
      (window as any).__categories = c;
    }).catch(()=>{});
  }, []);

  async function verifyAdmin() {
    try {
      const ok = await checkAdmin();
      setIsAdmin(!!ok);
    } catch (err) {
      setIsAdmin(false);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function doLogin() {
    try {
      await loginAdmin(password);
      setIsAdmin(true);
      setPassword('');
      await load();
      alert('Logged in as admin.');
    } catch (err: any) {
      alert('Login failed: ' + (err.message || err));
    }
  }

  function startCreate() {
    if (!isAdmin) {
      alert('Please login as admin to create products.');
      return;
    }
    const empty: any = { name: '', price: 0, currency: 'BHD', stock: 0, images: [''], description: '', category: '' };
    setEditing(empty);
    setForm(empty);
  }

  function startEdit(p: Product) {
    setEditing(p);
    setForm({ ...p, images: p.images && p.images.length ? p.images : [''], currency: (p as any).currency || 'BHD' });
  }

  async function submit() {
    try {
      if (!isAdmin) return alert('Please login as admin to perform this action.');
      // If editing an existing product (has an `id`) then update, otherwise create
      if (editing && (editing as any).id) {
        await updateProductAdmin(String((editing as any).id), form);
      } else {
        await createProduct(form);
      }
      await load();
      // notify other pages (public products) to refresh
      try { window.dispatchEvent(new CustomEvent('products-updated')); } catch (e) {}
      setEditing(null);
      setForm({ name: '', price: 0, currency: 'BHD', stock: 0, images: [''] });
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function doDelete(id: string | number) {
    if (!isAdmin) return alert('Please login as admin to perform this action.');
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProductAdmin(String(id));
      await load();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin: Products</h1>
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

        {!isAdmin ? (
          <div className="mb-6 max-w-md">
            <label className="block text-sm font-semibold mb-2">Admin Login</label>
            <div className="flex gap-2">
              <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} placeholder="Enter admin key" />
              <Button onClick={doLogin}>Login</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Admin-only page. Login required to create, edit or delete products.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Button onClick={startCreate}>Create New Product</Button>
            </div>

            <div className="mb-6">
              {editing !== null && (
                <div className="bg-white p-4 rounded shadow mb-4">
                  <h2 className="font-semibold mb-2">{editing && (editing as any).id ? 'Edit Product' : 'New Product'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm">Name</label>
                      <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm">Price</label>
                      <Input type="number" value={form.price} onChange={(e: any) => setForm({ ...form, price: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-sm">Stock</label>
                      <Input type="number" value={form.stock} onChange={(e: any) => setForm({ ...form, stock: Number(e.target.value) })} />
                    </div>

                    <div>
                      <label className="block text-sm">Category</label>
                      <select className="w-full border rounded p-2" value={form.category || ''} onChange={(e: any) => setForm({ ...form, category: e.target.value })}>
                        <option value="">Select category</option>
                        {((window as any).__categories || []).map((c:any) => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm">Description</label>
                      <textarea className="w-full border rounded p-2" rows={4} value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm mb-2">Images</label>
                      {form.images && form.images.map((img: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <Input value={img} onChange={(e: any) => {
                            const next = [...form.images]; next[idx] = e.target.value; setForm({ ...form, images: next });
                          }} />
                          <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => { const next = [...form.images]; next.splice(idx, 1); setForm({ ...form, images: next }); }}>Remove</button>
                        </div>
                      ))}
                      <div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setForm({ ...form, images: [...(form.images || []), ''] })}>Add image</button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {(form.images || []).filter(Boolean).map((src: string, i: number) => (
                          <img key={i} src={src} alt={`preview-${i}`} className="h-24 w-full object-cover rounded" onError={(e:any)=>{e.currentTarget.style.opacity='0.5'}} />
                        ))}
                      </div>
                      {((form.videos as string[]) || []).length > 0 && (
                        <div className="mt-3">
                          <label className="block text-sm mb-2">Video Previews</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(form.videos || []).filter(Boolean).map((src: string, i: number) => (
                              <div key={i} className="h-24 w-full rounded overflow-hidden bg-black">
                                <video src={src} className="h-24 w-full object-cover" controls preload="metadata" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-4">
                        <label className="block text-sm mb-2">Upload Images / Videos</label>
                        <input type="file" accept="image/*,video/*" multiple onChange={async (e:any) => {
                          setUploadError(null);
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          const fd = new FormData();
                          for (let i = 0; i < files.length; i++) fd.append('media', files[i]);
                          try {
                            const j = await (await import('../services/api')).uploadProductMedia(fd);
                            const urls = j && j.urls ? j.urls : [];
                            const nextImages = [...(form.images || []), ...urls.filter((u:string)=>u.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))];
                            const nextVideos = [...((form.videos as string[]) || []), ...urls.filter((u:string)=>u.match(/\.(mp4|webm|ogg)$/i))];
                            setForm({ ...form, images: nextImages, videos: nextVideos });
                          } catch (err:any) {
                            const msg = (err && err.message) ? String(err.message) : String(err || 'Upload failed');
                            setUploadError(msg.replace(/\n/g, ' '));
                          }
                        }} />
                        {uploadError ? <div className="mt-2 text-sm text-red-600">{uploadError}</div> : null}
                        <div className="mt-2 text-sm text-gray-600">Uploaded videos will be stored and their URLs added to the product.</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm">Currency</label>
                      <select className="w-full border rounded p-2" value={form.currency || 'BHD'} onChange={(e:any)=>setForm({ ...form, currency: e.target.value })}>
                        <option value="BHD">BHD</option>
                        <option value="USD">USD</option>
                        <option value="AED">AED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm">Rating</label>
                      <Input type="number" min={0} max={5} value={form.rating ?? 0} onChange={(e:any)=>setForm({ ...form, rating: Number(e.target.value) })} disabled />
                      <p className="text-xs text-gray-500">Rating is calculated from user reviews and cannot be set manually.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={submit}>Save</Button>
                    <Button onClick={() => { setEditing(null); setForm({ name: '', price: 0, currency: 'BHD', stock: 0, images: [''] }); }} variant="outline">Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {loading ? <p>Loading...</p> : null}
              {error ? <p className="text-red-500">{error}</p> : null}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={String(p.id)} className="bg-white p-4 rounded shadow">
                    <img src={p.images && p.images[0]} alt={p.name} className="w-full h-40 object-cover mb-3 rounded" />
                    <h3 className="font-semibold mb-2">{p.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                    <p className="font-bold mb-2">{(p.price ?? 0).toFixed(2)} {(p.currency || 'BHD')}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => startEdit(p)}>Edit</Button>
                      <Button variant="destructive" onClick={() => doDelete(p.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

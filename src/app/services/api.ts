export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.warn('fetchProducts failed', res.status, txt);
    throw new Error('Failed to fetch products');
  }
  const data = await res.json().catch(() => null);
  let list: any[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && Array.isArray((data as any).products)) list = (data as any).products;
  else if (data && Array.isArray((data as any).data)) list = (data as any).data;
  else if (data && Array.isArray((data as any).items)) list = (data as any).items;

  // If API returned nothing, fallback to local sample products to avoid empty UI
  if (!list || list.length === 0) {
    try {
      const mod = await import('../data/products');
      list = mod.products || [];
      console.info('fetchProducts: using local fallback products');
    } catch (e) {
      // ignore
    }
  }

  return list.map((p: any) => ({ ...p, id: p._id ?? p.id }));
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(payload: any) {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function deleteCategoryAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return res.json();
}

export async function fetchProductById(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const p = await res.json();
  return { ...p, id: p._id ?? p.id };
}

export async function createProduct(payload: any) {
  // sanitize payload: ensure images is array of non-empty strings, price is number, and default currency
  const safe = { ...payload };
  safe.images = Array.isArray(safe.images) ? safe.images.filter(Boolean) : [];
  if (safe.price) safe.price = Number(safe.price);
  if (!safe.currency) safe.currency = 'BHD';
  const headers: any = { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(safe),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function uploadProductMedia(formData: FormData) {
  const res = await fetch(`${API_BASE}/admin/products/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Failed to upload media: ' + txt);
  }
  return res.json();
}

export async function updateProductAdmin(id: string, payload: any) {
  const safe = { ...payload };
  safe.images = Array.isArray(safe.images) ? safe.images.filter(Boolean) : [];
  if (safe.price) safe.price = Number(safe.price);
  if (!safe.currency) safe.currency = 'BHD';
  const headers: any = { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(safe),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProductAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function loginAdmin(key: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ key }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function checkAdmin() {
  const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });
  if (!res.ok) return false;
  const j = await res.json();
  return j.ok === true;
}

export async function fetchAdminOrders(filters: any = {}) {
  const qs = new URLSearchParams();
  if (filters.paymentStatus) qs.set('paymentStatus', filters.paymentStatus);
  if (filters.orderStatus) qs.set('orderStatus', filters.orderStatus);
  if (filters.from) qs.set('from', filters.from);
  if (filters.to) qs.set('to', filters.to);
  const url = `${API_BASE}/admin/orders${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function exportAdminOrders(filters: any = {}) {
  const qs = new URLSearchParams();
  if (filters.paymentStatus) qs.set('paymentStatus', filters.paymentStatus);
  if (filters.orderStatus) qs.set('orderStatus', filters.orderStatus);
  if (filters.from) qs.set('from', filters.from);
  if (filters.to) qs.set('to', filters.to);
  const url = `${API_BASE}/admin/orders/export${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Failed to export orders: ' + txt);
  }
  const blob = await res.blob();
  return blob;
}

export async function exportSingleOrder(orderId: string) {
  const url = `${API_BASE}/admin/orders/${orderId}/export`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Failed to export order: ' + txt);
  }
  return res.blob();
}

export async function logoutAdmin() {
  const res = await fetch(`${API_BASE}/admin/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Failed to logout: ' + txt);
  }
  return res.json().catch(() => ({ success: true }));
}

export async function fetchAdminOrder(orderId: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function updateOrderAdmin(orderId: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
}

export async function postProductReview(productId: string, payload: any) {
  const url = `${API_BASE}/products/${productId}/reviews`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Failed to submit review: ' + txt);
  }
  return res.json();
}

// Auth methods
export async function signupUser(payload: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Signup failed: ' + txt);
  }
  return res.json();
}

export async function loginUser(payload: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Login failed: ' + txt);
  }
  return res.json();
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

// Admin review moderation
export async function fetchAdminReviews() {
  const res = await fetch(`${API_BASE}/admin/reviews`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function deleteReviewAdmin(productId: string, reviewId: string) {
  const res = await fetch(`${API_BASE}/admin/products/${productId}/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete review');
  return res.json();
}

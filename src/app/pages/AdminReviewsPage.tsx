import { useEffect, useState } from 'react';
import { fetchAdminReviews, deleteReviewAdmin } from '../services/api';
import { Button } from '../components/ui/button';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchAdminReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally { setLoading(false); }
  }

  async function remove(productId:string, reviewId:string) {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReviewAdmin(productId, reviewId);
      await load();
    } catch (err:any) {
      alert('Delete failed: ' + (err.message || err));
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Admin: Reviews</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-4">
          {reviews.map((r:any, idx:number)=>(
            <div key={idx} className="bg-white p-4 rounded shadow flex justify-between items-start">
              <div>
                <div className="font-semibold">{r.productName}</div>
                <div className="text-sm text-gray-600">By: {r.review.name} · {r.review.email}</div>
                <div className="text-sm mt-2">{r.review.comment}</div>
                <div className="text-xs text-gray-500 mt-2">{new Date(r.review.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={()=>remove(r.productId, r.review._id)} variant="destructive">Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

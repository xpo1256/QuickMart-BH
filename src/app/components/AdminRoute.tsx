import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkAdmin } from '../services/api';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkAdmin()
      .then((ok) => {
        if (!mounted) return;
        setIsAdmin(!!ok);
      })
      .catch(() => {
        if (!mounted) return;
        setIsAdmin(false);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

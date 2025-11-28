import { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

export function AdminPanel() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('auth_token');
    const adminData = localStorage.getItem('admin_data');

    if (token && adminData) {
      // Verify token
      api.verifyToken().then((response) => {
        if (response.data?.valid) {
          setAdmin(JSON.parse(adminData));
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('admin_data');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (adminData: any) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    setAdmin(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#143C50] to-[#0a1f2d]">
        <Loader2 className="w-8 h-8 animate-spin text-[#009696]" />
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}

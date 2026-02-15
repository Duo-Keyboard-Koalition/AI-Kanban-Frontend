'use client';

import { useAuth } from '@/lib/auth-context';
import { AuthForm } from '@/components/auth-form';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <AuthForm />
      </div>
    );
  }

  return <Dashboard />;
}

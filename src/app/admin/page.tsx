
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the admin dashboard.
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return null; 
}

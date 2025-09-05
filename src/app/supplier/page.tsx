
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page just redirects to the supplier dashboard.
// In a real app, it would be protected by authentication.
export default function SupplierRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/supplier/dashboard');
  }, [router]);

  return null; 
}

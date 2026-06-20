import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProtectedLayout } from '@/components/admin/AdminProtectedLayout';

export const metadata = {
  title: 'Admin Dashboard | QuizLab',
  description: 'Admin control center for managing products, users, and analytics',
};

/**
 * Admin root layout
 * Wraps all admin pages with AdminLayout for sidebar and navigation
 * AdminProtectedLayout handles authentication and role-based access client-side
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      <AdminProtectedLayout>{children}</AdminProtectedLayout>
    </AdminLayout>
  );
}

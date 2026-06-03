// src/components/nav/SidebarWrapper.tsx

'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { isAdmin } from '@/lib/auth';

/**
 * SidebarWrapper - Detects user role and renders appropriate sidebar
 * Regular users see the simple navigation sidebar (Home, Tests, Dashboard, Profile)
 * Admin users see the professional admin sidebar (250px with categories)
 */
export default function SidebarWrapper() {
  const userIsAdmin = isAdmin();

  if (userIsAdmin) {
    return <AdminSidebar />;
  }

  return <Sidebar />;
}

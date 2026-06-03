'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { MobileMenuToggle } from './MobileMenuToggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Desktop Sidebar - always visible on md+ */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Overlay - shows when menu is open on mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* Mobile Sidebar - slides in from left on mobile */}
      <div className="md:hidden">
        <div
          className={`
            fixed inset-y-0 left-0 z-30
            transform transition-transform duration-300
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Menu Toggle Button */}
      <MobileMenuToggle onClick={handleToggleMobileMenu} />

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useUserStore } from '@/store/user';

interface ModuleLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export default function ModuleLayout({ children, title, subtitle, headerRight }: ModuleLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser } = useUserStore();

  if (!currentUser) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-y-auto main-content">
        {/* Page header */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold text-text">{title}</h1>
              {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}

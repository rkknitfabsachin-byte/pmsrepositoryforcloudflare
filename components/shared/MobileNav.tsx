'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Layers, Factory,
  Palette, PackageCheck, ClipboardList, Settings,
} from 'lucide-react';
import { useUserStore } from '@/store/user';
import { getNavModules } from '@/lib/roles';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, CalendarCheck, Layers, Factory,
  Palette, PackageCheck, ClipboardList, Settings,
};

export default function MobileNav() {
  const pathname = usePathname();
  const { currentUser } = useUserStore();
  const effectiveRole = useUserStore((s) => s.getEffectiveRole());
  if (!currentUser) return null;
  const navModules = getNavModules(effectiveRole);

  return (
    <nav className="mobile-nav hide-desktop" id="mobile-navigation">
      {navModules.map((mod) => {
        const Icon = ICON_MAP[mod.icon] || ClipboardList;
        const isActive = pathname === mod.path || pathname?.startsWith(mod.path + '/');
        return (
          <Link key={mod.id} href={mod.path} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} />
            <span>{mod.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

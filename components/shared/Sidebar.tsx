'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Layers, Factory,
  Palette, PackageCheck, ClipboardList, Settings,
  ChevronLeft, ChevronRight, LogOut, Shield,
} from 'lucide-react';
import { useUserStore } from '@/store/user';
import { getAccessibleModules, getRoleLabel } from '@/lib/roles';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, CalendarCheck, Layers, Factory,
  Palette, PackageCheck, ClipboardList, Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, impersonateRole } = useUserStore();
  const effectiveRole = useUserStore((s) => s.getEffectiveRole());
  const logout = useUserStore((s) => s.logout);

  if (!currentUser) return null;
  const modules = getAccessibleModules(effectiveRole);

  return (
    <aside className={`sidebar h-screen flex flex-col hide-mobile ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo area */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center font-heading font-bold text-white text-sm shrink-0">
          PMS
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-heading font-bold text-sm text-white whitespace-nowrap">Production MS</div>
            <div className="text-[0.625rem] text-white/50">{getRoleLabel(effectiveRole)}</div>
          </div>
        )}
      </div>

      {/* Impersonation badge */}
      {impersonateRole && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-1.5 bg-warning/20 rounded-md text-[0.625rem] text-warning-light font-heading font-semibold flex items-center gap-1.5">
          <Shield size={10} /> Viewing as {getRoleLabel(impersonateRole)}
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {modules.map((mod) => {
          const Icon = ICON_MAP[mod.icon] || ClipboardList;
          const isActive = pathname === mod.path || pathname?.startsWith(mod.path + '/');
          return (
            <Link key={mod.id} href={mod.path} className={`sidebar-link ${isActive ? 'active' : ''}`} title={mod.name}>
              <Icon size={18} />
              {!collapsed && <span>{mod.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        <button onClick={onToggle} className="sidebar-link w-full" title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={logout} className="sidebar-link w-full text-red-300 hover:text-red-200" title="Logout">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

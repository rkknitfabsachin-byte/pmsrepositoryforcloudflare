// ============================
// Role Definitions & Permission Checker
// ============================

import { type UserRole, type ModuleConfig } from './types';

/** Module configurations with role access */
export const MODULES: ModuleConfig[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['ADMIN'],
    description: 'KPI overview and analytics',
  },
  {
    id: 'orders',
    name: 'Orders',
    path: '/orders',
    icon: 'ClipboardList',
    roles: ['ADMIN'],
    description: 'Add and manage purchase orders',
  },
  {
    id: 'planning',
    name: 'Planning',
    path: '/planning',
    icon: 'CalendarCheck',
    roles: ['ADMIN', 'PLANNER'],
    description: 'Plan and schedule production orders',
  },
  {
    id: 'yarn',
    name: 'Yarn',
    path: '/yarn',
    icon: 'Layers',
    roles: ['ADMIN', 'YARN_MANAGER'],
    description: 'Manage yarn inventory and orders',
  },
  {
    id: 'production',
    name: 'Production',
    path: '/production',
    icon: 'Factory',
    roles: ['ADMIN', 'PRODUCTION'],
    description: 'Track machine allocation and output',
  },
  {
    id: 'dyeing',
    name: 'Dyeing',
    path: '/dyeing',
    icon: 'Palette',
    roles: ['ADMIN', 'DYEING'],
    description: 'Dyeing and finishing processes',
  },
  {
    id: 'completion',
    name: 'Dispatch',
    path: '/completion',
    icon: 'PackageCheck',
    roles: ['ADMIN', 'DISPATCH'],
    description: 'Order completion and dispatch',
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['ADMIN'],
    description: 'User management and contacts',
  },
];

/** Column ranges each role can edit (0-indexed) */
export const ROLE_EDITABLE_COLUMNS: Record<UserRole, number[]> = {
  ADMIN: Array.from({ length: 28 }, (_, i) => i), // All columns
  PLANNER: [7, 8, 9], // Columns 8-10 (timestamp, status, planning notes)
  YARN_MANAGER: [10, 11, 12, 13, 14, 15, 16, 17], // Columns 11-18
  PRODUCTION: [18, 19, 20, 21, 22], // Columns 19-23
  DYEING: [23, 24, 25, 26], // Columns 24-27
  DISPATCH: [27], // Column 28
  VIEWER: [], // No edit access
};

/** Check if a role has access to a module */
export function hasModuleAccess(role: UserRole, moduleId: string): boolean {
  if (role === 'ADMIN') return true;
  if (role === 'VIEWER') return true; // Viewers can see all modules (read-only)

  const module = MODULES.find((m) => m.id === moduleId);
  if (!module) return false;
  return module.roles.includes(role);
}

/** Check if a role can edit a specific column */
export function canEditColumn(role: UserRole, columnIndex: number): boolean {
  return ROLE_EDITABLE_COLUMNS[role].includes(columnIndex);
}

/** Get modules accessible by a role */
export function getAccessibleModules(role: UserRole): ModuleConfig[] {
  if (role === 'ADMIN') return MODULES;
  if (role === 'VIEWER') {
    // Viewers see all process modules but not admin pages
    return MODULES.filter(
      (m) => !['dashboard', 'orders', 'settings'].includes(m.id)
    );
  }
  return MODULES.filter((m) => m.roles.includes(role));
}

/** Get modules for bottom navigation (max 5) */
export function getNavModules(role: UserRole): ModuleConfig[] {
  const accessible = getAccessibleModules(role);
  // For admin, show: Dashboard, Planning, Yarn, Production, Dyeing (5 max)
  // For others, they typically have 1-2 modules
  return accessible.slice(0, 5);
}

/** Get role display label */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Admin',
    PLANNER: 'Planner',
    YARN_MANAGER: 'Yarn Manager',
    PRODUCTION: 'Production',
    DYEING: 'Dyeing',
    DISPATCH: 'Dispatch',
    VIEWER: 'Viewer',
  };
  return labels[role];
}

/** Get role badge color class */
export function getRoleBadgeClass(role: UserRole): string {
  const classes: Record<UserRole, string> = {
    ADMIN: 'bg-primary text-white',
    PLANNER: 'bg-purple text-white',
    YARN_MANAGER: 'bg-accent text-white',
    PRODUCTION: 'bg-warning text-white',
    DYEING: 'bg-success text-white',
    DISPATCH: 'bg-primary-light text-white',
    VIEWER: 'bg-gray-400 text-white',
  };
  return classes[role];
}

/** Validate role string */
export function isValidRole(role: string): role is UserRole {
  return [
    'ADMIN',
    'PLANNER',
    'YARN_MANAGER',
    'PRODUCTION',
    'DYEING',
    'DISPATCH',
    'VIEWER',
  ].includes(role);
}

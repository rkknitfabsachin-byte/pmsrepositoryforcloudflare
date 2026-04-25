'use client';

import React, { useEffect, useState } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { type UserRole } from '@/lib/types';
import { getRoleLabel } from '@/lib/roles';
import { Settings, Users, Shield, Plus, Phone } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  whatsapp: string;
  active: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [team, setTeam] = useState<TeamMember[]>([
    { id: '1', name: 'Admin', role: 'ADMIN', whatsapp: '', active: true },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('PLANNER');
  const [newWa, setNewWa] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    if (currentUser.role !== 'ADMIN') { router.push('/planning'); return; }
  }, [currentUser, router]);

  const addMember = () => {
    if (!newName) return;
    setTeam((prev) => [...prev, {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      whatsapp: newWa,
      active: true,
    }]);
    setNewName(''); setNewWa(''); setShowAdd(false);
  };

  const toggleActive = (id: string) => {
    setTeam((prev) => prev.map((m) => m.id === id ? { ...m, active: !m.active } : m));
  };

  const allRoles: UserRole[] = ['ADMIN', 'PLANNER', 'YARN_MANAGER', 'PRODUCTION', 'DYEING', 'DISPATCH', 'VIEWER'];

  if (!currentUser) return null;

  return (
    <ModuleLayout title="Settings" subtitle="Team management & configuration">
      <div className="space-y-6 max-w-2xl">
        {/* Team Management */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <h3 className="font-heading font-bold text-sm">Team Members</h3>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="btn btn-accent btn-sm">
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="card-body">
            {/* Add form */}
            {showAdd && (
              <div className="bg-bg rounded-lg p-4 mb-4 space-y-3 animate-slideDown border border-border-light">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Name</label>
                    <input type="text" className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Team member name" />
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <select className="form-input form-select" value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
                      {allRoles.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">WhatsApp Number</label>
                  <input type="tel" className="form-input" value={newWa} onChange={(e) => setNewWa(e.target.value)} placeholder="919XXXXXXXXX" />
                </div>
                <button onClick={addMember} className="btn btn-primary btn-sm">Add Member</button>
              </div>
            )}

            {/* Team list */}
            <div className="space-y-2">
              {team.map((member) => (
                <div key={member.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  member.active ? 'border-border bg-surface' : 'border-border-light bg-bg-alt opacity-60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-heading font-bold text-sm text-primary">
                      {member.name[0]}
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm">{member.name}</div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="badge badge-blank text-[0.5625rem] py-0 px-1.5">{getRoleLabel(member.role)}</span>
                        {member.whatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone size={10} /> {member.whatsapp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(member.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${member.active ? 'bg-success' : 'bg-border'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${member.active ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            <h3 className="font-heading font-bold text-sm">App Configuration</h3>
          </div>
          <div className="card-body space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Sheet ID</span>
              <span className="font-mono text-xs truncate max-w-[200px]">1zsPFBwk...5YGE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Main Tab</span>
              <span className="font-medium">PMS 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Cache TTL</span>
              <span className="font-mono">30s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}

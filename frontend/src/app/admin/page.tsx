'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, PhoneCall, Mail, ToggleLeft, ToggleRight, Sparkles, ShieldAlert } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { API_BASE_URL } from '../../lib/config';

interface UserRecord {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    isVerified: boolean;
  };
  profile: {
    photos: string[];
    trustBadges: {
      idVerified: boolean;
      videoVerified: boolean;
      familyVerified: boolean;
    };
  } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Cannot fetch admin users list. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBadge = async (userId: string, badgeField: string, currentValue: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          badgeField,
          value: !currentValue
        })
      });
      if (res.ok) {
        // Optimistically update status local state
        setUsers(prev =>
          prev.map(item => {
            if (item.user.id === userId && item.profile) {
              return {
                ...item,
                profile: {
                  ...item.profile,
                  trustBadges: {
                    ...item.profile.trustBadges,
                    [badgeField]: !currentValue
                  }
                }
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-dark text-neutral-light">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-[#E8A0BF]" />
              Moderation & Trust Badge Queue
            </h1>
            <p className="text-sm text-neutral-light/60 mt-1">
              Verify users manually to grant premium trust status badges.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            Refresh List
          </button>
        </div>

        {/* Content Panel */}
        {loading ? (
          <div className="text-center py-16 text-neutral-light/40 animate-pulse text-sm">
            Fetching registered profiles...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-xs text-error max-w-md">
            {error}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden border shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-[#171221] text-neutral-light/60 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">ID Verified</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Video Verified</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Family Involvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((record) => (
                    <tr key={record.user.id} className="hover:bg-white/5 transition-colors">
                      
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {record.profile?.photos?.[0] ? (
                            <img
                              src={record.profile.photos[0]}
                              alt={record.user.name}
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-dark-card flex items-center justify-center font-bold text-sm">
                              {record.user.name[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-xs">{record.user.name}</h4>
                            <span className="text-[10px] text-primary-light uppercase tracking-wider">
                              {record.user.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Fields */}
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-light/80">
                          <Mail className="h-3.5 w-3.5 opacity-60" />
                          <span>{record.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-light/80">
                          <PhoneCall className="h-3.5 w-3.5 opacity-60" />
                          <span>{record.user.phoneNumber}</span>
                        </div>
                      </td>

                      {/* Badge Toggle: ID Verified */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleBadge(record.user.id, 'idVerified', record.profile?.trustBadges?.idVerified || false)}
                          className="mx-auto flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {record.profile?.trustBadges?.idVerified ? (
                            <span className="px-2 py-1 rounded bg-success/20 text-success text-[10px] font-bold flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-neutral-light/45 text-[10px] font-medium">
                              Not Verified
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Badge Toggle: Video Verified */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleBadge(record.user.id, 'videoVerified', record.profile?.trustBadges?.videoVerified || false)}
                          className="mx-auto flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {record.profile?.trustBadges?.videoVerified ? (
                            <span className="px-2 py-1 rounded bg-success/20 text-success text-[10px] font-bold flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5" /> Video OK
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-neutral-light/45 text-[10px] font-medium">
                              No Video
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Badge Toggle: Family Verified */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleBadge(record.user.id, 'familyVerified', record.profile?.trustBadges?.familyVerified || false)}
                          className="mx-auto flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {record.profile?.trustBadges?.familyVerified ? (
                            <span className="px-2 py-1 rounded bg-primary/20 text-primary-light text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" /> Family Connected
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-neutral-light/45 text-[10px] font-medium">
                              Disabled
                            </span>
                          )}
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

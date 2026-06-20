'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AdminTable } from '@/components/admin/AdminTable';
import { Loader } from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  orderCount: number;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (page: number, search: string) => {
    try {
      if (!user) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchQuery);
  }, [user, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleView = (user: User) => {
    // In a real app, open a detail modal
    console.log('View user:', user);
  };

  const handleEdit = (user: User) => {
    // In a real app, open an edit form
    console.log('Edit user:', user);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.email}?`)) {
      console.log('Delete user:', user);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">User Management</h1>
        <p className="text-white/60 mt-2">
          Manage platform users and their permissions
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          Error: {error}
        </div>
      )}

      <AdminTable<User>
        columns={[
          { key: 'email', label: 'Email', width: '25%' },
          {
            key: 'display_name',
            label: 'Name',
            render: (value) => value || 'N/A',
            width: '20%',
          },
          {
            key: 'orderCount',
            label: 'Orders',
            render: (value) => value,
            width: '12%',
          },
          {
            key: 'is_active',
            label: 'Status',
            render: (value) => (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  value
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {value ? 'Active' : 'Inactive'}
              </span>
            ),
            width: '12%',
          },
          {
            key: 'created_at',
            label: 'Joined',
            render: (value) =>
              new Date(value).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            width: '15%',
          },
          { key: 'actions', label: 'Actions', width: '16%' },
        ]}
        data={users}
        isLoading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchUsers(page, searchQuery)}
        searchPlaceholder="Search by email or name..."
        onSearch={handleSearch}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

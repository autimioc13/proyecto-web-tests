'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react';

interface Column<T> {
  key: keyof T | 'actions';
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function AdminTable<T extends { id: string | number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchPlaceholder = 'Search...',
  onSearch,
}: AdminTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/20">
        <table className="w-full">
          <thead>
            <tr className="bg-white/10 border-b border-white/20">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-white/80"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-400" />
                    <span className="text-white/60">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-white/60"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 text-sm text-white/80"
                    >
                      {column.key === 'actions' ? (
                        <div className="flex items-center gap-2">
                          {onView && (
                            <button
                              onClick={() => onView(row)}
                              className="p-1 hover:bg-white/10 rounded text-blue-400"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-1 hover:bg-white/10 rounded text-yellow-400"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="p-1 hover:bg-white/10 rounded text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ) : column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        String(row[column.key as keyof T])
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

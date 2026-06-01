'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="w-8 h-8" />;

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
      >
        Iniciar Sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-slate-300 text-sm flex items-center gap-2">
        <UserIcon size={16} />
        {user.user_metadata?.full_name || user.email}
      </span>
      <form action="/auth/signout" method="POST">
        <button
          type="submit"
          className="flex items-center gap-2 px-3 py-1 text-slate-400 hover:text-white transition"
        >
          <LogOut size={16} />
          Salir
        </button>
      </form>
    </div>
  );
}

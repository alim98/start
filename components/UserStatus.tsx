'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
    username: string;
    name: string;
    dailyLimit: number;
    usedToday: number;
    remaining: number;
}

export default function UserStatus() {
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setUser(data.user);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const usagePercent = (user.usedToday / user.dailyLimit) * 100;
    const isLow = user.remaining <= 3;

    return (
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            {/* User Info */}
            <div className="text-right">
                <div className="text-white font-medium text-sm">{user.name}</div>
                <div className="text-slate-400 text-xs">@{user.username}</div>
            </div>

            {/* Usage Bar */}
            <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">
                    {user.remaining}/{user.dailyLimit}
                </div>
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${isLow ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                        style={{ width: `${100 - usagePercent}%` }}
                    />
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors p-2"
                title="خروج"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
    );
}

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

export default function PortalUserStatus() {
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
            <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const usagePercent = (user.usedToday / user.dailyLimit) * 100;
    const isLow = user.remaining <= 3;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white rounded-2xl shadow-lg border border-slate-200 px-6 py-4 mb-8">
            {/* User Info */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                    👤
                </div>
                <div className="text-right">
                    <div className="text-slate-800 font-bold">{user.name}</div>
                    <div className="text-slate-500 text-sm">@{user.username}</div>
                </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-10 w-px bg-slate-200"></div>

            {/* Usage */}
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <div className={`text-2xl font-black ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                        {user.remaining}
                    </div>
                    <div className="text-xs text-slate-500">باقی‌مانده امروز</div>
                </div>
                <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                        style={{ width: `${100 - usagePercent}%` }}
                    />
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-slate-700">
                        {user.dailyLimit}
                    </div>
                    <div className="text-xs text-slate-500">سقف روزانه</div>
                </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-10 w-px bg-slate-200"></div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors px-4 py-2 rounded-xl"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">خروج</span>
            </button>
        </div>
    );
}

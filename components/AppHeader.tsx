'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserInfo {
    username: string;
    name: string;
    dailyLimit: number;
    usedToday: number;
    remaining: number;
}

interface AppHeaderProps {
    showNav?: boolean;
    navLinks?: { href: string; label: string; icon?: string }[];
}

export default function AppHeader({ showNav = true, navLinks = [] }: AppHeaderProps) {
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

    const usagePercent = user ? (user.usedToday / user.dailyLimit) * 100 : 0;
    const isLow = user ? user.remaining <= 3 : false;

    return (
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            {/* Navigation Links */}
            {showNav && navLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {navLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            href={link.href}
                            className="text-xs md:text-sm bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors font-medium flex items-center gap-1"
                        >
                            {link.icon && <span>{link.icon}</span>}
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            {/* User Status */}
            {!loading && user && (
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2 border border-slate-200">
                    {/* User Info */}
                    <div className="text-right">
                        <div className="text-slate-800 font-medium text-sm">{user.name}</div>
                        <div className="text-slate-500 text-xs">@{user.username}</div>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-300"></div>

                    {/* Usage */}
                    <div className="flex items-center gap-2">
                        <div className="text-center">
                            <div className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                                {user.remaining}
                            </div>
                            <div className="text-xs text-slate-500">باقی‌مانده</div>
                        </div>
                        <div className="w-16 h-2 bg-slate-300 rounded-full overflow-hidden">
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
                        className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="خروج"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

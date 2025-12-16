'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'خطا در ورود');
                setLoading(false);
                return;
            }

            // Success - redirect
            router.push(redirectTo);
            router.refresh();
        } catch (err) {
            setError('خطا در ارتباط با سرور');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-center">
                    {error}
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2 text-right">
                        نام کاربری
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="username"
                        dir="ltr"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2 text-right">
                        رمز عبور
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        dir="ltr"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            در حال ورود...
                        </span>
                    ) : (
                        'ورود'
                    )}
                </button>
            </div>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-lg mb-4">
                        <span className="text-5xl">🔐</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">ورود به سامانه</h1>
                    <p className="text-slate-400">لطفاً اطلاعات کاربری خود را وارد کنید</p>
                </div>

                {/* Login Form with Suspense */}
                <Suspense fallback={
                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                    <LoginForm />
                </Suspense>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-8">
                    © 2025 AI Startup Evaluator
                </p>
            </div>
        </div>
    );
}

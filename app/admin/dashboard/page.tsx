import Link from 'next/link';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

// Database is disabled - return empty stats
async function getStats() {
    return {
        total: 0,
        avgScore: 0,
        recent: [] as any[],
        languageStats: [] as any[]
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Navbar */}
            <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        <h1 className="font-bold text-xl tracking-tight">StartupEvaluator <span className="text-indigo-400">Admin</span></h1>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                        <Link href="/" className="hover:text-indigo-300">View App</Link>
                        <button className="bg-indigo-600 px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">Export CSV</button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Dashboard</h2>
                        <p className="text-slate-500">Real-time overview of user submissions and platform activity.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-lg border shadow-sm">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Database Offline
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Submissions</p>
                        <p className="text-4xl font-black text-slate-900">{stats.total}</p>
                        <div className="mt-4 text-xs text-yellow-600 font-bold flex items-center gap-1">
                            <span>⚠️</span>
                            <span className="text-slate-400 font-normal">Database offline</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1">Avg Idea Score</p>
                        <p className="text-4xl font-black text-indigo-600">{stats.avgScore}</p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${stats.avgScore}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1">Language Split</p>
                        <div className="flex items-end gap-4 mt-2">
                            <div>
                                <p className="text-2xl font-bold">-</p>
                                <p className="text-xs text-slate-400 uppercase">English</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div>
                                <p className="text-2xl font-bold">-</p>
                                <p className="text-xs text-slate-400 uppercase">Persian</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white">
                        <p className="text-indigo-100 text-sm font-medium mb-1">Revenue Potential</p>
                        <p className="text-4xl font-black">$0</p>
                        <p className="text-xs text-indigo-200 mt-4">Premium features not yet active</p>
                    </div>
                </div>

                {/* Message about DB being offline */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                    <span className="text-4xl mb-4 block">🔧</span>
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">Database Temporarily Offline</h3>
                    <p className="text-yellow-700">
                        The database connection is being configured. Statistics and recent submissions will appear once the connection is established.
                    </p>
                </div>
            </main>
        </div>
    );
}

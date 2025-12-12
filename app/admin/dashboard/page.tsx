import { prisma } from '@/lib/idea-database';
import Link from 'next/link';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

async function getStats() {
    const total = await prisma.userSubmission.count();

    // Calculate average score
    const aggregate = await prisma.userSubmission.aggregate({
        _avg: {
            score: true
        }
    });

    const recent = await prisma.userSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const languageStats = await prisma.userSubmission.groupBy({
        by: ['language'],
        _count: true
    });

    return {
        total,
        avgScore: Math.round(aggregate._avg.score || 0),
        recent,
        languageStats
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
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        System Operational
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Submissions</p>
                        <p className="text-4xl font-black text-slate-900">{stats.total}</p>
                        <div className="mt-4 text-xs text-green-600 font-bold flex items-center gap-1">
                            <span>↑ 12%</span>
                            <span className="text-slate-400 font-normal">vs last week</span>
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
                                <p className="text-2xl font-bold">{stats.languageStats.find(s => s.language === 'en')?._count || 0}</p>
                                <p className="text-xs text-slate-400 uppercase">English</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div>
                                <p className="text-2xl font-bold">{stats.languageStats.find(s => s.language === 'fa')?._count || 0}</p>
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

                {/* Dynamic Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Recent Evaluations</h3>
                            <button className="text-sm text-indigo-600 font-bold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Idea Title</th>
                                        <th className="px-6 py-3 font-semibold">Score</th>
                                        <th className="px-6 py-3 font-semibold">Lang</th>
                                        <th className="px-6 py-3 font-semibold">Date</th>
                                        <th className="px-6 py-3 font-semibold text-right">Verdict</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recent.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate" title={sub.title}>
                                                {sub.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${sub.score && sub.score > 70 ? 'text-green-600' : 'text-slate-600'}`}>
                                                    {sub.score || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded textxs font-bold uppercase ${sub.language === 'en' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                                    {sub.language}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold 
                                            ${sub.verdict === 'Promising' ? 'bg-emerald-100 text-emerald-700' :
                                                        sub.verdict === 'Maybe' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-rose-100 text-rose-700'}`}>
                                                    {sub.verdict}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.recent.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                                                No evaluations yet. Start testing the app!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Side Panel / Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">High Potential Ideas</span>
                                    <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                                        {stats.recent.filter(i => i.verdict === 'Promising').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Average Description Len</span>
                                    <span className="font-mono bg-slate-50 text-slate-700 px-2 py-1 rounded">
                                        ~150 chars
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black text-white rounded-2xl shadow-xl p-6 relative overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">🔥 Upgrade to Pro</h3>
                                <p className="text-slate-400 group-hover:text-white/80 text-sm mb-4">
                                    Unlock advanced analytics, user emails, and export capabilities.
                                </p>
                                <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-slate-100">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

// User configuration with access control and usage limits
// In production, move this to a database or secure vault

export interface User {
    username: string;
    password: string; // In production, use hashed passwords!
    name: string;
    allowedApps: ('en' | 'fa' | 'park' | 'all')[];
    dailyLimit: number; // Max evaluations per day
    isActive: boolean;
}

// Pre-defined users - EDIT THIS LIST TO ADD/REMOVE USERS
export const users: User[] = [
    {
        username: 'admin',
        password: 'admin123', // Change this!
        name: 'مدیر سیستم',
        allowedApps: ['all'],
        dailyLimit: 100,
        isActive: true,
    },
    {
        username: 'demo_en',
        password: 'demo2024',
        name: 'Demo User (English)',
        allowedApps: ['en'],
        dailyLimit: 10,
        isActive: true,
    },
    {
        username: 'demo_fa',
        password: 'demo2024',
        name: 'کاربر آزمایشی',
        allowedApps: ['fa'],
        dailyLimit: 10,
        isActive: true,
    },
    {
        username: 'vc_user',
        password: 'vc2024',
        name: 'کاربر صندوق',
        allowedApps: ['park'],
        dailyLimit: 20,
        isActive: true,
    },
    {
        username: 'pro_user',
        password: 'pro2024',
        name: 'کاربر حرفه‌ای',
        allowedApps: ['en', 'fa'],
        dailyLimit: 50,
        isActive: true,
    },
];

// Helper functions
export function findUser(username: string): User | undefined {
    return users.find(u => u.username === username && u.isActive);
}

export function validateCredentials(username: string, password: string): User | null {
    const user = findUser(username);
    if (user && user.password === password) {
        return user;
    }
    return null;
}

export function hasAppAccess(user: User, appMode: string): boolean {
    if (user.allowedApps.includes('all')) return true;
    return user.allowedApps.includes(appMode as any);
}

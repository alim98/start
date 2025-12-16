'use client';

import { useState } from 'react';

export default function SimpleLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setResult('Sending request...');

        const startTime = Date.now();

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const endTime = Date.now();
            const data = await res.json();

            setResult(`
Status: ${res.status}
Time: ${endTime - startTime}ms
Response: ${JSON.stringify(data, null, 2)}
            `);
        } catch (err: any) {
            const endTime = Date.now();
            setResult(`
Error: ${err.message}
Time: ${endTime - startTime}ms
            `);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto' }}>
            <h1>🔧 Debug Login Page</h1>

            <div style={{ marginBottom: '20px' }}>
                <label>Username: </label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '10px', width: '200px', marginLeft: '10px' }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Password: </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '10px', width: '200px', marginLeft: '10px' }}
                />
            </div>

            <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: loading ? '#ccc' : '#0070f3',
                    color: 'white',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer'
                }}
            >
                {loading ? 'Loading...' : 'Test Login'}
            </button>

            <pre style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
            }}>
                {result || 'Click "Test Login" to see result'}
            </pre>
        </div>
    );
}

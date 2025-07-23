"use client";

import { useState } from 'react';

export default function TestPage() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testOAuth = async () => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);

            // Teste simples de fetch para verificar se a URL está acessível
            const testUrl = 'https://dev.uspdigital.usp.br/wsusuario/oauth/request_token';

            console.log('Testando URL:', testUrl);

            const response = await fetch(testUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('Status:', response.status);
            console.log('Headers:', response.headers);

            const text = await response.text();
            console.log('Response:', text);

            setResult({
                status: response.status,
                text: text,
                headers: Object.fromEntries(response.headers.entries())
            });

        } catch (error) {
            console.error('Erro no teste:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Teste OAuth USP</h1>

                <button
                    onClick={testOAuth}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? 'Testando...' : 'Testar Conexão OAuth'}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <strong>Erro:</strong> {error}
                    </div>
                )}

                {result && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        <strong>Resultado:</strong>
                        <pre className="mt-2 text-sm overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 
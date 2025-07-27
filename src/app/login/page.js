"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { uspOAuthClient } from "@/lib/uspOAuthClient";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Verificar se há erro na URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
            switch (errorParam) {
                case 'missing_params':
                    setError('Parâmetros de autenticação ausentes. Tente novamente.');
                    break;
                case 'oauth_failed':
                    setError('Falha na autenticação USP. Verifique suas credenciais.');
                    break;
                case 'callback_error':
                    setError('Erro no processo de autenticação. Tente novamente.');
                    break;
                default:
                    setError('Erro desconhecido. Tente novamente.');
            }
        }
    }, [searchParams]);

    const handleUSPLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const callbackUrl = typeof window !== "undefined" && window.location
                ? `${window.location.origin}/api/auth/usp/callback`
                : "";

            const result = await uspOAuthClient.authenticate(callbackUrl);

            if (typeof window !== "undefined") {
                window.location.href = result.authorizationUrl;
            }
        } catch (error) {
            console.error('Erro ao iniciar autenticação USP:', error);
            setError('Erro ao conectar com a USP. Tente novamente.');
            setLoading(false);
        }
    };

    const handleMockLogin = () => {
        setLoading(true);
        // Redirecionar para o modo mock
        if (typeof window !== "undefined") {
            window.location.href = `${window.location.origin}/api/auth/usp/callback?oauth_token=mock_token&oauth_verifier=mock_verifier&mock=true`;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Login USP
                    </h1>
                    <p className="text-gray-600">
                        Faça login com sua Senha Única USP
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleUSPLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#F37021] hover:bg-[#E05A1A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F37021] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Conectando...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Entrar com Senha Única USP
                                </div>
                            )}
                        </button>

                        {/* Botão de teste para desenvolvimento */}
                        {typeof window !== "undefined" && window.location.hostname.includes('localhost') && (
                            <button
                                onClick={handleMockLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F37021] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Carregando...' : 'Modo Teste (Desenvolvimento)'}
                            </button>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Ao fazer login, você concorda com os termos de uso da USP
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 
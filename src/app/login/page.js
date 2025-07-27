"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { uspOAuthClient } from "@/lib/uspOAuthClient";

function LoginPageContent() {
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
            console.log('🔍 Login - Iniciando processo de login USP');

            const callbackUrl = typeof window !== "undefined" && window.location
                ? `${window.location.origin}/api/auth/usp/callback`
                : "";

            console.log('🔍 Login - Callback URL:', callbackUrl);
            console.log('🔍 Login - Window location:', window.location);
            console.log('🔍 Login - Window origin:', window.location.origin);

            console.log('🔍 Login - Chamando uspOAuthClient.authenticate...');
            const result = await uspOAuthClient.authenticate(callbackUrl);

            console.log('🔍 Login - Resultado da autenticação:', result);
            console.log('🔍 Login - Authorization URL:', result.authorizationUrl);

            if (typeof window !== "undefined") {
                console.log('🔍 Login - Redirecionando para:', result.authorizationUrl);
                window.location.href = result.authorizationUrl;
            }
        } catch (error) {
            console.error('❌ Login - Erro detalhado ao iniciar autenticação USP:', error);
            console.error('❌ Login - Stack trace:', error.stack);

            // Mostrar erro mais específico
            let errorMessage = 'Erro ao conectar com a USP. Tente novamente.';

            if (error.message.includes('CORS')) {
                errorMessage = 'Erro de CORS: Domínio não autorizado pela USP.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Erro de autenticação: Tokens inválidos.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Acesso negado: URL de callback não configurada.';
            } else if (error.message.includes('404')) {
                errorMessage = 'URL da API da USP não encontrada.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Erro interno do servidor da USP.';
            }

            setError(errorMessage);
            setLoading(false);
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

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F37021] mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando...</h2>
                </div>
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
} 
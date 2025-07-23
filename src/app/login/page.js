"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { uspOAuthClient } from '@/lib/uspOAuthClient';
import Back from '@/app/components/Back';

export default function LoginPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const initiateUSPLogin = async () => {
            try {
                setLoading(true);
                setError('');

                // URL de callback para o OAuth
                const callbackUrl = `${window.location.origin}/api/auth/usp/callback`;

                console.log('Iniciando autenticação USP...');
                console.log('Callback URL:', callbackUrl);

                // Iniciar processo de autenticação OAuth
                const result = await uspOAuthClient.authenticate(callbackUrl);

                console.log('Resultado da autenticação:', result);

                // Salvar request token no localStorage
                uspOAuthClient.saveToStorage();

                // Redirecionar para a página de autorização da USP
                console.log('Redirecionando para:', result.authorizationUrl);
                window.location.href = result.authorizationUrl;

            } catch (error) {
                console.error('Erro no login USP:', error);
                setError(`Erro ao conectar com a USP: ${error.message}`);
                setLoading(false);
            }
        };

        // Se o usuário já está logado, redirecionar
        if (user) {
            router.push('/');
            return;
        }

        // Iniciar login USP automaticamente
        initiateUSPLogin();
    }, [user, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F37021] mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Conectando com a USP...</h2>
                        <p className="text-gray-600">Aguarde enquanto redirecionamos você para a autenticação oficial.</p>
                    </>
                ) : error ? (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro na conexão</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#F37021] text-white px-6 py-2 rounded-md hover:bg-[#e05a1a] transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
} 
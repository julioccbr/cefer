"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { uspOAuthClient } from '@/lib/uspOAuthClient';

function USPCompleteAuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginUSP } = useAuth();

    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);

    useEffect(() => {
        const completeAuth = async () => {
            try {
                setStatus('loading');

                const oauthToken = searchParams.get('oauth_token');
                const oauthVerifier = searchParams.get('oauth_verifier');
                const isMock = searchParams.get('mock') === 'true';

                if (!oauthToken || !oauthVerifier) {
                    throw new Error('Parâmetros OAuth ausentes');
                }

                let userData;

                if (isMock) {
                    // Dados mockados para desenvolvimento
                    userData = {
                        loginUsuario: "user123",
                        nomeUsuario: "João Silva",
                        emailPrincipalUsuario: "joao.silva@usp.br",
                        tipoUsuario: "Aluno",
                        numeroTelefoneFormatado: "(11) 99999-9999",
                        vinculo: [
                            {
                                tipoVinculo: "Aluno",
                                codigoSetor: "123",
                                nomeAbreviadoSetor: "IME"
                            }
                        ]
                    };
                } else {
                    // Autenticação real da USP
                    // Carregar request token do localStorage
                    uspOAuthClient.loadFromStorage();
                    if (!uspOAuthClient.requestToken) {
                        throw new Error('Request token não encontrado. Tente fazer login novamente.');
                    }

                    const authResult = await uspOAuthClient.completeAuthentication(oauthVerifier);
                    uspOAuthClient.saveToStorage();

                    if (!authResult || !authResult.userInfo) {
                        throw new Error('Falha ao obter dados do usuário da USP');
                    }

                    userData = authResult.userInfo;
                }

                // Mapear dados do usuário
                const user = {
                    id: userData.loginUsuario,
                    name: userData.nomeUsuario,
                    email: userData.emailPrincipalUsuario || userData.emailUspUsuario || userData.emailAlternativoUsuario,
                    type: userData.tipoUsuario,
                    phone: userData.numeroTelefoneFormatado,
                    vinculos: userData.vinculo || [],
                    uspData: userData
                };

                console.log('Dados do usuário USP:', user);

                const loginResult = await loginUSP(user);
                setStatus('success');

                // Redirecionar baseado no resultado
                setTimeout(() => {
                    if (loginResult.isFirstAccess) {
                        router.push('/completar-perfil');
                    } else {
                        router.push('/');
                    }
                }, 1000);

            } catch (error) {
                console.error('Erro ao completar autenticação:', error);
                setError(error.message);
                setStatus('error');
                uspOAuthClient.clearSession();
                uspOAuthClient.clearStorage();
            }
        };
        completeAuth();
    }, [searchParams, loginUSP, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F37021] mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Completando autenticação...</h2>
                    <p className="text-gray-600">Aguarde enquanto finalizamos seu login na USP.</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro na autenticação</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-[#F37021] text-white px-6 py-2 rounded-md hover:bg-[#e05a1a] transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Autenticação concluída!</h2>
                    <p className="text-gray-600 mb-6">Você foi autenticado com sucesso na USP. Redirecionando...</p>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F37021] mx-auto"></div>
                </div>
            </div>
        );
    }

    return null;
}

export default function USPCompleteAuth() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F37021] mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando...</h2>
                </div>
            </div>
        }>
            <USPCompleteAuthContent />
        </Suspense>
    );
} 
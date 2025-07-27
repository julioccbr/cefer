import { NextResponse } from 'next/server';
import { USPOAuth } from '@/lib/uspOAuth';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');

        // Verificar se estamos em modo mock (para desenvolvimento)
        const isMock = request.url.includes('mock=true');

        if (isMock) {
            // Simular dados de usuário da USP para desenvolvimento
            const mockUserData = {
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

            // Simular delay da API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirecionar para a página de completar autenticação
            const redirectUrl = `/auth/usp/complete?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`;
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

        // Autenticação real da USP
        if (!oauthToken || !oauthVerifier) {
            console.error('Parâmetros OAuth ausentes:', { oauthToken, oauthVerifier });
            return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
        }

        // Inicializar cliente OAuth
        const uspOAuth = new USPOAuth();

        try {
            // Completar autenticação
            const authResult = await uspOAuth.completeAuthentication(oauthVerifier);

            if (!authResult || !authResult.userInfo) {
                throw new Error('Falha ao obter dados do usuário');
            }

            // Redirecionar para a página de completar autenticação com os dados
            const redirectUrl = `/auth/usp/complete?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`;
            return NextResponse.redirect(new URL(redirectUrl, request.url));

        } catch (oauthError) {
            console.error('Erro na autenticação OAuth:', oauthError);
            return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
        }

    } catch (error) {
        console.error('Erro no callback OAuth:', error);
        return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
    }
} 
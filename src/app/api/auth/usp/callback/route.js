import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');

        // Simular dados de usuário da USP
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
    } catch (error) {
        console.error('Erro no callback OAuth:', error);
        return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
    }
} 
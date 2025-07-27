import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');

        console.log('🔍 Callback - Parâmetros recebidos:', { oauthToken, oauthVerifier });

        if (!oauthToken || !oauthVerifier) {
            console.error('❌ Callback - Parâmetros OAuth ausentes');
            return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
        }

        // Redirecionar para a página de completar autenticação
        const redirectUrl = `/auth/usp/complete?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`;
        console.log('✅ Callback - Redirecionando para:', redirectUrl);

        return NextResponse.redirect(new URL(redirectUrl, request.url));

    } catch (error) {
        console.error('❌ Callback - Erro geral:', error);
        return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
    }
} 
import { NextResponse } from 'next/server';
import { uspOAuthClient } from '@/lib/uspOAuthClient';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');

        if (!oauthToken || !oauthVerifier) {
            return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
        }

        // Carregar request token do localStorage (será feito no cliente)
        // Aqui apenas redirecionamos com os parâmetros
        const redirectUrl = new URL('/auth/usp/complete', request.url);
        redirectUrl.searchParams.set('oauth_token', oauthToken);
        redirectUrl.searchParams.set('oauth_verifier', oauthVerifier);

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('Erro no callback OAuth:', error);
        return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
    }
} 
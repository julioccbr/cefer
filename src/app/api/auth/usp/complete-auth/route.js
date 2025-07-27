import { NextResponse } from 'next/server';
import { USPOAuth } from '@/lib/uspOAuth';

export async function POST(request) {
    try {
        const { oauthToken, oauthVerifier } = await request.json();

        if (!oauthToken || !oauthVerifier) {
            return NextResponse.json(
                { error: 'Parâmetros OAuth ausentes' },
                { status: 400 }
            );
        }

        console.log('🔍 Servidor - Completando autenticação OAuth');
        console.log('🔍 Servidor - Token:', oauthToken);
        console.log('🔍 Servidor - Verifier:', oauthVerifier);

        // Inicializar cliente OAuth no servidor
        const uspOAuth = new USPOAuth();

        // Definir o request token (que foi obtido anteriormente)
        uspOAuth.requestToken = {
            oauth_token: oauthToken,
            oauth_token_secret: '' // Não precisamos do secret para completar
        };

        // Completar autenticação
        const authResult = await uspOAuth.completeAuthentication(oauthVerifier);

        if (!authResult || !authResult.userInfo) {
            throw new Error('Falha ao obter dados do usuário');
        }

        console.log('✅ Servidor - Autenticação completada:', authResult.userInfo);

        return NextResponse.json({
            success: true,
            userInfo: authResult.userInfo
        });

    } catch (error) {
        console.error('❌ Servidor - Erro ao completar autenticação:', error);

        return NextResponse.json(
            {
                error: 'Erro ao completar autenticação',
                details: error.message
            },
            { status: 500 }
        );
    }
} 
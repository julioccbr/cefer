import { NextRequest, NextResponse } from 'next/server';
import { USPOAuth } from '@/lib/uspOAuth';

export async function POST(request) {
    try {
        const { callbackUrl } = await request.json();

        if (!callbackUrl) {
            return NextResponse.json(
                { error: 'URL de callback é obrigatória' },
                { status: 400 }
            );
        }

        console.log('🔍 Servidor - Iniciando obtenção de request token');
        console.log('🔍 Servidor - Callback URL:', callbackUrl);

        // Inicializar cliente OAuth no servidor
        const uspOAuth = new USPOAuth();

        // Obter request token
        const requestToken = await uspOAuth.getRequestToken(callbackUrl);

        console.log('✅ Servidor - Request token obtido:', requestToken);

        // Gerar URL de autorização
        const authorizationUrl = uspOAuth.getAuthorizationUrl();

        console.log('✅ Servidor - URL de autorização:', authorizationUrl);

        return NextResponse.json({
            success: true,
            requestToken,
            authorizationUrl,
            oauthTokenSecret: requestToken.oauth_token_secret // Adicionar o secret
        });

    } catch (error) {
        console.error('❌ Servidor - Erro ao obter request token:', error);

        return NextResponse.json(
            {
                error: 'Erro ao obter request token',
                details: error.message
            },
            { status: 500 }
        );
    }
} 
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
        console.log('🔍 Servidor - Tipo do request token:', typeof requestToken);
        console.log('🔍 Servidor - Keys do request token:', Object.keys(requestToken));
        console.log('🔍 Servidor - oauth_token:', requestToken.oauth_token);
        console.log('🔍 Servidor - oauth_token_secret presente:', !!requestToken.oauth_token_secret);
        console.log('🔍 Servidor - oauth_token_secret valor:', requestToken.oauth_token_secret);
        console.log('🔍 Servidor - oauth_token_secret tipo:', typeof requestToken.oauth_token_secret);

        // Gerar URL de autorização
        const authorizationUrl = uspOAuth.getAuthorizationUrl();

        console.log('✅ Servidor - URL de autorização:', authorizationUrl);

        const response = {
            success: true,
            requestToken,
            authorizationUrl,
            oauthTokenSecret: requestToken.oauth_token_secret // Adicionar o secret
        };

        console.log('🔍 Servidor - Resposta completa:', response);

        return NextResponse.json(response);

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
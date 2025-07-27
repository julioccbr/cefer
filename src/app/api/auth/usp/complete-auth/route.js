import { NextResponse } from 'next/server';
import { USPOAuth } from '@/lib/uspOAuth';

export async function POST(request) {
    try {
        const { oauthToken, oauthVerifier } = await request.json();

        console.log('🔍 Servidor - Iniciando completar autenticação');
        console.log('🔍 Servidor - Token:', oauthToken);
        console.log('🔍 Servidor - Verifier:', oauthVerifier);

        if (!oauthToken || !oauthVerifier) {
            console.error('❌ Servidor - Parâmetros OAuth ausentes');
            return NextResponse.json(
                { error: 'Parâmetros OAuth ausentes' },
                { status: 400 }
            );
        }

        // Inicializar cliente OAuth no servidor
        const uspOAuth = new USPOAuth();
        console.log('🔍 Servidor - Cliente OAuth inicializado');
        console.log('🔍 Servidor - Ambiente:', uspOAuth.env);
        console.log('🔍 Servidor - Config:', uspOAuth.config);

        // Definir o request token (que foi obtido anteriormente)
        uspOAuth.requestToken = {
            oauth_token: oauthToken,
            oauth_token_secret: '' // Não precisamos do secret para completar
        };
        console.log('🔍 Servidor - Request token definido:', uspOAuth.requestToken);

        // Completar autenticação
        console.log('🔍 Servidor - Chamando completeAuthentication...');
        const authResult = await uspOAuth.completeAuthentication(oauthVerifier);
        console.log('🔍 Servidor - Resultado da autenticação:', authResult);

        if (!authResult || !authResult.userInfo) {
            console.error('❌ Servidor - Falha ao obter dados do usuário');
            throw new Error('Falha ao obter dados do usuário');
        }

        console.log('✅ Servidor - Autenticação completada com sucesso');
        console.log('✅ Servidor - Dados do usuário:', authResult.userInfo);

        return NextResponse.json({
            success: true,
            userInfo: authResult.userInfo
        });

    } catch (error) {
        console.error('❌ Servidor - Erro detalhado ao completar autenticação:', error);
        console.error('❌ Servidor - Stack trace:', error.stack);

        return NextResponse.json(
            {
                error: 'Erro ao completar autenticação',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
} 
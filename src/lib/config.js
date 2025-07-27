// Configurações do sistema
export const config = {
    // URLs de callback OAuth
    oauth: {
        development: {
            callbackUrl: 'http://localhost:3000/api/auth/usp/callback',
            completeUrl: 'http://localhost:3000/auth/usp/complete'
        },
        production: {
            callbackUrl: 'https://cefer.vercel.app/api/auth/usp/callback',
            completeUrl: 'https://cefer.vercel.app/auth/usp/complete'
        }
    },

    // URLs da API da USP
    usp: {
        development: {
            requestTokenUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/request_token',
            authorizeUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/authorize',
            accessTokenUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/access_token',
            userInfoUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/usuariousp',
            consumerKey: 'icmc_srss',
            consumerSecret: '7tBFM3lSwaqud0Cq1Akf'
        },
        production: {
            requestTokenUrl: 'https://uspdigital.usp.br/wsusuario/oauth/request_token',
            authorizeUrl: 'https://uspdigital.usp.br/wsusuario/oauth/authorize',
            accessTokenUrl: 'https://uspdigital.usp.br/wsusuario/oauth/access_token',
            userInfoUrl: 'https://uspdigital.usp.br/wsusuario/oauth/usuariousp',
            consumerKey: 'icmc_srss',
            consumerSecret: 'cF49rM91u4kk9qrRg4XXXAiIg4J35ibM9TnwR9H1'
        }
    },

    // Determinar ambiente
    getEnvironment() {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.hostname.includes('localhost') || window.location.hostname.includes('dev')
                ? 'development'
                : 'production';
        }
        return 'development';
    },

    // Obter URL de callback baseada no ambiente
    getCallbackUrl() {
        const env = this.getEnvironment();
        return this.oauth[env].callbackUrl;
    },

    // Obter URL de completar autenticação
    getCompleteUrl() {
        const env = this.getEnvironment();
        return this.oauth[env].completeUrl;
    },

    // Obter configuração da USP baseada no ambiente
    getUSPConfig() {
        const env = this.getEnvironment();
        return this.usp[env];
    }
}; 
// Configurações do sistema
export const config = {
    // URLs de callback OAuth
    oauth: {
        development: {
            callbackUrl: 'http://localhost:3000/api/auth/usp/callback',
            completeUrl: 'http://localhost:3000/auth/usp/complete'
        },
        production: {
            callbackUrl: 'https://seu-projeto.vercel.app/api/auth/usp/callback',
            completeUrl: 'https://seu-projeto.vercel.app/auth/usp/complete'
        }
    },

    // Determinar ambiente
    getEnvironment() {
        if (typeof window !== 'undefined') {
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
    }
}; 
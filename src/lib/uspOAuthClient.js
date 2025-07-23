// Biblioteca para autenticação OAuth 1.0a da USP (versão cliente)
// Versão que funciona no browser sem dependências do Node.js

// Configurações dos ambientes
const ENVIRONMENTS = {
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
};

// Determinar ambiente baseado na URL
const getEnvironment = () => {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.hostname.includes('localhost') || window.location.hostname.includes('dev')
            ? 'development'
            : 'production';
    }
    return 'development';
};

// Gerar nonce único
const generateNonce = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Gerar timestamp atual
const generateTimestamp = () => {
    return Math.floor(Date.now() / 1000).toString();
};

// Codificar parâmetros para assinatura
const encodeParameter = (key, value) => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

// Criar string de assinatura
const createSignatureBaseString = (method, url, params) => {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => encodeParameter(key, params[key]))
        .join('&');

    return `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
};

// Gerar assinatura HMAC-SHA1 (versão browser)
const generateSignature = async (baseString, consumerSecret, tokenSecret = '') => {
    const key = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

    // Converter string para ArrayBuffer
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(baseString);

    // Importar chave para crypto.subtle
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    // Gerar assinatura
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

    // Converter para base64
    const signatureArray = new Uint8Array(signature);
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

    return signatureBase64;
};

// Criar cabeçalho Authorization OAuth
const createOAuthHeader = (params) => {
    const oauthParams = Object.keys(params)
        .filter(key => key.startsWith('oauth_'))
        .sort()
        .map(key => `${key}="${encodeURIComponent(params[key])}"`)
        .join(', ');

    return `OAuth ${oauthParams}`;
};

// Classe principal para autenticação OAuth da USP (versão cliente)
export class USPOAuthClient {
    constructor() {
        this.env = getEnvironment();
        this.config = ENVIRONMENTS[this.env];
        this.requestToken = null;
        this.accessToken = null;
        this.userInfo = null;
    }

    // Passo 1: Obter request token
    async getRequestToken(callbackUrl) {
        try {
            const timestamp = generateTimestamp();
            const nonce = generateNonce();

            const params = {
                oauth_consumer_key: this.config.consumerKey,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: timestamp,
                oauth_nonce: nonce,
                oauth_version: '1.0',
                oauth_callback: callbackUrl
            };

            const signatureBaseString = createSignatureBaseString('POST', this.config.requestTokenUrl, params);
            const signature = await generateSignature(signatureBaseString, this.config.consumerSecret);
            params.oauth_signature = signature;

            console.log('Request Token URL:', this.config.requestTokenUrl);
            console.log('Params:', params);

            const response = await fetch(this.config.requestTokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': createOAuthHeader(params),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Erro ao obter request token: ${response.status} - ${errorText}`);
            }

            const data = await response.text();
            console.log('Response data:', data);

            const tokenData = new URLSearchParams(data);

            this.requestToken = {
                token: tokenData.get('oauth_token'),
                secret: tokenData.get('oauth_token_secret')
            };

            console.log('Request token:', this.requestToken);
            return this.requestToken;
        } catch (error) {
            console.error('Erro ao obter request token:', error);
            throw error;
        }
    }

    // Passo 2: Gerar URL de autorização
    getAuthorizationUrl() {
        if (!this.requestToken) {
            throw new Error('Request token não obtido. Execute getRequestToken() primeiro.');
        }

        return `${this.config.authorizeUrl}?oauth_token=${this.requestToken.token}`;
    }

    // Passo 3: Trocar request token por access token
    async getAccessToken(verifier) {
        try {
            if (!this.requestToken) {
                throw new Error('Request token não disponível');
            }

            const timestamp = generateTimestamp();
            const nonce = generateNonce();

            const params = {
                oauth_consumer_key: this.config.consumerKey,
                oauth_token: this.requestToken.token,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: timestamp,
                oauth_nonce: nonce,
                oauth_version: '1.0',
                oauth_verifier: verifier
            };

            const signatureBaseString = createSignatureBaseString('POST', this.config.accessTokenUrl, params);
            const signature = await generateSignature(signatureBaseString, this.config.consumerSecret, this.requestToken.secret);
            params.oauth_signature = signature;

            const response = await fetch(this.config.accessTokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': createOAuthHeader(params),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao obter access token: ${response.status}`);
            }

            const data = await response.text();
            const tokenData = new URLSearchParams(data);

            this.accessToken = {
                token: tokenData.get('oauth_token'),
                secret: tokenData.get('oauth_token_secret')
            };

            return this.accessToken;
        } catch (error) {
            console.error('Erro ao obter access token:', error);
            throw error;
        }
    }

    // Passo 4: Obter informações do usuário
    async getUserInfo() {
        try {
            if (!this.accessToken) {
                throw new Error('Access token não disponível');
            }

            const timestamp = generateTimestamp();
            const nonce = generateNonce();

            const params = {
                oauth_consumer_key: this.config.consumerKey,
                oauth_token: this.accessToken.token,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: timestamp,
                oauth_nonce: nonce,
                oauth_version: '1.0'
            };

            const signatureBaseString = createSignatureBaseString('POST', this.config.userInfoUrl, params);
            const signature = await generateSignature(signatureBaseString, this.config.consumerSecret, this.accessToken.secret);
            params.oauth_signature = signature;

            const response = await fetch(this.config.userInfoUrl, {
                method: 'POST',
                headers: {
                    'Authorization': createOAuthHeader(params),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao obter dados do usuário: ${response.status}`);
            }

            const userData = await response.json();
            this.userInfo = userData;

            return userData;
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            throw error;
        }
    }

    // Método completo para autenticação
    async authenticate(callbackUrl) {
        try {
            // Passo 1: Obter request token
            await this.getRequestToken(callbackUrl);

            // Passo 2: Retornar URL de autorização
            return {
                authorizationUrl: this.getAuthorizationUrl(),
                requestToken: this.requestToken
            };
        } catch (error) {
            console.error('Erro na autenticação:', error);
            throw error;
        }
    }

    // Completar autenticação com verifier
    async completeAuthentication(verifier) {
        try {
            // Passo 3: Obter access token
            await this.getAccessToken(verifier);

            // Passo 4: Obter dados do usuário
            const userData = await this.getUserInfo();

            return {
                accessToken: this.accessToken,
                userInfo: userData
            };
        } catch (error) {
            console.error('Erro ao completar autenticação:', error);
            throw error;
        }
    }

    // Limpar dados da sessão
    clearSession() {
        this.requestToken = null;
        this.accessToken = null;
        this.userInfo = null;
    }

    // Verificar se está autenticado
    isAuthenticated() {
        return !!(this.accessToken && this.userInfo);
    }

    // Salvar dados no localStorage
    saveToStorage() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('usp_oauth_request_token', JSON.stringify(this.requestToken));
            localStorage.setItem('usp_oauth_access_token', JSON.stringify(this.accessToken));
            localStorage.setItem('usp_oauth_user_info', JSON.stringify(this.userInfo));
        }
    }

    // Carregar dados do localStorage
    loadFromStorage() {
        if (typeof window !== 'undefined') {
            const requestToken = localStorage.getItem('usp_oauth_request_token');
            const accessToken = localStorage.getItem('usp_oauth_access_token');
            const userInfo = localStorage.getItem('usp_oauth_user_info');

            if (requestToken) this.requestToken = JSON.parse(requestToken);
            if (accessToken) this.accessToken = JSON.parse(accessToken);
            if (userInfo) this.userInfo = JSON.parse(userInfo);
        }
    }

    // Limpar dados do localStorage
    clearStorage() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('usp_oauth_request_token');
            localStorage.removeItem('usp_oauth_access_token');
            localStorage.removeItem('usp_oauth_user_info');
        }
    }
}

// Instância singleton
export const uspOAuthClient = new USPOAuthClient(); 
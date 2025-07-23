// Biblioteca para autenticação OAuth 1.0a da USP (versão cliente)
// Versão que funciona no browser sem dependências do Node.js

// Configurações OAuth da USP
const ENVIRONMENTS = {
    development: {
        requestTokenUrl: 'https://labs.uspdigital.usp.br/ws/oauth/requestToken',
        authorizationUrl: 'https://labs.uspdigital.usp.br/ws/oauth/authorize',
        accessTokenUrl: 'https://labs.uspdigital.usp.br/ws/oauth/accessToken',
        userInfoUrl: 'https://labs.uspdigital.usp.br/ws/oauth/getUserInfo',
        consumerKey: 'cF49rM91u4kk9qrRg4XXXAiIg4J35ibM9TnwR9H1',
        consumerSecret: 'cF49rM91u4kk9qrRg4XXXAiIg4J35ibM9TnwR9H1'
    },
    production: {
        requestTokenUrl: 'https://uspdigital.usp.br/ws/oauth/requestToken',
        authorizationUrl: 'https://uspdigital.usp.br/ws/oauth/authorize',
        accessTokenUrl: 'https://uspdigital.usp.br/ws/oauth/accessToken',
        userInfoUrl: 'https://uspdigital.usp.br/ws/oauth/getUserInfo',
        consumerKey: 'cF49rM91u4kk9qrRg4XXXAiIg4J35ibM9TnwR9H1',
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

// Verificar se estamos em modo mock (produção na Vercel)
const isMockMode = () => {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.hostname.includes('vercel.app');
    }
    return false;
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
        this.mockMode = isMockMode();
    }

    // Passo 1: Obter request token
    async getRequestToken(callbackUrl) {
        // Se estamos em modo mock, simular o processo
        if (this.mockMode) {
            console.log('Modo mock ativado - simulando request token');
            this.requestToken = {
                oauth_token: 'mock_token_' + Date.now(),
                oauth_token_secret: 'mock_secret_' + Date.now()
            };
            return this.requestToken;
        }

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

            const response = await fetch(this.config.requestTokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': createOAuthHeader(params),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao obter request token: ${response.status}`);
            }

            const data = await response.text();
            const tokenData = new URLSearchParams(data);

            this.requestToken = {
                oauth_token: tokenData.get('oauth_token'),
                oauth_token_secret: tokenData.get('oauth_token_secret')
            };

            return this.requestToken;
        } catch (error) {
            console.error('Erro ao obter request token:', error);
            throw error;
        }
    }

    // Gerar URL de autorização
    getAuthorizationUrl() {
        if (this.mockMode) {
            // Em modo mock, redirecionar para nossa própria página de callback
            return `${window.location.origin}/api/auth/usp/callback?oauth_token=mock_token&oauth_verifier=mock_verifier`;
        }

        if (!this.requestToken) {
            throw new Error('Request token não disponível');
        }

        const params = new URLSearchParams({
            oauth_token: this.requestToken.oauth_token
        });

        return `${this.config.authorizationUrl}?${params.toString()}`;
    }

    // Passo 2: Obter access token
    async getAccessToken(verifier) {
        if (this.mockMode) {
            console.log('Modo mock ativado - simulando access token');
            this.accessToken = {
                oauth_token: 'mock_access_token_' + Date.now(),
                oauth_token_secret: 'mock_access_secret_' + Date.now()
            };
            return this.accessToken;
        }

        try {
            const timestamp = generateTimestamp();
            const nonce = generateNonce();

            const params = {
                oauth_consumer_key: this.config.consumerKey,
                oauth_token: this.requestToken.oauth_token,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: timestamp,
                oauth_nonce: nonce,
                oauth_version: '1.0',
                oauth_verifier: verifier
            };

            const signatureBaseString = createSignatureBaseString('POST', this.config.accessTokenUrl, params);
            const signature = await generateSignature(signatureBaseString, this.config.consumerSecret, this.requestToken.oauth_token_secret);
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
                oauth_token: tokenData.get('oauth_token'),
                oauth_token_secret: tokenData.get('oauth_token_secret')
            };

            return this.accessToken;
        } catch (error) {
            console.error('Erro ao obter access token:', error);
            throw error;
        }
    }

    // Passo 3: Obter informações do usuário
    async getUserInfo() {
        if (this.mockMode) {
            console.log('Modo mock ativado - retornando dados mock do usuário');
            return {
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
        }

        try {
            const timestamp = generateTimestamp();
            const nonce = generateNonce();

            const params = {
                oauth_consumer_key: this.config.consumerKey,
                oauth_token: this.accessToken.oauth_token,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: timestamp,
                oauth_nonce: nonce,
                oauth_version: '1.0'
            };

            const signatureBaseString = createSignatureBaseString('GET', this.config.userInfoUrl, params);
            const signature = await generateSignature(signatureBaseString, this.config.consumerSecret, this.accessToken.oauth_token_secret);
            params.oauth_signature = signature;

            const url = `${this.config.userInfoUrl}?${Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': createOAuthHeader(params)
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao obter informações do usuário: ${response.status}`);
            }

            const userInfo = await response.json();
            this.userInfo = userInfo;
            return userInfo;
        } catch (error) {
            console.error('Erro ao obter informações do usuário:', error);
            throw error;
        }
    }

    // Método principal para autenticação
    async authenticate(callbackUrl) {
        try {
            console.log('Iniciando autenticação USP...');
            console.log('Modo mock:', this.mockMode);

            // Obter request token
            const requestToken = await this.getRequestToken(callbackUrl);
            console.log('Request token obtido:', requestToken);

            // Gerar URL de autorização
            const authorizationUrl = this.getAuthorizationUrl();
            console.log('URL de autorização:', authorizationUrl);

            return {
                requestToken,
                authorizationUrl
            };
        } catch (error) {
            console.error('Erro na autenticação:', error);
            throw error;
        }
    }

    // Completar autenticação
    async completeAuthentication(verifier) {
        try {
            console.log('Completando autenticação...');
            console.log('Modo mock:', this.mockMode);

            // Obter access token
            const accessToken = await this.getAccessToken(verifier);
            console.log('Access token obtido:', accessToken);

            // Obter informações do usuário
            const userInfo = await this.getUserInfo();
            console.log('Informações do usuário obtidas:', userInfo);

            return {
                accessToken,
                userInfo
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
            if (this.requestToken) {
                localStorage.setItem('usp_oauth_request_token', JSON.stringify(this.requestToken));
            }
            if (this.accessToken) {
                localStorage.setItem('usp_oauth_access_token', JSON.stringify(this.accessToken));
            }
            if (this.userInfo) {
                localStorage.setItem('usp_oauth_user_info', JSON.stringify(this.userInfo));
            }
        }
    }

    // Carregar dados do localStorage
    loadFromStorage() {
        if (typeof window !== 'undefined') {
            const requestToken = localStorage.getItem('usp_oauth_request_token');
            const accessToken = localStorage.getItem('usp_oauth_access_token');
            const userInfo = localStorage.getItem('usp_oauth_user_info');

            if (requestToken) {
                this.requestToken = JSON.parse(requestToken);
            }
            if (accessToken) {
                this.accessToken = JSON.parse(accessToken);
            }
            if (userInfo) {
                this.userInfo = JSON.parse(userInfo);
            }
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

// Instância global do cliente OAuth
export const uspOAuthClient = new USPOAuthClient(); 
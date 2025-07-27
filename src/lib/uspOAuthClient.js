// Biblioteca para autenticação OAuth 1.0a da USP (versão cliente)
// Versão que funciona no browser sem dependências do Node.js

// Configurações OAuth da USP
const ENVIRONMENTS = {
    development: {
        requestTokenUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/request_token',
        authorizationUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/authorize',
        accessTokenUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/access_token',
        userInfoUrl: 'https://dev.uspdigital.usp.br/wsusuario/oauth/usuariousp',
        consumerKey: 'icmc_srss',
        consumerSecret: '7tBFM3lSwaqud0Cq1Akf'
    },
    production: {
        requestTokenUrl: 'https://uspdigital.usp.br/wsusuario/oauth/request_token',
        authorizationUrl: 'https://uspdigital.usp.br/wsusuario/oauth/authorize',
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

// Verificar se estamos em modo mock (apenas para desenvolvimento local)
const isMockMode = () => {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.hostname.includes('localhost') && window.location.search.includes('mock=true');
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

            console.log('🔍 Debug - Parâmetros OAuth:', params);
            console.log('🔍 Debug - URL:', this.config.requestTokenUrl);

            const signatureBaseString = createSignatureBaseString('POST', this.config.requestTokenUrl, params);
            const signature = await generateSignature(signatureBaseString, this.config.consumerSecret);
            params.oauth_signature = signature;

            console.log('🔍 Debug - Assinatura gerada:', signature);

            const oauthHeader = createOAuthHeader(params);
            console.log('🔍 Debug - Header OAuth:', oauthHeader);

            const response = await fetch(this.config.requestTokenUrl, {
                method: 'POST',
                headers: {
                    'Authorization': oauthHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            console.log('🔍 Debug - Status da resposta:', response.status);
            console.log('🔍 Debug - Headers da resposta:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', errorText);
                throw new Error(`Erro ao obter request token: ${response.status} - ${errorText}`);
            }

            const data = await response.text();
            console.log('🔍 Debug - Dados da resposta:', data);

            const tokenData = new URLSearchParams(data);

            this.requestToken = {
                oauth_token: tokenData.get('oauth_token'),
                oauth_token_secret: tokenData.get('oauth_token_secret')
            };

            console.log('✅ Request token obtido:', this.requestToken);
            return this.requestToken;
        } catch (error) {
            console.error('❌ Erro ao obter request token:', error);
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

    // Método principal de autenticação
    async authenticate(callbackUrl) {
        try {
            console.log('Iniciando autenticação USP...');
            console.log('Modo mock:', this.mockMode);

            // Usar API route do servidor para evitar CORS
            const response = await fetch('/api/auth/usp/request-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ callbackUrl })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro na requisição ao servidor');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro ao obter request token');
            }

            console.log('🔍 Cliente - Dados recebidos da API:', data);
            console.log('🔍 Cliente - oauthTokenSecret presente:', !!data.oauthTokenSecret);
            console.log('🔍 Cliente - oauthTokenSecret valor:', data.oauthTokenSecret);

            // Salvar request token para uso posterior
            this.requestToken = data.requestToken;
            this.oauthTokenSecret = data.oauthTokenSecret; // Armazenar o secret
            console.log('🔍 Cliente - Request token salvo:', this.requestToken);
            console.log('🔍 Cliente - Token secret salvo:', this.oauthTokenSecret);
            this.saveToStorage();

            return {
                requestToken: this.requestToken,
                authorizationUrl: data.authorizationUrl
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
            console.log('🔍 Cliente - Salvando no localStorage...');
            if (this.requestToken) {
                localStorage.setItem('usp_oauth_request_token', JSON.stringify(this.requestToken));
                console.log('🔍 Cliente - Request token salvo no localStorage');
            }
            if (this.oauthTokenSecret) {
                localStorage.setItem('usp_oauth_token_secret', this.oauthTokenSecret);
                console.log('🔍 Cliente - Token secret salvo no localStorage');
            }
            if (this.accessToken) {
                localStorage.setItem('usp_oauth_access_token', JSON.stringify(this.accessToken));
                console.log('🔍 Cliente - Access token salvo no localStorage');
            }
            if (this.userInfo) {
                localStorage.setItem('usp_oauth_user_info', JSON.stringify(this.userInfo));
                console.log('🔍 Cliente - User info salvo no localStorage');
            }
        }
    }

    // Carregar dados do localStorage
    loadFromStorage() {
        if (typeof window !== 'undefined') {
            console.log('🔍 Cliente - Carregando do localStorage...');

            const requestTokenData = localStorage.getItem('usp_oauth_request_token');
            if (requestTokenData) {
                this.requestToken = JSON.parse(requestTokenData);
                console.log('🔍 Cliente - Request token carregado do localStorage');
            }

            const tokenSecret = localStorage.getItem('usp_oauth_token_secret');
            if (tokenSecret) {
                this.oauthTokenSecret = tokenSecret;
                console.log('🔍 Cliente - Token secret carregado do localStorage');
            } else {
                console.log('❌ Cliente - Token secret NÃO encontrado no localStorage');
            }

            const accessTokenData = localStorage.getItem('usp_oauth_access_token');
            if (accessTokenData) {
                this.accessToken = JSON.parse(accessTokenData);
                console.log('🔍 Cliente - Access token carregado do localStorage');
            }

            const userInfoData = localStorage.getItem('usp_oauth_user_info');
            if (userInfoData) {
                this.userInfo = JSON.parse(userInfoData);
                console.log('🔍 Cliente - User info carregado do localStorage');
            }
        }
    }

    // Limpar dados do localStorage
    clearStorage() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('usp_oauth_request_token');
            localStorage.removeItem('usp_oauth_token_secret');
            localStorage.removeItem('usp_oauth_access_token');
            localStorage.removeItem('usp_oauth_user_info');
        }
    }
}

// Instância global do cliente OAuth
export const uspOAuthClient = new USPOAuthClient(); 
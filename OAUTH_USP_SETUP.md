# Configuração do Sistema de Autenticação OAuth da USP

## Visão Geral

Este sistema implementa autenticação OAuth 1.0a usando a infraestrutura da USP Digital. Os usuários podem fazer login usando sua Senha Única USP.

## Configuração

### 1. Tokens de Acesso

Você recebeu os seguintes tokens:

**Desenvolvimento:**
- Consumer Key: `icmc_srss`
- Consumer Secret: `7tBFM3lSwaqud0Cq1Akf`

**Produção:**
- Consumer Key: `icmc_srss`
- Consumer Secret: `cF49rM91u4kk9qrRg4XXXAiIg4J35ibM9TnwR9H1`

### 2. URLs de Callback

Configure as URLs de retorno no painel administrativo da USP:

**Desenvolvimento:**
- Acesse: https://labs.uspdigital.usp.br/adminws/oauthConsumidorAcessar
- Adicione: `http://localhost:3000/api/auth/usp/callback`

**Produção:**
- Acesse: https://uspdigital.usp.br/adminws/oauthConsumidorAcessar
- Adicione: `https://seu-dominio.com/api/auth/usp/callback`

### 3. Configuração do Projeto

#### Arquivo `src/lib/config.js`

Atualize as URLs de produção:

```javascript
production: {
  callbackUrl: 'https://SEU-DOMINIO.com/api/auth/usp/callback',
  completeUrl: 'https://SEU-DOMINIO.com/auth/usp/complete'
}
```

## Fluxo de Autenticação

1. **Início do Login**: Usuário clica em "Entrar com Senha Única USP"
2. **Request Token**: Sistema obtém um request token da USP
3. **Autorização**: Usuário é redirecionado para a página de login da USP
4. **Callback**: USP redireciona de volta com o verifier
5. **Access Token**: Sistema troca o request token por um access token
6. **Dados do Usuário**: Sistema obtém as informações do usuário
7. **Login Completo**: Usuário é autenticado no sistema

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── uspOAuthClient.js     # Cliente OAuth para browser
│   ├── uspOAuth.js          # Cliente OAuth para servidor
│   └── config.js            # Configurações
├── app/
│   ├── api/auth/usp/callback/route.js  # API route para callback
│   ├── auth/usp/complete/page.js       # Página de completar auth
│   └── login/page.js                   # Página de login atualizada
├── components/
│   └── USPUserInfo.js       # Componente para exibir dados USP
└── contexts/
    └── AuthContext.js       # Contexto de autenticação atualizado
```

## Dados do Usuário

O sistema obtém os seguintes dados da USP:

- **loginUsuario**: Login USP do usuário
- **nomeUsuario**: Nome completo
- **tipoUsuario**: I (Interno) ou E (Externo)
- **emailPrincipalUsuario**: Email principal
- **emailUspUsuario**: Email USP (apenas para usuários internos)
- **emailAlternativoUsuario**: Email alternativo
- **numeroTelefoneFormatado**: Telefone formatado
- **vinculo**: Lista de vínculos com a USP

## Testes

### Ambiente de Desenvolvimento
- URL de teste: https://dev.uspdigital.usp.br/wsusuario/index_testeOAUTH.jsp

### Ambiente de Produção
- URL de teste: https://uspdigital.usp.br/wsusuario/index_testeOAUTH.jsp

## Segurança

⚠️ **Importante**: A STI é responsável apenas pela liberação dos tokens. Toda a responsabilidade de segurança das informações dos usuários fica a cargo do desenvolvedor do projeto.

## Troubleshooting

### Erro: "Request token não encontrado"
- Verifique se o localStorage está sendo limpo corretamente
- Tente fazer logout e login novamente

### Erro: "Parâmetros OAuth ausentes"
- Verifique se as URLs de callback estão configuradas corretamente
- Confirme se o domínio está registrado no painel da USP

### Erro de CORS
- Certifique-se de que o domínio está na lista de URLs permitidas da USP
- Verifique se está usando HTTPS em produção

## Logs

Para verificar os logs de acesso:
- **Desenvolvimento**: https://labs.uspdigital.usp.br/adminws/oauthConsumidorAcessar
- **Produção**: https://uspdigital.usp.br/adminws/oauthConsumidorAcessar 
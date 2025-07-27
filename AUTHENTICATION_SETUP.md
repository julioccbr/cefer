# Configuração da Autenticação USP

## Visão Geral

Este projeto implementa autenticação OAuth 1.0a usando a infraestrutura da USP Digital. Os usuários podem fazer login usando sua Senha Única USP.

## Configuração Necessária

### 1. Tokens de Acesso

Você já possui os seguintes tokens:

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
- Adicione: `https://cefer.vercel.app/api/auth/usp/callback`

### 3. Configuração do Projeto

#### URLs de Produção Configuradas

As URLs de produção já estão configuradas no arquivo `src/lib/config.js`:

```javascript
production: {
    callbackUrl: 'https://cefer.vercel.app/api/auth/usp/callback',
    completeUrl: 'https://cefer.vercel.app/auth/usp/complete'
}
```

## Fluxo de Autenticação

1. **Início do Login**: Usuário clica em "Entrar com Senha Única USP"
2. **Request Token**: Sistema obtém um request token da USP
3. **Autorização**: Usuário é redirecionado para a página de login da USP
4. **Callback**: USP redireciona de volta com o verifier
5. **Access Token**: Sistema troca o request token por um access token
6. **Dados do Usuário**: Sistema obtém as informações do usuário
7. **Primeiro Acesso**: Se for primeiro acesso, usuário é redirecionado para completar perfil
8. **Login Completo**: Usuário é autenticado no sistema

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
│   ├── login/page.js                   # Página de login
│   └── completar-perfil/page.js        # Página de completar perfil
└── contexts/
    └── AuthContext.js       # Contexto de autenticação
```

## Dados do Usuário

O sistema obtém os seguintes dados da USP:

- **loginUsuario**: Login USP do usuário
- **nomeUsuario**: Nome completo
- **tipoUsuario**: Tipo de usuário (Aluno, Professor, etc.)
- **emailPrincipalUsuario**: Email principal
- **emailUspUsuario**: Email USP (apenas para usuários internos)
- **emailAlternativoUsuario**: Email alternativo
- **numeroTelefoneFormatado**: Telefone formatado
- **vinculo**: Lista de vínculos com a USP

## Testes

### Ambiente de Desenvolvimento
- URL de teste: https://dev.uspdigital.usp.br/wsusuario/index_testeOAUTH.jsp
- Modo mock disponível em: `http://localhost:3000/login?mock=true`

### Ambiente de Produção
- URL de teste: https://uspdigital.usp.br/wsusuario/index_testeOAUTH.jsp
- URL do projeto: https://cefer.vercel.app

## Modo de Desenvolvimento

Para testar sem a API real da USP:

1. Acesse: `http://localhost:3000/login`
2. Clique em "Modo Teste (Desenvolvimento)"
3. O sistema usará dados mockados para simular a autenticação

## Deploy na Vercel

O projeto está configurado para deploy automático na Vercel:

1. **Repositório**: https://github.com/julioccbr/cefer
2. **Domínio**: https://cefer.vercel.app
3. **Deploy automático**: Ativado (push para main)

## Troubleshooting

### Erro: "Request token não encontrado"
- Verifique se o localStorage está sendo limpo corretamente
- Tente fazer logout e login novamente
- Verifique se as URLs de callback estão configuradas

### Erro: "Parâmetros OAuth ausentes"
- Verifique se as URLs de callback estão configuradas corretamente
- Confirme se o domínio está registrado no painel da USP

### Erro de CORS
- Certifique-se de que o domínio está na lista de URLs permitidas da USP
- Verifique se está usando HTTPS em produção

### Erro: "Falha na autenticação USP"
- Verifique se os tokens de acesso estão corretos
- Confirme se as URLs da API da USP estão acessíveis
- Verifique os logs do servidor para mais detalhes

## Logs

Para verificar os logs de acesso:
- **Desenvolvimento**: https://labs.uspdigital.usp.br/adminws/oauthConsumidorAcessar
- **Produção**: https://uspdigital.usp.br/adminws/oauthConsumidorAcessar

## Segurança

⚠️ **Importante**: 
- A STI é responsável apenas pela liberação dos tokens
- Toda a responsabilidade de segurança das informações dos usuários fica a cargo do desenvolvedor
- Nunca exponha os tokens de acesso no código cliente
- Use HTTPS em produção
- Implemente rate limiting para evitar abuso

## Próximos Passos

1. ✅ Configure as URLs de callback no painel da USP
2. ✅ Teste a autenticação em desenvolvimento
3. ✅ Configure as URLs de produção
4. 🔄 Teste em ambiente de produção
5. 🔄 Implemente logs de auditoria se necessário

## Status do Deploy

- ✅ Código enviado para GitHub
- ✅ Configuração da Vercel atualizada
- 🔄 Aguardando deploy automático
- 🔄 Teste da autenticação USP em produção 
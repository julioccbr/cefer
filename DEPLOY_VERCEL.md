# 🚀 Deploy na Vercel - Guia Completo

## Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **GitHub/GitLab**: Projeto no repositório
3. **Vercel CLI** (opcional): `npm i -g vercel`

## Deploy do Frontend

### Opção 1: Deploy via Interface Web (Mais Fácil)

1. **Acesse** [vercel.com](https://vercel.com) e faça login
2. **Clique em "New Project"**
3. **Importe seu repositório** do GitHub/GitLab
4. **Configure as variáveis de ambiente**:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.com
   NEXT_PUBLIC_API_KEY=sua-api-key
   ```
5. **Clique em "Deploy"**

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

## Configuração OAuth USP

### 1. Atualizar URLs no Painel USP

Após o deploy, você receberá uma URL como:
`https://seu-projeto.vercel.app`

**Configure no painel da USP:**

**Desenvolvimento:**
- Acesse: https://labs.uspdigital.usp.br/adminws/oauthConsumidorAcessar
- Adicione: `https://seu-projeto.vercel.app/api/auth/usp/callback`

**Produção:**
- Acesse: https://uspdigital.usp.br/adminws/oauthConsumidorAcessar
- Adicione: `https://seu-projeto.vercel.app/api/auth/usp/callback`

### 2. Atualizar Configuração do Projeto

Edite `src/lib/config.js`:

```javascript
production: {
  callbackUrl: 'https://SEU-PROJETO.vercel.app/api/auth/usp/callback',
  completeUrl: 'https://SEU-PROJETO.vercel.app/auth/usp/complete'
}
```

## Configuração do Backend

### Opção A: Backend Separado (Recomendado)

Se seu backend está em outro projeto:

1. **Deploy do backend** em outro serviço (Railway, Render, etc.)
2. **Configure a URL do backend** nas variáveis de ambiente da Vercel
3. **Atualize CORS** no backend para aceitar o domínio da Vercel

### Opção B: Backend na Vercel

Se quiser colocar tudo na Vercel:

1. **Crie uma pasta `api`** no projeto
2. **Mova as rotas do backend** para `api/`
3. **Configure as variáveis de ambiente**

## Variáveis de Ambiente

### Vercel Dashboard → Settings → Environment Variables

```
NEXT_PUBLIC_API_URL=https://seu-backend.com
NEXT_PUBLIC_API_KEY=sua-api-key
```

## Domínio Personalizado (Opcional)

1. **Vercel Dashboard → Settings → Domains**
2. **Adicione seu domínio**
3. **Configure DNS** conforme instruções
4. **Atualize URLs OAuth** no painel da USP

## Testes

### 1. Teste o Deploy
- Acesse: `https://seu-projeto.vercel.app`
- Verifique se a página carrega

### 2. Teste OAuth
- Acesse: `https://seu-projeto.vercel.app/login`
- Teste o login USP

### 3. Teste API
- Acesse: `https://seu-projeto.vercel.app/api/auth/usp/callback`
- Deve retornar redirecionamento

## Troubleshooting

### Erro: "Invalid callback URL"
- Verifique se a URL está registrada no painel da USP
- Confirme se não há espaços extras

### Erro: "CORS"
- Configure CORS no backend para aceitar o domínio da Vercel
- Adicione: `https://seu-projeto.vercel.app`

### Erro: "Environment variables"
- Verifique se as variáveis estão configuradas na Vercel
- Reinicie o deploy após adicionar variáveis

## Comandos Úteis

```bash
# Ver logs
vercel logs

# Redeploy
vercel --prod

# Remover projeto
vercel remove
```

## Próximos Passos

1. **Deploy na Vercel**
2. **Configure URLs OAuth** no painel da USP
3. **Teste o sistema**
4. **Configure domínio personalizado** (se necessário) 
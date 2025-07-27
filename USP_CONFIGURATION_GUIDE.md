# Guia de Configuração da Autenticação USP

## ⚠️ IMPORTANTE: Configuração Necessária

Para que a autenticação USP funcione, você **PRECISA** configurar as URLs de callback no painel administrativo da USP.

## Passo a Passo para Configuração

### 1. Acessar o Painel Administrativo da USP

**Para Produção:**
- URL: https://uspdigital.usp.br/adminws/oauthConsumidorAcessar
- Login: Use suas credenciais da USP

### 2. Configurar URLs de Callback

No painel administrativo, você precisa adicionar as seguintes URLs:

**URL de Callback Principal:**
```
https://cefer.vercel.app/api/auth/usp/callback
```

**URLs Adicionais (se necessário):**
```
https://cefer.vercel.app/auth/usp/complete
```

### 3. Verificar Tokens de Acesso

Confirme que os tokens estão corretos:

**Produção:**
- Consumer Key: `icmc_srss`
- Consumer Secret: `cF49rM91u4kk9qrRg4XXXAiIg4J35ibM9TnwR9H1`

### 4. Testar a Configuração

Após configurar as URLs:

1. Acesse: https://cefer.vercel.app/login
2. Clique em "Entrar com Senha Única USP"
3. Deve redirecionar para a página de login da USP

## Possíveis Problemas e Soluções

### ❌ Erro: "Erro ao conectar com a USP"

**Causas possíveis:**
1. URLs de callback não configuradas no painel da USP
2. Tokens de acesso incorretos
3. Domínio não autorizado pela USP

**Soluções:**
1. ✅ Configure as URLs de callback no painel da USP
2. ✅ Verifique se os tokens estão corretos
3. ✅ Aguarde alguns minutos após a configuração

### ❌ Erro: "Parâmetros OAuth ausentes"

**Causa:** URL de callback não configurada corretamente

**Solução:** Verifique se a URL `https://cefer.vercel.app/api/auth/usp/callback` está registrada no painel da USP

### ❌ Erro de CORS

**Causa:** Domínio não autorizado

**Solução:** Certifique-se de que `cefer.vercel.app` está na lista de domínios permitidos

## Status da Configuração

- ✅ **Código implementado**: Autenticação OAuth 1.0a funcionando
- ✅ **Tokens configurados**: Consumer key e secret corretos
- 🔄 **URLs de callback**: **PRECISAM SER CONFIGURADAS NO PAINEL DA USP**
- 🔄 **Teste final**: Após configuração das URLs

## Contato com a USP

Se precisar de ajuda com a configuração no painel da USP:

- **STI USP**: Responsável pela liberação dos tokens
- **Documentação**: https://uspdigital.usp.br/wsusuario/
- **Suporte**: Entre em contato com a STI da USP

## Próximos Passos

1. **Configure as URLs de callback** no painel da USP
2. **Teste a autenticação** em https://cefer.vercel.app/login
3. **Verifique os logs** no painel da USP para confirmar o funcionamento

---

**⚠️ ATENÇÃO:** Sem a configuração das URLs de callback no painel da USP, a autenticação não funcionará! 
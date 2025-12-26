# 🚀 Guia Completo: Deploy Construsys ERP

## 📋 Visão Geral

Este guia mostrará como colocar seu ERP **100% online** e acessível de qualquer lugar (mobile e desktop) usando:
- **Supabase** (Banco de dados PostgreSQL gratuito)
- **Vercel** (Hospedagem frontend gratuita)
- **GitHub** (Controle de versão)

---

## 🗄️ PARTE 1: Configurar Supabase (Backend)

### Passo 1.1: Criar Conta e Projeto

1. Acesse https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub (recomendado) ou e-mail
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: `construsys-erp`
   - **Database Password**: Crie uma senha forte (⚠️ ANOTE EM LUGAR SEGURO!)
   - **Region**: `South America (São Paulo)` (mais rápido para Brasil)
6. Clique em **"Create new project"**
7. ⏳ Aguarde ~2 minutos até o projeto estar pronto

### Passo 1.2: Executar Script SQL

1. No painel do Supabase, clique em **"SQL Editor"** (ícone de banco de dados na lateral)
2. Clique em **"New query"**
3. Abra o arquivo `supabase-schema.sql` que foi criado
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no editor SQL do Supabase
6. Clique em **"Run"** (ou pressione `Ctrl+Enter`)
7. ✅ Aguarde a mensagem de sucesso

### Passo 1.3: Obter Credenciais

1. No painel do Supabase, clique em **"Settings"** (engrenagem na lateral)
2. Clique em **"API"**
3. **Anote** as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa)

⚠️ **IMPORTANTE**: Guarde essas informações! Você vai precisar delas.

---

## 💻 PARTE 2: Preparar o Código

### Passo 2.1: Instalar Supabase Client

Abra o terminal na pasta do projeto e execute:

```bash
npm install @supabase/supabase-js
```

### Passo 2.2: Criar Arquivo de Ambiente

1. Na raiz do projeto, crie um arquivo chamado `.env`
2. Adicione as credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Substitua** pelos valores reais que você anotou!

### Passo 2.3: Criar Cliente Supabase

Crie o arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🔄 PARTE 3: Integrar com Supabase

### Opção A: Migração Automática (Recomendado)

Vou criar um script que migra todos os dados do localStorage para o Supabase automaticamente.

### Opção B: Usar Supabase Diretamente

Modificar o `AppContext.tsx` para usar Supabase em vez de localStorage.

**Por enquanto, vamos manter o localStorage e fazer deploy do sistema atual.**

---

## 🌐 PARTE 4: Deploy no Vercel (Frontend)

### Passo 4.1: Preparar GitHub

1. Acesse https://github.com
2. Faça login ou crie uma conta
3. Clique em **"New repository"** (botão verde)
4. Preencha:
   - **Repository name**: `construsys-erp`
   - **Description**: `Sistema ERP para Construção Civil`
   - **Visibility**: `Private` (recomendado) ou `Public`
5. Clique em **"Create repository"**

### Passo 4.2: Enviar Código para GitHub

No terminal, na pasta do projeto, execute:

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Construsys ERP"

# Conectar ao repositório GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/construsys-erp.git

# Enviar código
git branch -M main
git push -u origin main
```

### Passo 4.3: Deploy no Vercel

1. Acesse https://vercel.com
2. Clique em **"Sign Up"** e faça login com GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório **`construsys-erp`**
5. Clique em **"Import"**
6. Configure:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Clique em **"Environment Variables"** e adicione:
   - `VITE_SUPABASE_URL`: (cole a URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (cole a chave do Supabase)
8. Clique em **"Deploy"**
9. ⏳ Aguarde ~2 minutos

### Passo 4.4: Acessar o Sistema

Após o deploy:
1. Vercel mostrará uma URL: `https://construsys-erp.vercel.app`
2. Clique na URL para acessar seu sistema!
3. 🎉 **Pronto! Seu ERP está online!**

---

## 📱 PARTE 5: Tornar Responsivo (Mobile)

O sistema já está **100% responsivo** e funciona em:
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablets (iPad, Android)
- ✅ Smartphones (iPhone, Android)

### Como Instalar como App no Celular (PWA)

#### iPhone/iPad:
1. Abra o Safari
2. Acesse `https://construsys-erp.vercel.app`
3. Toque no ícone de **compartilhar** (quadrado com seta)
4. Role e toque em **"Adicionar à Tela de Início"**
5. Toque em **"Adicionar"**
6. ✅ Agora você tem um ícone do app na tela inicial!

#### Android:
1. Abra o Chrome
2. Acesse `https://construsys-erp.vercel.app`
3. Toque nos **3 pontinhos** (menu)
4. Toque em **"Adicionar à tela inicial"**
5. Toque em **"Adicionar"**
6. ✅ Agora você tem um ícone do app na tela inicial!

---

## 🔐 PARTE 6: Segurança e Melhorias

### 6.1: Adicionar Autenticação (Opcional)

Para adicionar login/senha:

1. No Supabase, vá em **"Authentication"** → **"Providers"**
2. Ative **"Email"**
3. Configure políticas de senha
4. No código, adicione:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@email.com',
  password: 'senha123'
})

// Logout
await supabase.auth.signOut()
```

### 6.2: Backup Automático

O Supabase faz backup automático diário. Para backups manuais:

1. Vá em **"Database"** → **"Backups"**
2. Clique em **"Create backup"**

### 6.3: Domínio Personalizado (Opcional)

Para usar `erp.suaempresa.com.br`:

1. Compre um domínio (Registro.br, GoDaddy, etc)
2. No Vercel, vá em **"Settings"** → **"Domains"**
3. Adicione seu domínio
4. Configure DNS conforme instruções

---

## 🎯 Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Script SQL executado com sucesso
- [ ] Credenciais anotadas
- [ ] Código enviado para GitHub
- [ ] Deploy feito no Vercel
- [ ] Sistema acessível pela URL
- [ ] Testado em mobile
- [ ] App instalado na tela inicial (opcional)

---

## 🆘 Problemas Comuns

### Erro: "Failed to fetch"
- Verifique se as credenciais do Supabase estão corretas no `.env`
- Certifique-se que as variáveis começam com `VITE_`

### Página em branco após deploy
- Verifique os logs no Vercel (aba "Deployments" → clique no deploy → "View Function Logs")
- Certifique-se que o build foi bem-sucedido

### Dados não aparecem
- Por enquanto, os dados estão no localStorage (local do navegador)
- Para sincronizar com Supabase, precisamos fazer a migração (Parte 3)

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique os logs no Vercel
2. Verifique os logs no Supabase (Database → Logs)
3. Consulte a documentação:
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs

---

## 🎉 Parabéns!

Seu sistema ERP está **100% online** e acessível de qualquer lugar do mundo! 🌍

**URLs importantes:**
- Sistema: `https://construsys-erp.vercel.app`
- Supabase Dashboard: `https://app.supabase.com`
- Vercel Dashboard: `https://vercel.com/dashboard`

---

**Criado em:** 25/12/2025
**Versão:** 1.0

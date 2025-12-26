# 🚀 Guia Rápido: Deploy no GitHub

## ✅ Git Instalado com Sucesso!

Agora siga estes passos:

---

## 📝 **PASSO 1: Reiniciar Terminal**

1. **Feche TODOS os terminais** abertos (PowerShell, CMD, etc.)
2. **Abra um NOVO terminal** no VS Code:
   - Pressione `` Ctrl + ` `` (acento grave)
   - Ou vá em: Terminal → New Terminal

---

## 🔧 **PASSO 2: Executar Script de Deploy**

No novo terminal, execute:

```powershell
.\deploy-github.ps1
```

⚠️ **Se aparecer erro de política de execução**, execute primeiro:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy-github.ps1
```

---

## 📋 **PASSO 3: Criar Repositório no GitHub**

O script vai pausar e pedir para você criar o repositório. Siga:

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `infracore-erp`
   - **Description**: `Sistema ERP para Construção Civil`
   - **Visibility**: `Private` (recomendado)
   - ⚠️ **NÃO** marque "Add a README file"
   - ⚠️ **NÃO** marque "Add .gitignore"
   - ⚠️ **NÃO** marque "Choose a license"
3. Clique em **"Create repository"**
4. **Volte ao terminal** e pressione ENTER

---

## 👤 **PASSO 4: Informar Usuário GitHub**

O script vai pedir seu usuário do GitHub:
- Digite seu usuário (ex: `joaosilva`)
- Pressione ENTER

---

## 🔐 **PASSO 5: Autenticação (se necessário)**

Se o GitHub pedir autenticação:

**Opção A - Token (Recomendado):**
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Classic"
3. Marque: `repo` (Full control of private repositories)
4. Clique em "Generate token"
5. **Copie o token** (guarde em lugar seguro!)
6. Quando o Git pedir senha, **cole o token**

**Opção B - GitHub CLI:**
```powershell
winget install --id GitHub.cli
gh auth login
```

---

## ✅ **Verificar se Funcionou**

Após o script terminar:

1. Acesse: `https://github.com/SEU_USUARIO/infracore-erp`
2. Você deve ver todos os arquivos do projeto!

---

## 🌐 **PRÓXIMO PASSO: Deploy no Vercel**

Agora que o código está no GitHub, vamos colocar online:

### 1️⃣ Acessar Vercel
- Vá em: https://vercel.com/signup
- Faça login com GitHub

### 2️⃣ Importar Projeto
- Clique em "Add New..." → "Project"
- Selecione `infracore-erp`
- Clique em "Import"

### 3️⃣ Configurar
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4️⃣ Adicionar Variáveis de Ambiente
Clique em "Environment Variables" e adicione:

```
VITE_SUPABASE_URL = https://oxjqoatvipfnfadjhzvz.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94anFvYXR2aXBmbmZhZGpoenZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MDY2ODIsImV4cCI6MjA4MjI4MjY4Mn0.Uboa2XRelOqTYbKyCwi3aswL-4IYGZgqPfa-9M2jyKU
```

### 5️⃣ Deploy
- Clique em "Deploy"
- Aguarde ~2 minutos
- 🎉 **Pronto! Seu ERP está online!**

---

## 🆘 Problemas Comuns

### Erro: "git: command not found"
- Reinicie o terminal
- Se persistir, reinicie o VS Code

### Erro: "Permission denied"
- Execute: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### Erro ao fazer push
- Verifique se criou o repositório no GitHub
- Verifique se o nome do repositório está correto
- Use token em vez de senha

---

## 📞 Precisa de Ajuda?

Se tiver qualquer problema, me avise que eu te ajudo! 🚀

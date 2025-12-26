# 🔧 Como Criar o Arquivo .env

## Passo a Passo Rápido:

### 1. Criar o Arquivo

**Opção A - Via VS Code:**
1. Clique com botão direito na pasta raiz do projeto
2. Selecione "New File"
3. Digite exatamente: `.env` (com o ponto no início)
4. Pressione Enter

**Opção B - Via Terminal:**
```bash
# Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# Windows (CMD)
type nul > .env

# Mac/Linux
touch .env
```

### 2. Copiar Conteúdo

Copie o conteúdo do arquivo `.env.example` e cole no `.env`

### 3. Preencher Credenciais

Substitua os valores de exemplo pelas suas credenciais reais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Salvar e Reiniciar

1. Salve o arquivo `.env` (Ctrl+S)
2. Pare o servidor (Ctrl+C no terminal)
3. Inicie novamente: `npm run dev`

---

## ⚠️ Importante:

- O arquivo `.env` **NÃO** será enviado ao GitHub (está no .gitignore)
- Nunca compartilhe suas credenciais do Supabase
- Se precisar recriar, use o `.env.example` como base

---

## ✅ Como Saber se Funcionou:

Ao iniciar o servidor, você verá no console:
- ✅ `Supabase configured and ready!` = Funcionando
- 📦 `Running in localStorage mode` = Credenciais não configuradas

---

## 🆘 Problemas Comuns:

**Erro: "Cannot find module"**
- Certifique-se que instalou: `npm install @supabase/supabase-js`

**Variáveis não carregam**
- Verifique se o arquivo se chama exatamente `.env` (com ponto)
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor após criar/modificar o .env

**Arquivo .env não aparece no VS Code**
- Ele pode estar oculto. Vá em View > Show Hidden Files
- Ou use o terminal: `ls -la` (Mac/Linux) ou `dir /a` (Windows)

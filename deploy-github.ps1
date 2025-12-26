# ============================================
# SCRIPT DE DEPLOY - INFRACORE ERP
# ============================================
# Execute este script após reiniciar o terminal

# Passo 1: Configurar Git (execute apenas uma vez)
Write-Host "Configurando Git..." -ForegroundColor Cyan
git config --global user.name "InfraCore ERP"
git config --global user.email "seu-email@exemplo.com"  # ALTERE PARA SEU EMAIL

# Passo 2: Inicializar repositório
Write-Host "`nInicializando repositório Git..." -ForegroundColor Cyan
git init

# Passo 3: Adicionar todos os arquivos
Write-Host "`nAdicionando arquivos..." -ForegroundColor Cyan
git add .

# Passo 4: Fazer commit
Write-Host "`nFazendo commit..." -ForegroundColor Cyan
git commit -m "Initial commit - InfraCore ERP"

# Passo 5: Conectar ao GitHub
Write-Host "`n⚠️ ATENÇÃO: Você precisa criar o repositório no GitHub primeiro!" -ForegroundColor Yellow
Write-Host "1. Acesse: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Nome do repositório: infracore-erp" -ForegroundColor Yellow
Write-Host "3. Deixe PRIVATE" -ForegroundColor Yellow
Write-Host "4. NÃO marque 'Initialize with README'" -ForegroundColor Yellow
Write-Host "5. Clique em 'Create repository'" -ForegroundColor Yellow
Write-Host "`nApós criar, pressione ENTER para continuar..." -ForegroundColor Yellow
Read-Host

# Passo 6: Adicionar remote (ALTERE SEU_USUARIO)
Write-Host "`nConectando ao GitHub..." -ForegroundColor Cyan
$usuario = Read-Host "Digite seu usuário do GitHub"
git remote add origin "https://github.com/$usuario/infracore-erp.git"

# Passo 7: Enviar código
Write-Host "`nEnviando código para o GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

Write-Host "`n✅ Deploy concluído!" -ForegroundColor Green
Write-Host "Próximo passo: Deploy no Vercel" -ForegroundColor Cyan
Write-Host "Acesse: https://vercel.com/new" -ForegroundColor Cyan

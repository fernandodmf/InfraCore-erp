-- ============================================
-- ATUALIZAÇÃO DE SCHEMA PARA SUPORTE FINANCEIRO E DETALHADO
-- ============================================

-- Clientes: Endereço estruturado e crédito
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_zip TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- Fornecedores: Dados bancários
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_info JSONB DEFAULT '{}';

-- Estoque: Detalhes fiscais e localização
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS ncm TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS brand TEXT;

-- Transações: Vencimento e Vínculo
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS origin_module TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS origin_id UUID;

-- Vendas: Parcelamento e Peso
ALTER TABLE sales ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS weight_ticket TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS measured_weight DECIMAL(10,3);

-- Ordens de Compra: Financeiro
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS target_account_id TEXT;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Frota/Combustível: Financeiro e Posto
ALTER TABLE fleet ADD COLUMN IF NOT EXISTS financial_account_id TEXT; -- Em logs se necessário, aqui talvez não

-- Atualizar logs de combustível (JSONB dentro de fleet ou tabela separada? O schema original usa JSONB 'fuel_logs')
-- Se migrarmos para tabela relacional seria melhor, mas manteremos o JSONB atualizado na aplicação por enquanto.
-- O schema SQL original define 'fuel_logs JSONB'. A aplicação vai gerenciar a estrutura interna desse JSON.

-- Contas Financeiras (Nova Tabela para preencher o select de contas)
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Banco, Caixa, Investimento
    bank_name TEXT,
    agency TEXT,
    account_number TEXT,
    initial_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    color TEXT,
    status TEXT DEFAULT 'Ativa',
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for financial_accounts" ON financial_accounts FOR ALL USING (true);

-- Seed Contas
INSERT INTO financial_accounts (name, type, bank_name, initial_balance, current_balance, color) VALUES
('Banco do Brasil', 'Conta Corrente', 'Banco do Brasil', 100000, 142000, 'bg-blue-600'),
('Caixa Interno', 'Caixa', 'Interno', 5000, 12450, 'bg-teal-600')
ON CONFLICT DO NOTHING;

-- Schema Update Done


-- 2. FORNECEDORES
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  category TEXT,
  status TEXT DEFAULT 'Ativo',
  registered_at TIMESTAMP DEFAULT NOW(),
  initials TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. FUNCIONÁRIOS
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'Ativo',
  admission_date DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  bank_account TEXT,
  pix_key TEXT,
  vacation_days_available INTEGER DEFAULT 30,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. ESTOQUE
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  min_stock DECIMAL(10,2) DEFAULT 0,
  color TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. TRANSAÇÕES FINANCEIRAS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  account TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pendente',
  type TEXT NOT NULL,
  ledger_code TEXT,
  ledger_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. VENDAS
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  items JSONB NOT NULL,
  payment_method TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  account TEXT,
  status TEXT DEFAULT 'Conciliado',
  type TEXT DEFAULT 'Receita',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. ORÇAMENTOS
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  client_name TEXT NOT NULL,
  date DATE NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Aberto',
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. ORDENS DE COMPRA
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  date DATE NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pendente',
  received_at DATE,
  account_id TEXT,
  ledger_code TEXT,
  ledger_name TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. FROTA
CREATE TABLE fleet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  year INTEGER,
  plate TEXT NOT NULL UNIQUE,
  type TEXT,
  status TEXT DEFAULT 'Operacional',
  fuel_level INTEGER DEFAULT 100,
  last_maintenance DATE,
  km INTEGER DEFAULT 0,
  maintenance_history JSONB DEFAULT '[]',
  fuel_logs JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. PNEUS
CREATE TABLE tires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  size TEXT NOT NULL,
  status TEXT DEFAULT 'Novo',
  current_vehicle_id UUID REFERENCES fleet(id),
  position TEXT,
  install_km INTEGER,
  current_km INTEGER DEFAULT 0,
  max_km INTEGER DEFAULT 100000,
  recap_count INTEGER DEFAULT 0,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. FOLHA DE PAGAMENTO
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  benefits DECIMAL(10,2) DEFAULT 0,
  overtime DECIMAL(10,2) DEFAULT 0,
  discounts DECIMAL(10,2) DEFAULT 0,
  total_net DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pendente',
  paid_at DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. REGISTRO DE PONTO
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  check_in TIME NOT NULL,
  check_out TIME,
  status TEXT DEFAULT 'Presente',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. FÉRIAS
CREATE TABLE vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  status TEXT DEFAULT 'Solicitado',
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_by TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. ANTECIPAÇÕES SALARIAIS
CREATE TABLE salary_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  request_date DATE NOT NULL,
  status TEXT DEFAULT 'Pendente',
  approved_by TEXT,
  paid_at DATE,
  deduct_from_month TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 15. PRODUÇÃO - FÓRMULAS
CREATE TABLE production_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  output_product_id UUID REFERENCES inventory(id),
  ingredients JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 16. PRODUÇÃO - UNIDADES
CREATE TABLE production_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Operando',
  capacity TEXT NOT NULL,
  current_load INTEGER DEFAULT 0,
  temp INTEGER DEFAULT 0,
  power TEXT,
  allowed_categories JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 17. PRODUÇÃO - ORDENS
CREATE TABLE production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES inventory(id),
  formula_id UUID REFERENCES production_formulas(id),
  quantity DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Planejado',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT DEFAULT 'Média',
  progress INTEGER DEFAULT 0,
  unit_id UUID REFERENCES production_units(id),
  batch TEXT,
  operator TEXT,
  quality_tests JSONB DEFAULT '[]',
  raw_materials_deducted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 18. USUÁRIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_id TEXT NOT NULL,
  status TEXT DEFAULT 'Ativo',
  last_login TIMESTAMP,
  avatar TEXT,
  registered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 19. CONFIGURAÇÕES
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT DEFAULT 'BRL',
  language TEXT DEFAULT 'pt-BR',
  theme TEXT DEFAULT 'dark',
  notifications JSONB DEFAULT '{}',
  technical JSONB DEFAULT '{}',
  backup JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_payroll_month ON payroll(month);
CREATE INDEX idx_production_orders_status ON production_orders(status);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE tires ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE ACESSO (PERMITIR TUDO POR ENQUANTO)
-- ============================================

-- Clientes
CREATE POLICY "Enable all for clients" ON clients FOR ALL USING (true);

-- Fornecedores
CREATE POLICY "Enable all for suppliers" ON suppliers FOR ALL USING (true);

-- Funcionários
CREATE POLICY "Enable all for employees" ON employees FOR ALL USING (true);

-- Estoque
CREATE POLICY "Enable all for inventory" ON inventory FOR ALL USING (true);

-- Transações
CREATE POLICY "Enable all for transactions" ON transactions FOR ALL USING (true);

-- Vendas
CREATE POLICY "Enable all for sales" ON sales FOR ALL USING (true);

-- Orçamentos
CREATE POLICY "Enable all for budgets" ON budgets FOR ALL USING (true);

-- Ordens de Compra
CREATE POLICY "Enable all for purchase_orders" ON purchase_orders FOR ALL USING (true);

-- Frota
CREATE POLICY "Enable all for fleet" ON fleet FOR ALL USING (true);

-- Pneus
CREATE POLICY "Enable all for tires" ON tires FOR ALL USING (true);

-- Folha
CREATE POLICY "Enable all for payroll" ON payroll FOR ALL USING (true);

-- Ponto
CREATE POLICY "Enable all for time_logs" ON time_logs FOR ALL USING (true);

-- Férias
CREATE POLICY "Enable all for vacations" ON vacations FOR ALL USING (true);

-- Antecipações
CREATE POLICY "Enable all for salary_advances" ON salary_advances FOR ALL USING (true);

-- Fórmulas
CREATE POLICY "Enable all for production_formulas" ON production_formulas FOR ALL USING (true);

-- Unidades
CREATE POLICY "Enable all for production_units" ON production_units FOR ALL USING (true);

-- Ordens de Produção
CREATE POLICY "Enable all for production_orders" ON production_orders FOR ALL USING (true);

-- Usuários
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true);

-- Configurações
CREATE POLICY "Enable all for settings" ON settings FOR ALL USING (true);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir configuração padrão
VALUES ('Construsys Engenharia Ltda', 'Construsys ERP', '12.345.678/0001-99', 'contato@construsys.com', '(11) 4002-8922', 'Rua da Tecnologia, 100 - Industrial, SP');

-- 20. PERFIS DE ACESSO
CREATE TABLE app_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE app_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for app_roles" ON app_roles FOR ALL USING (true);

-- Seed Roles
INSERT INTO app_roles (id, name, description, permissions) VALUES
('admin', 'Administrador', 'Acesso total ao sistema', '["all"]'::jsonb),
('manager', 'Gerente', 'Gestão de módulos operacionais', '["sales.view", "sales.create", "purchases.view", "inventory.view"]'::jsonb),
('operator', 'Operador', 'Operação de campo e produção', '["production.view", "fleet.view"]'::jsonb);

-- Seed Admin User (Password handling to be defined, simulating 'active' status)
INSERT INTO users (name, email, role_id, status, registered_at)
VALUES ('Admin Construsys', 'admin@construsys.com', 'admin', 'Ativo', NOW());

-- ============================================
-- FIM DO SCHEMA
-- ============================================

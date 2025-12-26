-- ============================================
-- CONSTRUSYS ERP - SCHEMA SUPABASE
-- ============================================

-- 1. CLIENTES
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'Ativo',
  type TEXT DEFAULT 'Matriz',
  registered_at TIMESTAMP DEFAULT NOW(),
  initials TEXT,
  color_class TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
INSERT INTO settings (company_name, trade_name, document, email, phone, address)
VALUES ('Construsys Engenharia Ltda', 'Construsys ERP', '12.345.678/0001-99', 'contato@construsys.com', '(11) 4002-8922', 'Rua da Tecnologia, 100 - Industrial, SP');

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- ============================================
-- InfraCore ERP - Reset Database Script
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Desativa verificações de FK temporariamente para permitir truncate
-- (Supabase geralmente não precisa disso, mas é seguro incluir)

-- Limpa tabelas de dados transacionais primeiro (ordem por dependências)
-- Use DELETE em vez de TRUNCATE se TRUNCATE der problemas

DO $$
DECLARE
    tables_to_clear TEXT[] := ARRAY[
        'stock_movements',
        'sales',
        'budget_items', 
        'budgets',
        'transaction_items',
        'transactions',
        'production_units',
        'production_formulas',
        'production_orders',
        'maintenance_records',
        'fuel_logs',
        'fleet',
        'payroll',
        'time_logs',
        'salary_advances',
        'vacations',
        'employees',
        'suppliers',
        'clients',
        'inventory',
        'financial_accounts',
        'tire_history',
        'tires',
        'purchase_orders'
    ];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables_to_clear LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
            EXECUTE format('DELETE FROM %I', t);
            RAISE NOTICE 'Limpou tabela: %', t;
        ELSE
            RAISE NOTICE 'Tabela não existe (ignorada): %', t;
        END IF;
    END LOOP;
END $$;

-- Alternativa mais simples: Execute apenas as tabelas que VOCÊ SABE que existem
-- Descomente e ajuste conforme sua estrutura:

/*
DELETE FROM sales;
DELETE FROM transactions;
DELETE FROM fleet;
DELETE FROM tires;
DELETE FROM clients;
DELETE FROM suppliers;
DELETE FROM employees;
DELETE FROM inventory;
DELETE FROM users;
DELETE FROM app_roles;
DELETE FROM settings;
DELETE FROM payroll;
DELETE FROM purchase_orders;
DELETE FROM production_orders;
DELETE FROM production_formulas;
DELETE FROM production_units;
DELETE FROM financial_accounts;
*/

-- Para verificar quais tabelas existem no seu schema:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

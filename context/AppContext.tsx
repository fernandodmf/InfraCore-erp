import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import * as api from '../src/services/api';
import {
  Client, Transaction, FleetVehicle, Sale, InventoryItem, Budget, Supplier,
  Employee, PurchaseOrder, MaintenanceRecord, FuelLog, PayrollRecord, TimeLog, Tire, TireHistory,
  ProductionOrder, ProductionFormula, QualityTest, ProductionUnit, User, AppRole, AppSettings, AuditLog,
  Vacation, SalaryAdvance, StockMovement
} from '../types';
// MOCK_CLIENTS, MOCK_TRANSACTIONS, MOCK_FLEET imports removed for clean implementation

// Initial Mock Inventory
// Initial Mock Inventory - CLEARED
const INITIAL_INVENTORY: InventoryItem[] = [];

const INITIAL_BUDGETS: Budget[] = [];

const INITIAL_SUPPLIERS: Supplier[] = [];

const INITIAL_EMPLOYEES: Employee[] = [];

const INITIAL_TIRES: Tire[] = [];

const INITIAL_FORMULAS: ProductionFormula[] = [];

const INITIAL_PRODUCTION_UNITS: ProductionUnit[] = [];

const INITIAL_ROLES: AppRole[] = [
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total e irrestrito ao sistema.',
    permissions: ['all']
  },
  {
    id: 'manager_com',
    name: 'Gerente Comercial',
    description: 'Gestão completa de vendas, clientes e equipe comercial.',
    permissions: [
      'sales.view', 'sales.view_all', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.approve', 'sales.discount',
      'clients.view', 'clients.manage', 'clients.credit',
      'crm.leads', 'reports.basic', 'reports.advanced'
    ]
  },
  {
    id: 'salesperson',
    name: 'Vendedor',
    description: 'Acesso padrão para força de vendas.',
    permissions: [
      'sales.view', 'sales.create', 'clients.view', 'crm.leads'
    ]
  },
  {
    id: 'manager_stock',
    name: 'Gestor de Estoque',
    description: 'Controle total de inventário e compras.',
    permissions: [
      'inventory.view', 'inventory.move', 'inventory.adjust', 'inventory.cost_view',
      'purchases.view', 'purchases.create', 'purchases.approve_level1',
      'suppliers.view', 'suppliers.manage'
    ]
  },
  {
    id: 'operator',
    name: 'Operador de Campo',
    description: 'Focado em execução de ordens e manutenção.',
    permissions: [
      'production.execute', 'maintenance.create', 'fuel.log', 'fleet.view'
    ]
  },
  {
    id: 'financial',
    name: 'Analista Financeiro',
    description: 'Contas a pagar/receber e fluxo de caixa.',
    permissions: [
      'finance.dashboard', 'finance.payables', 'finance.receivables', 'finance.transact', 'finance.reconcile',
      'reports.basic', 'reports.advanced', 'finance.reports'
    ]
  }
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin InfraCore', username: 'admin', password: '123', email: 'admin@infracore.com', roleId: 'admin', status: 'Ativo', registeredAt: '01/01/2023' },
  { id: '2', name: 'Gerência Vendas', username: 'vendas', password: '123', email: 'vendas@infracore.com', roleId: 'manager', status: 'Ativo', registeredAt: '15/05/2023' },
];

const INITIAL_SETTINGS: AppSettings = {
  companyName: 'InfraCore Engenharia Ltda',
  tradeName: 'InfraCore ERP',
  document: '12.345.678/0001-99',
  email: 'contato@infracore.com',
  phone: '(11) 4002-8922',
  address: 'Rua da Tecnologia, 100 - Industrial, SP',
  bankDetails: {
    bankName: 'Banco do Brasil',
    agency: '0041-X',
    account: '44.021-X',
    pixKey: 'contato@infracore.com',
    pixType: 'E-mail'
  },
  currency: 'BRL',
  language: 'pt-BR',
  theme: 'dark',
  notifications: {
    stockAlerts: true,
    overdueFinance: true,
    productionUpdates: true,
    fleetMaintenance: true
  },
  technical: {
    taxRegime: 'Lucro Presumido',
    defaultTaxRate: 15.5,
    financialYearStart: '01/01',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'America/Sao_Paulo'
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    lastBackup: '22/12/2025 23:00'
  },
  // Expanded Defaults
  operational: {
    maxDiscount: 15,
    minMargin: 20,
    defaultPaymentTerm: 30,
    budgetValidity: 7,
    maxInstallments: 12,
    minInstallmentValue: 100,
    creditLimit: 5000,
    overdueGracePeriod: 5,
    autoApprovalLimit: 10000,
    commissionRate: 3,
    priceTableCount: 3,
    quotaRenewalDays: 30,
    leadFollowupDays: 3,
    contractMinDuration: 12,
    warrantyPeriod: 12,
    safetyStock: 10,
    reorderPoint: 20,
    maxStockLevel: 90,
    inventoryCountFrequency: 90,
    batchTrackingDays: 180,
    wastePercentage: 2,
    productionLeadTime: 5,
    setupTime: 30,
    qualityControlSampling: 10,
    maintenanceInterval: 500,
    batchSize: 100,
    workShiftHours: 8,
    overtimeLimit: 20,
    scrapReworkLimit: 5,
    capacityUtilization: 85,
    purchaseApprovalLevel1: 5000,
    purchaseApprovalLevel2: 20000,
    minQuotations: 3,
    supplierEvaluationPeriod: 6,
    deliveryToleranceDays: 2,
    minOrderValue: 500,
    paymentTermNegotiation: 45,
    qualityInspectionRate: 20,
    returnPeriod: 7,
    contractRenewalAlert: 30,
    interestRate: 1,
    lateFee: 2,
    earlyPaymentDiscount: 3,
    cashFlowProjectionDays: 90,
    bankReconciliationFrequency: 7,
    minimumCashReserve: 10000,
    budgetVarianceAlert: 10,
    invoiceReminderDays: 3,
    creditCardProcessingFee: 3.5,
    fiscalYearStart: 1
  },
  integrations: {
    nfe: { name: 'Nota Fiscal Eletrônica (NF-e)', status: 'Ativo', category: 'Fiscal' },
    nfse: { name: 'Nota Fiscal de Serviço (NFS-e)', status: 'Ativo', category: 'Fiscal' },
    sefaz: { name: 'Consulta SEFAZ', status: 'Ativo', category: 'Fiscal' },
    mdfe: { name: 'Manifesto Eletrônico (MDF-e)', status: 'Ativo', category: 'Fiscal' },
    pagseguro: { name: 'Gateway PagSeguro', status: 'Ativo', category: 'Financeiro' },
    boleto: { name: 'Boleto Bancário', status: 'Ativo', category: 'Financeiro' },
    pix: { name: 'PIX', status: 'Ativo', category: 'Financeiro' },
    ofx: { name: 'Conciliação OFX', status: 'Ativo', category: 'Financeiro' },
    whatsapp: { name: 'WhatsApp Business API', status: 'Ativo', category: 'Comunicação' },
    sendgrid: { name: 'E-mail Marketing (SendGrid)', status: 'Ativo', category: 'Comunicação' },
    googlemaps: { name: 'Google Maps API', status: 'Ativo', category: 'Logística' },
    sinapi: { name: 'SINAPI', status: 'Ativo', category: 'Engenharia' },
    sicro: { name: 'SICRO', status: 'Ativo', category: 'Engenharia' }
  },
  emailConfig: {
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    senderEmail: 'noreply@infracore.com',
    templates: {
      budget: 'Olá, segue anexo o orçamento...',
      invoice: 'Prezado cliente, sua nota fiscal foi emitida...'
    }
  },
  documents: {
    printerMain: 'HP LaserJet Pro',
    printerThermal: 'Zebra ZD220',
    margins: 10,
    copies: 2,
    showLogo: true,
    watermarkDraft: true,
    qrCode: false,
    autoNumbering: true,
    digitalSignature: false,
    customFooter: true,
    barcode: true,
    authSeal: false
  },
  performance: {
    cacheSize: 245,
    imageQuality: 85,
    autoCompression: true,
    lazyLoading: true,
    preloading: false,
    gzip: true,
    autoIndexing: true,
    queryCache: true,
    minifyAssets: true,
    cdn: false,
    dbPooling: true
  }
};

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: '1', userId: '1', userName: 'Admin InfraCore', action: 'Login no Sistema', module: 'Login', timestamp: '01/01/2026 08:00', severity: 'info', details: 'Login realizado com sucesso via senha', ip: '192.168.1.100' },
  { id: '2', userId: '1', userName: 'Admin InfraCore', action: 'Alteração de Configuração', module: 'Configurações', timestamp: '01/01/2026 08:05', severity: 'warning', details: 'Alterou o tema para Escuro', ip: '192.168.1.100' },
  { id: '3', userId: '2', userName: 'Gerência Vendas', action: 'Nova Venda', module: 'Vendas', timestamp: '01/01/2026 09:15', severity: 'info', details: 'Venda #1034 criada para Cliente Exemplo', ip: '192.168.1.102' },
  { id: '4', userId: '1', userName: 'Admin InfraCore', action: 'Exclusão de Usuário', module: 'Configurações', timestamp: '01/01/2026 10:30', severity: 'critical', details: 'Usuário temp_user removido permanentemente', ip: '192.168.1.100' },
  { id: '5', userId: '2', userName: 'Gerência Vendas', action: 'Falha de Login', module: 'Login', timestamp: '01/01/2026 11:00', severity: 'warning', details: 'Senha incorreta (3 tentativas)', ip: '192.168.1.105' },
  { id: '6', userId: '1', userName: 'Admin InfraCore', action: 'Backup Manual', module: 'Segurança', timestamp: '01/01/2026 12:00', severity: 'info', details: 'Backup completo do banco de dados executado', ip: '192.168.1.100' },
  { id: '7', userId: '1', userName: 'Admin InfraCore', action: 'Atualização de Estoque', module: 'Estoque', timestamp: '01/01/2026 14:20', severity: 'info', details: 'Ajuste manual de inventário: Cimento CP-II (+50 un)', ip: '192.168.1.100' },
  { id: '8', userId: 'financial', userName: 'Analista Financeiro', action: 'Pagamento Realizado', module: 'Financeiro', timestamp: '01/01/2026 15:45', severity: 'info', details: 'Conta de Energia (Ref: 12/2025) paga via Boleto', ip: '192.168.1.108' },
];

interface AppContextType {
  clients: Client[];
  suppliers: Supplier[];
  employees: Employee[];
  transactions: Transaction[];
  sales: Sale[];
  budgets: Budget[];
  purchaseOrders: PurchaseOrder[];
  fleet: FleetVehicle[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  payroll: PayrollRecord[];
  timeLogs: TimeLog[];
  tires: Tire[];
  productionOrders: ProductionOrder[];
  formulas: ProductionFormula[];
  productionUnits: ProductionUnit[];
  users: User[];
  roles: AppRole[];
  settings: AppSettings;
  auditLogs: AuditLog[];
  accounts: any[]; // Assuming 'any' for now based on INITIAL_ACCOUNTS structure
  planOfAccounts: any[]; // Assuming 'any' for now based on INITIAL_PLAN_OF_ACCOUNTS structure

  currentUser: User | null;
  login: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permissionId: string) => boolean;

  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;

  addPayroll: (record: PayrollRecord) => void;
  payPayroll: (id: string) => void;
  addTimeLog: (log: TimeLog) => void;

  // Vacations
  vacations: Vacation[];
  addVacation: (vacation: Vacation) => void;
  updateVacationStatus: (id: string, status: Vacation['status'], approvedBy?: string) => void;
  deleteVacation: (id: string) => void;

  // Salary Advances
  salaryAdvances: SalaryAdvance[];
  addSalaryAdvance: (advance: SalaryAdvance) => void;
  updateAdvanceStatus: (id: string, status: SalaryAdvance['status'], approvedBy?: string) => void;
  paySalaryAdvance: (id: string) => void;
  deleteAdvance: (id: string) => void;

  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (id: string, status: Transaction['status'], date?: string) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (file: any) => void;
  addSale: (sale: Sale) => void;
  addBudget: (budget: Budget) => void;
  updateBudgetStatus: (id: string, status: Budget['status']) => void;

  addPurchaseOrder: (order: PurchaseOrder) => void;
  updatePurchaseOrder: (order: PurchaseOrder) => void;
  receivePurchaseOrder: (id: string) => void;

  addVehicle: (vehicle: FleetVehicle) => void;
  updateVehicle: (vehicle: FleetVehicle) => void;
  updateVehicleStatus: (id: string, status: FleetVehicle['status']) => void;
  deleteVehicle: (id: string) => void;
  addMaintenanceRecord: (vehicleId: string, record: MaintenanceRecord) => void;
  addFuelLog: (vehicleId: string, log: FuelLog) => void;

  addTire: (tire: Tire) => void;
  updateTire: (tire: Tire) => void;
  deleteTire: (id: string) => void;
  addTireHistory: (tireId: string, entry: TireHistory) => void;
  deleteTireHistory: (tireId: string, historyId: string) => void;

  deleteMaintenanceRecord: (vehicleId: string, recordId: string) => void;
  deleteFuelLog: (vehicleId: string, logId: string) => void;

  addStockItem: (item: InventoryItem) => void;
  updateStock: (itemId: string, quantityDelta: number, reason?: string, documentId?: string) => void;
  updateStockItem: (item: InventoryItem) => void;
  deleteStockItem: (id: string) => void;

  // Production
  addProductionOrder: (order: ProductionOrder) => void;
  updateProductionOrder: (order: ProductionOrder) => void;
  deleteProductionOrder: (id: string) => void;
  startProduction: (id: string) => void;
  completeProduction: (id: string) => void;
  addFormula: (formula: ProductionFormula) => void;
  updateFormula: (formula: ProductionFormula) => void;
  deleteFormula: (id: string) => void; // Added
  addQualityTest: (orderId: string, test: QualityTest) => void;

  addProductionUnit: (unit: ProductionUnit) => void;
  updateProductionUnit: (unit: ProductionUnit) => void;
  deleteProductionUnit: (id: string) => void;

  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addRole: (role: AppRole) => void;
  updateRole: (role: AppRole) => void;
  deleteRole: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;

  addAccount: (acc: any) => void; // Added
  deleteAccount: (id: string) => void; // Added
  addPlanAccount: (parentId: string | null, name: string, type?: 'Receita' | 'Despesa') => void; // Updated
  deletePlanAccount: (id: string, parentId?: string | null) => void; // Updated
  updatePlanAccount: (id: string, name: string, parentId?: string | null) => void; // Updated

  clearAllData: () => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  seedDatabase: (data: any) => void;
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    projectedBalance: number;
    receivables: number;
    payables: number;
    recentTransactions: Transaction[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'infracore_erp_data';

const INITIAL_ACCOUNTS = [
  { id: 'acc-1', name: 'Caixa Geral', type: 'Espécie', balance: 0, color: 'bg-emerald-600', code: 'Gaveta / Cofre' }
];

const INITIAL_PLAN_OF_ACCOUNTS = [
  // ==================================================================================
  // GRUPO 1: RECEITAS (ENTRADAS)
  // ==================================================================================
  {
    id: '1', code: '1.01', name: 'Receita Operacional Bruta', type: 'Receita', children: [
      { id: '101', code: '1.01.01', name: 'Venda de Produtos de Fabricação Própria' },
      { id: '102', code: '1.01.02', name: 'Revenda de Mercadorias' },
      { id: '103', code: '1.01.03', name: 'Prestação de Serviços de Engenharia/Obra' },
      { id: '104', code: '1.01.04', name: 'Locação de Equipamentos e Maquinário' },
    ]
  },
  {
    id: '2', code: '1.02', name: 'Outras Receitas Operacionais', type: 'Receita', children: [
      { id: '201', code: '1.02.01', name: 'Recuperação de Despesas' },
      { id: '202', code: '1.02.02', name: 'Venda de Ativo Imobilizado (Ganho de Capital)' },
      { id: '203', code: '1.02.03', name: 'Reversão de Provisões' },
    ]
  },
  {
    id: '3', code: '1.03', name: 'Receitas Financeiras', type: 'Receita', children: [
      { id: '301', code: '1.03.01', name: 'Rendimentos de Aplicações Financeiras' },
      { id: '302', code: '1.03.02', name: 'Juros Recebidos de Clientes' },
      { id: '303', code: '1.03.03', name: 'Descontos Obtidos de Fornecedores' },
      { id: '304', code: '1.03.04', name: 'Variação Cambial Ativa' },
    ]
  },

  // ==================================================================================
  // GRUPO 2: CUSTOS E DESPESAS (SAÍDAS)
  // ==================================================================================

  // 2.01 - DEDUÇÕES DA RECEITA
  {
    id: '4', code: '2.01', name: 'Deduções da Receita Bruta', type: 'Despesa', children: [
      { id: '401', code: '2.01.01', name: 'Impostos Incidentes s/ Vendas (ICMS/ISS/PIS/COFINS)' },
      { id: '402', code: '2.01.02', name: 'Devoluções e Abatimentos de Vendas' },
      { id: '403', code: '2.01.03', name: 'Cancelamento de Vendas' },
    ]
  },

  // 2.02 - CUSTOS (CPV / CSP)
  {
    id: '5', code: '2.02', name: 'Custos Diretos (CPV / CSP)', type: 'Despesa', children: [
      { id: '501', code: '2.02.01', name: 'Matéria-Prima e Insumos (Produção)' },
      { id: '502', code: '2.02.02', name: 'Materiais Aplicados na Obra' },
      { id: '503', code: '2.02.03', name: 'Mão de Obra Direta (Operacional)' },
      { id: '504', code: '2.02.04', name: 'Encargos Sociais sobre MOD' },
      { id: '505', code: '2.02.05', name: 'Combustíveis e Lubrificantes (Produção)' },
      { id: '506', code: '2.02.06', name: 'Manutenção de Máquinas e Equipamentos' },
      { id: '507', code: '2.02.07', name: 'EPIs e Uniformes (Produção)' },
      { id: '508', code: '2.02.08', name: 'Subempreiteiros e Terceirização de Obra' },
    ]
  },

  // 2.03 - DESPESAS COM PESSOAL
  {
    id: '6', code: '2.03', name: 'Despesas com Pessoal (Administrativo)', type: 'Despesa', children: [
      { id: '601', code: '2.03.01', name: 'Salários e Ordenados' },
      { id: '602', code: '2.03.02', name: 'Pró-Labore Sócios' },
      { id: '603', code: '2.03.03', name: '13º Salário' },
      { id: '604', code: '2.03.04', name: 'Férias' },
      { id: '605', code: '2.03.05', name: 'INSS Empresa' },
      { id: '606', code: '2.03.06', name: 'FGTS' },
      { id: '607', code: '2.03.07', name: 'Vale Transporte / Alimentação / Refeição' },
      { id: '608', code: '2.03.08', name: 'Assistência Médica e Social' },
      { id: '609', code: '2.03.09', name: 'Treinamentos e Capacitação' },
    ]
  },

  // 2.04 - DESPESAS ADMINISTRATIVAS
  {
    id: '7', code: '2.04', name: 'Despesas Administrativas e Gerais', type: 'Despesa', children: [
      { id: '701', code: '2.04.01', name: 'Aluguel de Imóveis' },
      { id: '702', code: '2.04.02', name: 'Energia Elétrica' },
      { id: '703', code: '2.04.03', name: 'Água e Esgoto' },
      { id: '704', code: '2.04.04', name: 'Telefonia e Internet' },
      { id: '705', code: '2.04.05', name: 'Material de Expediente e Escritório' },
      { id: '706', code: '2.04.06', name: 'Serviços Contábeis e Jurídicos' },
      { id: '707', code: '2.04.07', name: 'Consultorias e Auditorias' },
      { id: '708', code: '2.04.08', name: 'Seguros Gerais (Predial/Responsabilidade)' },
      { id: '709', code: '2.04.09', name: 'Licenças de Software e TI' },
      { id: '710', code: '2.04.10', name: 'Serviços de Limpeza e Segurança' },
      { id: '711', code: '2.04.11', name: 'Depreciação e Amortização' },
    ]
  },

  // 2.05 - DESPESAS COMERCIAIS
  {
    id: '8', code: '2.05', name: 'Despesas Comerciais e de Vendas', type: 'Despesa', children: [
      { id: '801', code: '2.05.01', name: 'Comissões sobre Vendas' },
      { id: '802', code: '2.05.02', name: 'Publicidade e Propaganda (Marketing)' },
      { id: '803', code: '2.05.03', name: 'Brindes e Bonificações' },
      { id: '804', code: '2.05.04', name: 'Viagens e Estadias (Comercial)' },
      { id: '805', code: '2.05.05', name: 'Logística de Entrega (Fretes s/ Vendas)' },
    ]
  },

  // 2.06 - DESPESAS DE FROTA (Específico Transportadora/Construtora)
  {
    id: '9', code: '2.06', name: 'Despesas com Frota e Veículos', type: 'Despesa', children: [
      { id: '901', code: '2.06.01', name: 'Combustíveis e Lubrificantes (Frota Apoio)' },
      { id: '902', code: '2.06.02', name: 'Peças e Manutenção (Frota Apoio)' },
      { id: '903', code: '2.06.03', name: 'Pneus e Recapagens' },
      { id: '904', code: '2.06.04', name: 'IPVA, Licenciamento e Seguros de Frota' },
      { id: '905', code: '2.06.05', name: 'Multas de Trânsito' },
      { id: '906', code: '2.06.06', name: 'Pedágios e Estacionamentos' },
    ]
  },

  // 2.07 - DESPESAS FINANCEIRAS
  {
    id: '10', code: '2.07', name: 'Despesas Financeiras', type: 'Despesa', children: [
      { id: '1001', code: '2.07.01', name: 'Juros Pagos (Empréstimos/Financiamentos)' },
      { id: '1002', code: '2.07.02', name: 'Juros de Mora e Multas' },
      { id: '1003', code: '2.07.03', name: 'Tarifas e Manutenção Bancária' },
      { id: '1004', code: '2.07.04', name: 'IOF' },
      { id: '1005', code: '2.07.05', name: 'Variação Cambial Passiva' },
    ]
  },

  // 2.08 - DESPESAS TRIBUTÁRIAS
  {
    id: '11', code: '2.08', name: 'Despesas Tributárias', type: 'Despesa', children: [
      { id: '1101', code: '2.08.01', name: 'IPTU' },
      { id: '1102', code: '2.08.02', name: 'IPVA (Administrativo)' },
      { id: '1103', code: '2.08.03', name: 'Taxas e Alvarás de Funcionamento' },
      { id: '1104', code: '2.08.04', name: 'Contribuições Associativas e Sindicais' },
    ]
  },

  // 2.09 - INVESTIMENTOS (CAPEX)
  {
    id: '12', code: '2.09', name: 'Investimentos (Ativo Imobilizado/Intangível)', type: 'Despesa', children: [
      { id: '1201', code: '2.09.01', name: 'Aquisição de Imóveis e Terrenos' },
      { id: '1202', code: '2.09.02', name: 'Construções e Benfeitorias em Imóveis' },
      { id: '1203', code: '2.09.03', name: 'Máquinas, Equipamentos e Ferramentas' },
      { id: '1204', code: '2.09.04', name: 'Móveis e Utensílios' },
      { id: '1205', code: '2.09.05', name: 'Veículos' },
      { id: '1206', code: '2.09.06', name: 'Equipamentos de Informática e Periféricos' },
    ]
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [tires, setTires] = useState<Tire[]>(INITIAL_TIRES);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [formulas, setFormulas] = useState<ProductionFormula[]>(INITIAL_FORMULAS);
  const [productionUnits, setProductionUnits] = useState<ProductionUnit[]>(INITIAL_PRODUCTION_UNITS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<AppRole[]>(INITIAL_ROLES);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [accounts, setAccounts] = useState<any[]>(INITIAL_ACCOUNTS); // Added
  const [planOfAccounts, setPlanOfAccounts] = useState<any[]>(INITIAL_PLAN_OF_ACCOUNTS); // Added

  // Persistence Load
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize with first user as mock admin session if no user logged


  const login = async (username: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    // Debug info
    console.log('Attempting login with:', { username, passwordProvided: !!password });

    // 1. Try to find the user in the loaded state (Real DB Data)
    let user = users.find(u => u.username === username);

    // 2. Emergency/Setup Access: Only allow mock admin if DB is empty OR if explicitly requested manually (not auto-login)
    // This handles the "First Run" scenario where no users exist in Supabase yet.
    if (!user && users.length === 0 && username === 'admin' && password === '123') {
      console.log('🌱 First Access / Emergency Admin Login triggered');

      const mockAdmin = INITIAL_USERS.find(u => u.username === 'admin');
      if (mockAdmin) {
        // Ensure roles exist for permissions context
        if (roles.length === 0) setRoles(INITIAL_ROLES);

        setCurrentUser(mockAdmin);
        return { success: true, message: 'Acesso de Configuração Inicial (Banco Vazio)' };
      }
    }

    // 3. Normal Authentication Flow
    if (!user) {
      console.warn('Login failed: User not found.');
      return { success: false, message: 'Usuário não encontrado.' };
    }

    if (user.status !== 'Ativo') {
      console.warn(`Login failed: User ${username} is not Active.`);
      return { success: false, message: 'Usuário inativo ou bloqueado.' };
    }

    // Password Check (Simple comparsion for MVP)
    const passwordMatch = user.password === password;

    if (!passwordMatch) {
      console.warn('Login failed: Password mismatch.');
      return { success: false, message: 'Senha incorreta.' };
    }

    setCurrentUser(user);
    console.log('Login successful for:', username);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasPermission = useCallback((permissionId: string) => {
    if (!currentUser) return false;

    // Find User Role
    const userRole = roles.find(r => r.id === currentUser.roleId);
    if (!userRole) return false;

    // Check for Admin Superuser
    if (userRole.permissions.includes('all')) return true;

    return userRole.permissions.includes(permissionId);
  }, [currentUser, roles]);


  const loadSupabaseData = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const [
        cl, su, emp, inv, tr, fl, ti, us, ro, set, sa, po, pro, prf, pru, fac, pay, stm
      ] = await Promise.all([
        api.fetchData<Client>('clients'),
        api.fetchData<Supplier>('suppliers'),
        api.fetchData<Employee>('employees'),
        api.fetchData<InventoryItem>('inventory'),
        api.fetchData<Transaction>('transactions'),
        api.fetchData<FleetVehicle>('fleet'),
        api.fetchData<Tire>('tires'),
        api.fetchData<User>('users'),
        api.fetchRoles(),
        api.fetchData<AppSettings>('settings'),

        // New Tables
        api.fetchData<Sale>('sales'),
        api.fetchData<PurchaseOrder>('purchase_orders'),
        api.fetchData<ProductionOrder>('production_orders'),
        api.fetchData<ProductionFormula>('production_formulas'),
        api.fetchData<ProductionUnit>('production_units'),
        api.fetchData<any>('financial_accounts'),
        api.fetchData<PayrollRecord>('payroll'),
        api.fetchData<StockMovement>('stock_movements').catch(() => []), // Table might be missing, fail silently
        Promise.resolve([]), // Return empty array to keep destructuring indices aligned
      ]);

      if (cl.length > 0) setClients(cl);
      if (su.length > 0) setSuppliers(su);
      if (emp.length > 0) setEmployees(emp);
      if (inv.length > 0) setInventory(inv);
      if (tr.length > 0) setTransactions(tr);
      if (fl.length > 0) setFleet(fl);
      if (ti.length > 0) setTires(ti);
      if (us.length > 0) setUsers(us);
      if (ro.length > 0) setRoles(ro);
      if (set.length > 0) setSettings(set[0]);

      // New Data
      if (sa && sa.length > 0) setSales(sa);
      if (po && po.length > 0) setPurchaseOrders(po);
      if (pro && pro.length > 0) setProductionOrders(pro);
      if (prf && prf.length > 0) setFormulas(prf);
      if (pru && pru.length > 0) setProductionUnits(pru);
      if (fac && fac.length > 0) setAccounts(fac);
      if (pay && pay.length > 0) setPayroll(pay);
      if (stm && stm.length > 0) setStockMovements(stm);

      // Auto-Seed: If no users/roles/clients in DB, inject defaults to populated DB
      if (us.length === 0 && ro.length === 0 && cl.length === 0) {
        console.log('🌱 Empty database detected. Seeding full initial data...');

        try {
          const roleMap: Record<string, string> = {};

          // 1. Roles
          console.log('...Seeding Roles');
          for (const role of INITIAL_ROLES) {
            const { id, ...rest } = role;
            const cleanRole = await api.createItem<AppRole>('app_roles', rest);
            if (cleanRole) roleMap[role.id] = cleanRole.id;
          }

          // 2. Users
          console.log('...Seeding Users');
          for (const user of INITIAL_USERS) {
            const { id, roleId, ...rest } = user;
            const newRoleId = roleMap[roleId] || roleId;
            await api.createItem('users', { ...rest, roleId: newRoleId });
          }

          // 3. Settings
          if (set.length === 0) {
            console.log('...Seeding Settings');
            await api.createItem('settings', INITIAL_SETTINGS);
          }

          // 4. Clients
          console.log('...Seeding Clients (Synced)');
          // Removed mock clients seeding

          // 5. Suppliers
          console.log('...Seeding Suppliers (Synced)');
          for (const item of INITIAL_SUPPLIERS) {
            const { id, ...rest } = item;
            await api.createItem('suppliers', rest);
          }

          // 6. Employees
          console.log('...Seeding Employees (Synced)');
          for (const item of INITIAL_EMPLOYEES) {
            const { id, ...rest } = item;
            await api.createItem('employees', rest);
          }

          // 7. Inventory
          console.log('...Seeding Inventory (Synced)');
          for (const item of INITIAL_INVENTORY) {
            await api.createItem('inventory', item);
          }

          // 8. Fleet
          console.log('...Seeding Fleet (Synced)');
          // Removed mock fleet seeding

          // 9. Production Units
          console.log('...Seeding Production Units (Synced)');
          for (const item of INITIAL_PRODUCTION_UNITS) {
            const { id, ...rest } = item;
            await api.createItem('production_units', rest);
          }

          // 10. Formulas
          console.log('...Seeding Formulas (Synced)');
          for (const item of INITIAL_FORMULAS) {
            const { id, ...rest } = item;
            await api.createItem('production_formulas', rest);
          }

          console.log('✅ Full Seeding complete. Reloading Users...');

          // Re-fetch users to ensure login works immediately
          const latestUsers = await api.fetchData<User>('users');
          if (latestUsers && latestUsers.length > 0) {
            setUsers(latestUsers);
            console.log('✅ Users state updated with seeded data.');
          }

        } catch (seedErr) {
          console.error('Seeding failed:', seedErr);
        }
      }

    } catch (e) {
      console.error("Failed to load Supabase data", e);
    }
  };

  // Ensure Plan of Accounts is up to date (Force update for new structure)
  useEffect(() => {
    setPlanOfAccounts(INITIAL_PLAN_OF_ACCOUNTS);
  }, []);

  // Loading Logic
  useEffect(() => {
    const loadData = async () => {
      // setLoading(true); // Assuming setLoading is handled elsewhere or not needed here

      // 1. Try Local Storage first
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.clients) setClients(data.clients);
          if (data.suppliers) setSuppliers(data.suppliers);
          if (data.employees) setEmployees(data.employees);
          if (data.transactions) setTransactions(data.transactions);
          if (data.sales) setSales(data.sales);
          if (data.budgets) setBudgets(data.budgets);
          if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
          if (data.fleet) setFleet(data.fleet);
          if (data.inventory) setInventory(data.inventory);
          if (data.payroll) setPayroll(data.payroll);
          if (data.timeLogs) setTimeLogs(data.timeLogs);
          if (data.vacations) setVacations(data.vacations);
          if (data.salaryAdvances) setSalaryAdvances(data.salaryAdvances);
          if (data.tires) setTires(data.tires);
          if (data.productionOrders) setProductionOrders(data.productionOrders);
          if (data.formulas) setFormulas(data.formulas);
          if (data.productionUnits) setProductionUnits(data.productionUnits);
          if (data.users) setUsers(data.users);
          if (data.roles) setRoles(data.roles);
          if (data.settings) setSettings(data.settings);
          if (data.auditLogs) setAuditLogs(data.auditLogs);
          if (data.stockMovements) setStockMovements(data.stockMovements);
          // Force new Plan if old was detected or just override if user requests 'Update'
          // For now, we are forcing it via the useEffect above, so we don't load it from storage here to ensure the new structure takes precedence
          // setPlanOfAccounts(data.planOfAccounts || INITIAL_PLAN_OF_ACCOUNTS);
        }
      } catch (e) {
        console.error("Failed to load persistence", e);
      }

      // Load from Supabase (async)
      loadSupabaseData();
    }

    loadData(); // Call the async function
  }, []);


  // Persistence Save
  useEffect(() => {
    const data = {
      clients, suppliers, employees, transactions, sales, budgets, purchaseOrders, fleet, inventory, payroll, timeLogs, vacations, salaryAdvances, tires,
      productionOrders, formulas, productionUnits, users, roles, settings, auditLogs, accounts, planOfAccounts, stockMovements
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [clients, suppliers, employees, transactions, sales, budgets, purchaseOrders, fleet, inventory, payroll, timeLogs, vacations, salaryAdvances, tires, productionOrders, formulas, productionUnits, users, roles, settings, auditLogs, accounts, planOfAccounts, stockMovements]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('pt-BR'),
      ...logData
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Clients
  // Wrap setters to also update Supabase (Optimistic UI)
  const syncAdd = async (table: string, item: any, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    // Optimistic update
    setter(prev => [item, ...prev]);
    if (isSupabaseConfigured()) {
      try {
        await api.createItem(table, item);
      } catch (e) { console.error(`Sync add error ${table}`, e); }
    }
  };

  const syncUpdate = async (table: string, id: string, item: any, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(prev => prev.map(i => i.id === id ? item : i));
    if (isSupabaseConfigured()) {
      try {
        await api.updateItem(table, id, item);
      } catch (e) { console.error(`Sync update error ${table}`, e); }
    }
  };

  const syncDelete = async (table: string, id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(prev => prev.filter(i => i.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await api.deleteItem(table, id);
      } catch (e) { console.error(`Sync delete error ${table}`, e); }
    }
  };

  // Specific Implementations using Sync
  const addClient = (client: Client) => syncAdd('clients', client, setClients);
  const updateClient = (client: Client) => syncUpdate('clients', client.id, client, setClients);
  const deleteClient = (id: string) => syncDelete('clients', id, setClients);

  const addSupplier = (supplier: Supplier) => syncAdd('suppliers', supplier, setSuppliers);
  const updateSupplier = (supplier: Supplier) => syncUpdate('suppliers', supplier.id, supplier, setSuppliers);
  const deleteSupplier = (id: string) => syncDelete('suppliers', id, setSuppliers);

  const addEmployee = (employee: Employee) => syncAdd('employees', employee, setEmployees);
  const updateEmployee = (employee: Employee) => syncUpdate('employees', employee.id, employee, setEmployees);
  const deleteEmployee = (id: string) => syncDelete('employees', id, setEmployees);

  // ... (Manual replacements for others or generic pattern adoption)
  // For brevity in this large file rework, I will update critical ones: Users, Roles, Inventory

  const addUser = (user: User) => syncAdd('users', user, setUsers);
  const updateUser = (updated: User) => syncUpdate('users', updated.id, updated, setUsers);
  const deleteUser = (id: string) => syncDelete('users', id, setUsers);

  const addRole = (role: AppRole) => syncAdd('app_roles', role, setRoles);
  const updateRole = (updated: AppRole) => syncUpdate('app_roles', updated.id, updated, setRoles);
  const deleteRole = (id: string) => syncDelete('app_roles', id, setRoles);

  // Settings
  const updateSettings = (updated: AppSettings) => {
    setSettings(updated);
    if (isSupabaseConfigured()) api.updateSettings(updated);
  };

  // Inventory
  const addStockItem = (item: InventoryItem) => syncAdd('inventory', item, setInventory);
  const updateStockItem = (item: InventoryItem) => syncUpdate('inventory', item.id, item, setInventory);
  const deleteStockItem = (id: string) => syncDelete('inventory', id, setInventory);

  const updateStock = (itemId: string, quantityDelta: number, reason: string = 'Ajuste Manual', documentId?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, quantity: item.quantity + quantityDelta };
        if (isSupabaseConfigured()) api.updateItem('inventory', itemId, { quantity: newItem.quantity });

        // Log Movement
        const movement: StockMovement = {
          id: `mv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          itemId: item.id,
          itemName: item.name,
          type: quantityDelta >= 0 ? 'Entrada' : 'Saída',
          quantity: Math.abs(quantityDelta),
          date: new Date().toISOString(),
          reason: reason,
          documentId: documentId,
          userId: currentUser?.id,
          userName: currentUser?.name
        };
        setStockMovements(prev => [movement, ...prev]);
        if (isSupabaseConfigured()) api.createItem('stock_movements', movement);

        return newItem;
      }
      return item;
    }));
  };



  // Keep remaining simple setters for now to avoid breaking everything at once, 
  // or use the original implementations but note they are LocalStorage only until converted.

  // Original implementations below replaced by above for specific entities.
  // We need to keep the others compatible.

  const addPayroll = (record: PayrollRecord) => setPayroll(prev => [record, ...prev]); // TODO: Sync
  const payPayroll = (id: string) => {
    const p = payroll.find(r => r.id === id);
    if (!p || p.status === 'Pago') return;

    const updated: PayrollRecord = {
      ...p,
      status: 'Pago' as const,
      paidAt: new Date().toLocaleDateString('pt-BR')
    };

    // Transaction creation moved to HR.tsx to prevent duplicates and ensure correct Context
    // setTransactions - REMOVED

    setPayroll(prev => prev.map(item => item.id === id ? updated : item));

    setPayroll(prev => prev.map(item => item.id === id ? updated : item));
  };

  // Time Tracking
  const addTimeLog = (log: TimeLog) => setTimeLogs(prev => [log, ...prev]);

  // Vacations
  const addVacation = (vacation: Vacation) => {
    setVacations(prev => [vacation, ...prev]);
    // Atualizar dias disponíveis do funcionário
    if (vacation.status === 'Aprovado') {
      setEmployees(prev => prev.map(emp =>
        emp.id === vacation.employeeId
          ? { ...emp, vacationDaysAvailable: (emp.vacationDaysAvailable || 30) - vacation.days }
          : emp
      ));
    }
  };

  const updateVacationStatus = (id: string, status: Vacation['status'], approvedBy?: string) => {
    setVacations(prev => prev.map(vac => {
      if (vac.id === id) {
        const updated = { ...vac, status, approvedBy };

        // Se aprovado, deduzir dias do funcionário
        if (status === 'Aprovado' && vac.status !== 'Aprovado') {
          setEmployees(emps => emps.map(emp =>
            emp.id === vac.employeeId
              ? { ...emp, vacationDaysAvailable: (emp.vacationDaysAvailable || 30) - vac.days }
              : emp
          ));
        }

        // Se rejeitado após aprovação, devolver dias
        if (status === 'Rejeitado' && vac.status === 'Aprovado') {
          setEmployees(emps => emps.map(emp =>
            emp.id === vac.employeeId
              ? { ...emp, vacationDaysAvailable: (emp.vacationDaysAvailable || 0) + vac.days }
              : emp
          ));
        }

        return updated;
      }
      return vac;
    }));
  };

  const deleteVacation = (id: string) => {
    const vacation = vacations.find(v => v.id === id);
    if (vacation && vacation.status === 'Aprovado') {
      // Devolver dias se estava aprovado
      setEmployees(prev => prev.map(emp =>
        emp.id === vacation.employeeId
          ? { ...emp, vacationDaysAvailable: (emp.vacationDaysAvailable || 0) + vacation.days }
          : emp
      ));
    }
    setVacations(prev => prev.filter(v => v.id !== id));
  };

  // Salary Advances
  const addSalaryAdvance = (advance: SalaryAdvance) => setSalaryAdvances(prev => [advance, ...prev]);

  const updateAdvanceStatus = (id: string, status: SalaryAdvance['status'], approvedBy?: string) => {
    setSalaryAdvances(prev => prev.map(adv =>
      adv.id === id ? { ...adv, status, approvedBy } : adv
    ));
  };

  const paySalaryAdvance = (id: string) => {
    setSalaryAdvances(prev => prev.map(adv => {
      if (adv.id === id && adv.status === 'Aprovado') {
        const paidAt = new Date().toLocaleDateString('pt-BR');

        // Transaction creation moved to HR.tsx
        // setTransactions - REMOVED

        return { ...adv, status: 'Pago' as const, paidAt };
      }
      return adv;
    }));
  };

  const deleteAdvance = (id: string) => setSalaryAdvances(prev => prev.filter(adv => adv.id !== id));

  // Transactions
  // Transactions
  const updateTransactionStatus = (id: string, status: Transaction['status'], date?: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const updateData: Partial<Transaction> = { status };
        // If becoming Conciliado and date provided, update date
        if (date && status === 'Conciliado') {
          updateData.date = date;
        }

        if (isSupabaseConfigured()) {
          api.updateItem('transactions', id, updateData);
        }
        return { ...t, ...updateData };
      }
      return t;
    }));
  };

  const importTransactions = (file: any) => { alert('Importação via arquivo não implementada com Supabase ainda.'); };

  // Transactions
  const addTransaction = (t: Transaction) => {
    // Guards: Prevent duplicates based on ID
    if (transactions.some(existing => existing.id === t.id)) {
      console.warn(`Transaction ${t.id} already exists. Skipping.`);
      return;
    }
    syncAdd('transactions', t, setTransactions);
  };

  const updateTransaction = (t: Transaction) => {
    syncUpdate('transactions', t.id, t, setTransactions);
  };

  const deleteTransaction = (id: string) => syncDelete('transactions', id, setTransactions);

  // ...

  // Sales
  const addSale = (sale: Sale) => {
    // Guard: Prevent duplicate sales
    if (sales.some(s => s.id === sale.id)) return;

    setSales(prev => [sale, ...prev]);

    const numInstallments = sale.installments && sale.installments > 1 ? sale.installments : 1;

    // Helper to parse DD/MM/YYYY
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    // Helper to add days
    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result.toLocaleDateString('pt-BR');
    };

    if (numInstallments > 1) {
      const baseDate = parseDate(sale.date);
      const installmentValue = sale.amount / numInstallments;

      for (let i = 1; i <= numInstallments; i++) {
        let dueDate = addDays(baseDate, i * 30);

        // Use custom date if provided
        if (sale.installmentDueDates && sale.installmentDueDates[i - 1]) {
          const [y, m, d] = sale.installmentDueDates[i - 1].split('-');
          dueDate = `${d}/${m}/${y}`;
        }

        const installmentTx: Transaction = {
          ...sale,
          id: `${sale.id}-${i}`,
          description: `${sale.description} (${i}/${numInstallments})`,
          amount: installmentValue,
          status: 'Pendente',
          dueDate: dueDate,
          date: dueDate,
          type: 'Receita'
        };
        addTransaction(installmentTx);
      }
    } else {
      addTransaction(sale);
    }

    // Update stock only if not already processed (implicitly handled by UI flow, but good to be safe)
    sale.items.forEach(item => updateStock(item.id, -item.quantity, `Venda #${sale.id}`, sale.id));
  };

  const addBudget = (budget: Budget) => setBudgets(prev => [budget, ...prev]);
  const updateBudgetStatus = (id: string, status: Budget['status']) => setBudgets(prev => prev.map(b => b.id === id ? { ...b, status } : b));

  // Purchases
  const addPurchaseOrder = (order: PurchaseOrder) => {
    // Guard: Prevent ID duplication
    if (purchaseOrders.some(p => p.id === order.id)) return;

    const orderWithLedger = {
      ...order,
      ledgerCode: '2.02.03',
      ledgerName: 'Material de Consumo'
    };
    setPurchaseOrders(prev => [orderWithLedger, ...prev]);
    if (order.status === 'Recebido') {
      const expense: Transaction = {
        id: `exp-${order.id}`,
        date: order.date,
        description: `Compra: ${order.supplierName}`,
        category: 'Insumos',
        amount: order.total,
        account: order.accountId || 'Caixa',
        accountId: order.accountId || '',
        type: 'Despesa',
        status: 'Pendente',
        ledgerCode: '2.02.03',
        ledgerName: 'Material de Consumo'
      };
      addTransaction(expense);
      order.items.forEach(item => updateStock(item.id, item.quantity, `Compra PO #${order.id}`, order.id));
    }
  };

  const updatePurchaseOrder = (order: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(o => o.id === order.id ? order : o));
    if (isSupabaseConfigured()) api.updateItem('purchase_orders', order.id, order);
  };

  const receivePurchaseOrder = (id: string) => {
    setPurchaseOrders(prev => prev.map(order => {
      // Guard: Strictly check status to prevent double receiving
      if (order.id === id && order.status !== 'Recebido') {
        const receivedDate = new Date().toLocaleDateString('pt-BR');

        // Prevent duplicate transaction if somehow button clicked twice
        const expenseId = `exp-${order.id}`;
        if (transactions.some(t => t.id === expenseId)) return order;

        const updated: PurchaseOrder = {
          ...order,
          status: 'Recebido' as const,
          receivedAt: receivedDate,
          ledgerCode: '2.02.03',
          ledgerName: 'Material de Consumo'
        };

        // Fallback for Account
        const targetAccountId = order.targetAccountId || 'acc-1';
        const targetAccountName = accounts.find(a => a.id === targetAccountId)?.name || 'Caixa Geral';

        const expense: Transaction = {
          id: expenseId,
          date: receivedDate,
          description: `Compra PO #${order.id}: ${order.supplierName}`,
          category: 'Insumos',
          amount: order.total,
          account: targetAccountName,
          accountId: targetAccountId,
          type: 'Despesa',
          status: 'Pendente',
          ledgerCode: '2.02.03',
          ledgerName: 'Material de Consumo'
        };
        addTransaction(expense);

        // Critical: Update Stock with cost price awareness if needed (future improvement: Weighted Average Cost)
        order.items.forEach(item => updateStock(item.id, item.quantity, `Compra PO #${order.id}`, order.id));

        return updated;
      }
      return order;
    }));
  };

  // Vehicles
  const addVehicle = (vehicle: FleetVehicle) => setFleet(prev => [vehicle, ...prev]);
  const updateVehicle = (updatedVehicle: FleetVehicle) => setFleet(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  const updateVehicleStatus = (id: string, status: FleetVehicle['status']) => setFleet(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  const deleteVehicle = (id: string) => setFleet(prev => prev.filter(v => v.id !== id));

  const addMaintenanceRecord = (vehicleId: string, record: MaintenanceRecord) => {
    const vehicle = fleet.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const ledgerCode = record.ledgerCode || '2.02.02';
    const ledgerName = record.ledgerName || 'Manutenção de Frota';

    const recordWithLedger: MaintenanceRecord = {
      ...record,
      ledgerCode,
      ledgerName
    };

    const debitAccount = accounts.find(a => a.id === record.debitAccountId);
    const expense: Transaction = {
      id: `maint-${record.id}`,
      date: record.date,
      description: `Manutenção: ${vehicle.plate} - ${record.description}`,
      category: 'Manutenção',
      account: debitAccount?.name || 'Caixa',
      accountId: debitAccount?.id || '',
      amount: record.cost,
      status: 'Conciliado',
      type: 'Despesa',
      ledgerCode,
      ledgerName
    };
    addTransaction(expense);

    // Deduct stock if product is used
    if (record.productId && record.productQuantity) {
      updateStock(record.productId, -record.productQuantity);
    }

    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: [recordWithLedger, ...(v.maintenanceHistory || [])],
          km: Math.max(v.km, record.km),
          lastMaintenance: record.date
        };
      }
      return v;
    }));
  };

  const deleteMaintenanceRecord = (vehicleId: string, recordId: string) => {
    const vehicle = fleet.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const recordToDelete = vehicle.maintenanceHistory?.find(r => r.id === recordId);
    if (recordToDelete) {
      if (recordToDelete.productId && recordToDelete.productQuantity) {
        updateStock(recordToDelete.productId, recordToDelete.productQuantity);
      }
      // Remove transaction
      // We can use deleteTransaction but need to ensure it handles the ID format or we manually filter
      // The ID used in add was `maint-${record.id}`
      setTransactions(txs => txs.filter(t => t.id !== `maint-${recordId}`));
    }

    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: v.maintenanceHistory?.filter(r => r.id !== recordId) || []
        };
      }
      return v;
    }));
  };

  const addFuelLog = (vehicleId: string, log: FuelLog) => {
    const vehicle = fleet.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const ledgerCode = log.ledgerCode || '2.02.01';
    const ledgerName = log.ledgerName || 'Combustível';

    const logWithLedger: FuelLog = {
      ...log,
      ledgerCode,
      ledgerName
    };

    const expense: Transaction = {
      id: `fuel-${log.id}`,
      date: log.date,
      description: `Abastecimento: ${vehicle.plate} - ${log.liters}L`,
      category: 'Combustível',
      account: 'Cofre',
      accountId: '',
      amount: log.cost,
      status: 'Conciliado',
      type: 'Despesa',
      ledgerCode,
      ledgerName
    };

    addTransaction(expense);

    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          fuelLogs: [logWithLedger, ...(v.fuelLogs || [])],
          km: Math.max(v.km, log.km)
        };
      }
      return v;
    }));
  };

  const deleteFuelLog = (vehicleId: string, logId: string) => {
    setTransactions(txs => txs.filter(t => t.id !== `fuel-${logId}`));

    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          fuelLogs: v.fuelLogs?.filter(l => l.id !== logId) || []
        };
      }
      return v;
    }));
  };

  // Tires
  const addTire = (tire: Tire) => setTires(prev => [tire, ...prev]);
  const updateTire = (updatedTire: Tire) => setTires(prev => prev.map(t => t.id === updatedTire.id ? updatedTire : t));
  const deleteTire = (id: string) => setTires(prev => prev.filter(t => t.id !== id));
  const addTireHistory = (tireId: string, entry: TireHistory) => {
    setTires(prev => prev.map(t => {
      if (t.id === tireId) {
        const updated = {
          ...t,
          history: [entry, ...t.history],
          currentKm: Math.max(t.currentKm, entry.km)
        };

        if (entry.type === 'Retirada') {
          updated.status = 'Estoque';
          updated.currentVehicleId = undefined;
          updated.position = undefined;
        } else if (entry.type === 'Instalação' || entry.type === 'Rodízio') {
          updated.status = 'Em uso';
          updated.currentVehicleId = entry.vehicleId;
          updated.position = entry.position;
          if (entry.type === 'Instalação') updated.installKm = entry.km;
        } else if (entry.type === 'Recapagem') {
          updated.status = 'Novo'; // Becomes "Novo" (Recapado)
          updated.recapCount += 1;
        }

        return updated;
      }
      return t;
    }));
  };

  const deleteTireHistory = (tireId: string, historyId: string) => {
    setTires(prev => prev.map(t => {
      if (t.id === tireId) {
        return {
          ...t,
          history: t.history.filter(h => h.id !== historyId)
        };
      }
      return t;
    }));
  };

  // Production
  const addProductionOrder = (order: ProductionOrder) => syncAdd('production_orders', order, setProductionOrders);
  const updateProductionOrder = (order: ProductionOrder) => syncUpdate('production_orders', order.id, order, setProductionOrders);
  const deleteProductionOrder = (id: string) => syncDelete('production_orders', id, setProductionOrders);

  const addFormula = (formula: ProductionFormula) => syncAdd('production_formulas', formula, setFormulas);
  const updateFormula = (formula: ProductionFormula) => syncUpdate('production_formulas', formula.id, formula, setFormulas);
  const deleteFormula = (id: string) => syncDelete('production_formulas', id, setFormulas);

  const addProductionUnit = (unit: ProductionUnit) => syncAdd('production_units', unit, setProductionUnits);
  const updateProductionUnit = (unit: ProductionUnit) => syncUpdate('production_units', unit.id, unit, setProductionUnits);
  const deleteProductionUnit = (id: string) => syncDelete('production_units', id, setProductionUnits);

  const startProduction = (id: string) => {
    setProductionOrders(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, status: 'Em Produção' as const, progress: 10 };
        if (isSupabaseConfigured()) api.updateItem('production_orders', id, { status: 'Em Produção', progress: 10 });

        // Deduct inventory if not deducted
        if (!o.rawMaterialsDeducted) {
          const formula = formulas.find(f => f.id === o.formulaId);
          if (formula) {
            if (formula.type === 'Britagem') {
              // Britagem: Deduct Main Input (Ingredient 0)
              const input = formula.ingredients?.[0];
              if (input && input.productId) {
                updateStock(input.productId, -(o.quantity), `Produção OP #${o.orderNumber}`, o.id);
              }
            } else {
              // Composicao: Deduct all ingredients
              formula.ingredients.forEach(ing => {
                updateStock(ing.productId, -(ing.qty * o.quantity), `Produção OP #${o.orderNumber}`, o.id);
              });
            }

            updated.rawMaterialsDeducted = true;
            if (isSupabaseConfigured()) api.updateItem('production_orders', id, { rawMaterialsDeducted: true });
          }
        }
        return updated;
      }
      return o;
    }));
  };

  const completeProduction = (id: string) => {
    setProductionOrders(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, status: 'Finalizado' as const, progress: 100 };
        if (isSupabaseConfigured()) api.updateItem('production_orders', id, { status: 'Finalizado', progress: 100 });

        const formula = formulas.find(f => f.id === o.formulaId);

        if (formula?.type === 'Britagem') {
          // Britagem: Add multiple outputs based on percentage
          if (formula.outputs) {
            formula.outputs.forEach(out => {
              // Qty = Order Quantity * (Percentage / 100)
              const yieldQty = o.quantity * (out.percentage / 100);
              updateStock(out.productId, yieldQty, `Produção OP #${o.orderNumber}`, o.id);
            });
          }
        } else {
          // Standard: Add single product
          if (o.productId) {
            updateStock(o.productId, o.quantity, `Produção OP #${o.orderNumber}`, o.id);
          }
        }
        return updated;
      }
      return o;
    }));
  };

  const addQualityTest = (orderId: string, test: QualityTest) => {
    setProductionOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, qualityTests: [test, ...(o.qualityTests || [])] };
      }
      return o;
    }));
  };

  // Settings & User Management replaced above
  // const addUser = ... 
  // const updateSettings ...

  // Remaining unmodified implementations...

  // Financial Accounts and Plan of Accounts
  const addAccount = (acc: any) => syncAdd('financial_accounts', acc, setAccounts);
  const deleteAccount = (id: string) => syncDelete('financial_accounts', id, setAccounts);

  const addPlanAccount = (parentId: string | null, name: string, type: 'Receita' | 'Despesa' = 'Despesa') => {
    setPlanOfAccounts(prev => {
      if (!parentId) {
        // Add new Group
        const newId = Date.now().toString(); // Use timestamp for unique ID to avoid collision
        // Determine code base
        const nextCode = (prev.length + 1).toString() + ".01";
        return [...prev, {
          id: newId,
          code: nextCode,
          name,
          type,
          children: []
        }];
      }
      return prev.map(group => {
        if (group.id === parentId) {
          return {
            ...group,
            children: [...(group.children || []), {
              id: Date.now().toString(),
              code: `${group.code}.${(group.children?.length || 0) + 1}`,
              name,
              type: group.type
            }]
          };
        }
        return group;
      });
    });
  };

  const deletePlanAccount = (id: string, parentId?: string | null) => {
    setPlanOfAccounts(prev => {
      if (!parentId) {
        return prev.filter(g => g.id !== id);
      }
      return prev.map(group => {
        if (group.id === parentId) {
          return { ...group, children: group.children?.filter(c => c.id !== id) };
        }
        return group;
      });
    });
  };

  const updatePlanAccount = (id: string, name: string, parentId?: string | null) => {
    setPlanOfAccounts(prev => {
      if (!parentId) {
        return prev.map(g => g.id === id ? { ...g, name } : g);
      }
      return prev.map(group => {
        if (group.id === parentId) {
          return {
            ...group,
            children: group.children?.map(c => c.id === id ? { ...c, name } : c)
          };
        }
        return group;
      });
    });
  };

  // Dynamic Account Balance Calculation
  const calculatedAccounts = useMemo(() => {
    return accounts.map(acc => {
      // Create a unified matcher for Account ID or Name (Legacy support)
      const accTxs = transactions.filter(t =>
        t.status === 'Conciliado' &&
        (t.accountId === acc.id || t.account === acc.name)
      );

      const totalIncome = accTxs
        .filter(t => t.type === 'Receita')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = accTxs
        .filter(t => t.type === 'Despesa')
        .reduce((sum, t) => sum + t.amount, 0);

      // We maintain the 'balance' property in the state as the "Initial Balance"
      // The displayed balance is Initial + Revenue - Expenses
      // If 'initialBalance' doesn't exist (legacy data), we treat the stored 'balance' as initial.
      const startBalance = acc.initialBalance !== undefined ? acc.initialBalance : (acc.balance || 0);

      return {
        ...acc,
        balance: startBalance + totalIncome - totalExpense,
        initialBalance: startBalance // Ensure this persists
      };
    });
  }, [accounts, transactions]);

  const financials = useMemo(() => {
    // 1. Real Balance (Cash on Hand) - CAIXA REAL
    // Only 'Conciliado' transactions affect the actual money the company has.
    const realizedRevenue = transactions
      .filter(t => t.type === 'Receita' && t.status === 'Conciliado')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const realizedExpenses = transactions
      .filter(t => t.type === 'Despesa' && t.status === 'Conciliado')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Initial Balances of all accounts (Starting Capital)
    const totalInitialBalance = accounts.reduce((sum, acc) => sum + (acc.initialBalance !== undefined ? acc.initialBalance : (acc.balance || 0)), 0);

    // 2. Projected Balance (Forecast) - COMPETÊNCIA / PREVISÃO
    // Includes everything not cancelled.
    const projectedRevenue = transactions
      .filter(t => t.type === 'Receita' && t.status !== 'Cancelado')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const projectedExpenses = transactions
      .filter(t => t.type === 'Despesa' && t.status !== 'Cancelado')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalRevenue: realizedRevenue,
      totalExpenses: realizedExpenses,
      balance: totalInitialBalance + realizedRevenue - realizedExpenses, // Real Cash Flow

      // New Indicators for Dashboard
      projectedBalance: totalInitialBalance + projectedRevenue - projectedExpenses,
      receivables: projectedRevenue - realizedRevenue, // To Collect
      payables: projectedExpenses - realizedExpenses,  // To Pay

      recentTransactions: transactions.slice(0, 10)
    };
  }, [transactions, accounts]);

  const seedDatabase = (data: any) => {
    if (data.settings) setSettings(data.settings);
    if (data.employees) setEmployees(data.employees);
    if (data.clients) setClients(data.clients);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.inventory) setInventory(data.inventory);
    if (data.fleet) setFleet(data.fleet);
    if (data.transactions) setTransactions(data.transactions);
    if (data.sales) setSales(data.sales);
    if (data.budgets) setBudgets(data.budgets);
    if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
    if (data.stockMovements) setStockMovements(data.stockMovements);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    if (data.productionOrders) setProductionOrders(data.productionOrders);
    if (data.formulas) setFormulas(data.formulas);
    if (data.productionUnits) setProductionUnits(data.productionUnits);
    // For fuelLogs/maintenance, they are nested in fleet, so setFleet handles it.
  };

  return (
    <AppContext.Provider value={{
      clients, suppliers, employees, transactions, sales, budgets, purchaseOrders, fleet, inventory, payroll, timeLogs, vacations, salaryAdvances, tires,
      productionOrders, formulas, productionUnits, users, roles, settings, auditLogs, stockMovements,
      accounts: calculatedAccounts, // Use the dynamically calculated accounts
      planOfAccounts,
      currentUser, login, logout, hasPermission,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addEmployee, updateEmployee, deleteEmployee,
      addPayroll, payPayroll, addTimeLog,
      addVacation, updateVacationStatus, deleteVacation,
      addSalaryAdvance, updateAdvanceStatus, paySalaryAdvance, deleteAdvance,
      addTransaction, updateTransaction, updateTransactionStatus, deleteTransaction, importTransactions, addSale, addBudget, updateBudgetStatus,
      addPurchaseOrder, updatePurchaseOrder, receivePurchaseOrder,
      addStockItem, updateStock, updateStockItem, deleteStockItem,
      addVehicle, updateVehicle, updateVehicleStatus, deleteVehicle,
      addMaintenanceRecord, deleteMaintenanceRecord, addFuelLog, deleteFuelLog,
      addTire, updateTire, deleteTire, addTireHistory, deleteTireHistory,
      addProductionOrder, updateProductionOrder, deleteProductionOrder,
      startProduction, completeProduction, addFormula, updateFormula, deleteFormula, addQualityTest,
      addProductionUnit, updateProductionUnit, deleteProductionUnit,
      addUser, updateUser, deleteUser, addRole, updateRole, deleteRole, updateSettings,
      addAccount, deleteAccount, addPlanAccount, deletePlanAccount, updatePlanAccount,
      clearAllData, addAuditLog, seedDatabase, financials
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
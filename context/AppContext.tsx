import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import * as api from '../src/services/api';
import {
  Client, Transaction, FleetVehicle, Sale, InventoryItem, Budget, Supplier,
  Employee, PurchaseOrder, MaintenanceRecord, FuelLog, PayrollRecord, TimeLog, Tire, TireHistory,
  ProductionOrder, ProductionFormula, QualityTest, ProductionUnit, User, AppRole, AppSettings, AuditLog,
  Vacation, SalaryAdvance
} from '../types';
import { MOCK_CLIENTS, MOCK_TRANSACTIONS, MOCK_FLEET } from '../constants';

// Initial Mock Inventory
const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'p1', name: 'Cimento Portland CP-II', category: 'Cimento', quantity: 450, minStock: 100, price: 32.90, unit: 'sc', color: 'bg-gray-200 text-gray-600' },
  { id: 'p2', name: 'Areia Média Lavada', category: 'Agregados', quantity: 1200, minStock: 200, price: 120.00, unit: 'm³', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'p3', name: 'Brita 1', category: 'Agregados', quantity: 800, minStock: 150, price: 145.00, unit: 'm³', color: 'bg-stone-200 text-stone-600' },
  { id: 'p4', name: 'Bloco de Concreto 14x19x39', category: 'Alvenaria', quantity: 15000, minStock: 2000, price: 3.80, unit: 'un', color: 'bg-zinc-200 text-zinc-600' },
  { id: 'p5', name: 'Argamassa AC-III', category: 'Argamassas', quantity: 300, minStock: 50, price: 42.50, unit: 'sc', color: 'bg-orange-100 text-orange-600' },
  { id: 'p6', name: 'Vergalhão CA-50 10mm', category: 'Ferragem', quantity: 500, minStock: 100, price: 48.90, unit: 'br', color: 'bg-slate-200 text-slate-600' },
  { id: 'p7', name: 'Tijolo Cerâmico 6 Furos', category: 'Alvenaria', quantity: 8000, minStock: 1000, price: 1.25, unit: 'un', color: 'bg-red-100 text-red-600' },
  { id: 'p8', name: 'Cal Hidratada', category: 'Aditivos', quantity: 120, minStock: 30, price: 18.90, unit: 'sc', color: 'bg-white border border-gray-200 text-gray-500' },
  { id: 'p9', name: 'CBUQ Faixa C', category: 'Asfalto', quantity: 50, minStock: 20, price: 380.00, unit: 'ton', color: 'bg-gray-900 text-gray-300' },
  { id: 'p10', name: 'Concreto FCK 30', category: 'Concreto', quantity: 0, minStock: 0, price: 450.00, unit: 'm³', color: 'bg-gray-400 text-white' },
];

const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b1',
    clientId: '2',
    clientName: 'Construtora Horizonte',
    date: new Date().toLocaleDateString('pt-BR'),
    items: [{ id: 'p3', name: 'Brita 1', detail: 'Agregados', quantity: 50, unit: 'm³', price: 145.00 }],
    subtotal: 7250,
    discount: 250,
    total: 7000,
    status: 'Aberto',
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
  }
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Votorantim Cimentos S.A.', tradeName: 'Votorantim', category: 'Materiais Básicos', document: '00.123.456/0001-00', email: 'vendas@votorantim.com', phone: '(11) 3333-4444', status: 'Ativo', registeredAt: '10/01/2023', initials: 'VC' },
  { id: 's2', name: 'Gerdau Aços Longos S.A.', tradeName: 'Gerdau', category: 'Ferragem', document: '11.222.333/0001-99', email: 'comercial@gerdau.com.br', phone: '(51) 3323-2000', status: 'Ativo', registeredAt: '15/02/2023', initials: 'GE' },
  { id: 's3', name: 'Pedreira São Jorge Ltda', tradeName: 'Pedreira SJ', category: 'Agregados', document: '22.333.444/0001-88', email: 'contato@pedreirasj.com.br', phone: '(31) 3444-5555', status: 'Ativo', registeredAt: '20/03/2023', initials: 'PS' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Carlos Mendes', role: 'Gerente de Projetos', department: 'Engenharia', status: 'Ativo', admissionDate: '15/03/2022', salary: 8500.00, email: 'carlos.m@infracore.com', phone: '(11) 98888-1111' },
  { id: '2', name: 'Ana Silva', role: 'Analista Financeiro', department: 'Financeiro', status: 'Ativo', admissionDate: '02/05/2023', salary: 4200.00, email: 'ana.s@infracore.com', phone: '(11) 98888-2222' },
  { id: '3', name: 'Roberto Santos', role: 'Mestre de Obras', department: 'Operações', status: 'Férias', admissionDate: '10/01/2021', salary: 5600.00, email: 'roberto.s@infracore.com', phone: '(11) 98888-3333' },
  { id: '4', name: 'Julia Oliveira', role: 'RH Generalista', department: 'Recursos Humanos', status: 'Ativo', admissionDate: '20/08/2023', salary: 3800.00, email: 'julia.o@infracore.com', phone: '(11) 98888-4444' },
  { id: '5', name: 'Pedro Costa', role: 'Motorista', department: 'Logística', status: 'Afastado', admissionDate: '12/11/2022', salary: 2800.00, email: 'pedro.c@infracore.com', phone: '(11) 98888-5555' },
];

const INITIAL_TIRES: Tire[] = [
  {
    id: 't1',
    serialNumber: 'PN-MI-001',
    brand: 'Michelin',
    model: 'X Multi Z',
    size: '295/80 R22.5',
    status: 'Em uso',
    currentVehicleId: 'v1',
    position: 'DI',
    currentKm: 45000,
    maxKm: 120000,
    recapCount: 0,
    history: []
  },
  {
    id: 't2',
    serialNumber: 'PN-MI-002',
    brand: 'Michelin',
    model: 'X Multi Z',
    size: '295/80 R22.5',
    status: 'Em uso',
    currentVehicleId: 'v1',
    position: 'DD',
    currentKm: 45000,
    maxKm: 120000,
    recapCount: 0,
    history: []
  },
  {
    id: 't3',
    serialNumber: 'PN-GO-001',
    brand: 'Goodyear',
    model: 'KMAX S',
    size: '295/80 R22.5',
    status: 'Estoque',
    currentKm: 0,
    maxKm: 100000,
    recapCount: 1,
    history: [{ id: 'h1', date: '01/10/2023', type: 'Recapagem', km: 85000, notes: 'Primeira recapagem concluída' }]
  },
];

const INITIAL_FORMULAS: ProductionFormula[] = [
  {
    id: 'f1',
    name: 'Concreto FCK 30',
    category: 'Concreto',
    outputProductId: 'p10',
    ingredients: [
      { productId: 'p1', name: 'Cimento Portland CP-II', qty: 7, unit: 'sc' }, // 350kg approx
      { productId: 'p2', name: 'Areia Média Lavada', qty: 0.6, unit: 'm³' },
      { productId: 'p3', name: 'Brita 1', qty: 0.8, unit: 'm³' }
    ]
  },
  {
    id: 'f2',
    name: 'Asfalto CBUQ Faixa C',
    category: 'Asfalto',
    outputProductId: 'p9',
    ingredients: [
      { productId: 'p2', name: 'Areia Média Lavada', qty: 0.3, unit: 'm³' },
      { productId: 'p3', name: 'Brita 1', qty: 0.4, unit: 'm³' }
    ]
  },
];

const INITIAL_PRODUCTION_UNITS: ProductionUnit[] = [
  { id: 'u1', name: 'Planta Britagem 1', type: 'Britagem', status: 'Operando', capacity: '120 ton/h', currentLoad: 85, temp: 42, power: '850 kW' },
  { id: 'u2', name: 'Planta Britagem 2', type: 'Britagem', status: 'Manutenção', capacity: '150 ton/h', currentLoad: 0, temp: 22, power: '0 kW' },
  { id: 'u3', name: 'Usina de Asfalto', type: 'Asfalto', status: 'Operando', capacity: '80 ton/h', currentLoad: 60, temp: 165, power: '420 kW' },
  { id: 'u4', name: 'Usina de Concreto', type: 'Concreto', status: 'Operando', capacity: '60 m³/h', currentLoad: 45, temp: 28, power: '150 kW' },
];

const INITIAL_ROLES: AppRole[] = [
  { id: 'admin', name: 'Administrador', description: 'Acesso total ao sistema', permissions: ['all'] },
  { id: 'manager', name: 'Gerente', description: 'Gestão de módulos operacionais', permissions: ['sales.view', 'sales.create', 'purchases.view', 'inventory.view'] },
  { id: 'operator', name: 'Operador', description: 'Operação de campo e produção', permissions: ['production.view', 'fleet.view'] },
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin Construsys', email: 'admin@construsys.com', roleId: 'admin', status: 'Ativo', registeredAt: '01/01/2023' },
  { id: '2', name: 'Gerência Vendas', email: 'vendas@construsys.com', roleId: 'manager', status: 'Ativo', registeredAt: '15/05/2023' },
];

const INITIAL_SETTINGS: AppSettings = {
  companyName: 'Construsys Engenharia Ltda',
  tradeName: 'Construsys ERP',
  document: '12.345.678/0001-99',
  email: 'contato@construsys.com',
  phone: '(11) 4002-8922',
  address: 'Rua da Tecnologia, 100 - Industrial, SP',
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
  }
};

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: '1', userId: '1', userName: 'Admin Construsys', action: 'Alteração de Permissão', module: 'Segurança', details: 'Alterou permissões do grupo Operador', timestamp: '23/12/2025 09:15', severity: 'warning' },
  { id: '2', userId: '1', userName: 'Admin Construsys', action: 'Login no Sistema', module: 'Acesso', details: 'Acesso realizado via IP 192.168.0.1', timestamp: '23/12/2025 08:00', severity: 'info' },
  { id: '3', userId: '2', userName: 'Gerência Vendas', action: 'Exclusão de Registro', module: 'Vendas', details: 'Excluiu o orçamento B-20230510', timestamp: '22/12/2025 17:30', severity: 'critical' },
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
  login: (email: string) => Promise<boolean>;
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
  updateTransactionStatus: (id: string, status: Transaction['status'], date?: string) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (file: any) => void;
  addSale: (sale: Sale) => void;
  addBudget: (budget: Budget) => void;
  updateBudgetStatus: (id: string, status: Budget['status']) => void;

  addPurchaseOrder: (order: PurchaseOrder) => void;
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
  updateStock: (itemId: string, quantityDelta: number) => void;
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
  addPlanAccount: (parentId: string, name: string) => void; // Added
  deletePlanAccount: (parentId: string, id: string) => void; // Added
  updatePlanAccount: (gIndex: number, cIndex: number | null, name: string) => void; // Added

  clearAllData: () => void;

  financials: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
    recentTransactions: Transaction[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'infracore_erp_data';

const INITIAL_ACCOUNTS = [
  { id: 'acc-1', name: 'Banco do Brasil', type: 'Conta Corrente', balance: 142000, color: 'bg-blue-600', code: '0041 / 44021-X' },
  { id: 'acc-2', name: 'Bradesco PJ', type: 'Conta Corrente', balance: 340000, color: 'bg-red-600', code: '1290 / 00921-2' },
  { id: 'acc-3', name: 'NuBank PJ', type: 'Investimento', balance: 250000, color: 'bg-purple-600', code: 'Reserva 100% CDI' },
  { id: 'acc-4', name: 'Caixa Interno', type: 'Espécie', balance: 12450, color: 'bg-teal-600', code: 'Dinheiro em Mãos' },
];

const INITIAL_PLAN_OF_ACCOUNTS = [
  {
    id: '1', code: '1.01', name: 'Receita Operacional', type: 'Receita', children: [
      { id: '11', code: '1.01.01', name: 'Venda de Mercadorias' },
      { id: '12', code: '1.01.02', name: 'Prestação de Serviços' },
    ]
  },
  {
    id: '2', code: '2.01', name: 'Despesas Administrativas', type: 'Despesa', children: [
      { id: '21', code: '2.01.01', name: 'Salários e Ordenados' },
      { id: '22', code: '2.01.02', name: 'Aluguel' },
      { id: '23', code: '2.01.03', name: 'Energia Elétrica' },
    ]
  },
  {
    id: '3', code: '2.02', name: 'Despesas Operacionais', type: 'Despesa', children: [
      { id: '31', code: '2.02.01', name: 'Combustível' },
      { id: '32', code: '2.02.02', name: 'Manutenção de Frota' },
      { id: '33', code: '2.02.03', name: 'Material de Consumo' },
    ]
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>(MOCK_FLEET);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
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


  const login = async (email: string) => {
    const user = users.find(u => u.email === email && u.status === 'Ativo');
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
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
        cl, su, emp, inv, tr, fl, ti, us, ro, set, sa, po, pro, prf, pru, fac, pay
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

      // If 'users' table is empty (first load), we might want to keep the initial mock admin in state
      // or rely on the seed from SQL.

    } catch (e) {
      console.error("Failed to load Supabase data", e);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only load from localStorage if Supabase is NOT configured or offline logic
        // For now, load local first, then overwrite with Supabase if available
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
      } catch (e) {
        console.error("Failed to load persistence", e);
      }
    }

    // Load from Supabase (async)
    loadSupabaseData();

  }, []);


  // Persistence Save
  useEffect(() => {
    const data = {
      clients, suppliers, employees, transactions, sales, budgets, purchaseOrders, fleet, inventory, payroll, timeLogs, vacations, salaryAdvances, tires,
      productionOrders, formulas, productionUnits, users, roles, settings, auditLogs, accounts, planOfAccounts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [clients, suppliers, employees, transactions, sales, budgets, purchaseOrders, fleet, inventory, payroll, timeLogs, vacations, salaryAdvances, tires, productionOrders, formulas, productionUnits, users, roles, settings, auditLogs, accounts, planOfAccounts]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

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

  const updateStock = (itemId: string, quantityDelta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, quantity: item.quantity + quantityDelta };
        if (isSupabaseConfigured()) api.updateItem('inventory', itemId, { quantity: newItem.quantity }); // Patch
        return newItem;
      }
      return item;
    }));
  };

  // Transactions
  const addTransaction = (t: Transaction) => syncAdd('transactions', t, setTransactions);
  const deleteTransaction = (id: string) => syncDelete('transactions', id, setTransactions);


  // Keep remaining simple setters for now to avoid breaking everything at once, 
  // or use the original implementations but note they are LocalStorage only until converted.

  // Original implementations below replaced by above for specific entities.
  // We need to keep the others compatible.

  const addPayroll = (record: PayrollRecord) => setPayroll(prev => [record, ...prev]); // TODO: Sync
  const payPayroll = (id: string) => {
    setPayroll(prev => prev.map(p => {
      if (p.id === id && p.status !== 'Pago') {
        const updated: PayrollRecord = {
          ...p,
          status: 'Pago' as const,
          paidAt: new Date().toLocaleDateString('pt-BR')
        };
        const expense: Transaction = {
          id: `pay-${p.id}`,
          date: updated.paidAt || new Date().toLocaleDateString('pt-BR'),
          description: `Pagamento Salário: ${p.employeeName} - ${p.month}`,
          category: 'Folha de Pagamento',
          account: 'Banco do Brasil',
          amount: p.totalNet,
          status: 'Conciliado',
          type: 'Despesa',
          ledgerCode: '2.01.01',
          ledgerName: 'Salários e Ordenados',
          accountId: ''
        };
        // Use a functional update to avoid indirect issues
        setTransactions(txs => [expense, ...txs]);
        return updated;
      }
      return p;
    }));
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

        // Criar transação financeira
        const expense: Transaction = {
          id: `adv-${adv.id}`,
          date: paidAt,
          description: `Antecipação Salarial: ${adv.employeeName}`,
          category: 'Adiantamento',
          account: 'Banco do Brasil',
          accountId: '',
          amount: adv.amount,
          status: 'Conciliado',
          type: 'Despesa',
          ledgerCode: '2.01.01',
          ledgerName: 'Salários e Ordenados'
        };

        setTransactions(txs => [expense, ...txs]);

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

  // Sales
  const addSale = (sale: Sale) => {
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
        // Default logic: 30 days gap for each installment
        const dueDate = addDays(baseDate, i * 30);

        const installmentTx: Transaction = {
          ...sale,
          id: `${sale.id}-${i}`,
          description: `${sale.description} (${i}/${numInstallments})`,
          amount: installmentValue,
          status: 'Pendente',
          dueDate: dueDate,
          date: dueDate, // Show in future on Cash Flow
          type: 'Receita'
        };
        addTransaction(installmentTx);
      }
    } else {
      // Single Transaction
      addTransaction(sale);
    }

    sale.items.forEach(item => updateStock(item.id, -item.quantity));
  };
  const addBudget = (budget: Budget) => setBudgets(prev => [budget, ...prev]);
  const updateBudgetStatus = (id: string, status: Budget['status']) => setBudgets(prev => prev.map(b => b.id === id ? { ...b, status } : b));

  // Purchases
  const addPurchaseOrder = (order: PurchaseOrder) => {
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
      order.items.forEach(item => updateStock(item.id, item.quantity));
    }
  };

  const receivePurchaseOrder = (id: string) => {
    setPurchaseOrders(prev => prev.map(order => {
      if (order.id === id && order.status !== 'Recebido') {
        const receivedDate = new Date().toLocaleDateString('pt-BR');
        const updated: PurchaseOrder = {
          ...order,
          status: 'Recebido' as const,
          receivedAt: receivedDate,
          ledgerCode: '2.02.03',
          ledgerName: 'Material de Consumo'
        };
        const expense: Transaction = {
          id: `exp-${order.id}`,
          date: receivedDate,
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
        order.items.forEach(item => updateStock(item.id, item.quantity));
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
    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const ledgerCode = record.ledgerCode || '2.02.02';
        const ledgerName = record.ledgerName || 'Manutenção de Frota';

        const recordWithLedger: MaintenanceRecord = {
          ...record,
          ledgerCode,
          ledgerName
        };

        const expense: Transaction = {
          id: `maint-${record.id}`,
          date: record.date,
          description: `Manutenção: ${v.plate} - ${record.description}`,
          category: 'Manutenção',
          account: 'Banco do Brasil',
          accountId: '',
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
    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const recordToDelete = v.maintenanceHistory?.find(r => r.id === recordId);
        if (recordToDelete?.productId && recordToDelete?.productQuantity) {
          updateStock(recordToDelete.productId, recordToDelete.productQuantity);
        }
        setTransactions(txs => txs.filter(t => t.id !== `maint-${recordId}`));
        return {
          ...v,
          maintenanceHistory: v.maintenanceHistory?.filter(r => r.id !== recordId) || []
        };
      }
      return v;
    }));
  };

  const addFuelLog = (vehicleId: string, log: FuelLog) => {
    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
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
          description: `Abastecimento: ${v.plate} - ${log.liters}L`,
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
    setFleet(prev => prev.map(v => {
      if (v.id === vehicleId) {
        setTransactions(txs => txs.filter(t => t.id !== `fuel-${logId}`));
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
    // Logic to start and deduct items is complex, usually handled by checking order and inventory. 
    // For now we just update status and let UI handle logic or 'rawMaterialsDeducted'.
    // But we should likely deduct inventory here if not done.
    setProductionOrders(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, status: 'Em Produção' as const, progress: 10 };
        if (isSupabaseConfigured()) api.updateItem('production_orders', id, { status: 'Em Produção', progress: 10 });

        // Deduct inventory if not deducted
        if (!o.rawMaterialsDeducted) {
          const formula = formulas.find(f => f.id === o.formulaId);
          if (formula) {
            formula.ingredients.forEach(ing => {
              updateStock(ing.productId, -(ing.qty * o.quantity));
            });
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

        // Add finished product to inventory
        // If productId exists
        if (o.productId) {
          updateStock(o.productId, o.quantity);
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

  const addPlanAccount = (parentId: string, name: string) => { // Added
    setPlanOfAccounts(prev => prev.map(group => {
      if (group.id === parentId) {
        return {
          ...group,
          children: [...(group.children || []), {
            id: Date.now().toString(),
            code: `${group.code}.${(group.children?.length || 0) + 1}`.padEnd(7, '0'),
            name
          }]
        };
      }
      return group;
    }));
  };

  const deletePlanAccount = (parentId: string, id: string) => { // Added
    setPlanOfAccounts(prev => prev.map(group => {
      if (group.id === parentId) {
        return { ...group, children: group.children?.filter(c => c.id !== id) };
      }
      return group;
    }));
  };

  const updatePlanAccount = (gIndex: number, cIndex: number | null, name: string) => { // Added
    setPlanOfAccounts(prev => {
      const newPlan = [...prev];
      if (cIndex === null) {
        newPlan[gIndex] = { ...newPlan[gIndex], name };
      } else if (newPlan[gIndex].children) {
        newPlan[gIndex].children = newPlan[gIndex].children.map((child: any, idx: number) =>
          idx === cIndex ? { ...child, name } : child
        );
      }
      return newPlan;
    });
  };

  const financials = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.type === 'Receita').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'Despesa').reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalRevenue,
      totalExpenses,
      balance: totalRevenue - totalExpenses,
      recentTransactions: transactions.slice(0, 10)
    };
  }, [transactions]);

  return (
    <AppContext.Provider value={{
      clients, suppliers, employees, transactions, sales, budgets, purchaseOrders, fleet, inventory, payroll, timeLogs, vacations, salaryAdvances, tires,
      productionOrders, formulas, productionUnits, users, roles, settings, auditLogs, accounts, planOfAccounts,
      currentUser, login, logout, hasPermission,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addEmployee, updateEmployee, deleteEmployee,
      addPayroll, payPayroll, addTimeLog,
      addVacation, updateVacationStatus, deleteVacation,
      addSalaryAdvance, updateAdvanceStatus, paySalaryAdvance, deleteAdvance,
      addTransaction, updateTransactionStatus, deleteTransaction, importTransactions, addSale, addBudget, updateBudgetStatus,
      addPurchaseOrder, receivePurchaseOrder,
      addStockItem, updateStock, updateStockItem, deleteStockItem,
      addVehicle, updateVehicle, updateVehicleStatus, deleteVehicle,
      addMaintenanceRecord, deleteMaintenanceRecord, addFuelLog, deleteFuelLog,
      addTire, updateTire, deleteTire, addTireHistory, deleteTireHistory,
      addProductionOrder, updateProductionOrder, deleteProductionOrder,
      startProduction, completeProduction, addFormula, updateFormula, deleteFormula, addQualityTest,
      addProductionUnit, updateProductionUnit, deleteProductionUnit,
      addUser, updateUser, deleteUser, addRole, updateRole, deleteRole, updateSettings,
      addAccount, deleteAccount, addPlanAccount, deletePlanAccount, updatePlanAccount,
      clearAllData, financials
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
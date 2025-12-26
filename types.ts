export interface AppAttachment {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url?: string;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address?: string;
  status: 'Ativo' | 'Inativo';
  type: 'Matriz' | 'Filial' | 'Parceiro';
  registeredAt: string;
  initials: string;
  colorClass: string;
  attachments?: AppAttachment[];
}

export interface Supplier {
  id: string;
  name: string; // Razão Social
  tradeName?: string; // Nome Fantasia
  document: string; // CNPJ
  email: string;
  phone: string;
  category: string; // e.g., 'Materiais', 'Serviços'
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  registeredAt: string;
  initials: string;
  attachments?: AppAttachment[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'Ativo' | 'Férias' | 'Afastado' | 'Desligado';
  admissionDate: string;
  salary: number;
  email: string;
  phone?: string;
  birthDate?: string;
  bankAccount?: string;
  pixKey?: string;
  attachments?: AppAttachment[];
  vacationDaysAvailable?: number; // Dias de férias disponíveis
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // MM/YYYY
  baseSalary: number;
  benefits: number; // VA/VR/VT
  overtime: number;
  discounts: number; // INSS/IRRF
  totalNet: number;
  status: 'Pendente' | 'Pago' | 'Cancelado';
  paidAt?: string;
}

export interface TimeLog {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Presente' | 'Atraso' | 'Falta' | 'Extra';
  notes?: string;
}

export interface Vacation {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'Solicitado' | 'Aprovado' | 'Rejeitado' | 'Em Andamento' | 'Concluído';
  requestedAt: string;
  approvedBy?: string;
  notes?: string;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  requestDate: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Pago';
  approvedBy?: string;
  paidAt?: string;
  deductFromMonth: string; // MM/YYYY - mês que será descontado
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  status: 'Conciliado' | 'Pendente';
  type: 'Receita' | 'Despesa';
  ledgerCode?: string;
  ledgerName?: string;
}

export interface Sale extends Transaction {
  clientId: string;
  clientName: string;
  items: SalesItem[];
  paymentMethod?: string;
}

export interface SalesItem {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface FleetVehicle {
  id: string;
  name: string; // Model
  brand?: string;
  year?: number;
  plate: string;
  type?: 'Caminhão' | 'Carro' | 'Máquina' | 'Utilitário';
  status: 'Operacional' | 'Manutenção' | 'Parado';
  fuelLevel: number;
  lastMaintenance: string;
  km: number;
  maintenanceHistory?: MaintenanceRecord[];
  fuelLogs?: FuelLog[];
  attachments?: AppAttachment[];
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: 'Preventiva' | 'Corretiva' | 'Preditiva';
  description: string;
  cost: number;
  km: number;
  mechanic?: string;
  attachments?: AppAttachment[];
  ledgerCode?: string;
  ledgerName?: string;
  productId?: string;
  productQuantity?: number;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  km: number;
  fuelType: 'Diesel' | 'Gasolina' | 'Etanol' | 'Arla 32';
  attachments?: AppAttachment[];
  ledgerCode?: string;
  ledgerName?: string;
}

export interface ProductionUnit {
  id: string;
  name: string;
  type: string;
  status: 'Operando' | 'Manutenção' | 'Parado';
  capacity: string;
  currentLoad: number;
  temp: number;
  power: string;
  allowedCategories?: string[];
}

export interface QualityTest {
  id: string;
  type: string;
  result: string;
  minExpected: string;
  status: 'Aprovado' | 'Reprovado' | 'Pendente';
  testedAt: string;
  tester?: string;
}

export interface FormulaIngredient {
  productId: string;
  name: string;
  qty: number;
  unit: string;
}

export interface ProductionFormula {
  id: string;
  name: string;
  category: string;
  ingredients: FormulaIngredient[];
  outputProductId?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  productId?: string;
  formulaId?: string;
  quantity: number;
  status: 'Planejado' | 'Em Produção' | 'Qualidade' | 'Finalizado' | 'Pausado' | 'Cancelado';
  startDate: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  progress: number;
  unitId?: string;
  batch?: string;
  operator?: string;
  qualityTests?: QualityTest[];
  rawMaterialsDeducted?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  minStock: number;
  color?: string; // For UI display
  supplierId?: string; // Link to supplier
}

export interface PurchaseItem {
  id: string; // Product Link
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: 'Pendente' | 'Recebido' | 'Cancelado' | 'Aprovado';
  receivedAt?: string;
  accountId?: string; // Financial account used
  attachments?: AppAttachment[];
  ledgerCode?: string;
  ledgerName?: string;
}

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  items: SalesItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Aberto' | 'Aprovado' | 'Rejeitado' | 'Convertido';
  expiryDate: string;
}

export interface Tire {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  size: string;
  status: 'Novo' | 'Em uso' | 'Recapagem' | 'Descartado' | 'Estoque';
  currentVehicleId?: string;
  position?: string;
  installKm?: number;
  currentKm: number;
  maxKm: number;
  recapCount: number;
  history: TireHistory[];
}

export interface TireHistory {
  id: string;
  date: string;
  type: 'Instalação' | 'Rodízio' | 'Recapagem' | 'Inspeção' | 'Retirada';
  km: number;
  notes?: string;
  vehicleId?: string;
  position?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AppRole {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // e.g., ['sales.view', 'sales.create', 'finance.admin']
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'Ativo' | 'Inativo';
  lastLogin?: string;
  avatar?: string;
  registeredAt: string;
}

export interface AppSettings {
  companyName: string;
  tradeName: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    stockAlerts: boolean;
    overdueFinance: boolean;
    productionUpdates: boolean;
    fleetMaintenance: boolean;
  };
  technical: {
    taxRegime: string;
    defaultTaxRate: number;
    financialYearStart: string;
    dateFormat: string;
    timezone: string;
  };
  backup: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup?: string;
  };
}

export interface AppAttachment {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  url?: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string; // UF
  zipCode: string; // CEP
}

export interface Client {
  id: string;
  name: string;
  document: string; // CPF/CNPJ
  email: string;
  phone: string;
  address?: Address; // Structured address
  contactPerson?: string;
  creditLimit?: number;
  paymentTerms?: string; // e.g., '30/60/90'
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
  address?: Address;
  contactPerson?: string;
  category: string; // e.g., 'Materiais', 'Serviços'
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    pix?: string;
  };
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  registeredAt: string;
  initials: string;
  attachments?: AppAttachment[];
}

// ... existing Employee ...

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  price: number; // Selling Price
  costPrice?: number; // Cost Price for Margin Calc
  minStock: number;
  maxStock?: number;
  location?: string; // Prateleira/Bin
  barcode?: string; // EAN
  ncm?: string; // Fiscal
  weight?: number; // kg per unit (for scale integration)
  brand?: string;
  supplierId?: string;
  color?: string; // For UI
}

// ... existing interfaces ...

export interface Transaction {
  id: string;
  date: string;
  dueDate?: string; // Vencimento for Payables/Receivables
  description: string;
  category: string; // Plano de Contas Level 2
  accountId: string; // Financial Account ID (Banco, Caixa)
  amount: number;
  status: 'Conciliado' | 'Pendente' | 'Vencido' | 'Cancelado';
  type: 'Receita' | 'Despesa';
  documentNumber?: string; // Invoice #
  partnerId?: string; // ClientID or SupplierID
  originModule?: 'Vendas' | 'Compras' | 'Frota' | 'RH' | 'Manual';
  originId?: string; // ID of Sale, PO, etc.
  ledgerCode?: string;
  ledgerName?: string;
}

export interface Sale extends Transaction {
  clientId: string;
  clientName: string;
  items: SalesItem[];
  paymentMethod?: string;
  installments?: number;
  weightTicket?: string; // ID of scale ticket if used
  measuredWeight?: number; // Weight from scale
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  total: number;
  status: 'Pendente' | 'Recebido' | 'Cancelado' | 'Aprovado';
  receivedAt?: string;
  paymentTerms?: string; // '30 dias', 'Avista'
  targetAccountId?: string; // Where money will come from (Previsão)
  attachments?: AppAttachment[];
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number; // Total Cost
  pricePerLiter: number;
  km: number;
  fuelType: 'Diesel' | 'Gasolina' | 'Etanol' | 'Arla 32';
  stationName?: string; // Posto
  invoiceNumber?: string; // Nota Fiscal
  financialAccountId?: string; // Source of Payment if cash/card
  isPaid: boolean;
  attachments?: AppAttachment[];
}

// ... existing ProductionUnit ...

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

export interface SalesItem {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  unit: string;
  price: number;
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
  employeeId?: string; // Link to an employee profile
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

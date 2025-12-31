import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Trash2,
  CheckCircle,
  Printer,
  XCircle,
  Plus,
  Search,
  Package,
  CreditCard,
  Banknote,
  QrCode,
  User,
  MoreVertical,
  Minus,
  Truck,
  FileText,
  FileSearch,
  FileJson,
  Barcode,
  Award,
  Landmark,
  Save,
  FileDown,
  Scale,
  X,
  Eye,
  AlertTriangle,
  Download,
  Calendar,
  ChevronRight,
  ArrowLeftRight,
  Activity,
  TrendingUp,
  Target
} from 'lucide-react';
import { SalesItem, Client, Budget, Sale } from '../types';
import { useApp } from '../context/AppContext';
import { printDocument, exportToCSV } from '../utils/exportUtils';

const formatMoney = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const Sales = () => {
  const { sales, clients, addSale, inventory, budgets, addBudget, fleet, updateBudgetStatus, addTransaction, accounts, settings } = useApp();

  // Robust data filtering with extreme safety checks
  const validSales = useMemo(() => {
    if (!Array.isArray(sales)) return [];
    return sales.filter(s => {
      // Basic Object Check
      if (!s || typeof s !== 'object') return false;
      // Required Fields Check
      if (!s.id || typeof s.amount !== 'number') return false;
      // Date Integrity Check (Optional but recommended for robust dashboards)
      // if (!s.date || typeof s.date !== 'string') return false; 
      return true;
    });
  }, [sales]);

  const validBudgets = useMemo(() => {
    if (!Array.isArray(budgets)) return [];
    return budgets.filter(b => b && typeof b === 'object' && b.status);
  }, [budgets]);

  // Dashboard Calculations (Safe Mode)
  const dashboardStats = useMemo(() => {
    try {
      const today = new Date().toLocaleDateString('pt-BR');
      const totalToday = validSales
        .filter(s => s.date === today)
        .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyData = validSales.filter(s => {
        if (!s.date || typeof s.date !== 'string') return false;
        const parts = s.date.split('/');
        if (parts.length !== 3) return false;
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return month === currentMonth && year === currentYear;
      });

      const monthlyCount = monthlyData.length;
      const monthlyTotal = monthlyData.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
      const averageTicket = monthlyCount > 0 ? monthlyTotal / monthlyCount : 0;

      const monthlyTarget = 100000;
      const targetPercent = Math.min(Math.round((monthlyTotal / monthlyTarget) * 100), 100);

      return {
        totalToday,
        monthlyTotal,
        averageTicket,
        monthlyTarget,
        targetPercent,
        pendingBudgets: validBudgets.filter(b => b.status === 'Aberto').length
      };
    } catch (error) {
      console.error("Dashboard Calc Error:", error);
      return { totalToday: 0, monthlyTotal: 0, averageTicket: 0, monthlyTarget: 100000, targetPercent: 0, pendingBudgets: 0 };
    }
  }, [validSales, validBudgets]);

  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'budgets' | 'dashboard'>('dashboard');
  const [mobileTab, setMobileTab] = useState<'catalog' | 'checkout'>('catalog');

  // Modal State
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showNFE, setShowNFE] = useState<{ type: 'sale' | 'budget', data: any } | null>(null);

  // History Filters
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyDate, setHistoryDate] = useState('');

  const filteredHistory = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch = s.clientName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        s.id.includes(historySearchTerm);
      const matchesDate = historyDate ? s.date === new Date(historyDate).toLocaleDateString('pt-BR') : true;
      return matchesSearch && matchesDate;
    });
  }, [sales, historySearchTerm, historyDate]);

  // Cart State
  const [cart, setCart] = useState<SalesItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit');
  const [discount, setDiscount] = useState<string>('0');
  const [account, setAccount] = useState<string>(''); // Financial Account ID
  const [installments, setInstallments] = useState<number>(1);
  const [scaleWeight, setScaleWeight] = useState<number>(0);
  const [weightTicket, setWeightTicket] = useState<string>('');
  const [customDueDates, setCustomDueDates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dispatch / Logistics State
  const [requiresWeighing, setRequiresWeighing] = useState(false);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [driverName, setDriverName] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<'Aguardando' | 'Em Pesagem' | 'Despachado'>('Aguardando');

  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  // Available Financial Accounts
  const financialAccounts = accounts.length > 0 ? accounts : [
    { id: 'acc-1', name: 'Banco do Brasil', type: 'Banco' },
    { id: 'acc-2', name: 'Caixa Interno', type: 'Caixa' }
  ];

  // Scale Simulation State
  const [isScaleConnected, setIsScaleConnected] = useState(true);

  // Filter products from Global Inventory
  const filteredProducts = inventory.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountStart = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountStart);

  // Effect to reset installments for instant payments
  React.useEffect(() => {
    if (['money', 'pix'].includes(paymentMethod)) {
      setInstallments(1);
      setCustomDueDates([]);
    } else if (installments > 1) {
      // Initialize dates for installments
      const dates = Array.from({ length: installments }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + ((i + 1) * 30));
        return d.toISOString().split('T')[0];
      });
      setCustomDueDates(dates);
    }
  }, [paymentMethod, installments]);

  const updateDueDate = (index: number, value: string) => {
    const newDates = [...customDueDates];
    newDates[index] = value;
    setCustomDueDates(newDates);
  };

  const addToCart = (product: typeof inventory[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      // Ensure weight is present if available in inventory
      return [...prev, {
        id: product.id,
        name: product.name,
        detail: product.category,
        quantity: 1,
        unit: product.unit,
        price: product.price,
        originalPrice: product.price,
        originalUnit: product.unit,
        weight: product.weight // Density if m3
      }];
    });
    // Auto switch to cart on mobile if desired? Maybe not.
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleReadScale = (id: string) => {
    if (!isScaleConnected) {
      alert("Balança não conectada!");
      return;
    }
    const reading = (Math.random() * 20) + 5; // Weight in Tons

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        // density in ton/m3 = (kg/unit) / 1000
        const density = item.weight ? item.weight / 1000 : 1;

        let newQty = reading;
        // If unit is m3, we need volume = weight / density
        if (['m³', 'm3'].includes(item.unit.toLowerCase())) {
          newQty = reading / density;
        }
        // If unit is ton, quantity is reading

        return { ...item, quantity: parseFloat(newQty.toFixed(3)) };
      }
      return item;
    }));
  };

  const toggleUnit = (id: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.weight) {
        const density = item.weight / 1000;
        const unitLower = item.unit.toLowerCase();
        if (['m³', 'm3'].includes(unitLower)) {
          // Convert to Ton
          // Price/Ton = Price/m3 / Density
          const newPrice = (item.originalPrice || item.price) / density;
          const newQty = item.quantity * density;
          return { ...item, unit: 'ton', price: newPrice, quantity: parseFloat(newQty.toFixed(3)) };
        } else if (unitLower === 'ton') {
          // Convert to m3
          // Price/m3 = OriginalPrice
          const newPrice = item.originalPrice || item.price * density;
          const newQty = item.quantity / density;
          return { ...item, unit: 'm³', price: newPrice, quantity: parseFloat(newQty.toFixed(3)), originalUnit: 'm³', originalPrice: newPrice };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearForm = () => {
    setCart([]);
    setSelectedClient('');
    setSelectedVehicle('');
    setDiscount('0');
    setShowCheckout(false);
    setAccount('');
    setInstallments(1);
    setScaleWeight(0);
    setWeightTicket('');
    setIsSubmitting(false);
  };

  const handleFinalizeOrder = () => {
    if (cart.length === 0) return;
    if (!selectedClient) {
      alert("Selecione um cliente para continuar.");
      return;
    }
    if (!account) {
      alert("Selecione uma conta financeira para o recebimento.");
      return;
    }

    // Validation: Enforce Net Weight if Scale is Connected
    if (isScaleConnected) {
      if (!requiresWeighing) {
        alert("Atenção: A Balança está ativa! É obrigatório realizar a pesagem do veículo (Tara/Bruto) para finalizar.");
        return;
      }
      if (grossWeight <= tareWeight) {
        alert("Erro de Pesagem: O Peso Bruto deve ser maior que a Tara para gerar o Peso Líquido.");
        return;
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const saleId = `S-${Date.now()}`;
    const client = clients.find(c => c.id === selectedClient);
    const vehicle = fleet.find(v => v.id === selectedVehicle);

    // Dispatch / Weighing Logic
    // Dispatch / Weighing Logic
    const netWeight = requiresWeighing && grossWeight > tareWeight ? grossWeight - tareWeight : undefined;

    // Recalculate based on Truck Weight if applicable (Scale Automatic Calculation)
    let finalItems = [...cart];
    let finalAmount = total;

    if (isScaleConnected && netWeight && netWeight > 0) {
      // Find bulk item (first valid one for weighing)
      const bulkIndex = finalItems.findIndex(i => ['ton', 'm³', 'kg'].includes(i.unit.toLowerCase()));
      if (bulkIndex !== -1) {
        const item = finalItems[bulkIndex];
        const netWeightTons = netWeight / 1000;
        let newQty = item.quantity;

        const unitLower = item.unit.toLowerCase();
        if (unitLower === 'kg') newQty = netWeight;
        else if (unitLower === 'ton') newQty = netWeightTons;
        else if (['m³', 'm3'].includes(unitLower)) {
          const density = item.weight ? item.weight / 1000 : 1; // ton/m3 default 1
          newQty = netWeightTons / density;
        }

        // Update Item with Weight-based Quantity
        finalItems[bulkIndex] = { ...item, quantity: parseFloat(newQty.toFixed(3)) };

        // Recalculate Total Amount
        const newSubtotal = finalItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        finalAmount = Math.max(0, newSubtotal - (parseFloat(discount) || 0));
      }
    }

    // Create Transaction/Sale
    addSale({
      id: saleId,
      date: new Date().toLocaleDateString('pt-BR'),
      description: `Venda Direta${vehicle ? ` - Veículo: ${vehicle.plate}` : ''}`,
      category: 'Vendas',
      accountId: account, // Use ID
      account: financialAccounts.find(a => a.id === account)?.name || 'Desconhecido', // Legacy Name
      amount: finalAmount,
      status: ['money', 'pix', 'debit'].includes(paymentMethod) ? 'Conciliado' : 'Pendente',
      type: 'Receita',
      clientId: selectedClient,
      clientName: client?.name || 'Cliente Avulso',
      items: finalItems,
      paymentMethod,
      installments,
      installmentDueDates: customDueDates.length > 0 ? customDueDates : undefined,
      // Dispatch Fields
      vehicleId: selectedVehicle,
      driverName: driverName,
      dispatchStatus: requiresWeighing ? 'Despachado' : 'Entregue',
      tareWeight: requiresWeighing ? tareWeight : undefined,
      grossWeight: requiresWeighing ? grossWeight : undefined,
      netWeight: netWeight,
      weightTicket: weightTicket || undefined,
      // Financial Metadata
      partnerId: selectedClient || undefined,
      originModule: 'Vendas',
      originId: saleId,
      documentNumber: saleId.split('-')[1],
      ledgerCode: '1.01.01',
      ledgerName: 'Vendas de Mercadorias'
    });

    alert("Venda realizada com sucesso!");
    clearForm();
    setActiveTab('history');
  };


  const handlePrintBudget = (budget: Budget) => {
    // Get absolute latest settings
    const company = settings || {
      companyName: 'INFRACORE ERP',
      tradeName: 'Sistemas de Gestão',
      document: '00.000.000/0000-00',
      email: 'contato@infracore.com.br',
      phone: '(11) 99999-9999',
      address: 'Endereço Padrão do Sistema'
    };

    const html = `
      <div class="header" style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
        <div class="company-info">
          <h1 style="font-size: 24px; color: #000; margin-bottom: 5px; text-transform: uppercase;">${company.tradeName || company.companyName}</h1>
          <p style="font-size: 12px; font-weight: bold; margin: 2px 0;">CNPJ: ${company.document}</p>
          <p style="font-size: 11px; color: #555; margin: 2px 0;">${company.address}</p>
          <p style="font-size: 11px; color: #555; margin: 2px 0;">${company.phone} | ${company.email}</p>
        </div>
        <div class="doc-info" style="text-align: right;">
          <h2 style="font-size: 18px; color: #f97316; margin-bottom: 5px;">ORÇAMENTO DE VENDA</h2>
          <p style="font-size: 14px; margin: 2px 0;">Nº: <strong>${budget.id.split('-')[1] || budget.id}</strong></p>
          <p style="font-size: 12px; margin: 2px 0;">Emissão: ${budget.date}</p>
        </div>
      </div>

      <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div class="detail-box" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px;">DADOS DO CLIENTE</h3>
          <p style="font-size: 14px; font-weight: bold; margin: 0 0 5px 0;">${budget.clientName}</p>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Validade da Proposta: <strong>${budget.expiryDate}</strong></p>
        </div>
        <div class="detail-box" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 11px; color: #94a3b8; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 8px;">DETALHES DO PEDIDO</h3>
          <p style="font-size: 12px; margin: 0 0 4px 0;">Status: <span style="font-weight: bold; text-transform: uppercase; color: ${budget.status === 'Convertido' ? '#16a34a' : '#ea580c'}">${budget.status}</span></p>
          <p style="font-size: 12px; margin: 0;">Vendedor: Administrador</p>
        </div>
      </div>

      ${budget.netWeight ? `
      <div style="margin-bottom: 20px; padding: 10px; border: 1px dashed #cbd5e1; border-radius: 6px; background: #fff;">
        <h4 style="margin: 0 0 5px 0; font-size: 10px; color: #64748b; text-transform: uppercase;">Dados de Pesagem (Carga)</h4>
        <div style="display: flex; gap: 20px; font-size: 12px; font-family: monospace;">
          <span><strong>Tara:</strong> ${budget.tareWeight} kg</span>
          <span><strong>Bruto:</strong> ${budget.grossWeight} kg</span>
          <span><strong>Líquido:</strong> ${budget.netWeight} kg</span>
        </div>
      </div>
      ` : ''}

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead style="background: #f1f5f9; color: #475569; font-size: 10px; text-transform: uppercase;">
          <tr>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Descrição do Produto</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Qtd</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Un</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Valor Unit.</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Total</th>
          </tr>
        </thead>
        <tbody style="font-size: 12px; color: #1e293b;">
          ${budget.items.map((item, idx) => `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 10px;">
                <div style="font-weight: bold;">${item.name}</div>
                <div style="font-size: 10px; color: #94a3b8;">${item.detail || ''}</div>
              </td>
              <td style="padding: 12px 10px; text-align: right;">${item.quantity}</td>
              <td style="padding: 12px 10px; text-align: center;">${item.unit || 'UN'}</td>
              <td style="padding: 12px 10px; text-align: right;">${formatMoney(item.price)}</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold;">${formatMoney(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals" style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
        <div class="total-row" style="width: 200px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <span>Subtotal:</span>
          <span>${formatMoney(budget.subtotal)}</span>
        </div>
        <div class="total-row" style="width: 200px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <span>Descontos:</span>
          <span>${formatMoney(budget.discount || 0)}</span>
        </div>
        <div class="total-row total-final" style="width: 250px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #000; border-top: 2px solid #000; padding-top: 10px; margin-top: 5px;">
          <span>TOTAL A PAGAR:</span>
          <span>${formatMoney(budget.total)}</span>
        </div>
      </div>

      <div style="margin-top: 60px; border-top: 1px dotted #ccc; padding-top: 30px; display: flex; justify-content: space-between; gap: 40px;">
        <div style="flex: 1; text-align: center;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 1px;"></div>
          <p style="font-size: 10px; text-transform: uppercase;">Assinatura do Responsável</p>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 1px;"></div>
          <p style="font-size: 10px; text-transform: uppercase;">${budget.clientName}</p>
        </div>
      </div>

      <div style="margin-top: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; font-size: 10px; color: #64748b; line-height: 1.5;">
        <strong>Termos e Condições:</strong><br>
        1. Este orçamento tem validade de 15 dias a partir da data de emissão.<br>
        2. O pagamento deve ser realizado conforme condições acordadas.<br>
        3. A entrega dos materiais está condicionada à disponibilidade em estoque no momento do faturamento.<br>
        4. O recebimento da mercadoria implica na aceitação das condições deste orçamento.
      </div>
    `;
    printDocument(`Orcamento_${budget.id}_${budget.clientName.replace(/\s+/g, '_')}`, html);
  };

  const handleSaveBudget = () => {
    if (cart.length === 0) return;
    if (!selectedClient) {
      alert("Selecione um cliente para criar um orçamento.");
      return;
    }

    const client = clients.find(c => c.id === selectedClient);

    // Recalculate based on Weight if applicable (Mirroring Finalize Logic)
    let finalItems = [...cart];
    let finalSubtotal = subtotal;
    let finalAmount = total;
    const calculatedNetWeight = requiresWeighing && grossWeight > tareWeight ? grossWeight - tareWeight : undefined;

    if (isScaleConnected && calculatedNetWeight && calculatedNetWeight > 0) {
      const bulkIndex = finalItems.findIndex(i => ['ton', 'm³', 'kg'].includes(i.unit.toLowerCase()));
      if (bulkIndex !== -1) {
        const item = finalItems[bulkIndex];
        const netWeightTons = calculatedNetWeight / 1000;
        let newQty = item.quantity;

        const unitLower = item.unit.toLowerCase();
        if (unitLower === 'kg') newQty = calculatedNetWeight;
        else if (unitLower === 'ton') newQty = netWeightTons;
        else if (['m³', 'm3'].includes(unitLower)) {
          const density = item.weight ? item.weight / 1000 : 1;
          newQty = netWeightTons / density;
        }

        finalItems[bulkIndex] = { ...item, quantity: parseFloat(newQty.toFixed(3)) };
        finalSubtotal = finalItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        finalAmount = Math.max(0, finalSubtotal - (parseFloat(discount) || 0));
      }
    }

    const newBudget: Budget = {
      id: `B-${Date.now()}`,
      clientId: selectedClient,
      clientName: client?.name || 'Cliente Avulso',
      date: new Date().toLocaleDateString('pt-BR'),
      items: finalItems,
      subtotal: finalSubtotal,
      discount: parseFloat(discount) || 0,
      total: finalAmount,
      status: 'Aberto',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      // Include Weighing Data if present
      tareWeight: requiresWeighing ? tareWeight : undefined,
      grossWeight: requiresWeighing ? grossWeight : undefined,
      netWeight: calculatedNetWeight
    };

    addBudget(newBudget);
    alert("Orçamento (Pré-Venda) salvo com sucesso!");
    clearForm();
    setActiveTab('budgets');
  };

  const handleConvertBudgetToSale = (budget: Budget) => {
    if (!confirm(`Deseja converter o orçamento #${budget.id} em uma venda definitiva?`)) return;

    addSale({
      id: `S-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      description: `Conversão de Orçamento #${budget.id}`,
      category: 'Vendas',
      account: 'Banco do Brasil',
      amount: budget.total,
      status: 'Conciliado',
      type: 'Receita',
      clientId: budget.clientId,
      clientName: budget.clientName,
      items: budget.items,
      paymentMethod: 'credit'
    });

    updateBudgetStatus(budget.id, 'Convertido');
    alert("Orçamento convertido em venda com sucesso! Estoque e financeiro atualizados.");
    setActiveTab('history');
  };


  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      {/* NF-e Modal (DANFE Simulation) */}
      {showNFE && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-full flex flex-col animate-in zoom-in duration-200 text-black">
            {/* NF-e Header Control */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Barcode size={24} className="text-gray-700" />
                <span className="font-black text-xs uppercase tracking-widest text-gray-500">Visualização de Documento Fiscal (DANFE)</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white font-black text-xs rounded-lg flex items-center gap-2 hover:bg-black transition-all">
                  <Printer size={16} /> IMPRIMIR NF-e
                </button>
                <button onClick={() => setShowNFE(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>
            </div>

            {/* NF-e Printable Content */}
            <div className="flex-1 overflow-y-auto p-8 font-serif leading-tight printable-area bg-white">
              <div className="border-2 border-black p-4 space-y-4">
                {/* Top Section: Issuer & DANFE Info */}
                <div className="grid grid-cols-12 gap-0 border-b-2 border-black -mx-4 -mt-4">
                  <div className="col-span-5 p-4 border-r-2 border-black">
                    <h2 className="text-xl font-black uppercase tracking-tighter">INFRACORE ERP SISTEMAS LTDA</h2>
                    <p className="text-[10px] font-bold">AV. INDUSTRIAL, 1234 - DISTRITO INDUSTRIAL</p>
                    <p className="text-[10px] font-bold"> SÃO PAULO - SP | CEP: 01000-000</p>
                    <p className="text-[10px] font-bold">TEL: (11) 4002-8922</p>
                  </div>
                  <div className="col-span-3 p-4 border-r-2 border-black text-center flex flex-col justify-center">
                    <h3 className="text-lg font-black leading-none">DANFE</h3>
                    <p className="text-[8px] font-bold">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
                    <div className="mt-2 text-left text-[9px] font-bold leading-tight">
                      <p>0 - ENTRADA</p>
                      <p>1 - SAÍDA</p>
                      <p className="text-sm font-black border border-black inline-block px-2 mt-1">1</p>
                    </div>
                    <p className="text-[10px] font-bold mt-2">Nº 000.123.456</p>
                    <p className="text-[10px] font-bold uppercase">SÉRIE: 001</p>
                  </div>
                  <div className="col-span-4 p-4 text-center">
                    <div className="bg-black text-white p-1 text-[8px] font-black uppercase mb-2">Chave de Acesso</div>
                    <div className="font-mono text-[10px] break-all tracking-tighter leading-none mb-4">
                      3523 1000 1234 5600 0100 5500 1000 1234 5612 3456 7890
                    </div>
                    <div className="border border-black p-1 text-[8px] font-bold">
                      Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br
                    </div>
                  </div>
                </div>

                {/* Nature of Operation */}
                <div className="grid grid-cols-12 -mx-4 border-b-2 border-black">
                  <div className="col-span-8 p-2 border-r-2 border-black">
                    <p className="text-[8px] font-black uppercase">Natureza da Operação</p>
                    <p className="text-sm font-bold uppercase">VENDA DE MERCADORIA ADQUIRIDA DE TERCEIROS</p>
                  </div>
                  <div className="col-span-4 p-2">
                    <p className="text-[8px] font-black uppercase">Protocolo de Autorização</p>
                    <p className="text-sm font-bold uppercase">135230005512345 - 23/12/2023 14:22:15</p>
                  </div>
                </div>

                {/* Receiver Info */}
                <div className="space-y-0.5 -mx-4">
                  <div className="bg-gray-100 p-1 text-[8px] font-black uppercase border-b-2 border-black">Destinatário / Remetente</div>
                  <div className="grid grid-cols-12 border-b-2 border-black">
                    <div className="col-span-9 p-2 border-r-2 border-black">
                      <p className="text-[8px] font-black uppercase">Nome / Razão Social</p>
                      <p className="text-sm font-bold uppercase">{showNFE.data.clientName || 'CONSUMIDOR FINAL'}</p>
                    </div>
                    <div className="col-span-3 p-2">
                      <p className="text-[8px] font-black uppercase">CNPJ / CPF</p>
                      <p className="text-sm font-bold uppercase">00.000.000/0001-91</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-12 border-b-2 border-black">
                    <div className="col-span-6 p-2 border-r-2 border-black">
                      <p className="text-[8px] font-black uppercase">Endereço</p>
                      <p className="text-xs font-bold uppercase">Rua dos Exemplo, 456 - Centro</p>
                    </div>
                    <div className="col-span-3 p-2 border-r-2 border-black">
                      <p className="text-[8px] font-black uppercase">Bairro</p>
                      <p className="text-xs font-bold uppercase">Industrial</p>
                    </div>
                    <div className="col-span-3 p-2">
                      <p className="text-[8px] font-black uppercase">CEP</p>
                      <p className="text-xs font-bold uppercase">05522-100</p>
                    </div>
                  </div>
                </div>

                {/* Calculation Section */}
                <div className="space-y-0.5 -mx-4">
                  <div className="bg-gray-100 p-1 text-[8px] font-black uppercase border-b-2 border-black">Cálculo do Imposto</div>
                  <div className="grid grid-cols-5 border-b-2 border-black text-center divide-x-2 divide-black">
                    <div className="p-2"><p className="text-[8px] font-black uppercase">Base Cálc. ICMS</p><p className="text-xs font-bold">0,00</p></div>
                    <div className="p-2"><p className="text-[8px] font-black uppercase">Valor ICMS</p><p className="text-xs font-bold">0,00</p></div>
                    <div className="p-2"><p className="text-[8px] font-black uppercase">V. Total Frete</p><p className="text-xs font-bold">0,00</p></div>
                    <div className="p-2"><p className="text-[8px] font-black uppercase">V. Outras Desp.</p><p className="text-xs font-bold">0,00</p></div>
                    <div className="p-2"><p className="text-[8px] font-black uppercase">V. Total da Nota</p><p className="text-sm font-black">{formatMoney(showNFE.type === 'sale' ? showNFE.data.amount : showNFE.data.total)}</p></div>
                  </div>
                </div>

                {/* Weighing Ticket Info */}
                {(showNFE.data.netWeight || (showNFE.type === 'sale' && showNFE.data.grossWeight)) && (
                  <div className="space-y-0.5 -mx-4">
                    <div className="bg-gray-100 p-1 text-[8px] font-black uppercase border-b-2 border-black flex items-center justify-between">
                      <span>Ticket de Pesagem Rodoviária</span>
                      <span>{showNFE.data.weightTicket ? `Ref: ${showNFE.data.weightTicket}` : 'Integrado'}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b-2 border-black text-center divide-x-2 divide-black">
                      <div className="p-2"><p className="text-[8px] font-black uppercase">Peso Tara</p><p className="text-xs font-bold">{showNFE.data.tareWeight} kg</p></div>
                      <div className="p-2"><p className="text-[8px] font-black uppercase">Peso Bruto</p><p className="text-xs font-bold">{showNFE.data.grossWeight} kg</p></div>
                      <div className="p-2 bg-gray-50"><p className="text-[8px] font-black uppercase">Peso Líquido</p><p className="text-sm font-black">{showNFE.data.netWeight} kg</p></div>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="space-y-0.5 -mx-4 -mb-4">
                  <div className="bg-gray-100 p-1 text-[8px] font-black uppercase border-b-2 border-black">Dados dos Produtos / Serviços</div>
                  <table className="w-full text-center text-[9px] border-collapse">
                    <thead className="border-b-2 border-black font-black uppercase">
                      <tr className="divide-x-2 divide-black">
                        <th className="p-1 w-16">Cód. Prod</th>
                        <th className="p-1 text-left">Descrição do Produto</th>
                        <th className="p-1 w-12">NCM</th>
                        <th className="p-1 w-8">CST</th>
                        <th className="p-1 w-8">UND</th>
                        <th className="p-1 w-12">QTD</th>
                        <th className="p-1 w-20">V. Unit</th>
                        <th className="p-1 w-20">V. Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {showNFE.data.items.map((item: any, idx: number) => (
                        <tr key={idx} className="divide-x-2 divide-gray-300">
                          <td className="p-1">0000{idx + 1}</td>
                          <td className="p-1 text-left font-bold uppercase">{item.name} {item.detail && `- ${item.detail}`}</td>
                          <td className="p-1">38011000</td>
                          <td className="p-1">0102</td>
                          <td className="p-1">{item.unit}</td>
                          <td className="p-1">{item.quantity}</td>
                          <td className="p-1">{formatMoney(item.price)}</td>
                          <td className="p-1 font-bold">{formatMoney(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Stamp */}
              <div className="mt-8 flex justify-between items-end opacity-50 italic text-[10px]">
                <p>Documento gerado digitalmente pelo sistema InfraCore ERP. Autenticação via Blockchain integrada.</p>
                <div className="flex items-center gap-2">
                  <Award size={32} />
                  <p className="font-black border-t-2 border-black pt-1">RESPONSÁVEL PELA EMISSÃO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-cyan-600" />
                  Detalhes da Venda #{selectedSale.id.slice(-6)}
                </h3>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">{selectedSale.date} • {selectedSale.clientName}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-gray-700/30 p-4 rounded-xl border border-slate-100 dark:border-gray-600">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Informações de Pagamento</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Forma:</span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">{selectedSale.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Conta:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedSale.account}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold text-green-600 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full text-xs">CONCILIADO</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-gray-700/30 p-4 rounded-xl border border-slate-100 dark:border-gray-600 flex flex-col justify-center items-end">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total da Venda</p>
                  <p className="text-3xl font-black text-cyan-600">{formatMoney(selectedSale.amount)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package size={16} /> Itens do Pedido
                </h4>
                <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-gray-700 text-[10px] font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2 text-center">Qtd</th>
                        <th className="px-4 py-2 text-right">Preço</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx} className="dark:bg-gray-800">
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-gray-200">{item.name}</td>
                          <td className="px-4 py-3 text-center">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-3 text-right">{formatMoney(item.price)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{formatMoney(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 py-3 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                  <Printer size={18} /> Imprimir Cupom
                </button>
                <button className="flex-1 py-3 bg-cyan-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-700 shadow-lg shadow-cyan-600/20 transition-all">
                  <FileDown size={18} /> Exportar NF-e
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Detail Modal */}
      {selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-6 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800">
              <div>
                <h3 className="text-xl font-bold text-orange-900 dark:text-orange-400 flex items-center gap-2">
                  <Save className="text-orange-600" />
                  Orçamento #{selectedBudget.id}
                </h3>
                <p className="text-xs text-orange-700/60 mt-1 uppercase font-bold tracking-wider">Válido até: {selectedBudget.expiryDate}</p>
              </div>
              <button onClick={() => setSelectedBudget(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg text-orange-600"><User size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedBudget.clientName}</p>
                    <p className="text-xs text-slate-500">Cliente desde 2023</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className={`text-sm font-black ${selectedBudget.status === 'Convertido' ? 'text-green-600' : 'text-orange-600'}`}>{selectedBudget.status.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedBudget.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded flex items-center justify-center bg-white text-[10px] font-bold dark:bg-gray-700 border">{idx + 1}</span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">{item.quantity} {item.unit} x {formatMoney(item.price)}</span>
                      <span className="text-sm font-bold">{formatMoney(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-gray-700 flex justify-between items-center">
                <div className="text-slate-400 text-xs">
                  <p>Subtotal: {formatMoney(selectedBudget.subtotal)}</p>
                  <p>Desconto: {formatMoney(selectedBudget.discount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500">Valor Total</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{formatMoney(selectedBudget.total)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handlePrintBudget(selectedBudget)}
                  className="flex-1 py-3 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Printer size={18} /> Imprimir / PDF
                </button>
                {selectedBudget.status === 'Aberto' && (
                  <button
                    onClick={() => {
                      handleConvertBudgetToSale(selectedBudget);
                      setSelectedBudget(null);
                    }}
                    className="flex-[1.5] py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all uppercase tracking-wide"
                  >
                    <CheckCircle size={18} /> Converter para Venda
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar (already implemented in return start) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <ShoppingCart className="text-cyan-600" />
            Vendas e PDV
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ponto de venda ágil, orçamentos e pedidos.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-600 shadow-sm text-cyan-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
          >
            <Activity size={16} />
            Painel Gerencial
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
          >
            <Plus size={16} />
            Nova Venda
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'budgets' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
          >
            <FileText size={16} />
            Orçamentos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
          >
            <RefreshCw size={16} />
            Histórico
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                  <TrendingUp size={24} />
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Hoje</span>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Vendido</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatMoney(dashboardStats.totalToday)}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl text-cyan-600">
                  <Target size={24} />
                </div>
                <span className="bg-cyan-50 text-cyan-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Mensal</span>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Ticket Médio</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatMoney(dashboardStats.averageTicket)}
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600">
                  <FileText size={24} />
                </div>
                <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Pendentes</span>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Orçamentos Abertos</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {dashboardStats.pendingBudgets}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
              <h4 className="font-black text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-slate-400" /> Fluxo de Vendas Recentes
              </h4>
              <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                <div className="space-y-3">
                  {validSales.slice(0, 8).map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-cyan-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-cyan-600 font-black shadow-sm">
                          {sale.items?.length || 0}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{sale.clientName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{sale.date} • {sale.paymentMethod}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white">{formatMoney(sale.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <h4 className="text-2xl font-black uppercase tracking-widest mb-2">Meta Mensal</h4>
                <p className="text-slate-400 text-sm font-medium mb-8">Progresso atual em relação ao objetivo.</p>

                <div className="text-6xl font-black tracking-tighter mb-4">
                  {dashboardStats.targetPercent}<span className="text-2xl text-cyan-400">%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                  <div className="bg-cyan-400 h-full transition-all duration-1000" style={{ width: `${dashboardStats.targetPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>{formatMoney(dashboardStats.monthlyTotal)}</span>
                  <span>Meta: {formatMoney(dashboardStats.monthlyTarget)}</span>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-600/20 rounded-full blur-[80px]"></div>
              <div className="absolute top-10 right-10 opacity-10 rotate-12">
                <TrendingUp size={120} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'new' ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-4 shrink-0 mx-1">
            <button
              onClick={() => setMobileTab('catalog')}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === 'catalog' ? 'bg-white dark:bg-slate-600 shadow text-cyan-600 dark:text-white' : 'text-slate-400'}`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setMobileTab('checkout')}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === 'checkout' ? 'bg-white dark:bg-slate-600 shadow text-cyan-600 dark:text-white' : 'text-slate-400'}`}
            >
              Carrinho ({cart.length})
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full overflow-hidden relative">
            {/* Catalog */}
            <div className={`flex-1 flex flex-col gap-4 overflow-hidden h-full animate-in fade-in duration-500 ${mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="relative shrink-0 flex gap-4">
                <div className="relative flex-1 group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-600 transition-colors">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-3 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 bg-white dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all shadow-sm font-bold text-sm"
                    placeholder="Pesquisar produtos no estoque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className={`px-4 rounded-2xl border flex items-center gap-2 font-black text-xs uppercase transition-all shadow-sm ${isScaleConnected ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800' : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-gray-800 dark:border-gray-700'}`}
                  onClick={() => setIsScaleConnected(!isScaleConnected)}
                >
                  <Scale size={18} />
                  <span className="hidden xl:inline">{isScaleConnected ? 'Simulador Ativo' : 'Ativar Balança'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer group transition-all shadow-sm hover:shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${product.quantity < product.minStock ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'} group-hover:scale-105 transition-transform duration-300`}>
                        <Package size={20} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-slate-800 dark:text-white leading-tight truncate group-hover:text-cyan-600 transition-colors">{product.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                          {product.barcode && <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 font-mono">{product.barcode}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-1 w-24 shrink-0">
                      <span className={`text-[10px] font-bold ${product.quantity < product.minStock ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {product.quantity} {product.unit}
                      </span>
                      <div className="bg-slate-100 dark:bg-gray-700 h-1.5 w-full rounded-full overflow-hidden">
                        <div className={`h-full ${product.quantity < product.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (product.quantity / (product.minStock * 3)) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end min-w-[80px] shrink-0 text-right">
                      <span className="text-base font-black text-slate-900 dark:text-white">{formatMoney(product.price)}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">/ {product.unit}</span>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                        <input
                          type="number"
                          id={`qty-${product.id}`}
                          min="1"
                          defaultValue="1"
                          className="w-12 bg-transparent text-center text-xs font-bold border-none p-1 focus:ring-0 text-slate-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const qtyInput = document.getElementById(`qty-${product.id}`) as HTMLInputElement;
                          const qty = parseFloat(qtyInput.value) || 1;
                          for (let i = 0; i < qty; i++) addToCart(product);
                          qtyInput.value = "1"; // Reset
                        }}
                        className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart UI (simplified structure same as before but prettier) */}
            <div className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 h-full ${mobileTab === 'checkout' ? 'flex' : 'hidden lg:flex'}`}>
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-600 rounded-xl text-white shadow-lg shadow-cyan-600/20"><ShoppingCart size={20} /></div>
                    <h2 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Checkout</h2>
                  </div>
                  <button onClick={() => setCart([])} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-6 grayscale opacity-50">
                      <ShoppingCart size={80} strokeWidth={1} />
                      <div className="text-center">
                        <p className="font-black text-xl text-slate-400">Ponto de Venda Vazio</p>
                        <p className="text-sm font-medium">Adicione itens do estoque para começar</p>
                      </div>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="group p-4 bg-slate-50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-cyan-200 dark:hover:border-cyan-900/50 transition-all flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-slate-100 dark:border-gray-600"><Package size={16} /></div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{item.detail}</p>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 border dark:border-gray-600 shadow-sm">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors"><Minus size={14} /></button>
                            <div className="flex flex-col items-center px-3 relative group/scale">
                              <span className="text-sm font-black text-slate-800 dark:text-white">{item.quantity}</span>
                              {isScaleConnected && (['ton', 'm³', 'kg'].includes(item.unit)) && (
                                <>
                                  <button onClick={() => handleReadScale(item.id)} title="Ler Balança" className="absolute -top-8 bg-slate-900 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover/scale:opacity-100 scale-90 hover:scale-110 transition-all z-10"><Scale size={12} /></button>
                                  {item.weight && (
                                    <button onClick={() => toggleUnit(item.id)} title="Alternar Unidade" className="absolute -bottom-8 bg-cyan-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover/scale:opacity-100 scale-90 hover:scale-110 transition-all z-10"><ArrowLeftRight size={12} /></button>
                                  )}
                                </>
                              )}
                            </div>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors"><Plus size={14} /></button>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{formatMoney(item.price)} / {item.unit}</p>
                            <p className="font-black text-slate-900 dark:text-white">{formatMoney(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-gray-800/90 border-t dark:border-slate-700 space-y-6">
                  {!showCheckout ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{formatMoney(subtotal)}</span>
                      </div>
                      <button
                        disabled={cart.length === 0}
                        onClick={() => setShowCheckout(true)}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-2xl shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50"
                      >
                        <CreditCard size={20} /> IR PARA PAGAMENTO
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-in slide-in-from-bottom duration-300">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest pl-1">Selecionar Cliente</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                              value={selectedClient}
                              onChange={e => setSelectedClient(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border-none rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-cyan-500"
                            >
                              <option value="">Cliente Avulso / Não Identificado</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => setPaymentMethod('money')} className={`p-2 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-1 transition-all ${paymentMethod === 'money' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                            <Banknote size={18} /> DINHEIRO
                          </button>
                          <button onClick={() => setPaymentMethod('pix')} className={`p-2 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-1 transition-all ${paymentMethod === 'pix' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                            <QrCode size={18} /> PIX
                          </button>
                          <button onClick={() => setPaymentMethod('credit')} className={`p-2 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-1 transition-all ${paymentMethod === 'credit' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                            <CreditCard size={18} /> CARTÃO
                          </button>
                          <button onClick={() => setPaymentMethod('boleto')} className={`p-2 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-1 transition-all ${paymentMethod === 'boleto' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                            <Barcode size={18} /> BOLETO
                          </button>
                          <button onClick={() => setPaymentMethod('prazo')} className={`p-2 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-1 transition-all ${paymentMethod === 'prazo' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                            <Calendar size={18} /> A PRAZO
                          </button>
                        </div>
                      </div>


                      <div className="pt-4 border-t dark:border-gray-700 space-y-3">
                        {/* Financial Details */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Conta de Destino</label>
                            <select
                              value={account}
                              onChange={e => setAccount(e.target.value)}
                              className="w-full p-2 bg-slate-100 dark:bg-gray-700/50 rounded-lg text-xs font-bold"
                            >
                              <option value="">Selecione...</option>
                              {financialAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                              ))}
                            </select>
                          </div>
                          {!['money', 'pix'].includes(paymentMethod) && (
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Parcelas</label>
                              <select
                                value={installments}
                                onChange={e => setInstallments(Number(e.target.value))}
                                className="w-full p-2 bg-slate-100 dark:bg-gray-700/50 rounded-lg text-xs font-bold"
                              >
                                {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                                  <option key={n} value={n}>{n}x {n > 1 ? 'sem juros' : ''}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Installment Date Inputs */}
                        {installments > 1 && !['money', 'pix'].includes(paymentMethod) && (
                          <div className="bg-slate-50 dark:bg-gray-700/30 p-3 rounded-lg border border-slate-200 dark:border-gray-600">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Vencimentos das Parcelas</label>
                            <div className="grid grid-cols-3 gap-2">
                              {customDueDates.map((date, idx) => (
                                <div key={idx}>
                                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-0.5">{idx + 1}ª Parcela</label>
                                  <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => updateDueDate(idx, e.target.value)}
                                    className="w-full p-1.5 bg-white dark:bg-gray-600 rounded border border-slate-200 dark:border-gray-500 text-xs font-bold font-mono"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dispatch and Weighing Section */}
                        <div className="bg-slate-50 dark:bg-gray-700/30 p-4 rounded-xl border border-slate-200 dark:border-gray-600 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                              <Truck size={16} /> Logística e Despacho
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">Requer Pesagem?</span>
                              <button
                                onClick={() => setRequiresWeighing(!requiresWeighing)}
                                className={`w-10 h-6 rounded-full p-1 transition-colors ${requiresWeighing ? 'bg-cyan-600' : 'bg-slate-300'}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${requiresWeighing ? 'translate-x-4' : ''}`} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Veículo (Frota)</label>
                              <select
                                value={selectedVehicle}
                                onChange={e => setSelectedVehicle(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg text-xs font-bold"
                              >
                                <option value="">Veículo Próprio / Terceiro</option>
                                {fleet.map(v => (
                                  <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Motorista</label>
                              <input
                                type="text"
                                value={driverName}
                                onChange={e => setDriverName(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg text-xs font-bold"
                                placeholder="Nome do Condutor"
                              />
                            </div>
                          </div>

                          {requiresWeighing && (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-dashed border-cyan-200 dark:border-cyan-900/50 space-y-3 animate-in fade-in zoom-in duration-300">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-black text-cyan-600 uppercase flex items-center gap-1">
                                  <Scale size={12} /> Integração Balança Rodoviária
                                </label>
                                <span className="text-[9px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded font-bold">CONECTADO</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">Tara (Entrada)</p>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      value={tareWeight}
                                      onChange={e => setTareWeight(Number(e.target.value))}
                                      className="w-full p-1.5 text-right font-mono text-sm font-bold border rounded"
                                    />
                                    <button
                                      onClick={() => setTareWeight(Number((Math.random() * 5000 + 2000).toFixed(0)))}
                                      className="px-2 bg-slate-200 rounded hover:bg-cyan-200 text-xs"
                                    >Ler</button>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">Bruto (Saída)</p>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      value={grossWeight}
                                      onChange={e => setGrossWeight(Number(e.target.value))}
                                      className="w-full p-1.5 text-right font-mono text-sm font-bold border rounded"
                                    />
                                    <button
                                      onClick={() => setGrossWeight(Number((tareWeight + Math.random() * 10000).toFixed(0)))}
                                      className="px-2 bg-slate-200 rounded hover:bg-cyan-200 text-xs"
                                    >Ler</button>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-gray-700 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-500">Peso Líquido (Carga)</span>
                                  <span className="text-lg font-black text-cyan-600">
                                    {Math.max(0, grossWeight - tareWeight).toLocaleString('pt-BR')} kg
                                  </span>
                                </div>

                                {isScaleConnected && (grossWeight > tareWeight) && cart.find(i => ['ton', 'm³', 'kg'].includes(i.unit.toLowerCase())) && (
                                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800 animate-in zoom-in duration-300">
                                    <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase mb-1 flex items-center gap-1"><Scale size={10} /> Conversão Automática (Ativa)</p>
                                    {(() => {
                                      const item = cart.find(i => ['ton', 'm³', 'kg'].includes(i.unit.toLowerCase()));
                                      if (!item) return null;

                                      // Calc Prices
                                      const density = item.weight ? item.weight / 1000 : 1; // ton/m3
                                      let priceTon = 0;
                                      let priceM3 = 0;
                                      if (item.unit === 'ton') {
                                        priceTon = item.price;
                                        priceM3 = item.price * density;
                                      } else if (item.unit === 'm³') {
                                        priceM3 = item.price;
                                        priceTon = item.price / density;
                                      } else if (item.unit === 'kg') {
                                        priceTon = item.price * 1000;
                                        priceM3 = priceTon * density;
                                      }

                                      // Calc Qty
                                      const netWeightKg = grossWeight - tareWeight;
                                      const netWeightTon = netWeightKg / 1000;
                                      let convertedQty = netWeightTon;
                                      if (item.unit === 'kg') convertedQty = netWeightKg;
                                      else if (item.unit === 'm³') convertedQty = netWeightTon / density;

                                      return (
                                        <>
                                          <div className="text-xs flex justify-between font-mono text-emerald-900 dark:text-emerald-100 items-center mb-0.5">
                                            <span>Preço / m³:</span>
                                            <span className="font-bold">{formatMoney(priceM3)}</span>
                                          </div>
                                          <div className="text-xs flex justify-between font-mono text-emerald-900 dark:text-emerald-100 items-center mb-1">
                                            <span>Preço / Ton:</span>
                                            <span className="font-bold">{formatMoney(priceTon)}</span>
                                          </div>
                                          <div className="text-xs flex justify-between font-mono text-emerald-900 dark:text-emerald-100 items-center border-t border-emerald-200 dark:border-emerald-700 pt-1">
                                            <span>Qtd. Convertida:</span>
                                            <span className="font-bold bg-white dark:bg-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-700">
                                              {convertedQty.toFixed(3)} {item.unit}
                                            </span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 italic">
                                      * O valor total da venda será atualizado ao finalizar.
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase mt-4">
                          <span>Items Total</span>
                          <span>{formatMoney(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-900 dark:text-white">
                          <span className="font-black text-lg">TOTAL A PAGAR</span>
                          <span className="font-black text-3xl text-cyan-600">{formatMoney(total)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleSaveBudget} className="py-4 bg-white dark:bg-gray-700 text-slate-800 dark:text-white font-black rounded-2xl border border-slate-200 dark:border-gray-600 text-xs shadow-sm hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1">
                          <Save size={16} /> SALVAR ORÇAMENTO
                        </button>
                        <button
                          onClick={handleFinalizeOrder}
                          disabled={isSubmitting}
                          className={`py-4 ${isSubmitting ? 'bg-cyan-800 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-black rounded-2xl shadow-lg shadow-cyan-600/30 text-xs transition-all flex flex-col items-center justify-center gap-1`}
                        >
                          {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          ) : (
                            <>
                              <CheckCircle size={16} /> FINALIZAR VENDA
                            </>
                          )}
                        </button>
                      </div>
                      <button onClick={() => setShowCheckout(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] hover:underline uppercase">Voltar para Edição</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'budgets' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-xl text-white shadow-lg shadow-orange-600/20"><FileText size={20} /></div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white">Gestão de Orçamentos</h3>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border-none rounded-xl text-xs font-bold shadow-sm" placeholder="Buscar por cliente..." />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-gray-800 text-[10px] font-black text-slate-400 uppercase border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">ID / Data</th>
                  <th className="px-6 py-4">Cliente Solicitante</th>
                  <th className="px-6 py-4 text-right">Valor Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Validade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                        <FileText size={64} strokeWidth={1} />
                        <p className="font-black text-slate-500">Nenhum Orçamento Encontrado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  budgets.map(b => (
                    <tr key={b.id} className="group hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all">
                      <td className="px-6 py-5">
                        <p className="font-mono text-[10px] text-slate-400">#{b.id.split('-')[1]?.slice(-6) || b.id}</p>
                        <p className="font-bold text-slate-600 dark:text-slate-300">{b.date}</p>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 dark:text-white">{b.clientName}</td>
                      <td className="px-6 py-5 text-right font-black text-lg text-orange-600">{formatMoney(b.total)}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${b.status === 'Aberto' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Aberto' ? 'bg-orange-600' : 'bg-green-600'}`}></span>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">{b.expiryDate}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedBudget(b)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg transition-all" title="Ver Detalhes"><Eye size={18} /></button>
                          <button onClick={() => setShowNFE({ type: 'budget', data: b })} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg transition-all" title="Gerar NF-e (DANFE)"><FileSearch size={18} /></button>
                          {b.status === 'Aberto' && (
                            <>
                              <button
                                onClick={() => {
                                  setCart(b.items);
                                  setSelectedClient(b.clientId);
                                  setDiscount(b.discount.toString());
                                  setActiveTab('new');
                                  setShowCheckout(true);
                                }}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title="Editar Orçamento"
                              >
                                <MoreVertical size={18} className="rotate-90" />
                              </button>
                              <button
                                onClick={() => handleConvertBudgetToSale(b)}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                                title="Converter em Venda"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* History Tab Improved */
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col animate-in fade-in duration-500">
          <div className="p-6 border-b dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20"><RefreshCw size={20} /></div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white">Relatório de Vendas</h3>
            </div>
            <div className="flex gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600" size={16} />
                <input
                  type="text"
                  placeholder="ID da venda ou cliente..."
                  className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-700 border-none rounded-xl text-xs font-bold shadow-sm w-64"
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-700 border-none rounded-xl text-xs font-bold shadow-sm"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-gray-800 text-[10px] font-black text-slate-400 uppercase border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">Status / Data</th>
                  <th className="px-6 py-4">Cliente Atendido</th>
                  <th className="px-6 py-4 text-center">Itens / Volume</th>
                  <th className="px-6 py-4 text-right">Valor Final</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center opacity-40">
                      <RefreshCw size={50} className="mx-auto mb-4 animate-spin-slow" />
                      <p className="font-black text-slate-500 uppercase tracking-widest text-xs">Sem lançamentos recentes</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map(sale => (
                    <tr key={sale.id} className="group hover:bg-slate-50 dark:hover:bg-gray-700 transition-all border-l-4 border-transparent hover:border-cyan-500">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 uppercase mb-1">
                            <CheckCircle size={10} /> Concluída
                          </span>
                          <span className="text-sm font-bold text-slate-400">{sale.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-900 dark:text-white">{sale.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PEDIDO #{sale.id.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-gray-700 rounded-full">
                          <Package size={14} className="text-slate-400" />
                          <span className="text-xs font-black text-slate-700 dark:text-gray-300">{sale.items.length} ITENS</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="font-black text-lg text-slate-900 dark:text-white">{formatMoney(sale.amount)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sale.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedSale(sale)} className="p-2.5 bg-white dark:bg-gray-700 rounded-xl shadow-sm border dark:border-gray-600 text-slate-400 hover:text-cyan-600 transition-all"><Eye size={18} /></button>
                          <button onClick={() => setShowNFE({ type: 'sale', data: sale })} className="p-2.5 bg-white dark:bg-gray-700 rounded-xl shadow-sm border dark:border-gray-600 text-slate-400 hover:text-cyan-600 transition-all" title="Gerar DANFE"><FileSearch size={18} /></button>
                          <button onClick={() => alert('Compartilhando...')} className="p-2.5 bg-white dark:bg-gray-700 rounded-xl shadow-sm border dark:border-gray-600 text-slate-400 hover:text-cyan-600 transition-all"><Printer size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default Sales;
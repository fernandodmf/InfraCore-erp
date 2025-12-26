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
  ChevronRight
} from 'lucide-react';
import { SalesItem, Client, Budget, Sale } from '../types';
import { useApp } from '../context/AppContext';
import { printDocument, exportToCSV } from '../utils/exportUtils';

const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const Sales = () => {
  const { sales, clients, addSale, inventory, budgets, addBudget, fleet, updateBudgetStatus, addTransaction, accounts } = useApp();
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'budgets'>('new');

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

  const addToCart = (product: typeof inventory[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        detail: product.category,
        quantity: 1,
        unit: product.unit,
        price: product.price
      }];
    });
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
    const reading = (Math.random() * 20) + 5;
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: parseFloat(reading.toFixed(2)) };
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

    const saleId = `S-${Date.now()}`;
    const client = clients.find(c => c.id === selectedClient);
    const vehicle = fleet.find(v => v.id === selectedVehicle);

    // Dispatch / Weighing Logic
    const netWeight = requiresWeighing && grossWeight > tareWeight ? grossWeight - tareWeight : undefined;

    // Create Transaction/Sale
    addSale({
      id: saleId,
      date: new Date().toLocaleDateString('pt-BR'),
      description: `Venda Direta${vehicle ? ` - Veículo: ${vehicle.plate}` : ''}`,
      category: 'Vendas',
      accountId: account, // Use ID
      account: financialAccounts.find(a => a.id === account)?.name || 'Desconhecido', // Legacy Name
      amount: total,
      status: 'Conciliado', // Cash/Pix is instant, Credit might be receivable
      type: 'Receita',
      clientId: selectedClient,
      clientName: client?.name || 'Cliente Avulso',
      items: cart,
      paymentMethod,
      installments,
      // Dispatch Fields
      vehicleId: selectedVehicle,
      driverName: driverName,
      dispatchStatus: requiresWeighing ? 'Despachado' : 'Entregue',
      tareWeight: requiresWeighing ? tareWeight : undefined,
      grossWeight: requiresWeighing ? grossWeight : undefined,
      netWeight: netWeight,
      weightTicket: weightTicket || undefined,
    });

    // Create Financial Transaction
    addTransaction({
      id: `TR-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      description: `Venda Direta - ${client?.name || 'Cliente Avulso'}`,
      category: 'Vendas de Produtos',
      amount: total,
      type: 'Receita',
      status: 'Conciliado',
      accountId: account,
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
    const html = `
      <div class="header">
        <div class="company-info">
          <h1>CONSTRUSYS ERP</h1>
          <p>Sistemas de Gestão para Engenharia e Indústria</p>
        </div>
        <div class="doc-info">
          <h2>ORÇAMENTO DE VENDA</h2>
          <p>Nº: <strong>${budget.id}</strong></p>
          <p>DATA: ${budget.date}</p>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-box">
          <h3>DADOS DO CLIENTE</h3>
          <p>${budget.clientName}</p>
          <p>Validade: ${budget.expiryDate}</p>
        </div>
        <div class="detail-box">
          <h3>STATUS DO PEDIDO</h3>
          <p>${budget.status.toUpperCase()}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>DESCRIÇÃO DO PRODUTO/SERVIÇO</th>
            <th class="text-right">QTD</th>
            <th class="text-right">UN</th>
            <th class="text-right">VALOR UNIT.</th>
            <th class="text-right">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${budget.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${item.unit || 'UN'}</td>
              <td class="text-right">${formatMoney(item.price)}</td>
              <td class="text-right">${formatMoney(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatMoney(budget.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Descontos:</span>
          <span>${formatMoney(budget.discount || 0)}</span>
        </div>
        <div class="total-row total-final">
          <span>VALOR TOTAL:</span>
          <span>${formatMoney(budget.total)}</span>
        </div>
      </div>

      <div style="margin-top: 50px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #64748b;">OBSERVAÇÕES E CONDIÇÕES</h4>
        <p style="font-size: 11px; margin: 0;">* Este orçamento tem validade de 15 dias após a data de emissão.<br>
        * Preços sujeitos a alteração sem aviso prévio conforme disponibilidade de estoque.<br>
        * Entrega a combinar conforme cronograma logístico.</p>
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

    const newBudget: Budget = {
      id: `B-${Date.now()}`,
      clientId: selectedClient,
      clientName: client?.name || 'Cliente Avulso',
      date: new Date().toLocaleDateString('pt-BR'),
      items: cart,
      subtotal: subtotal,
      discount: parseFloat(discount) || 0,
      total: total,
      status: 'Aberto',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
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

      {activeTab === 'new' ? (
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
          {/* Catalog */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full animate-in fade-in duration-500">
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

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4 custom-scrollbar">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer group transition-all shadow-sm hover:shadow-xl flex flex-col items-center gap-3 relative overflow-hidden"
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-1 ${product.quantity < product.minStock ? 'bg-red-50 text-red-500' : 'bg-slate-50 dark:bg-slate-700 text-slate-400'} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}>
                    <Package size={36} strokeWidth={1.5} />
                  </div>
                  <div className="text-center w-full">
                    <h3 className="font-black text-slate-800 dark:text-white text-sm leading-tight mb-1">{product.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</p>
                    <div className="mt-3 bg-slate-50 dark:bg-gray-700 h-1 w-full rounded-full overflow-hidden">
                      <div className={`h-full ${product.quantity < product.minStock ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, (product.quantity / (product.minStock * 2)) * 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold mt-1.5 text-slate-500">{product.quantity} {product.unit} em estoque</p>
                    <div className="mt-4 flex items-end justify-center gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{formatMoney(product.price).split(',')[0]}</span>
                      <span className="text-xs font-bold text-slate-400 mb-1">/{product.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart UI (simplified structure same as before but prettier) */}
          <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-full">
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
                              <button onClick={() => handleReadScale(item.id)} className="absolute -top-7 bg-slate-900 text-white p-1 rounded-full shadow-lg opacity-0 group-hover/scale:opacity-100 scale-90 hover:scale-110 transition-all"><Scale size={10} /></button>
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
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setPaymentMethod('pix')} className={`p-3 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-2 transition-all ${paymentMethod === 'pix' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                          <QrCode size={18} /> PIX
                        </button>
                        <button onClick={() => setPaymentMethod('credit')} className={`p-3 rounded-xl border-2 font-black text-[10px] flex flex-col items-center gap-2 transition-all ${paymentMethod === 'credit' ? 'border-cyan-500 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20' : 'border-slate-100 dark:border-gray-700 text-slate-400'}`}>
                          <CreditCard size={18} /> CARTÃO
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
                      </div>

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

                            <div className="pt-2 border-t border-slate-100 dark:border-gray-700 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500">Peso Líquido (Carga)</span>
                              <span className="text-lg font-black text-cyan-600">
                                {Math.max(0, grossWeight - tareWeight).toLocaleString('pt-BR')} kg
                              </span>
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
                      <button onClick={handleFinalizeOrder} className="py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-lg shadow-cyan-600/30 text-xs hover:bg-cyan-700 transition-all flex flex-col items-center justify-center gap-1">
                        <CheckCircle size={16} /> FINALIZAR VENDA
                      </button>
                    </div>
                    <button onClick={() => setShowCheckout(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] hover:underline uppercase">Voltar para Edição</button>
                  </div>
                )}
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
                            <button
                              onClick={() => handleConvertBudgetToSale(b)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                            >
                              <CheckCircle size={18} />
                            </button>
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
      )}
    </div>
  );
};

export default Sales;
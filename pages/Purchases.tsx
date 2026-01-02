import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
   ShoppingBag,
   Truck,
   Wrench,
   Fuel,
   Package,
   Plus,
   FileText,
   AlertTriangle,
   Clock,
   TrendingDown,
   TrendingUp,
   ChevronRight,
   CheckCircle,
   Search,
   Filter,
   X,
   Trash2,
   Save,
   ArrowRight,
   MoreVertical,
   DollarSign,
   Calendar,
   Warehouse,
   Tag,
   AlertCircle,
   Paperclip,
   Upload,
   XCircle,
   File,
   PieChart as PieIcon,
   BarChart as BarIcon,
   Users,
   Printer,
   Edit2,
   ClipboardCheck,
   ShieldCheck,
   Settings
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseOrder, PurchaseItem, Supplier, InventoryItem, MaintenanceRecord, Employee } from '../types';
import { printDocument } from '../utils/exportUtils';

const Purchases = () => {
   const {
      fleet,
      updateVehicleStatus,
      addTransaction,
      suppliers,
      addSupplier,
      updateSupplier,
      transactions,
      inventory,
      purchaseOrders,
      addPurchaseOrder,
      updatePurchaseOrder,
      receivePurchaseOrder,
      addStockItem,
      updateStockItem,
      deleteStockItem,
      accounts,
      currentUser,
      addMaintenanceRecord,
      employees
   } = useApp();

   const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'new-order' | 'suppliers' | 'inventory' | 'approval'>('dashboard');
   const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // New Order Form States
   const [selectedSupplier, setSelectedSupplier] = useState<string>('');
   const [orderItems, setOrderItems] = useState<PurchaseItem[]>([]);
   const [isStockDirect, setIsStockDirect] = useState(true); // If true, auto-marks as Received
   const [tempAttachments, setTempAttachments] = useState<any[]>([]);

   // Financial & Shipping
   const [paymentTerms, setPaymentTerms] = useState<string>('30 DDL');
   const [shippingCost, setShippingCost] = useState<number>(0);
   const [sourceAccount, setSourceAccount] = useState<string>('');



   // Inventory Management States
   const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
   const [isStockModalOpen, setIsStockModalOpen] = useState(false);
   const [stockForm, setStockForm] = useState<Partial<InventoryItem>>({
      name: '', category: 'Insumos', quantity: 0, minStock: 0, unit: 'kg', price: 0
   });

   // Supplier Management States
   const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
   const [supForm, setSupForm] = useState<Partial<Supplier>>({
      status: 'Ativo', registeredAt: new Date().toLocaleDateString('pt-BR')
   });
   const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

   // Search & Filter
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState<string>('Todos');

   // OSM States (Maintenance)
   const [isOSMModalOpen, setIsOSMModalOpen] = useState(false);
   const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
   const [osmForm, setOsmForm] = useState<Partial<MaintenanceRecord>>({
      type: 'Preventiva',
      date: new Date().toISOString().split('T')[0],
      cost: 0,
      km: 0,
      attachments: []
   });

   // ODO States (Operational Expense)
   const [isODOModalOpen, setIsODOModalOpen] = useState(false);
   const [odoForm, setOdoForm] = useState<{
      description: string;
      date: string;
      value: number;
      category: string;
      supplierName: string;
      paymentMethod: string;
      installments: number;
      account: string;
      attachments: any[];
   }>({
      description: '',
      date: new Date().toISOString().split('T')[0],
      value: 0,
      category: 'Despesa Operacional',
      supplierName: 'Fornecedor Diverso',
      paymentMethod: 'Boleto',
      installments: 1,
      account: '',
      attachments: []
   });

   // ODP States (Personnel Expense)
   const [isODPModalOpen, setIsODPModalOpen] = useState(false);
   const [odpForm, setOdpForm] = useState<{
      employeeId: string;
      type: string;
      value: number;
      date: string;
      description: string;
      paymentMethod: string;
      account: string;
   }>({
      employeeId: '',
      type: 'Adiantamento Salarial',
      value: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'Transferência Bancária',
      account: ''
   });

   // Cart Management
   const addItemToOrder = (product: InventoryItem) => {
      const exists = orderItems.find(item => item.id === product.id);
      if (exists) {
         setOrderItems(orderItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
         setOrderItems([...orderItems, {
            id: product.id,
            name: product.name,
            quantity: 1,
            unit: product.unit,
            price: product.price
         }]);
      }
   };

   const removeItem = (id: string) => {
      setOrderItems(orderItems.filter(item => item.id !== id));
   };

   const updateItemQuantity = (id: string, qty: number) => {
      setOrderItems(orderItems.map(item => item.id === id ? { ...item, quantity: Math.max(0.1, qty) } : item));
   };

   const orderSubtotal = orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
   const orderTotal = orderSubtotal + shippingCost; // With shipping

   const handleCreateOrder = () => {
      if (isSubmitting) return;

      if (!selectedSupplier || orderItems.length === 0) {
         alert("Selecione um fornecedor e adicione itens ao pedido.");
         return;
      }

      setIsSubmitting(true);

      const supplier = suppliers.find(s => s.id === selectedSupplier);
      const newOrder: PurchaseOrder = {
         id: `PO-${Date.now()}`,
         supplierId: selectedSupplier,
         supplierName: supplier?.name || 'Fornecedor Desconhecido',
         date: new Date().toLocaleDateString('pt-BR'),
         items: orderItems,
         subtotal: orderSubtotal,
         total: orderTotal,
         status: 'Pendente', // Always Pending first
         attachments: tempAttachments,
         paymentTerms,
         shippingCost,
         targetAccountId: sourceAccount // Opicional nesta fase
      };

      addPurchaseOrder(newOrder);

      alert("Pedido enviado para a Central de Aprovações!");

      // Reset and redirect
      setOrderItems([]);
      setSelectedSupplier('');
      setTempAttachments([]);
      setShippingCost(0);
      setSourceAccount('');
      setActiveTab('approval'); // Go to approval
      setIsSubmitting(false);
   };

   const handleApproveOrder = (order: PurchaseOrder) => {
      if (confirm(`Confirmar aprovação do pedido #${order.id}?`)) {
         updatePurchaseOrder({ ...order, status: 'Aprovado' });
      }
   };

   const handleRejectOrder = (order: PurchaseOrder) => {
      if (confirm(`Rejeitar pedido #${order.id}? Ele será cancelado.`)) {
         updatePurchaseOrder({ ...order, status: 'Cancelado' });
      }
   };

   const handleReceiveApprovedOrder = (order: PurchaseOrder) => {
      if (order.status !== 'Aprovado') return alert("O pedido precisa ser APROVADO antes de ser recebido.");

      // If no account, Context falls back to Default/Caixa
      receivePurchaseOrder(order.id);
      alert(`Recebimento confirmado! Estoque e Financeiro atualizados.${!order.targetAccountId ? ' (Conta Padrão utilizada)' : ''}`);
   };

   const handleSaveStock = (e: React.FormEvent) => {
      e.preventDefault();
      const item = {
         ...stockForm,
         id: editingItem?.id || `ITM-${Date.now()}`,
      } as InventoryItem;

      if (editingItem) {
         updateStockItem(item);
      } else {
         addStockItem(item);
      }
      setIsStockModalOpen(false);
      setEditingItem(null);
      setStockForm({ name: '', category: 'Insumos', quantity: 0, minStock: 0, unit: 'kg', price: 0 });
   };

   const handleSaveSupplier = (e: React.FormEvent) => {
      e.preventDefault();
      const supplier = {
         ...supForm,
         id: editingSupplier?.id || `SUP-${Date.now()}`,
      } as Supplier;

      if (editingSupplier) {
         updateSupplier(supplier);
      } else {
         addSupplier(supplier);
      }
      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      setSupForm({ status: 'Ativo', registeredAt: new Date().toLocaleDateString('pt-BR') });
   };

   // Filtered Lists
   const filteredOrders = purchaseOrders.filter(order => {
      const matchesTerm = order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.includes(searchTerm);
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
      return matchesTerm && matchesStatus;
   });

   const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
   };

   const handlePrintPurchaseOrder = (order: PurchaseOrder) => {
      const html = `
         <div class="header">
            <div class="company-info">
               <h1>INFRACORE ERP</h1>
               <p>Sistemas de Gestão para Engenharia e Indústria</p>
            </div>
            <div class="doc-info">
               <h2>PEDIDO DE COMPRA</h2>
               <p>Nº: <strong>${order.id}</strong></p>
               <p>DATA: ${order.date}</p>
            </div>
         </div>

         <div class="details-grid">
            <div class="detail-box">
               <h3>FORNECEDOR</h3>
               <p>${order.supplierName}</p>
               <p>Emissão: ${order.date}</p>
            </div>
            <div class="detail-box">
               <h3>STATUS DO PEDIDO</h3>
               <p>${order.status.toUpperCase()}</p>
               <p>Classificação: ${order.ledgerName || 'Geral'}</p>
            </div>
         </div>

         <table>
            <thead>
               <tr>
                  <th>DESCRIÇÃO DO ITEM</th>
                  <th class="text-right">QTD</th>
                  <th class="text-right">UN</th>
                  <th class="text-right">VALOR UNIT.</th>
                  <th class="text-right">SUBTOTAL</th>
               </tr>
            </thead>
            <tbody>
               ${order.items.map(item => `
                  <tr>
                     <td>${item.name}</td>
                     <td class="text-right">${item.quantity}</td>
                     <td class="text-right">${item.unit || 'UN'}</td>
                     <td class="text-right">${formatCurrency(item.price)}</td>
                     <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
               `).join('')}
            </tbody>
         </table>

         <div class="totals">
            <div class="total-row total-final">
               <span>VALOR TOTAL DO PEDIDO:</span>
               <span>${formatCurrency(order.total)}</span>
            </div>
         </div>

         <div style="margin-top: 50px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #64748b;">INSTRUÇÕES DE ENTREGA / COBRANÇA</h4>
            <p style="font-size: 11px; margin: 0;">* Este pedido deve ser acompanhado da Nota Fiscal correspondente no ato da entrega.<br>
            * A conferência qualitativa e quantitativa será realizada no recebimento.<br>
            * Condições de pagamento conforme acordado previamente com o departamento financeiro.</p>
         </div>
      `;
      printDocument(`Pedido_Compra_${order.id}_${order.supplierName.replace(/\s+/g, '_')}`, html);
   };

   // UI Helpers
   const getStatusColor = (status: string) => {
      switch (status) {
         case 'Recebido': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
         case 'Pendente': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
         case 'Aprovado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
         case 'Cancelado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
         default: return 'bg-gray-100 text-gray-500';
      }
   };

   const handleSaveOSM = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVehicleId) return;

      const record: MaintenanceRecord = {
         id: `M-${Date.now()}`,
         vehicleId: selectedVehicleId,
         date: osmForm.date || '',
         type: osmForm.type as any || 'Preventiva',
         description: osmForm.description || '',
         cost: Number(osmForm.cost) || 0,
         km: Number(osmForm.km) || 0,
         mechanic: osmForm.mechanic,
         attachments: osmForm.attachments,
         productId: osmForm.productId,
         productQuantity: osmForm.productQuantity,
         debitAccountId: osmForm.debitAccountId,
         ledgerCode: osmForm.ledgerCode,
         ledgerName: osmForm.ledgerName
      };

      addMaintenanceRecord(selectedVehicleId, record);
      setIsOSMModalOpen(false);
      setOsmForm({
         type: 'Preventiva',
         date: new Date().toISOString().split('T')[0],
         cost: 0,
         km: 0,
         attachments: []
      });
      alert("OSM gerada com sucesso!");
   };

   const handleSaveODO = (e: React.FormEvent) => {
      e.preventDefault();

      const newOrder: PurchaseOrder = {
         id: `ODO-${Date.now()}`,
         supplierId: 'DVERSO',
         supplierName: odoForm.supplierName,
         date: new Date(odoForm.date).toLocaleDateString('pt-BR'),
         items: [{
            id: `SERV-${Date.now()}`,
            name: odoForm.description,
            quantity: 1,
            unit: 'SV',
            price: odoForm.value
         }],
         subtotal: odoForm.value,
         total: odoForm.value,
         status: 'Pendente',
         attachments: odoForm.attachments,
         paymentTerms: odoForm.paymentMethod,
         shippingCost: 0,
         ledgerName: odoForm.category,
         targetAccountId: odoForm.account
      };

      addPurchaseOrder(newOrder);
      setIsODOModalOpen(false);
      setOdoForm({
         description: '',
         date: new Date().toISOString().split('T')[0],
         value: 0,
         category: 'Despesa Operacional',
         supplierName: 'Fornecedor Diverso',
         paymentMethod: 'Boleto',
         installments: 1,
         account: '',
         attachments: []
      });
      alert("ODO gerada e enviada para aprovação!");
   };

   const handleSaveODP = (e: React.FormEvent) => {
      e.preventDefault();

      const employee = employees.find(emp => emp.id === odpForm.employeeId);
      if (!employee) return;

      const newOrder: PurchaseOrder = {
         id: `ODP-${Date.now()}`,
         supplierId: employee.id,
         supplierName: employee.name,
         date: new Date(odpForm.date).toLocaleDateString('pt-BR'),
         items: [{
            id: `SERV-${Date.now()}`,
            name: `${odpForm.type}: ${odpForm.description}`,
            quantity: 1,
            unit: 'UN',
            price: odpForm.value
         }],
         subtotal: odpForm.value,
         total: odpForm.value,
         status: 'Pendente',
         attachments: [],
         paymentTerms: odpForm.paymentMethod,
         shippingCost: 0,
         ledgerName: `Pessoal - ${odpForm.type}`,
         targetAccountId: odpForm.account,
         ledgerCode: '2.01.01' // Generic code for personnel
      };

      addPurchaseOrder(newOrder);
      setIsODPModalOpen(false);
      setOdpForm({
         employeeId: '',
         type: 'Adiantamento Salarial',
         value: 0,
         date: new Date().toISOString().split('T')[0],
         description: '',
         paymentMethod: 'Transferência Bancária',
         account: ''
      });
      alert("ODP gerada com sucesso!");
   };

   return (
      <div className="flex flex-col gap-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <ShoppingBag className="text-cyan-600" />
                  Central de Compras e Despesas
               </h2>
               <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Gestão de pedidos de compra, fornecedores e estoque de insumos.</p>
            </div>
            <div className="flex items-center gap-2">

               <button className="p-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-600 dark:text-gray-300">
                  <FileText size={20} />
               </button>
            </div>
         </div>

         {/* Main Tabs */}
         <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
               {['dashboard', 'orders', 'suppliers', 'inventory'].map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 capitalize ${activeTab === tab
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                  >
                     {tab === 'dashboard' && <BarIcon size={16} />}
                     {tab === 'approval' && <ShieldCheck size={16} />}
                     {tab === 'orders' && <FileText size={16} />}
                     {tab === 'suppliers' && <Users size={16} />}
                     {tab === 'inventory' && <Warehouse size={16} />}
                     {
                        tab === 'dashboard' ? 'Painel Geral' :
                           tab === 'approval' ? 'Central de Aprovações' :
                              tab === 'orders' ? 'Histórico de Pedidos' :
                                 tab === 'suppliers' ? 'Fornecedores' : 'Estoque'
                     }
                  </button>
               ))}
            </nav>
         </div>



         {/* DASHBOARD TAB */}
         {activeTab === 'dashboard' && (
            <div className="space-y-6">

               {/* Authorization Center (Moved to Dashboard) */}
               <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl border border-slate-700 text-white flex justify-between items-center">
                  <div className="flex flex-col gap-6 items-start">
                     <div>
                        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                           <ShieldCheck className="text-emerald-400" size={32} />
                           Central de Autorização
                        </h2>
                        <p className="text-slate-400 font-medium">Os pedidos abaixo aguardam análise para liberação de compra e estoque.</p>
                     </div>
                     <div className="flex flex-wrap gap-4">
                        <button
                           onClick={() => setActiveTab('new-order')}
                           className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition-all uppercase tracking-wide hover:scale-105 active:scale-95"
                        >
                           <Plus size={20} />
                           Gerar Pedido de Compra
                        </button>
                        <button
                           onClick={() => setIsOSMModalOpen(true)}
                           className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-600/20 hover:bg-teal-500 transition-all uppercase tracking-wide hover:scale-105 active:scale-95"
                        >
                           <Wrench size={20} />
                           Gerar OSM
                        </button>
                        <button
                           onClick={() => setIsODOModalOpen(true)}
                           className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase tracking-wide hover:scale-105 active:scale-95"
                        >
                           <FileText size={20} />
                           Gerar ODO
                        </button>
                        <button
                           onClick={() => setIsODPModalOpen(true)}
                           className="flex items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-fuchsia-600/20 hover:bg-fuchsia-500 transition-all uppercase tracking-wide hover:scale-105 active:scale-95"
                        >
                           <Users size={20} />
                           Gerar ODP
                        </button>
                     </div>
                  </div>
                  <div className="text-right bg-white/5 p-4 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pendente</p>
                     <p className="text-3xl font-black text-emerald-400">{formatCurrency(purchaseOrders.filter(o => o.status === 'Pendente').reduce((acc, curr) => acc + curr.total, 0))}</p>
                  </div>
               </div>

               {/* Pending Orders List (Only if > 0) */}
               {purchaseOrders.filter(o => o.status === 'Pendente').length > 0 && (
                  <div className="grid grid-cols-1 gap-6">
                     {purchaseOrders.filter(o => o.status === 'Pendente').map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                           <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
                           <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                              <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">Aguardando Análise</span>
                                    <span className="text-xs font-bold text-slate-400">{order.date}</span>
                                    <span className="text-xs font-mono text-slate-300">#{order.id}</span>
                                 </div>
                                 <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{order.supplierName}</h3>
                                 <p className="text-sm text-slate-500">{order.items.length} itens • Condição: <span className="font-bold text-slate-700 dark:text-slate-300">{order.paymentTerms}</span></p>
                              </div>

                              <div className="flex gap-8 items-center border-l dark:border-slate-700 pl-8">
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Valor Total</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(order.total)}</p>
                                 </div>
                                 <div className="flex gap-3">
                                    <button
                                       onClick={() => handleRejectOrder(order)}
                                       className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold uppercase text-[10px] transition-colors"
                                    >
                                       Rejeitar
                                    </button>
                                    <button
                                       onClick={() => handleApproveOrder(order)}
                                       className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-emerald-600/20 hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                       <ShieldCheck size={18} /> Autorizar Compra
                                    </button>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                              <div className="flex gap-4 overflow-x-auto pb-2">
                                 {order.items.map(item => (
                                    <div key={item.id} className="min-w-[150px] p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                       <p className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                                       <div className="flex justify-between mt-1">
                                          <span className="text-[10px] text-slate-500">{item.quantity} {item.unit}</span>
                                          <span className="text-[10px] font-bold text-emerald-600">{formatCurrency(item.price * item.quantity)}</span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Stats */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                           <ShoppingBag size={24} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700`}>Mês Atual</span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase mb-1">Total em Compras</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(purchaseOrders.reduce((acc, curr) => acc + curr.total, 0))}
                     </h3>
                     <div className="mt-2 text-[10px] text-slate-400">Total acumulado de pedidos rascunhados e recebidos.</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                           <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700">{purchaseOrders.filter(o => o.status === 'Pendente').length}</span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase mb-1">Pedidos Pendentes</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Aguardando</h3>
                     <div className="mt-2 text-[10px] text-slate-400">Ordens de compra enviadas aos fornecedores.</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                           <AlertCircle size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 text-red-700">{inventory.filter(i => i.quantity < i.minStock).length}</span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase mb-1">Alerta de Estoque</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Crítico</h3>
                     <div className="mt-2 text-[10px] text-slate-400">Produtos abaixo do estoque de segurança.</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg">
                           <CheckCircle size={24} />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700">Frota OK</span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase mb-1">Frota Ativa</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {fleet.filter(v => v.status === 'Operacional').length}/{fleet.length}
                     </h3>
                     <div className="mt-2 text-[10px] text-slate-400">Veículos prontos para operação.</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Monthly Purchases Chart */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-6">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <BarIcon className="text-cyan-600" size={18} />
                           Volume de Compras Mensal
                        </h3>
                     </div>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={[
                              { name: 'Jul', total: 45000 },
                              { name: 'Ago', total: 52000 },
                              { name: 'Set', total: 38000 },
                              { name: 'Out', total: 61000 },
                              { name: 'Nov', total: 47000 },
                              { name: 'Dez', total: 55000 },
                           ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                              <Bar dataKey="total" fill="#0891b2" radius={[4, 4, 0, 0]} barSize={30} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Stock Alert Status */}
                  <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl p-6 shadow-lg text-white">
                     <h3 className="font-bold text-sm uppercase tracking-widest opacity-70 mb-4">Saúde do Suprimento</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-xs">Estoque Geral</span>
                           <span className="font-black text-xl">84%</span>
                        </div>
                        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                           <div className="bg-white h-full" style={{ width: '84%' }}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4">
                           <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                              <p className="text-[10px] uppercase opacity-60">Giro Médio</p>
                              <p className="text-lg font-bold">12.5 d</p>
                           </div>
                           <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                              <p className="text-[10px] uppercase opacity-60">Lead Time</p>
                              <p className="text-lg font-bold">4.2 d</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Critical Inventory */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <Warehouse className="text-red-500" size={18} />
                           Reposição Necessária
                        </h3>
                        <button onClick={() => setActiveTab('new-order')} className="text-xs text-cyan-600 font-bold hover:underline">Comprar Tudo</button>
                     </div>
                     <div className="divide-y divide-slate-100 dark:divide-gray-700">
                        {inventory.filter(i => i.quantity < i.minStock).slice(0, 5).map(item => (
                           <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50">
                              <div>
                                 <p className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                 <p className="text-xs text-slate-500">Mín: {item.minStock} {item.unit} • Atual: <span className="text-red-600 font-bold">{item.quantity}</span></p>
                              </div>
                              <button
                                 onClick={() => {
                                    addItemToOrder(item);
                                    setActiveTab('new-order');
                                 }}
                                 className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              >
                                 <Plus size={18} />
                              </button>
                           </div>
                        ))}
                        {inventory.filter(i => i.quantity < i.minStock).length === 0 && (
                           <div className="p-8 text-center text-slate-400 italic text-sm">Nenhum estoque crítico no momento.</div>
                        )}
                     </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <Clock className="text-blue-500" size={18} />
                           Pedidos Recentes
                        </h3>
                     </div>
                     <div className="overflow-x-auto text-sm">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50 dark:bg-gray-700/50 text-slate-500 font-bold text-[10px] uppercase">
                              <tr>
                                 <th className="px-6 py-2">ID</th>
                                 <th className="px-6 py-2">Fornecedor</th>
                                 <th className="px-6 py-2 text-right">Total</th>
                                 <th className="px-6 py-2 text-center">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                              {purchaseOrders.slice(0, 5).map(order => (
                                 <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-3 font-mono text-xs">{order.id}</td>
                                    <td className="px-6 py-3 font-medium">{order.supplierName}</td>
                                    <td className="px-6 py-3 text-right font-bold">{formatCurrency(order.total)}</td>
                                    <td className="px-6 py-3 text-center">
                                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                                          {order.status}
                                       </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                       {/* Actions per row */}
                                       {order.status === 'Aprovado' && (
                                          <button
                                             onClick={() => receivePurchaseOrder(order.id)}
                                             title="Receber Material"
                                             className="p-1 px-2 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase hover:bg-emerald-200 mr-2"
                                          >
                                             Receber
                                          </button>
                                       )}
                                       <button onClick={() => handlePrintPurchaseOrder(order)} className="text-slate-400 hover:text-cyan-600"><Printer size={16} /></button>
                                    </td>
                                 </tr>
                              ))}
                              {purchaseOrders.length === 0 && (
                                 <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 italic">Nenhum pedido realizado.</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* NEW ORDER TAB */}
         {activeTab === 'new-order' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-300">
               {/* Left: Product Selector */}
               <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-6">
                     <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Search size={20} className="text-cyan-600" />
                        Escolher Itens
                     </h3>
                     <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           type="text"
                           placeholder="Buscar no estoque..."
                           className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                        {inventory.map(item => (
                           <button
                              key={item.id}
                              onClick={() => addItemToOrder(item)}
                              className="group p-4 bg-slate-50 dark:bg-gray-700/30 border border-slate-200 dark:border-gray-600 rounded-xl text-left hover:border-cyan-500 hover:bg-white dark:hover:bg-gray-700 transition-all"
                           >
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">{item.category} • {item.unit}</p>
                                 </div>
                                 <Plus className="text-slate-300 group-hover:text-cyan-600 group-hover:scale-110 transition-all" size={18} />
                              </div>
                              <div className="mt-3 flex items-end justify-between">
                                 <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400">{formatCurrency(item.price)}</span>
                                 <span className={`text-[10px] ${item.quantity < item.minStock ? 'text-red-500 font-bold' : 'text-slate-400'}`}>Estoque: {item.quantity}</span>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right: Cart & Supplier */}
               <div className="flex flex-col gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
                     <div className="p-4 bg-slate-50 dark:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <ShoppingBag size={18} className="text-cyan-600" />
                           Resumo da Compra
                        </h3>
                     </div>

                     <div className="p-4 space-y-4 flex-1">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fornecedor</label>
                           <select
                              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                              value={selectedSupplier}
                              onChange={(e) => setSelectedSupplier(e.target.value)}
                           >
                              <option value="">Selecione um fornecedor...</option>
                              {suppliers.map(s => (
                                 <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-3">
                           <label className="block text-xs font-bold text-slate-500 uppercase">Itens Selecionados</label>
                           <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {orderItems.map(item => (
                                 <div key={item.id} className="p-2 border border-slate-100 dark:border-gray-700 rounded-lg bg-slate-50/50 dark:bg-gray-800/50 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                       <p className="text-xs font-bold truncate max-w-[150px]">{item.name}</p>
                                       <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 px-1"><X size={14} /></button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <input
                                             type="number"
                                             className="w-16 p-1 text-xs border rounded dark:bg-gray-700 dark:text-white text-center"
                                             value={item.quantity}
                                             onChange={(e) => updateItemQuantity(item.id, parseFloat(e.target.value))}
                                          />
                                          <span className="text-[10px] text-slate-500">{item.unit}</span>
                                       </div>
                                       <span className="text-xs font-bold">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                 </div>
                              ))}
                              {orderItems.length === 0 && (
                                 <div className="py-8 text-center text-slate-400 text-xs italic">Carrinho vazio.</div>
                              )}
                           </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="pt-4 border-t border-slate-100 dark:border-gray-700">
                           <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                              <Paperclip size={14} className="text-cyan-600" /> Notas & Anexos
                           </h4>
                           <div className="space-y-3">
                              <div className="border-2 border-dashed border-slate-100 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-400 transition-colors relative">
                                 <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                       const file = e.target.files?.[0];
                                       if (file) {
                                          const at = { id: Date.now().toString(), name: file.name, date: new Date().toLocaleDateString('pt-BR'), size: (file.size / 1024).toFixed(1) + ' KB', type: file.type };
                                          setTempAttachments([...tempAttachments, at]);
                                       }
                                    }}
                                 />
                                 <Upload size={16} className="text-slate-300 mb-1" />
                                 <span className="text-[9px] font-bold text-slate-400 uppercase">Anexar cupom/nota</span>
                              </div>

                              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                 {tempAttachments.map(at => (
                                    <div key={at.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-gray-800 rounded-lg group border border-transparent hover:border-cyan-100">
                                       <div className="flex items-center gap-2 overflow-hidden">
                                          <File size={12} className="text-cyan-600 shrink-0" />
                                          <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate">{at.name}</span>
                                       </div>
                                       <button type="button" onClick={() => setTempAttachments(tempAttachments.filter(a => a.id !== at.id))} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                                          <XCircle size={12} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Financial Settings */}
                        <div className="pt-4 border-t border-slate-100 dark:border-gray-700 space-y-3">
                           <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                              <DollarSign size={14} className="text-cyan-600" /> Detalhes Financeiros
                           </h4>
                           <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Condição de Pagamento</label>
                              <select
                                 className="w-full p-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg text-xs font-bold"
                                 value={paymentTerms}
                                 onChange={e => setPaymentTerms(e.target.value)}
                              >
                                 <option value="À Vista">À Vista</option>
                                 <option value="15 DDL">15 Dias</option>
                                 <option value="30 DDL">30 Dias</option>
                                 <option value="30/60 DDL">30/60 Dias</option>
                                 <option value="30/60/90 DDL">30/60/90 Dias</option>
                              </select>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Custo Frete (R$)</label>
                                 <input
                                    type="number"
                                    className="w-full p-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg text-xs font-bold"
                                    value={shippingCost}
                                    onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                                 />
                              </div>
                              <div>
                                 <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Conta de Saída</label>
                                 <select
                                    className="w-full p-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg text-xs font-bold"
                                    value={sourceAccount}
                                    onChange={e => setSourceAccount(e.target.value)}
                                 >
                                    <option value="">Selecione...</option>
                                    {accounts.map(acc => (
                                       <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Totals & Actions */}
                     <div className="p-4 bg-slate-50 dark:bg-gray-700/50 border-t border-slate-200 dark:border-gray-600 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">Subtotal:</span>
                           <span className="font-bold">{formatCurrency(orderSubtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                           <span className="font-bold text-slate-800 dark:text-white">Total:</span>
                           <span className="font-black text-cyan-600">{formatCurrency(orderTotal)}</span>
                        </div>

                        <div className="col-span-2">
                           <button
                              onClick={() => handleCreateOrder()}
                              disabled={isSubmitting}
                              className={`w-full py-4 bg-cyan-600 rounded-xl text-sm font-black text-white shadow-lg hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 uppercase tracking-wide ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                           >
                              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : <ShieldCheck size={18} />}
                              {isSubmitting ? 'Processando...' : 'Enviar para Aprovação'}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* ORDERS LIST TAB */}
         {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
               <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:w-96">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <input
                        type="text"
                        placeholder="Buscar fornecedor ou ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 dark:bg-gray-700 text-sm outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex items-center gap-3">
                     <select
                        className="p-2 border border-slate-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                     >
                        <option value="Todos">Todos os Status</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Recebido">Recebido</option>
                        <option value="Cancelado">Cancelado</option>
                     </select>
                     <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <Filter size={16} /> Filtros
                     </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 dark:bg-gray-700/50 text-slate-600 dark:text-gray-300 font-bold text-xs uppercase border-b border-slate-200 dark:border-gray-700">
                        <tr>
                           <th className="px-6 py-3">ID Pedido / Data</th>
                           <th className="px-6 py-3">Fornecedor</th>
                           <th className="px-6 py-3">Itens</th>
                           <th className="px-6 py-3 text-right">Valor Total</th>
                           <th className="px-6 py-3 text-center">Status</th>
                           <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                        {filteredOrders.map(order => (
                           <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/50 transition-colors group">
                              <td className="px-6 py-4">
                                 <p className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-400">{order.id}</p>
                                 <p className="text-[10px] text-slate-500 mt-0.5">{order.date}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="font-bold text-slate-800 dark:text-white">{order.supplierName}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col gap-0.5">
                                    {order.items.slice(0, 2).map((it, idx) => (
                                       <span key={idx} className="text-[10px] text-slate-500">• {it.quantity} {it.unit} {it.name}</span>
                                    ))}
                                    {order.items.length > 2 && <span className="text-[10px] text-cyan-600 font-bold">+ {order.items.length - 2} itens</span>}
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                 {formatCurrency(order.total)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button
                                       onClick={() => setSelectedOrder(order)}
                                       className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg transition-colors"
                                       title="Ver Detalhes"
                                    >
                                       <ArrowRight size={18} />
                                    </button>
                                    <button
                                       onClick={() => handlePrintPurchaseOrder(order)}
                                       className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                       title="Imprimir Pedido"
                                    >
                                       <Printer size={18} />
                                    </button>
                                    {order.status === 'Aprovado' && (
                                       <button
                                          onClick={() => handleReceiveApprovedOrder(order)}
                                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          title="Receber Pedido (Aprovado)"
                                       >
                                          <CheckCircle size={18} />
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Nenhum pedido encontrado.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* INVENTORY TAB */}
         {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               {/* Search and Quick Filters */}
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           type="text"
                           placeholder="Buscar item, categoria ou código..."
                           className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 dark:bg-gray-700 text-sm outline-none"
                        />
                     </div>

                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                     {['Todos', 'Crítico', 'Normal', 'Excedente'].map(f => (
                        <button key={f} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${f === 'Todos' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                           {f}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Inventory List */}
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-gray-700/50 text-slate-600 dark:text-gray-300 font-bold text-xs uppercase border-b border-slate-200 dark:border-gray-700">
                           <tr>
                              <th className="px-6 py-4">Item / Categoria</th>
                              <th className="px-6 py-4 text-center">Status</th>
                              <th className="px-6 py-4 text-center">Quantidade</th>
                              <th className="px-6 py-4 text-right">Preço Médio</th>
                              <th className="px-6 py-4 text-right">Ações</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                           {inventory.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-700/50 transition-colors group">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-lg ${item.category === 'Insumos' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                          <Package size={20} />
                                       </div>
                                       <div>
                                          <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.category}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${item.quantity < item.minStock
                                       ? 'bg-rose-100 text-rose-700 border-rose-200'
                                       : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                       }`}>
                                       {item.quantity < item.minStock ? 'REPOSIÇÃO' : 'DISPONÍVEL'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                       <span className={`font-bold ${item.quantity < item.minStock ? 'text-rose-600' : 'text-slate-700 dark:text-white'}`}>
                                          {item.quantity} {item.unit}
                                       </span>
                                       <span className="text-[10px] text-slate-400">Mín: {item.minStock}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right font-mono font-medium text-slate-600 dark:text-gray-300">
                                    {formatCurrency(item.price)}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       <button
                                          onClick={() => {
                                             addItemToOrder(item);
                                             setActiveTab('new-order');
                                          }}
                                          className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors border border-transparent hover:border-cyan-100"
                                          title="Solicitar Reposição"
                                       >
                                          <ShoppingBag size={18} />
                                       </button>
                                       {currentUser?.roleId === 'admin' && (
                                          <>
                                             <button
                                                onClick={() => { setEditingItem(item); setStockForm(item); setIsStockModalOpen(true); }}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                                                title="Editar"
                                             >
                                                <Edit2 size={18} />
                                             </button>
                                             <button
                                                onClick={() => { if (confirm('Remover este item do catálogo?')) deleteStockItem(item.id); }}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Excluir"
                                             >
                                                <Trash2 size={18} />
                                             </button>
                                          </>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {inventory.length === 0 && (
                              <tr>
                                 <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                    Nenhum item cadastrado no estoque.
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}
         {activeTab === 'suppliers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
               {suppliers.map(sup => (
                  <div key={sup.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 hover:border-cyan-200 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                           <Users size={24} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sup.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {sup.status}
                        </span>
                     </div>
                     <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{sup.name}</h4>
                     <p className="text-xs text-slate-500 mb-4">{sup.category} • {sup.document}</p>

                     <div className="space-y-2 border-t dark:border-gray-700 pt-4 mt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                           <Calendar size={14} className="text-slate-400" />
                           Desde: {sup.registeredAt}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                           <DollarSign size={14} className="text-slate-400" />
                           Total Comprado: {formatCurrency(purchaseOrders.filter(o => o.supplierId === sup.id).reduce((a, b) => a + b.total, 0))}
                        </div>
                     </div>

                     <div className="mt-6 flex gap-2">
                        <button className="flex-1 py-2 bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-cyan-50 hover:text-cyan-600 transition-colors">Editar</button>
                        <button onClick={() => {
                           setSelectedSupplier(sup.id);
                           setActiveTab('new-order');
                        }} className="flex-1 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors">Novo Pedido</button>
                     </div>
                  </div>
               ))}
               <button onClick={() => { setSupForm({ status: 'Ativo', registeredAt: new Date().toLocaleDateString('pt-BR') }); setIsSupplierModalOpen(true); }} className="bg-slate-50/50 dark:bg-gray-800/50 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-cyan-300 hover:text-cyan-500 transition-all group">
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-full group-hover:scale-110 transition-transform shadow-sm">
                     <Plus size={32} />
                  </div>
                  <span className="font-bold text-sm">Adicionar Fornecedor</span>
               </button>
            </div>
         )}

         {/* ORDER DETAILS MODAL */}
         {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border dark:border-gray-700 animate-in zoom-in duration-200 overflow-hidden">
                  <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-800/50">
                     <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                           Pedido {selectedOrder.id}
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(selectedOrder.status)}`}>
                              {selectedOrder.status}
                           </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Data: {selectedOrder.date} • Fornecedor: {selectedOrder.supplierName}</p>
                     </div>
                     <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>

                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Itens do Pedido</h4>
                        <div className="bg-slate-50 dark:bg-gray-900/50 rounded-xl overflow-hidden border border-slate-100 dark:border-gray-700">
                           <table className="w-full text-sm">
                              <thead className="bg-slate-100 dark:bg-gray-800 text-[10px] font-black uppercase text-slate-500">
                                 <tr>
                                    <th className="px-4 py-2 text-left">Item</th>
                                    <th className="px-4 py-2 text-center">Quant.</th>
                                    <th className="px-4 py-2 text-right">Preço</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                 {selectedOrder.items.map((it, idx) => (
                                    <tr key={idx}>
                                       <td className="px-4 py-3 font-bold text-slate-700 dark:text-gray-300">{it.name}</td>
                                       <td className="px-4 py-3 text-center">{it.quantity} {it.unit}</td>
                                       <td className="px-4 py-3 text-right">{formatCurrency(it.price)}</td>
                                       <td className="px-4 py-3 text-right font-bold">{formatCurrency(it.price * it.quantity)}</td>
                                    </tr>
                                 ))}
                              </tbody>
                              <tfoot className="bg-slate-50 dark:bg-gray-800/50 font-bold">
                                 <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right uppercase text-[10px] text-slate-500">Total do Pedido</td>
                                    <td className="px-4 py-3 text-right text-cyan-600">{formatCurrency(selectedOrder.total)}</td>
                                 </tr>
                              </tfoot>
                           </table>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Classificação Financeira</h4>
                           <div className="p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
                              <p className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400">[{selectedOrder.ledgerCode || '2.02.03'}]</p>
                              <p className="text-xs font-bold text-cyan-900 dark:text-cyan-200">{selectedOrder.ledgerName || 'Material de Consumo'}</p>
                           </div>
                        </div>
                        <div>
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Anexos ({selectedOrder.attachments?.length || 0})</h4>
                           <div className="space-y-1.5">
                              {selectedOrder.attachments?.map(at => (
                                 <div key={at.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                                    <File size={14} className="text-cyan-600" />
                                    <span className="text-[10px] font-bold truncate flex-1">{at.name}</span>
                                    <span className="text-[8px] text-slate-400">{at.size}</span>
                                 </div>
                              ))}
                              {(!selectedOrder.attachments || selectedOrder.attachments.length === 0) && (
                                 <p className="text-[10px] text-slate-400 italic">Nenhum comprovante anexado.</p>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-gray-800/80 border-t dark:border-gray-700 flex justify-end gap-3">
                     <button
                        onClick={() => handlePrintPurchaseOrder(selectedOrder)}
                        className="px-6 py-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                     >
                        <Printer size={16} /> Imprimir / PDF
                     </button>
                     <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-sm font-bold">Fechar</button>
                     {selectedOrder.status === 'Pendente' && (
                        <button
                           onClick={() => {
                              receivePurchaseOrder(selectedOrder.id);
                              setSelectedOrder(null);
                           }}
                           className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/20"
                        >
                           Marcar como Recebido
                        </button>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Stock Item Modal */}
         {isStockModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border dark:border-gray-700 animate-in zoom-in duration-200">
                  <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white uppercase tracking-tight">{editingItem ? 'Editar Item' : 'Novo Item de Estoque'}</h3>
                     <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleSaveStock} className="p-6 space-y-4">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome do Item</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-gray-700 border-none rounded-xl py-3 font-bold text-sm" value={stockForm.name || ''} onChange={e => setStockForm({ ...stockForm, name: e.target.value })} required />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Categoria</label>
                           <select
                              className="w-full bg-slate-50 dark:bg-gray-700 border-none rounded-xl py-3 font-bold text-sm uppercase"
                              value={stockForm.category || ''}
                              onChange={e => setStockForm({ ...stockForm, category: e.target.value })}
                              required
                           >
                              <option value="">Selecione...</option>
                              <option value="Insumos">Insumos</option>
                              <option value="Matéria Prima">Matéria Prima</option>
                              <option value="Acabamentos">Acabamentos</option>
                              <option value="Ferramentas">Ferramentas</option>
                              <option value="Equipamentos">Equipamentos</option>
                              <option value="Consumíveis">Consumíveis</option>
                              <option value="Outros">Outros</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Unidade</label>
                           <select
                              className="w-full bg-slate-50 dark:bg-gray-700 border-none rounded-xl py-3 font-bold text-sm uppercase"
                              value={stockForm.unit || ''}
                              onChange={e => setStockForm({ ...stockForm, unit: e.target.value })}
                              required
                           >
                              <option value="">Selecione...</option>
                              <option value="un">UN (Unidade)</option>
                              <option value="kg">KG (Quilos)</option>
                              <option value="ton">TON (Toneladas)</option>
                              <option value="m³">M³ (Metros Cúb.)</option>
                              <option value="m²">M² (Metros Quad.)</option>
                              <option value="m">M (Metros Lineares)</option>
                              <option value="l">L (Litros)</option>
                              <option value="sc">SC (Sacos)</option>
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Qtd Atual</label>
                           <input type="number" className="w-full bg-slate-50 dark:bg-gray-700 border-none rounded-xl py-3 font-bold text-sm" value={stockForm.quantity || 0} onChange={e => setStockForm({ ...stockForm, quantity: Number(e.target.value) })} required />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Qtd Mínima</label>
                           <input type="number" className="w-full bg-slate-50 dark:bg-gray-700 border-none rounded-xl py-3 font-bold text-sm" value={stockForm.minStock || 0} onChange={e => setStockForm({ ...stockForm, minStock: Number(e.target.value) })} required />
                        </div>
                     </div>
                     <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg mt-4">Salvar Item</button>
                  </form>
               </div>
            </div>

         )}
         {/* OSM Modal (Maintenance) */}
         {isOSMModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
               <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl border dark:border-slate-700 animate-in zoom-in duration-200 my-8">
                  <div className="px-10 py-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                     <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Gerar Ordem de Serviço de Manutenção (OSM)</h3>
                     <button onClick={() => setIsOSMModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleSaveOSM} className="p-10 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Veículo / Equipamento</label>
                              <select
                                 className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm"
                                 value={selectedVehicleId}
                                 onChange={e => setSelectedVehicleId(e.target.value)}
                                 required
                              >
                                 <option value="">Selecione o ativo...</option>
                                 {fleet.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.name}</option>)}
                              </select>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Data</label>
                                 <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" value={osmForm.date} onChange={e => setOsmForm({ ...osmForm, date: e.target.value })} required />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo</label>
                                 <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" value={osmForm.type} onChange={e => setOsmForm({ ...osmForm, type: e.target.value as any })} required>
                                    <option value="Preventiva">Preventiva</option>
                                    <option value="Corretiva">Corretiva</option>
                                    <option value="Preditiva">Preditiva</option>
                                 </select>
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descrição do Serviço</label>
                              <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 font-bold text-sm" placeholder="Ex: Troca de óleo, filtros, reparo mecânico..." value={osmForm.description} onChange={e => setOsmForm({ ...osmForm, description: e.target.value })} required rows={4}></textarea>
                           </div>
                           {/* Account Selection */}
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Conta de Débito</label>
                              <select
                                 className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm"
                                 value={osmForm.debitAccountId || ''}
                                 onChange={e => setOsmForm({ ...osmForm, debitAccountId: e.target.value })}
                                 required
                              >
                                 <option value="">Selecione a conta...</option>
                                 {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)})</option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Custo Estimado (R$)</label>
                                 <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" placeholder="0.00" value={osmForm.cost || ''} onChange={e => setOsmForm({ ...osmForm, cost: Number(e.target.value) })} required />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">KM Atual</label>
                                 <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" placeholder="0" value={osmForm.km || ''} onChange={e => setOsmForm({ ...osmForm, km: Number(e.target.value) })} required />
                              </div>
                           </div>

                           {/* Parts/Products Logic from Inventory */}
                           <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                              <h4 className="text-xs font-black text-teal-600 uppercase mb-4">Peças e Insumos (Opcional)</h4>
                              <div className="grid grid-cols-1 gap-4">
                                 <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Produto</label>
                                    <select
                                       className="w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl py-3 font-bold text-sm"
                                       value={osmForm.productId || ''}
                                       onChange={e => setOsmForm({ ...osmForm, productId: e.target.value })}
                                    >
                                       <option value="">Nenhum produto...</option>
                                       {inventory.map(item => (
                                          <option key={item.id} value={item.id}>{item.name} (Estoque: {item.quantity})</option>
                                       ))}
                                    </select>
                                 </div>
                              </div>
                           </div>

                           {/* Ledger Code */}
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Plano de Contas</label>
                              <select
                                 className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm"
                                 value={osmForm.ledgerCode}
                                 onChange={e => {
                                    const options: any = {
                                       '2.02.02': 'Manutenção de Frota',
                                       '2.02.03': 'IPVA / Taxas / Seguros',
                                       '2.02.04': 'Pneus / Rodagem'
                                    };
                                    setOsmForm({ ...osmForm, ledgerCode: e.target.value, ledgerName: options[e.target.value] });
                                 }}
                              >
                                 <option value="2.02.02">2.02.02 - Manutenção de Frota</option>
                                 <option value="2.02.03">2.02.03 - IPVA / Taxas / Seguros</option>
                                 <option value="2.02.04">2.02.04 - Pneus / Rodagem</option>
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="pt-8 border-t dark:border-slate-700 flex gap-4">
                        <button
                           type="button"
                           onClick={() => setIsOSMModalOpen(false)}
                           className="flex-1 py-5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-3xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                        >
                           Cancelar
                        </button>
                        <button
                           type="submit"
                           className="flex-[2] py-5 bg-teal-600 text-white font-black rounded-3xl uppercase tracking-widest text-[10px] shadow-2xl shadow-teal-600/30 hover:bg-teal-500 transition-all flex items-center justify-center gap-3"
                        >
                           <Save size={18} /> Confirmar OSM
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* ODO Modal (Operational Expense) */}
         {isODOModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
               <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border dark:border-slate-700 animate-in zoom-in duration-200 my-8">
                  <div className="px-10 py-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                     <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Gerar Ordem de Despesa (ODO)</h3>
                     <button onClick={() => setIsODOModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleSaveODO} className="p-10 space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descrição da Despesa</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 font-bold text-sm" placeholder="Ex: Material de escritório, Serviço de Limpeza..." value={odoForm.description} onChange={e => setOdoForm({ ...odoForm, description: e.target.value })} required />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Valor (R$)</label>
                           <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" placeholder="0.00" value={odoForm.value || ''} onChange={e => setOdoForm({ ...odoForm, value: Number(e.target.value) })} required />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Data de Vencimento</label>
                           <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" value={odoForm.date} onChange={e => setOdoForm({ ...odoForm, date: e.target.value })} required />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Beneficiário / Fornecedor</label>
                           <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" value={odoForm.supplierName} onChange={e => setOdoForm({ ...odoForm, supplierName: e.target.value })} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Categoria</label>
                           <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" value={odoForm.category} onChange={e => setOdoForm({ ...odoForm, category: e.target.value })}>
                              <option value="Despesa Operacional">Despesa Operacional</option>
                              <option value="Serviços Terceiros">Serviços de Terceiros</option>
                              <option value="Impostos e Taxas">Impostos e Taxas</option>
                              <option value="Aluguel">Aluguel / Condomínio</option>
                              <option value="Outros">Outras Despesas</option>
                           </select>
                        </div>
                     </div>

                     <div className="pt-6 border-t dark:border-slate-700 flex gap-4">
                        <button
                           type="button"
                           onClick={() => setIsODOModalOpen(false)}
                           className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                        >
                           Cancelar
                        </button>
                        <button
                           type="submit"
                           className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                           <Save size={18} /> Lançar Despesa
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* ODP Modal (Personnel Expense) */}
         {isODPModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
               <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border dark:border-slate-700 animate-in zoom-in duration-200 my-8">
                  <div className="px-10 py-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                     <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Gerar Ordem de Despesa de Pessoal (ODP)</h3>
                     <button onClick={() => setIsODPModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  <form onSubmit={handleSaveODP} className="p-10 space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Colaborador (RH)</label>
                        <select
                           className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm"
                           value={odpForm.employeeId}
                           onChange={e => setOdpForm({ ...odpForm, employeeId: e.target.value })}
                           required
                        >
                           <option value="">Selecione o colaborador...</option>
                           {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                           ))}
                        </select>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo de Despesa</label>
                           <select
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm"
                              value={odpForm.type}
                              onChange={e => setOdpForm({ ...odpForm, type: e.target.value })}
                           >
                              <option value="Adiantamento Salarial">Adiantamento Salarial</option>
                              <option value="Reembolso de Despesas">Reembolso de Despesas</option>
                              <option value="Vale Transporte">Vale Transporte</option>
                              <option value="Vale Refeição">Vale Refeição</option>
                              <option value="Bônus / Premiação">Bônus / Premiação</option>
                              <option value="Rescisão">Rescisão</option>
                              <option value="Férias">Férias</option>
                              <option value="Outros">Outros</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Valor (R$)</label>
                           <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" placeholder="0.00" value={odpForm.value || ''} onChange={e => setOdpForm({ ...odpForm, value: Number(e.target.value) })} required />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Descrição / Observação</label>
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 px-4 font-bold text-sm" placeholder="Detalhes adicionais..." value={odpForm.description} onChange={e => setOdpForm({ ...odpForm, description: e.target.value })} />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Data de Pagamento</label>
                           <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm" value={odpForm.date} onChange={e => setOdpForm({ ...odpForm, date: e.target.value })} required />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Conta de Saída</label>
                           <select
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-bold text-sm"
                              value={odpForm.account}
                              onChange={e => setOdpForm({ ...odpForm, account: e.target.value })}
                              required
                           >
                              <option value="">Selecione a conta...</option>
                              {accounts.map(acc => (
                                 <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)})</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="pt-6 border-t dark:border-slate-700 flex gap-4">
                        <button
                           type="button"
                           onClick={() => setIsODPModalOpen(false)}
                           className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                        >
                           Cancelar
                        </button>
                        <button
                           type="submit"
                           className="flex-[2] py-4 bg-fuchsia-600 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-2xl shadow-fuchsia-600/30 hover:bg-fuchsia-500 transition-all flex items-center justify-center gap-2"
                        >
                           <Save size={18} /> Lançar ODP
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default Purchases;
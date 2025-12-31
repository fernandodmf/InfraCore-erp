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
   Edit2
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { PurchaseOrder, PurchaseItem, Supplier, InventoryItem } from '../types';
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
      receivePurchaseOrder,
      addStockItem,
      updateStockItem,
      deleteStockItem,
      accounts
   } = useApp();

   const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'new-order' | 'suppliers' | 'inventory'>('dashboard');
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

   const handleCreateOrder = (status: PurchaseOrder['status'] = 'Pendente') => {
      if (isSubmitting) return;

      if (!selectedSupplier || orderItems.length === 0) {
         alert("Selecione um fornecedor e adicione itens ao pedido.");
         return;
      }

      // If auto-receiving or instant payment, account is required
      if ((status === 'Recebido' || status === 'Aprovado') && !sourceAccount) {
         alert("Selecione uma conta financeira para vincular o pagamento/previsão.");
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
         status: status,
         attachments: tempAttachments,
         paymentTerms,
         shippingCost,
         targetAccountId: sourceAccount
      };

      addPurchaseOrder(newOrder);

      alert(status === 'Recebido' ? "Compra registrada, estoque atualizado e financeiro lançado!" : "Pedido de compra gerado com sucesso!");

      // Reset and redirect
      setOrderItems([]);
      setSelectedSupplier('');
      setTempAttachments([]);
      setShippingCost(0);
      setSourceAccount('');
      setActiveTab('orders');
      setIsSubmitting(false);
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

   return (
      <div className="flex flex-col gap-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <ShoppingBag className="text-cyan-600" />
                  Suprimentos e Compras
               </h2>
               <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Gestão de pedidos de compra, fornecedores e estoque de insumos.</p>
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => setActiveTab('new-order')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${activeTab === 'new-order'
                     ? 'bg-slate-200 text-slate-800'
                     : 'bg-cyan-600 text-white hover:bg-cyan-700'
                     }`}
               >
                  <Plus size={18} />
                  Gerar Pedido
               </button>
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
                     {tab === 'dashboard' && <ArrowRight size={16} />}
                     {tab === 'orders' && <FileText size={16} />}
                     {tab === 'suppliers' && <Users size={16} />}
                     {tab === 'inventory' && <Warehouse size={16} />}
                     {tab === 'dashboard' ? 'Painel Geral' : tab === 'orders' ? 'Pedidos e Histórico' : tab === 'suppliers' ? 'Fornecedores' : 'Gerenciar Estoque'}
                  </button>
               ))}
            </nav>
         </div>

         {/* DASHBOARD TAB */}
         {activeTab === 'dashboard' && (
            <div className="space-y-6">
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

                        <div className="flex items-center gap-2 p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
                           <input
                              type="checkbox"
                              id="received"
                              className="rounded text-cyan-600"
                              checked={isStockDirect}
                              onChange={e => setIsStockDirect(e.target.checked)}
                           />
                           <label htmlFor="received" className="text-xs font-bold text-cyan-800 dark:text-cyan-400 cursor-pointer">
                              Entrada imediata no estoque
                           </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <button
                              onClick={() => handleCreateOrder('Pendente')}
                              disabled={isSubmitting}
                              className={`py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-xl text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                           >
                              Gerar Pedido
                           </button>
                           <button
                              onClick={() => handleCreateOrder('Recebido')}
                              disabled={isSubmitting}
                              className={`py-2.5 bg-cyan-600 rounded-xl text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                           >
                              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : <CheckCircle size={16} />}
                              {isSubmitting ? 'Processando...' : 'Finalizar'}
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
                                    {order.status === 'Pendente' && (
                                       <button
                                          onClick={() => receivePurchaseOrder(order.id)}
                                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          title="Receber Pedido"
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
                     <button
                        onClick={() => {
                           setEditingItem(null);
                           setStockForm({ name: '', category: 'Material', quantity: 0, minStock: 0, unit: 'UN', price: 0 });
                           setIsStockModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                        title="Adicionar Item Manualmente"
                     >
                        <Plus size={20} />
                     </button>
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
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map(item => (
                     <div key={item.id} className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-gray-700 hover:border-cyan-200 transition-all group relative overflow-hidden">
                        {/* Status Badge Background */}
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 transition-transform group-hover:scale-110 ${item.quantity < item.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                           <div className="w-14 h-14 bg-slate-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors shadow-sm">
                              <Package size={28} />
                           </div>
                           <div className="text-right">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${item.quantity < item.minStock ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                 {item.quantity < item.minStock ? 'Reposição' : 'Disponível'}
                              </span>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">{item.id}</p>
                           </div>
                        </div>

                        <div className="relative z-10 mb-6">
                           <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight uppercase italic tracking-tighter">{item.name}</h4>
                           <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded mt-1 inline-block">{item.category}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                           <div className="bg-slate-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Qtd. Atual</p>
                              <p className={`text-xl font-black ${item.quantity < item.minStock ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>{item.quantity} <span className="text-[10px] font-bold opacity-60 uppercase">{item.unit}</span></p>
                           </div>
                           <div className="bg-slate-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estq. Mínimo</p>
                              <p className="text-xl font-black text-slate-900 dark:text-white">{item.minStock} <span className="text-[10px] font-bold opacity-60 uppercase">{item.unit}</span></p>
                           </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-gray-700 relative z-10">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Preço Médio</span>
                              <span className="font-bold text-sm text-emerald-600">{formatCurrency(item.price)}</span>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => {
                                 addItemToOrder(item);
                                 setActiveTab('new-order');
                              }} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Pedir Reposição</button>
                              <button
                                 onClick={() => { setEditingItem(item); setStockForm(item); setIsStockModalOpen(true); }}
                                 className="p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                              >
                                 <Edit2 size={18} />
                              </button>
                              <button
                                 onClick={() => { if (confirm('Remover este item do catálogo?')) deleteStockItem(item.id); }}
                                 className="p-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
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
      </div>
   );
};

export default Purchases;
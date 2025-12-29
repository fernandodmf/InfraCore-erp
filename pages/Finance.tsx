import React, { useState } from 'react';
import {
   Upload,
   Plus,
   TrendingUp,
   ArrowUp,
   ArrowDown,
   Eye,
   Paperclip,
   Calendar,
   CreditCard,
   Settings,
   Edit2,
   Trash2,
   List,
   FolderOpen,
   X,
   Save,
   CheckCircle,
   DollarSign,
   Filter,
   MoreVertical,
   Download,
   Landmark,
   AlertCircle,
   Search,
   PieChart,
   ChevronRight
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { CHART_DATA_CASHFLOW } from '../constants';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

const Finance = () => {
   const {
      transactions, financials, addTransaction, deleteTransaction, importTransactions, updateTransactionStatus, updateTransaction,
      accounts, addAccount, deleteAccount,
      planOfAccounts, addPlanAccount, deletePlanAccount, updatePlanAccount, hasPermission
   } = useApp();

   const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'receivables' | 'payables' | 'accounts' | 'planning'>('overview');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
   const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

   const [formData, setFormData] = useState<Partial<Transaction>>({
      type: 'Despesa',
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      account: 'Bradesco PJ'
   });

   const [accountForm, setAccountForm] = useState<any>({
      id: '', name: '', type: 'Conta Corrente', balance: 0, color: 'bg-blue-600', code: ''
   });

   // Filters
   const [searchTerm, setSearchTerm] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('Todas');

   const formatMoney = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
   };

   // Filtering Logic
   const filteredTransactions = transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || tx.type === categoryFilter;
      return matchesSearch && matchesCategory;
   });

   const receivables = transactions.filter(tx => tx.type === 'Receita' && tx.status !== 'Conciliado');
   const payables = transactions.filter(tx => tx.type === 'Despesa' && tx.status !== 'Conciliado');

   // Handlers
   const handleSaveTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.description || !formData.amount) return;

      const selectedAccount = planOfAccounts.flatMap(g => g.children || []).find(c => c.id === formData.ledgerCode) ||
         planOfAccounts.find(g => g.id === formData.ledgerCode);

      const newTx: Transaction = {
         ...formData,
         id: selectedTransaction ? selectedTransaction.id : Date.now().toString(),
         date: formData.date || new Date().toLocaleDateString('pt-BR'),
         description: formData.description || '',
         amount: Number(formData.amount),
         category: selectedAccount?.name || 'Outros',
         account: formData.account || 'Bradesco PJ',
         accountId: accounts.find(a => a.name === formData.account)?.id || '',
         status: formData.status || 'Pendente',
         type: formData.type || 'Despesa',
         ledgerCode: selectedAccount?.code || '',
         ledgerName: selectedAccount?.name || ''
      } as Transaction;

      if (selectedTransaction) {
         updateTransaction(newTx);
      } else {
         addTransaction(newTx);
      }
      setIsModalOpen(false);
      setSelectedTransaction(null);
      setFormData({ type: 'Despesa', date: new Date().toLocaleDateString('pt-BR'), status: 'Pendente', account: 'Bradesco PJ' });
   };

   // UI Components
   const NavButton = ({ id, label, icon: Icon, colorClass = "text-slate-500" }: any) => (
      <button
         onClick={() => setActiveTab(id)}
         className={`
            px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2.5 whitespace-nowrap
            ${activeTab === id
               ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-900'
               : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400'
            }
         `}
      >
         <Icon size={18} className={activeTab === id ? 'text-cyan-400' : colorClass} />
         {label}
      </button>
   );

   const KpiCard = ({ title, value, subtext, icon: Icon, color, trend }: any) => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
         <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
            <Icon size={64} />
         </div>
         <div className="relative">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-2">{value}</h3>
            {subtext && (
               <div className="flex items-center gap-1.5">
                  {trend && (
                     <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend === 'up' ? '+' : '-'}2.5%
                     </span>
                  )}
                  <span className={`text-[10px] font-bold ${color}`}>{subtext}</span>
               </div>
            )}
         </div>
      </div>
   );

   return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">

         {/* Top Header & Navigation */}
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700">
            <div className="flex overflow-x-auto p-1 gap-1 no-scrollbar items-center">
               <NavButton id="overview" label="Dashboard" icon={PieChart} />
               <div className="w-px bg-slate-200 dark:bg-gray-700 mx-1 h-6 hidden md:block"></div>
               <NavButton id="ledger" label="Livro Caixa" icon={List} />
               <NavButton id="receivables" label="A Receber" icon={ArrowDown} colorClass="text-green-500" />
               <NavButton id="payables" label="A Pagar" icon={ArrowUp} colorClass="text-red-500" />
               <div className="w-px bg-slate-200 dark:bg-gray-700 mx-1 h-6 hidden md:block"></div>
               <NavButton id="accounts" label="Bancos & Caixa" icon={Landmark} />
               <NavButton id="planning" label="Plano de Contas" icon={FolderOpen} />
            </div>

            {hasPermission('finance.transact') && (
               <button
                  onClick={() => {
                     setSelectedTransaction(null);
                     setFormData({ type: 'Despesa', date: new Date().toLocaleDateString('pt-BR'), status: 'Pendente', account: 'Bradesco PJ' });
                     setIsModalOpen(true);
                  }}
                  className="mx-2 xl:mx-0 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
               >
                  <Plus size={18} /> Novo Lançamento
               </button>
            )}
         </div>

         {/* Transactions Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200 overflow-hidden text-left">
                  <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-slate-50/50 dark:bg-gray-700/50">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-cyan-600" />
                        {selectedTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
                     </h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveTransaction} className="p-6 space-y-5">
                     {/* Toggle Type */}
                     <div className="flex bg-slate-100 dark:bg-gray-700 p-1.5 rounded-xl">
                        <button
                           type="button"
                           onClick={() => setFormData({ ...formData, type: 'Receita' })}
                           className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.type === 'Receita' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm border border-slate-100 dark:border-gray-500' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           <ArrowDown size={16} /> Receita
                        </button>
                        <button
                           type="button"
                           onClick={() => setFormData({ ...formData, type: 'Despesa' })}
                           className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.type === 'Despesa' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm border border-slate-100 dark:border-gray-500' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           <ArrowUp size={16} /> Despesa
                        </button>
                     </div>

                     <div className="space-y-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Descrição</label>
                           <input
                              required
                              type="text"
                              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                              placeholder="Ex: Pagamento Fornecedor X"
                              value={formData.description || ''}
                              onChange={e => setFormData({ ...formData, description: e.target.value })}
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Valor (R$)</label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                 <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-10 pr-4 py-3 font-bold"
                                    placeholder="0,00"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                 />
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Data</label>
                              <input
                                 type="text"
                                 className="w-full rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 font-bold text-center"
                                 value={formData.date || ''}
                                 onChange={e => setFormData({ ...formData, date: e.target.value })}
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Categoria (Plano de Contas)</label>
                           <select
                              required
                              className="w-full rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 text-sm font-semibold"
                              value={formData.ledgerCode || ''}
                              onChange={e => setFormData({ ...formData, ledgerCode: e.target.value })}
                           >
                              <option value="">Selecione...</option>
                              {planOfAccounts.filter(g => g.type === formData.type).map(group => (
                                 <optgroup key={group.id} label={group.name} className="font-bold">
                                    {group.children?.map(child => (
                                       <option key={child.id} value={child.id}>{child.code} - {child.name}</option>
                                    ))}
                                 </optgroup>
                              ))}
                           </select>
                        </div>

                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Conta Financeira</label>
                           <div className="grid grid-cols-2 gap-2">
                              {accounts.slice(0, 4).map(acc => (
                                 <button
                                    type="button"
                                    key={acc.id}
                                    onClick={() => setFormData({ ...formData, account: acc.name })}
                                    className={`p-2 rounded-lg border text-xs font-bold text-left transition-all ${formData.account === acc.name ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:text-cyan-300 dark:bg-cyan-900/30' : 'border-slate-200 dark:border-gray-600 text-slate-500 hover:border-cyan-300'}`}
                                 >
                                    <span className="block truncate">{acc.name}</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="pt-2 flex gap-3">
                        <button
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="flex-1 py-3 text-slate-600 dark:text-gray-300 font-bold hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                           Cancelar
                        </button>
                        <button
                           type="submit"
                           className="flex-1 py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
                        >
                           Confirmar
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* New Account Modal */}
         {isAccountModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200 overflow-hidden text-left">
                  <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-slate-50/50 dark:bg-gray-700/50">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Landmark className="text-cyan-600" />
                        Nova Conta
                     </h3>
                     <button onClick={() => setIsAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                     </button>
                  </div>

                  <form onSubmit={(e) => {
                     e.preventDefault();
                     addAccount({ ...accountForm, id: Date.now().toString(), balance: Number(accountForm.balance) });
                     setIsAccountModalOpen(false);
                  }} className="p-6 space-y-5">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nome da Conta / Banco</label>
                        <input
                           required
                           type="text"
                           className="w-full rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 font-semibold focus:ring-2 focus:ring-cyan-500"
                           placeholder="Ex: Nubank Principal"
                           value={accountForm.name}
                           onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Saldo Inicial (R$)</label>
                        <input
                           required
                           type="number"
                           step="0.01"
                           className="w-full rounded-xl border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 font-bold"
                           value={accountForm.balance}
                           onChange={e => setAccountForm({ ...accountForm, balance: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Cor do Card</label>
                        <div className="flex gap-2">
                           {['bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-purple-600', 'bg-slate-900'].map(color => (
                              <button
                                 type="button"
                                 key={color}
                                 onClick={() => setAccountForm({ ...accountForm, color })}
                                 className={`w-8 h-8 rounded-full ${color} ${accountForm.color === color ? 'ring-4 ring-offset-2 ring-cyan-500' : 'opacity-70 hover:opacity-100'}`}
                              />
                           ))}
                        </div>
                     </div>
                     <button
                        type="submit"
                        className="w-full py-3 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 mt-4"
                     >
                        Criar Conta
                     </button>
                  </form>
               </div>
            </div>
         )}

         {/* Main Content Area */}
         {activeTab === 'overview' && (
            <div className="space-y-6">
               {/* KPIs */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KpiCard
                     title="Caixa Disponível"
                     value={formatMoney(financials.balance)}
                     subtext="Conciliado Real"
                     color="text-slate-900"
                     icon={Landmark}
                     trend="up"
                  />
                  <KpiCard
                     title="A Receber"
                     value={formatMoney(financials.receivables)}
                     subtext="Previsão de Entrada"
                     color="text-green-600"
                     icon={ArrowDown}
                  />
                  <KpiCard
                     title="A Pagar"
                     value={formatMoney(financials.payables)}
                     subtext="Previsão de Saída"
                     color="text-red-600"
                     icon={ArrowUp}
                  />
                  <KpiCard
                     title="Saldo Projetado"
                     value={formatMoney(financials.projectedBalance)}
                     subtext="Após quitações"
                     color="text-cyan-600"
                     icon={TrendingUp}
                  />
               </div>

               {/* Charts & Recent Activity */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">Fluxo de Caixa</h3>
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                              <span className="text-xs font-bold text-slate-500">Entradas</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                              <span className="text-xs font-bold text-slate-500">Saídas</span>
                           </div>
                        </div>
                     </div>
                     <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={CHART_DATA_CASHFLOW} barGap={8}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                              <Tooltip
                                 cursor={{ fill: '#f8fafc' }}
                                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                              />
                              <Bar dataKey="income" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={32} />
                              <Bar dataKey="expense" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={32} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col">
                     <h3 className="font-bold text-slate-800 dark:text-white mb-4">Contas Bancárias</h3>
                     <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        {accounts.map(acc => (
                           <div key={acc.id} className="p-4 rounded-xl border border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/30 flex justify-between items-center group hover:border-cyan-300 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-lg ${acc.color} text-white flex items-center justify-center shadow-lg shadow-cyan-900/10`}>
                                    <Landmark size={18} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{acc.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">{acc.type}</p>
                                 </div>
                              </div>
                              <span className="text-sm font-black text-slate-700 dark:text-slate-200">{formatMoney(acc.balance)}</span>
                           </div>
                        ))}
                     </div>
                     <button onClick={() => setActiveTab('accounts')} className="mt-4 w-full py-3 text-cyan-600 text-xs font-bold uppercase border border-cyan-100 hover:bg-cyan-50 rounded-xl transition-colors">
                        Gerenciar Contas
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Ledger View (Transactions List) */}
         {(activeTab === 'ledger' || activeTab === 'receivables' || activeTab === 'payables') && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {activeTab === 'ledger' ? <List className="text-cyan-600" /> : activeTab === 'receivables' ? <ArrowDown className="text-green-500" /> : <ArrowUp className="text-red-500" />}
                        {activeTab === 'ledger' ? 'Livro Caixa' : activeTab === 'receivables' ? 'Contas a Receber' : 'Contas a Pagar'}
                     </h3>
                     <p className="text-xs text-slate-500 mt-1">
                        {activeTab === 'ledger' ? 'Histórico completo de transações' : activeTab === 'receivables' ? 'Valores pendentes de recebimento' : 'Compromissos pendentes de pagamento'}
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                           type="text"
                           placeholder="Buscar..."
                           value={searchTerm}
                           onChange={e => setSearchTerm(e.target.value)}
                           className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 w-48"
                        />
                     </div>
                     <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg">
                        <Filter size={18} />
                     </button>
                     <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg">
                        <Download size={18} />
                     </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-gray-700/50 font-black tracking-wider">
                        <tr>
                           <th className="px-6 py-4">Data / Vencimento</th>
                           <th className="px-6 py-4">Descrição</th>
                           <th className="px-6 py-4">Categoria</th>
                           <th className="px-6 py-4">Conta</th>
                           <th className="px-6 py-4 text-right">Valor</th>
                           <th className="px-6 py-4 text-center">Status</th>
                           <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                        {(activeTab === 'ledger' ? filteredTransactions : activeTab === 'receivables' ? receivables : payables).map(tx => (
                           <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors group">
                              <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.dueDate || tx.date}</td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'Receita' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                       {tx.type === 'Receita' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{tx.description}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                                    {tx.ledgerName || tx.category}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">{tx.account}</td>
                              <td className={`px-6 py-4 text-right font-black ${tx.type === 'Receita' ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
                                 {formatMoney(tx.amount)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tx.status === 'Conciliado' ? 'bg-green-100 text-green-700' :
                                    tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                       'bg-slate-100 text-slate-600'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Conciliado' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    {tx.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                    {hasPermission('finance.reconcile') && (
                                       <button
                                          onClick={() => {
                                             // Quick Conciliate/Undo
                                             const newStatus = tx.status === 'Conciliado' ? 'Pendente' : 'Conciliado';
                                             if (newStatus === 'Conciliado') {
                                                const date = prompt("Data da Conciliação:", new Date().toLocaleDateString('pt-BR'));
                                                if (date) updateTransactionStatus(tx.id, 'Conciliado', date);
                                             } else {
                                                updateTransactionStatus(tx.id, 'Pendente');
                                             }
                                          }}
                                          className={`p-1.5 rounded-lg transition-colors ${tx.status === 'Conciliado' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-100'}`}
                                          title="Conciliar / Pagar"
                                       >
                                          <CheckCircle size={16} />
                                       </button>
                                    )}

                                    {hasPermission('finance.transact') && (
                                       <button
                                          onClick={() => {
                                             setSelectedTransaction(tx);
                                             setFormData(tx);
                                             setIsModalOpen(true);
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"
                                          title="Editar"
                                       >
                                          <Edit2 size={16} />
                                       </button>
                                    )}

                                    {hasPermission('finance.delete') && (
                                       <button
                                          onClick={() => { if (confirm("Excluir?")) deleteTransaction(tx.id); }}
                                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg table-row-action"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Accounts Tab */}
         {activeTab === 'accounts' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Landmark className="text-cyan-600" /> Contas Bancárias & Caixa
                     </h3>
                     <p className="text-xs text-slate-500 mt-1">Gerencie os saldos iniciais e contas de movimento.</p>
                  </div>
                  <button onClick={() => { setAccountForm({ id: '', name: '', type: 'Conta Corrente', balance: 0, color: 'bg-blue-600', code: '' }); setIsAccountModalOpen(true); }} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                     <Plus size={14} /> Nova Conta
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {accounts.map(acc => (
                     <div key={acc.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${acc.color} opacity-10 blur-2xl -mr-10 -mt-10`}></div>
                        <div className="relative">
                           <div className="flex justify-between items-start mb-6">
                              <div className={`w-12 h-12 rounded-xl ${acc.color} text-white flex items-center justify-center shadow-lg shadow-cyan-900/10`}>
                                 <Landmark size={24} />
                              </div>
                              <div className="flex gap-1">
                                 {hasPermission('finance.delete') && (
                                    <button onClick={() => deleteAccount(acc.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                 )}
                              </div>
                           </div>
                           <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{acc.name}</h4>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{acc.type}</p>
                           <div className="flex items-end justify-between border-t border-slate-100 dark:border-gray-700 pt-4">
                              <div>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Saldo Atual</p>
                                 <p className="text-lg font-black text-slate-800 dark:text-white">{formatMoney(acc.balance)}</p>
                              </div>
                              <button className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                                 Ver Extrato <ChevronRight size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Planning Tab */}
         {activeTab === 'planning' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden animate-in fade-in duration-300">
               <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FolderOpen className="text-cyan-600" /> Plano de Contas
                     </h3>
                     <p className="text-xs text-slate-500 mt-1">Estrutura de Categorias de Receitas e Despesas.</p>
                  </div>
                  <button onClick={() => alert('Para criar categorias, utilize as Configurações do Sistema.')} className="px-4 py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
                     <Plus size={14} /> Nova Categoria
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 dark:bg-gray-700/50 text-[10px] uppercase font-black text-slate-400">
                        <tr>
                           <th className="px-6 py-4">Código</th>
                           <th className="px-6 py-4">Nome da Categoria</th>
                           <th className="px-6 py-4 text-center">Tipo</th>
                           <th className="px-6 py-4 text-center">Nível</th>
                           <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                        {planOfAccounts.map(group => (
                           <React.Fragment key={group.id}>
                              {/* Group Header */}
                              <tr className="bg-slate-50/50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
                                 <td className="px-6 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{group.id}</td>
                                 <td className="px-6 py-3 font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <FolderOpen size={16} className="text-slate-400" /> {group.name}
                                 </td>
                                 <td className="px-6 py-3 text-center text-xs font-bold text-slate-500">{group.type}</td>
                                 <td className="px-6 py-3 text-center"><span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold">GRUPO</span></td>
                                 <td className="px-6 py-3 text-right">
                                    {hasPermission('finance.delete') && (
                                       <button onClick={() => deletePlanAccount(group.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                    )}
                                 </td>
                              </tr>
                              {/* Children */}
                              {group.children?.map(child => (
                                 <tr key={child.id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-xs text-slate-400 pl-10 border-l-4 border-transparent hover:border-cyan-400">{child.code}</td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium pl-10">{child.name}</td>
                                    <td className="px-6 py-3 text-center text-xs text-slate-400">{child.type}</td>
                                    <td className="px-6 py-3 text-center"><span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-400 text-[10px] font-bold">ANALÍTICA</span></td>
                                    <td className="px-6 py-3 text-right">
                                       {hasPermission('finance.delete') && (
                                          <button onClick={() => deletePlanAccount(child.id)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                       )}
                                    </td>
                                 </tr>
                              ))}
                           </React.Fragment>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

      </div>
   );
};

export default Finance;
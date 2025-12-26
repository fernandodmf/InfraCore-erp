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
   AlertCircle
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from 'recharts';
import { CHART_DATA_CASHFLOW } from '../constants';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

// Plan of accounts and accounts are now managed by AppContext

const Finance = () => {
   const {
      transactions, financials, addTransaction, deleteTransaction, importTransactions, updateTransactionStatus,
      accounts, addAccount, deleteAccount,
      planOfAccounts, addPlanAccount, deletePlanAccount, updatePlanAccount
   } = useApp();
   const [activeTab, setActiveTab] = useState<'overview' | 'planOfAccounts' | 'accounts'>('overview');

   const [isModalOpen, setIsModalOpen] = useState(false);
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

   // Transaction Filters
   const [searchTerm, setSearchTerm] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('Todas');

   // Format currency
   const formatMoney = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
   };

   // Filter logic
   const filteredTransactions = transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || tx.type === categoryFilter;
      return matchesSearch && matchesCategory;
   });

   const uniqueCategories = ['Todas', 'Receita', 'Despesa'];

   const handleSaveTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.description || !formData.amount) return;

      const selectedAccount = planOfAccounts.flatMap(g => g.children || []).find(c => c.id === formData.ledgerCode) ||
         planOfAccounts.find(g => g.id === formData.ledgerCode);

      const newTx: Transaction = {
         id: Date.now().toString(),
         date: formData.date || new Date().toLocaleDateString('pt-BR'),
         description: formData.description || '',
         amount: Number(formData.amount),
         category: selectedAccount?.name || 'Outros',
         account: formData.account || 'Bradesco PJ',
         status: formData.status || 'Pendente',
         type: formData.type || 'Despesa',
         ledgerCode: selectedAccount?.code || '',
         ledgerName: selectedAccount?.name || ''
      };

      addTransaction(newTx);
      setIsModalOpen(false);
      setFormData({ type: 'Despesa', date: new Date().toLocaleDateString('pt-BR'), status: 'Pendente', account: 'Bradesco PJ' });
   };

   // Plan of Accounts Actions
   const handleAddSubAccount = (parentId: string) => {
      const name = prompt("Nome da nova subconta:");
      if (!name) return;
      addPlanAccount(parentId, name);
   };

   const handleDeleteSubAccount = (parentId: string, subAccountId: string) => {
      if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
      deletePlanAccount(parentId, subAccountId);
   };

   const handleEditAccount = (groupIndex: number, childIndex: number | null, currentName: string) => {
      const newName = prompt("Editar nome da conta:", currentName);
      if (!newName) return;
      updatePlanAccount(groupIndex, childIndex, newName);
   };

   const handleSaveAccount = (e: React.FormEvent) => {
      e.preventDefault();
      addAccount({
         ...accountForm,
         id: `acc-${Date.now()}`
      });
      setIsAccountModalOpen(false);
      setAccountForm({ name: '', type: 'Conta Corrente', balance: 0, color: 'bg-blue-600', code: '' });
   };

   return (
      <div className="flex flex-col gap-5">
         {/* Transaction Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="text-cyan-600" />
                        Novo Lançamento
                     </h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
                     <div className="flex bg-slate-100 dark:bg-gray-700 p-1 rounded-xl mb-2">
                        <button
                           type="button"
                           onClick={() => setFormData({ ...formData, type: 'Receita' })}
                           className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'Receita' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-slate-500'}`}
                        >
                           Receita
                        </button>
                        <button
                           type="button"
                           onClick={() => setFormData({ ...formData, type: 'Despesa' })}
                           className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'Despesa' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' : 'text-slate-500'}`}
                        >
                           Despesa
                        </button>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                        <input
                           required
                           type="text"
                           className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                           placeholder="Ex: Pagamento Fornecedor X"
                           value={formData.description || ''}
                           onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                           <input
                              required
                              type="number"
                              step="0.01"
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-bold"
                              placeholder="0,00"
                              value={formData.amount || ''}
                              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                           <input
                              type="text"
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              value={formData.date || ''}
                              onChange={e => setFormData({ ...formData, date: e.target.value })}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plano de Contas (Obrigatório)</label>
                        <select
                           required
                           className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                           value={formData.ledgerCode || ''}
                           onChange={e => setFormData({ ...formData, ledgerCode: e.target.value })}
                        >
                           <option value="">Selecione a categoria...</option>
                           {planOfAccounts.filter(g => g.type === formData.type).map(group => (
                              <optgroup key={group.id} label={group.name}>
                                 {group.children?.map(child => (
                                    <option key={child.id} value={child.id}>{child.code} - {child.name}</option>
                                 ))}
                              </optgroup>
                           ))}
                        </select>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conta de Destino/Origem</label>
                        <select
                           className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                           value={formData.account || ''}
                           onChange={e => setFormData({ ...formData, account: e.target.value })}
                        >
                           <option value="Bradesco PJ">Bradesco PJ</option>
                           <option value="Banco do Brasil">Banco do Brasil</option>
                           <option value="Caixa">Caixa (Dinheiro)</option>
                           <option value="NuBank Reserva">NuBank Reserva</option>
                        </select>
                     </div>

                     <div className="pt-4 flex gap-3">
                        <button
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="flex-1 py-2 text-slate-600 dark:text-gray-300 font-bold hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                           Cancelar
                        </button>
                        <button
                           type="submit"
                           className="flex-1 py-2 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
                        >
                           Confirmar
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-display tracking-tight">Financeiro</h1>
               <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Gestão de fluxo de caixa, orçamento e plano de contas.</p>
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
               <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
               >
                  <TrendingUp size={16} /> Visão Geral
               </button>
               <button
                  onClick={() => setActiveTab('planOfAccounts')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'planOfAccounts' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
               >
                  <List size={16} /> Plano de Contas
               </button>
               <button
                  onClick={() => setActiveTab('accounts')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'accounts' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
               >
                  <Landmark size={16} /> Contas
               </button>
            </div>
         </div>

         {activeTab === 'planOfAccounts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-300">
               {/* Plan of Accounts Editor */}
               <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-700/30">
                     <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Plano de Contas Gerencial</h3>
                        <p className="text-xs text-slate-500">Estrutura de receitas e despesas editável</p>
                     </div>
                     <button onClick={() => {
                        const name = prompt("Nome do novo grupo:");
                        if (name) alert("Recurso de adição de grupos principais em estruturação. Subcontas podem ser adicionadas nos grupos existentes.");
                     }} className="text-xs font-bold text-cyan-600 uppercase hover:underline flex items-center gap-1">
                        <Plus size={14} /> Novo Grupo
                     </button>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                     {planOfAccounts.map((group, gIndex) => (
                        <div key={group.id} className="border border-slate-200 dark:border-gray-600 rounded-lg overflow-hidden transition-all hover:border-cyan-200">
                           <div className="bg-slate-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center group/header">
                              <div className="flex items-center gap-3">
                                 <span className="font-mono text-xs font-bold text-slate-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-gray-600">{group.code}</span>
                                 <span className="font-bold text-slate-800 dark:text-white text-sm">{group.name}</span>
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${group.type === 'Receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{group.type}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                                 <button onClick={() => handleEditAccount(gIndex, null, group.name)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-slate-500">
                                    <Edit2 size={14} />
                                 </button>
                                 <button onClick={() => handleAddSubAccount(group.id)} className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded text-cyan-600" title="Adicionar Subconta">
                                    <Plus size={14} />
                                 </button>
                              </div>
                           </div>
                           <div className="divide-y divide-slate-100 dark:divide-gray-700">
                              {group.children?.map((child, cIndex) => (
                                 <div key={child.id} className="px-4 py-3 pl-12 flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                       <span className="font-mono text-xs text-slate-400">{child.code}</span>
                                       <span className="text-sm text-slate-600 dark:text-slate-300">{child.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                       <button onClick={() => handleEditAccount(gIndex, cIndex, child.name)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-gray-600 rounded text-slate-400 hover:text-cyan-600">
                                          <Edit2 size={12} />
                                       </button>
                                       <button onClick={() => handleDeleteSubAccount(group.id, child.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500">
                                          <Trash2 size={12} />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                              {(!group.children || group.children.length === 0) && (
                                 <div className="px-4 py-3 pl-12 text-xs text-slate-400 italic">Nenhuma subconta cadastrada</div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Helper / Info Panel */}
               <div className="flex flex-col gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                     <div className="flex items-start gap-3">
                        <FolderOpen className="text-blue-600 dark:text-blue-400 mt-1" size={20} />
                        <div>
                           <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Estrutura Sugerida</h4>
                           <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 leading-relaxed">
                              Mantenha seu plano de contas organizado em no máximo 3 níveis de profundidade para facilitar a geração de relatórios DRE e Fluxo de Caixa.
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-5">
                     <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Resumo por Grupo</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-500">1. Receitas</span>
                           <span className="font-bold text-green-600">3 contas</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-500">2. Despesas</span>
                           <span className="font-bold text-red-600">6 contas</span>
                        </div>
                        <div className="border-t border-slate-100 dark:border-gray-700 pt-2 mt-2">
                           <div className="flex justify-between text-sm font-bold">
                              <span className="text-slate-900 dark:text-white">Total</span>
                              <span className="text-slate-900 dark:text-white">9 categorias</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-300">
               {accounts.map((acc: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                     <div className={`absolute top-0 right-0 w-24 h-24 ${acc.color} opacity-[0.03] rounded-bl-full`}></div>
                     <div className="flex justify-between items-start mb-6">
                        <div className={`${acc.color} text-white p-3 rounded-xl shadow-lg`}>
                           <Landmark size={24} />
                        </div>
                        <button className="text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={20} /></button>
                     </div>
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{acc.name}</h3>
                     <p className="text-xs text-slate-500 mb-4">{acc.type} • {acc.code}</p>
                     <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-end">
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Saldo Atual</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white">{formatMoney(acc.balance)}</p>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-400 hover:text-cyan-600 transition-colors"><Edit2 size={16} /></button>
                           <button onClick={() => { if (confirm("Excluir conta?")) deleteAccount(acc.id); }} className="p-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </div>
                  </div>
               ))}
               <button onClick={() => setIsAccountModalOpen(true)} className="bg-slate-50 dark:bg-gray-800/50 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-cyan-300 hover:text-cyan-500 transition-all group">
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-full group-hover:scale-110 transition-transform">
                     <Plus size={32} />
                  </div>
                  <span className="font-bold text-sm">Adicionar Nova Conta</span>
               </button>
            </div>
         )}

         {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex flex-wrap gap-3 mb-2">
                  <button onClick={() => importTransactions(null)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium">
                     <Upload size={16} />
                     Importar Extrato
                  </button>
                  <button
                     onClick={() => setIsModalOpen(true)}
                     className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all font-bold text-sm"
                  >
                     <Plus size={18} />
                     Novo Lançamento
                  </button>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-gray-700 relative overflow-hidden group hover:border-cyan-200 transition-colors">
                     <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">Saldo Consolidado</p>
                     <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{formatMoney(financials.balance + 642450)}</h3>
                     <div className="flex items-center gap-1 mt-2 text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold dark:bg-green-900/20 uppercase">
                        <TrendingUp size={12} />
                        <span>+2.4% vs mês anterior</span>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-gray-700 hover:border-pink-200 transition-colors">
                     <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">A Pagar (Hoje)</p>
                     <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">R$ 12.450,00</h3>
                     <p className="text-xs text-pink-500 font-bold mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> 3 boletos vencendo
                     </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-gray-700 hover:border-blue-200 transition-colors">
                     <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">Entradas Brutas</p>
                     <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{formatMoney(financials.totalRevenue)}</h3>
                     <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs font-medium">
                        <Calendar size={14} />
                        <span>Ciclo atual</span>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-gray-700 hover:border-teal-200 transition-colors">
                     <p className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">Resultado Operacional</p>
                     <h3 className="text-2xl lg:text-3xl font-black text-cyan-600 dark:text-cyan-400">{formatMoney(financials.balance)}</h3>
                     <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 dark:bg-gray-700 overflow-hidden">
                        <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-1 text-right font-medium">EBITDA: 14%</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-gray-700">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h4 className="font-bold text-slate-800 dark:text-white">Fluxo de Caixa Mensal</h4>
                           <p className="text-xs text-slate-500 italic">Comparativo Receitas vs Despesas</p>
                        </div>
                        <div className="flex gap-2">
                           <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-teal-500"><CheckCircle size={10} /> Entradas</span>
                           <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-pink-500"><CheckCircle size={10} /> Saídas</span>
                        </div>
                     </div>
                     <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={CHART_DATA_CASHFLOW}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                              <Tooltip
                                 cursor={{ fill: '#f8fafc' }}
                                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="income" name="Receitas" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={20} />
                              <Bar dataKey="expense" name="Despesas" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={20} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="flex flex-col gap-5">
                     <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 flex-1">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-lg font-bold text-slate-900 dark:text-white">Disponibilidade</h4>
                           <button onClick={() => setActiveTab('accounts')} className="text-cyan-600 text-xs font-bold hover:underline uppercase">Gerenciar</button>
                        </div>
                        <div className="space-y-3">
                           {accounts.slice(0, 3).map((acc, i) => (
                              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800/50 hover:border-cyan-200 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className={`${acc.color} text-white p-2 rounded-lg text-xs font-black w-10 h-10 flex items-center justify-center shadow-sm uppercase`}>
                                       {acc.name.substring(0, 2)}
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-slate-800 dark:text-white">{acc.name}</p>
                                       <p className="text-[10px] text-slate-400 font-medium">{acc.type}</p>
                                    </div>
                                 </div>
                                 <span className="text-sm font-black text-slate-700 dark:text-slate-100">{formatMoney(acc.balance)}</span>
                              </div>
                           ))}
                           {accounts.length === 0 && (
                              <p className="text-center py-4 text-xs text-slate-400 italic">Nenhuma conta ativa.</p>
                           )}
                        </div>
                     </div>

                     {(() => {
                        const nextBill = transactions.find(t => t.type === 'Despesa' && t.status === 'Pendente');
                        return (
                           <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={80} /></div>
                              <h5 className="font-bold text-xs text-slate-400 uppercase mb-4 tracking-widest">Próximo Vencimento</h5>
                              {nextBill ? (
                                 <>
                                    <div className="flex items-start gap-4 mb-6">
                                       <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl border border-red-500/20">
                                          <Calendar size={24} />
                                       </div>
                                       <div>
                                          <p className="font-bold text-lg leading-tight line-clamp-1">{nextBill.description}</p>
                                          <p className="text-xs text-slate-400 mt-0.5 font-mono">{nextBill.date} • Pendente</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                       <h4 className="text-2xl font-black text-white">{formatMoney(nextBill.amount)}</h4>
                                       <button
                                          onClick={() => updateTransactionStatus(nextBill.id, 'Conciliado')}
                                          className="bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-500/20 uppercase"
                                       >
                                          PAGAR
                                       </button>
                                    </div>
                                 </>
                              ) : (
                                 <div className="py-10 text-center opacity-40">
                                    <CheckCircle size={32} className="mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase">Faturas em dia</p>
                                 </div>
                              )}
                           </div>
                        );
                     })()}
                  </div>
               </div>

               {/* Transactions Table */}
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-gray-700/50">
                     <div className="flex items-center gap-3">
                        <List className="text-cyan-600" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Livro Caixa</h4>
                     </div>
                     <div className="relative flex items-center gap-2">
                        <div className="relative">
                           <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <select
                              className="pl-9 pr-8 py-2 text-sm bg-white border-slate-200 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={categoryFilter}
                              onChange={(e) => setCategoryFilter(e.target.value)}
                           >
                              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                           </select>
                        </div>
                        <div className="relative">
                           <Settings size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input
                              className="pl-9 pr-4 py-2 text-sm bg-white border-slate-200 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full sm:w-64"
                              placeholder="Filtrar por nome..."
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-slate-400 uppercase bg-slate-50 dark:bg-gray-800 font-black border-b border-slate-100 dark:border-gray-700">
                           <tr>
                              <th className="px-6 py-3">Data</th>
                              <th className="px-6 py-3">Descrição / Origem</th>
                              <th className="px-6 py-3">Plano de Contas</th>
                              <th className="px-6 py-3 text-right">Valor</th>
                              <th className="px-6 py-3 text-center">Status</th>
                              <th className="px-6 py-3 text-right">Ações</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                           {filteredTransactions.map(tx => (
                              <tr key={tx.id} className="bg-white hover:bg-slate-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group">
                                 <td className="px-6 py-3.5 whitespace-nowrap">
                                    <span className="font-bold text-slate-500 dark:text-gray-400 text-xs">{tx.date}</span>
                                 </td>
                                 <td className="px-6 py-3.5">
                                    <div className="flex items-center gap-3">
                                       <div className={`p-1.5 rounded-lg ${tx.type === 'Receita' ? 'bg-green-100 text-green-600 dark:bg-green-900/40' : 'bg-red-100 text-red-600 dark:bg-red-900/40'}`}>
                                          {tx.type === 'Receita' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                       </div>
                                       <div>
                                          <span className="font-bold text-slate-800 dark:text-white text-sm">{tx.description}</span>
                                          <p className="text-[10px] text-slate-400">{tx.account}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-3.5">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                          {tx.ledgerCode || '---'}
                                       </span>
                                       <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                          {tx.ledgerName || tx.category}
                                       </span>
                                    </div>
                                 </td>
                                 <td className={`px-6 py-3.5 text-right font-black text-sm ${tx.type === 'Receita' ? 'text-green-600' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {tx.type === 'Receita' ? '+' : '-'} {formatMoney(tx.amount)}
                                 </td>
                                 <td className="px-6 py-3.5 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'Conciliado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                       <span className={`h-1.5 w-1.5 rounded-full ${tx.status === 'Conciliado' ? 'bg-green-600' : 'bg-amber-600'}`}></span>
                                       {tx.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                       <button
                                          onClick={() => updateTransactionStatus(tx.id, tx.status === 'Conciliado' ? 'Pendente' : 'Conciliado')}
                                          className={`p-2 rounded-lg transition-colors ${tx.status === 'Conciliado' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
                                          title={tx.status === 'Conciliado' ? 'Reverter Conciliação' : 'Conciliar / Pagar'}
                                       >
                                          <CheckCircle size={16} />
                                       </button>
                                       <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg"><Eye size={16} /></button>
                                       <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-white rounded-lg"><Paperclip size={16} /></button>
                                       <button onClick={() => { if (confirm("Remover esta transação?")) deleteTransaction(tx.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}

         {/* Account Modal */}
         {isAccountModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Landmark className="text-cyan-600" />
                        Nova Conta Financeira
                     </h3>
                     <button onClick={() => setIsAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Conta / Banco</label>
                        <input
                           required
                           type="text"
                           className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                           placeholder="Ex: Itaú Personalité"
                           value={accountForm.name}
                           onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                           <select
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              value={accountForm.type}
                              onChange={e => setAccountForm({ ...accountForm, type: e.target.value })}
                           >
                              <option value="Conta Corrente">Conta Corrente</option>
                              <option value="Investimento">Investimento</option>
                              <option value="Espécie">Espécie / Caixa</option>
                              <option value="Cartão de Crédito">Cartão de Crédito</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Saldo Inicial</label>
                           <input
                              type="number"
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-bold"
                              value={accountForm.balance}
                              onChange={e => setAccountForm({ ...accountForm, balance: Number(e.target.value) })}
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código / Agência / Obs</label>
                        <input
                           type="text"
                           className="w-full rounded-lg border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                           placeholder="Ex: Ag 0001 / CC 1234-5"
                           value={accountForm.code}
                           onChange={e => setAccountForm({ ...accountForm, code: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cor de Identificação</label>
                        <div className="flex gap-2 mt-1">
                           {['bg-blue-600', 'bg-red-600', 'bg-purple-600', 'bg-teal-600', 'bg-orange-600', 'bg-emerald-600'].map(c => (
                              <button
                                 key={c}
                                 type="button"
                                 onClick={() => setAccountForm({ ...accountForm, color: c })}
                                 className={`w-8 h-8 rounded-full ${c} ${accountForm.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                              />
                           ))}
                        </div>
                     </div>
                     <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsAccountModalOpen(false)} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-600/20">Salvar Conta</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default Finance;
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Truck,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Package,
  Activity,
  Users,
  ShoppingCart,
  Zap,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Target,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { CHART_DATA_CASHFLOW } from '../constants';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const {
    financials, fleet, transactions, sales, budgets,
    employees, inventory, payroll
  } = useApp();

  // Stats Calculations
  const activeVehicles = fleet.filter(v => v.status === 'Operacional').length;
  const fleetPercentage = fleet.length > 0 ? Math.round((activeVehicles / fleet.length) * 100) : 0;

  const pendingBudgets = budgets.filter(b => b.status === 'Aberto').length;
  const totalSalesThisMonth = sales.length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock).length;
  const activeEmployees = employees.filter(e => e.status === 'Ativo').length;
  const pendingPayroll = payroll.filter(p => p.status === 'Pendente').length;

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const recentActivity = useMemo(() => {
    return [...transactions].slice(0, 6);
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 pb-10">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20 hidden sm:block">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Console de Comando
              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-lg font-black uppercase tracking-widest animate-pulse">Live</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 uppercase tracking-wider font-display">InfraCore ERP • Gestão Integrada de Infraestrutura</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <Calendar size={16} className="text-cyan-600" />
            <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
          </div>
          <NavLink to="/reports" className="p-2.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-all">
            <Activity size={20} />
          </NavLink>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 rotate-12">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                <ArrowUpRight size={14} /> 8.4%
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Saldo Financeiro</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{formatMoney(financials.balance)}</h3>
            <div className="h-1 w-12 bg-emerald-500 rounded-full mt-4 group-hover:w-full transition-all duration-700"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 -rotate-12">
            <ShoppingCart size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <Target size={24} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-300 text-[10px] font-black border border-slate-100 dark:border-slate-600 uppercase">{pendingBudgets} Aberto</div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Vendas Hoje</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {(() => {
                const todayStr = new Date().toLocaleDateString('pt-BR');
                const salesToday = sales.filter(s => s.date === todayStr);
                const totalToday = salesToday.reduce((acc, s) => acc + s.amount, 0);
                return formatMoney(totalToday);
              })()}
            </h3>
            <div className="h-1 w-12 bg-cyan-500 rounded-full mt-4 group-hover:w-full transition-all duration-700"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Truck size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Zap size={24} />
              </div>
              <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase">{activeVehicles} Online</div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Disponibilidade</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{fleetPercentage}%</h3>
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-500 group-hover:animate-pulse" style={{ width: `${fleetPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
            <Users size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors focus:ring-0">
                <CheckCircle size={24} />
              </div>
              <div className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100 uppercase">Seguro</div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Human Capital</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{activeEmployees} <span className="text-sm text-slate-400 font-black uppercase ml-1">Staff</span></h3>
            <div className="h-1 w-12 bg-indigo-500 rounded-full mt-4 group-hover:w-full transition-all duration-700"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Fluxo de Caixa Operacional</h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Visão histórica consolidada (6 meses)</p>
            </div>
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-400 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Despesas</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA_CASHFLOW}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 800 }}
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    padding: '20px',
                    background: '#0f172a',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#06b6d4" strokeWidth={5} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10">
            <h4 className="text-xl font-black uppercase tracking-[0.2em] mb-10 flex items-center justify-between">
              Intelligence
              <Zap className="text-cyan-400 animate-pulse" size={24} />
            </h4>

            <div className="space-y-6">
              {lowStockItems > 0 && (
                <NavLink to="/inventory" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
                  <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl"><Package size={20} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Estoque Crítico</p>
                    <p className="text-sm font-bold mt-0.5">{lowStockItems} itens abaixo do mínimo</p>
                  </div>
                </NavLink>
              )}

              {pendingPayroll > 0 && (
                <NavLink to="/hr" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl"><DollarSign size={20} /></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Payroll Pending</p>
                    <p className="text-sm font-bold mt-0.5">{pendingPayroll} ordens de pagamento</p>
                  </div>
                </NavLink>
              )}

              <NavLink to="/production" className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
                <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl"><BarChart3 size={20} /></div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Job Efficiency</p>
                  <p className="text-sm font-bold mt-0.5">Performance operacional: 94.2%</p>
                </div>
              </NavLink>
            </div>

            <div className="mt-12 pt-10 border-t border-white/10">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Real-time Pulse</p>
                <span className="flex items-center gap-2 text-[10px] font-black text-cyan-400">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
                  SYNCED
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-16">
                {[30, 60, 40, 95, 20, 80, 50, 90, 70, 85, 45, 100].map((v, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-[2000ms]" style={{ height: `${v}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Stream</h4>
            <NavLink to="/finance" className="text-[10px] font-black text-cyan-600 hover:text-cyan-700 uppercase tracking-widest transition-colors">See Treasury</NavLink>
          </div>
          <div className="space-y-4">
            {recentActivity.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-transparent hover:border-cyan-100 dark:hover:border-slate-700 transition-all group cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-2xl ${tx.type === 'Receita' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tx.type === 'Receita' ? <ArrowUpRight size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white line-clamp-1 group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{tx.category}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${tx.type === 'Receita' ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}>
                  {tx.type === 'Receita' ? '+' : '-'} {formatMoney(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: 'Vendas/PDV', icon: <ShoppingCart />, color: 'bg-cyan-500', path: '/sales', sub: 'Terminais Ativos' },
            { name: 'Financeiro', icon: <DollarSign />, color: 'bg-emerald-500', path: '/finance', sub: 'Tesouraria' },
            { name: 'Produção', icon: <Activity />, color: 'bg-slate-900', path: '/production', sub: 'Monitoramento' },
            { name: 'Logística', icon: <Truck />, color: 'bg-amber-500', path: '/fleet', sub: 'Gestão Frota' },
            { name: 'Inventário', icon: <Package />, color: 'bg-indigo-600', path: '/clients', sub: 'Estoque Central' },
            { name: 'RH & Ponto', icon: <Users />, color: 'bg-violet-600', path: '/hr', sub: 'Staff & Folha' },
          ].map((action, i) => (
            <NavLink key={i} to={action.path} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-5 group hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300">
              <div className={`p-5 ${action.color} text-white rounded-3xl shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                {React.cloneElement(action.icon as React.ReactElement, { size: 28 })}
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest block">{action.name}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{action.sub}</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
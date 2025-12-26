import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    DollarSign,
    Share2,
    Printer,
    Mail,
    ChevronDown,
    Loader,
    ArrowUpRight,
    ArrowDownRight,
    Circle,
    Package,
    Activity,
    Factory,
    RefreshCw,
    ExternalLink,
    AlertTriangle,
    TrendingDown,
    PieChart as PieChartIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCSV } from '../utils/exportUtils';

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#99f6ff'];

const Reports = () => {
    const { financials, transactions, sales, inventory, purchaseOrders } = useApp();
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportPeriod, setReportPeriod] = useState('30d');
    const [reportType, setReportType] = useState<'financial' | 'operational' | 'sales'>('financial');

    // Simulate generating report or export to Excel
    const handleGenerateReport = (action: 'download' | 'share' | 'print' | 'excel') => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            if (action === 'download') alert("Relatório PDF de alta resolução baixado!");
            if (action === 'excel') {
                // Determine what to export based on some logic or just the transactions
                if (reportType === 'financial') {
                    exportToCSV(transactions, 'Relatorio_Financeiro_InfraCore');
                } else if (reportType === 'sales') {
                    const salesData = sales.map(s => ({
                        ID: s.id,
                        Data: s.date,
                        Cliente: s.clientName,
                        Total: s.total,
                        Status: s.status,
                        Itens: s.items.map(i => i.name).join(', ')
                    }));
                    exportToCSV(salesData, 'Relatorio_Vendas_InfraCore');
                } else {
                    exportToCSV(inventory, 'Relatorio_Estoque_InfraCore');
                }
            }
            if (action === 'share') {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Link para este dashboard copiado com sucesso!");
            }
            if (action === 'print') window.print();
        }, 1200);
    };

    // --- REAL DATA AGGREGATION ---

    // 1. Financial Trends (Daily/Monthly aggregation from Transactions)
    const financialHistory = useMemo(() => {
        // Group transactions by date for the last 7 entries for the chart
        const last7 = transactions.slice(-7).map(tx => ({
            name: tx.date.split('/')[0], // Just the day
            receita: tx.type === 'Receita' ? tx.amount : 0,
            despesa: tx.type === 'Despesa' ? tx.amount : 0,
        }));

        // If no transactions, use default mock so charts aren't empty
        if (last7.length === 0) {
            return [
                { name: '18', receita: 4000, despesa: 2400 },
                { name: '19', receita: 3000, despesa: 1398 },
                { name: '20', receita: 2000, despesa: 9800 },
                { name: '21', receita: 2780, despesa: 3908 },
                { name: '22', receita: 1890, despesa: 4800 },
                { name: '23', receita: 2390, despesa: 3800 },
                { name: 'Hoje', receita: financials.totalRevenue / 10, despesa: financials.totalExpenses / 10 },
            ];
        }
        return last7;
    }, [transactions, financials]);

    // 2. Expenses by Category
    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};
        transactions.forEach(tx => {
            if (tx.type === 'Despesa') {
                categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
            }
        });

        const data = Object.entries(categories).map(([name, value]) => ({ name, value }));
        return data.length > 0 ? data : [
            { name: 'Insumos', value: 45000 },
            { name: 'Logística', value: 12000 },
            { name: 'Manutenção', value: 8000 },
            { name: 'Salários', value: 35000 },
        ];
    }, [transactions]);

    // 3. Sales Performance (Top Products)
    const topProducts = useMemo(() => {
        const counts: Record<string, number> = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                counts[item.name] = (counts[item.name] || 0) + (item.price * item.quantity);
            });
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, val]) => ({ name, value: val }));
    }, [sales]);

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
    }).format(val);

    const formatBRLCompact = (val: number) => {
        if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
        return formatBRL(val);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Header / Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display tracking-tight">
                        <div className="p-2 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
                            <PieChartIcon size={24} />
                        </div>
                        BI & Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Insights operacionais e financeiros em tempo real.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-700">
                        <button
                            onClick={() => setReportPeriod('7d')}
                            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${reportPeriod === '7d' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            7 DIAS
                        </button>
                        <button
                            onClick={() => setReportPeriod('30d')}
                            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${reportPeriod === '30d' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            30 DIAS
                        </button>
                        <button
                            onClick={() => setReportPeriod('12m')}
                            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${reportPeriod === '12m' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            12 MESES
                        </button>
                    </div>

                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden xl:block" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleGenerateReport('share')}
                            className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-cyan-600 rounded-2xl transition-all border dark:border-slate-700"
                            title="Compartilhar Dashboard"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={() => handleGenerateReport('excel')}
                            className="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all border border-emerald-100 dark:border-emerald-900/30"
                            title="Exportar para Excel (.csv)"
                        >
                            <FileText size={20} />
                        </button>
                        <button
                            disabled={isGenerating}
                            onClick={() => handleGenerateReport('download')}
                            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl hover:opacity-90 transition-all font-black text-xs flex items-center gap-3 disabled:opacity-70"
                        >
                            {isGenerating ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
                            {isGenerating ? 'PROCESSANDO...' : 'RELATÓRIO PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Smart KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'RECEITA BRUTA', value: financials.totalRevenue, trend: '+12.5%', icon: <DollarSign />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { label: 'LUCRO ESTIMADO', value: financials.balance, trend: '+4.2%', icon: <TrendingUp />, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/10' },
                    { label: 'TICKET MÉDIO', value: sales.length > 0 ? financials.totalRevenue / sales.length : 0, trend: '-1.8%', icon: <Activity />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'EFFICIENCY (OEE)', value: 94.2, trend: '+2.1%', icon: <Factory />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                                {kpi.icon}
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {kpi.label.includes('EFFICIENCY') ? kpi.value.toFixed(1) + '%' : formatBRLCompact(kpi.value)}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cash Flow Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase text-xs">Fluxo de Caixa Consolidado</h3>
                            <p className="text-sm text-slate-400 font-medium">Entradas vs Saídas Diárias</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase"><Circle size={8} fill="currentColor" /> Receitas</span>
                            <span className="flex items-center gap-2 text-[10px] font-black text-pink-500 uppercase"><Circle size={8} fill="currentColor" /> Despesas</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area type="monotone" dataKey="receita" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                                <Area type="monotone" dataKey="despesa" stroke="#f472b6" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Breakdown */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase text-xs">Alocação de Recursos</h3>
                    <p className="text-sm text-slate-400 mb-8 font-medium">Distribuição por centro de custo</p>

                    <div className="h-[350px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Total</span>
                            <span className="text-xl font-black text-slate-800 dark:text-white">{formatBRL(financials.totalExpenses).split(',')[0]}</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {categoryData.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{formatBRL(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Products & Stock Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Performance</h3>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight">Produtos Líderes em Faturamento</h4>
                        </div>
                        <Package className="text-cyan-500" size={24} />
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-cyan-600 group-hover:text-white transition-all">{i + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1 text-xs">
                                        <span className="font-black dark:text-gray-300">{p.name}</span>
                                        <span className="font-black text-cyan-600">{formatBRL(p.value)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-600 rounded-full shadow-[0_0_10px_rgba(8,145,178,0.4)] transition-all duration-1000" style={{ width: `${(p.value / (topProducts[0]?.value || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="text-center py-10 text-slate-400 italic text-sm">Nenhum dado de venda consolidado ainda.</div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 grayscale"><Factory size={200} /></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Monitor de Disponibilidade</h3>
                                <h4 className="text-2xl font-black leading-tight">Gargalos e Reposição</h4>
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                                <Activity size={24} className="text-cyan-400" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            {inventory.filter(p => (p.quantity / p.minStock) < 1.5).slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${item.quantity < item.minStock ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">{item.name}</p>
                                            <p className="text-[10px] font-bold text-white/40 uppercase">Atenção: Estoque Baixo</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg">{item.quantity} {item.unit}</p>
                                        <p className="text-[10px] font-bold text-white/40">MIN: {item.minStock}</p>
                                    </div>
                                </div>
                            ))}
                            {inventory.filter(p => (p.quantity / p.minStock) < 1.5).length === 0 && (
                                <div className="text-center py-10 opacity-50">Tudo operando conforme o planejado.</div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                const lowStock = inventory.filter(p => p.quantity < p.minStock);
                                if (lowStock.length > 0) {
                                    alert(`Sugestão: Criar pedidos de compra para ${lowStock.length} itens com estoque crítico: ${lowStock.map(i => i.name).join(', ')}.`);
                                } else {
                                    alert("Todos os itens estão com estoque saudável acima do mínimo.");
                                }
                            }}
                            className="w-full mt-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl transition-all shadow-cyan-600/30 uppercase tracking-widest text-xs"
                        >
                            Gerar Pedidos de Reposição
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

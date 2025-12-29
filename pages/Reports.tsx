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
    PieChart as PieChartIcon,
    Truck,
    User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCSV, printDocument } from '../utils/exportUtils';

const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const Reports = () => {
    const { financials, transactions, sales, inventory, purchaseOrders, clients, fleet, employees } = useApp();
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'generator'>('dashboard');

    // Report Generator State
    const [selectedModule, setSelectedModule] = useState<string>('sales');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Available Modules for Reporting
    const modules = [
        { id: 'sales', name: 'Vendas e Comercial', icon: <DollarSign size={16} /> },
        { id: 'finance', name: 'Transações Financeiras', icon: <TrendingUp size={16} /> },
        { id: 'inventory', name: 'Estoque e Produtos', icon: <Package size={16} /> },
        { id: 'clients', name: 'Base de Clientes', icon: <Circle size={16} /> },
        { id: 'fleet', name: 'Frota e Veículos', icon: <Truck size={16} /> },
        { id: 'hr', name: 'Recursos Humanos', icon: <User size={16} /> }, // Assuming User icon imported later
    ];

    // Filter Logic
    const reportData = useMemo(() => {
        let data: any[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);

        // Helper to check date range (if item has date)
        const isInRange = (dateStr?: string) => {
            if (!dateStr) return true; // Include if no date? Or exclude? Default include for master data like clients
            // Parse PT-BR date dd/mm/yyyy
            const [day, month, year] = dateStr.split('/').map(Number);
            const itemDate = new Date(year, month - 1, day);
            return itemDate >= start && itemDate <= end;
        };

        switch (selectedModule) {
            case 'sales':
                data = sales.filter(s => isInRange(s.date)).map(s => ({
                    ID: s.id,
                    Data: s.date,
                    Cliente: s.clientName,
                    'Forma Pagto': s.paymentMethod,
                    Total: s.amount,
                    Status: s.status
                }));
                break;
            case 'finance':
                data = transactions.filter(t => isInRange(t.date)).map(t => ({
                    ID: t.id,
                    Data: t.date,
                    Descrição: t.description,
                    Categoria: t.category,
                    Tipo: t.type,
                    Valor: t.amount,
                    Status: t.status,
                    Conta: t.account
                }));
                break;
            case 'inventory':
                data = inventory.map(i => ({
                    ID: i.id,
                    Produto: i.name,
                    Categoria: i.category,
                    Qtd: i.quantity,
                    Unidade: i.unit,
                    'Preço Venda': i.price,
                    Peso: i.weight || '-',
                    'Valor Total': i.price * i.quantity
                }));
                break;
            case 'clients':
                // Filter by registration date if needed, or just show all active
                data = clients.map(c => ({
                    Nome: c.name,
                    Documento: c.document,
                    Email: c.email,
                    Telefone: c.phone,
                    Cidade: c.address?.city,
                    Status: c.status
                }));
                break;
            case 'fleet':
                data = fleet.map(f => ({
                    Placa: f.plate,
                    Modelo: f.model,
                    Tipo: f.type,
                    KM: f.km,
                    Status: f.status,
                    Combustível: f.fuelType
                }));
                break;
            case 'hr':
                data = employees.map(e => ({
                    Nome: e.name,
                    Cargo: e.role,
                    Depto: e.department,
                    Salário: e.salary,
                    Admissão: e.admissionDate,
                    Status: e.status
                }));
                break;
        }
        return data;
    }, [selectedModule, startDate, endDate, sales, transactions, inventory, clients, fleet, employees]);

    const handlePrintReport = () => {
        const title = `Relatório de ${modules.find(m => m.id === selectedModule)?.name}`;

        // Generate HTML Table
        if (reportData.length === 0) {
            alert("Sem dados para imprimir.");
            return;
        }

        const headers = Object.keys(reportData[0]);
        const html = `
            <div style="margin-bottom: 20px;">
                <p><strong>Período:</strong> ${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}</p>
                <p><strong>Total de Registros:</strong> ${reportData.length}</p>
            </div>
            <table>
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${reportData.map(row => `
                        <tr>${headers.map(h => {
            let val = row[h as keyof typeof row];
            if (typeof val === 'number' && (h.includes('Valor') || h.includes('Total') || h.includes('Preço') || h.includes('Salário'))) {
                val = formatMoney(val);
            }
            return `<td>${val}</td>`;
        }).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        printDocument(title, html);
    };

    // Keep existing BI Dash logic
    const [reportPeriod, setReportPeriod] = useState('30d');


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

    const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#99f6ff'];

    // Legacy handler for the dashboard buttons (optional, or redirect to generator)
    const handleDashboardExport = (action: 'download' | 'share' | 'excel') => {
        if (action === 'share') {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiado!");
        } else if (action === 'excel') {
            exportToCSV(transactions, 'Relatorio_Financeiro_Geral');
        } else {
            setActiveTab('generator'); // Redirect to detailed generator
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Main Header with Tabs */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display tracking-tight">
                        <div className="p-2 bg-gradient-to-br from-cyan-600 to-cyan-400 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
                            {activeTab === 'dashboard' ? <PieChartIcon size={24} /> : <FileText size={24} />}
                        </div>
                        {activeTab === 'dashboard' ? 'BI & Analytics' : 'Gerador de Relatórios'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                        {activeTab === 'dashboard' ? 'Insights operacionais e financeiros em tempo real.' : 'Exportação detalhada de dados do sistema.'}
                    </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-3 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <PieChartIcon size={16} /> VISÃO GERAL
                    </button>
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`px-6 py-3 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${activeTab === 'generator' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Printer size={16} /> RELATÓRIOS DETALHADOS
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' ? (
                /* --- DASHBOARD VIEW (Existing Logic) --- */
                <div className="flex flex-col gap-6 animate-in slide-in-from-left duration-300">
                    {/* Period Selector & Dashboard Tools */}
                    <div className="flex justify-end gap-4">
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                            {['7d', '30d', '12m'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setReportPeriod(p)}
                                    className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${reportPeriod === p ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    {p.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => handleDashboardExport('excel')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100" title="Exportar Resumo"><FileText size={20} /></button>
                        <button onClick={() => handleDashboardExport('share')} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><Share2 size={20} /></button>
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
                                        <Tooltip />
                                        <Area type="monotone" dataKey="receita" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                                        <Area type="monotone" dataKey="despesa" stroke="#f472b6" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Categories Breakdown */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="h-[350px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} fill="#8884d8" paddingAngle={8} dataKey="value" stroke="none">
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Total</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{formatBRL(financials.totalExpenses).split(',')[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- REPORT GENERATOR VIEW --- */
                <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-right duration-300">

                    {/* Sidebar Configuration */}
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity size={20} className="text-cyan-600" /> Configuração
                            </h3>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Módulo</label>
                                <div className="space-y-2">
                                    {modules.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setSelectedModule(m.id)}
                                            className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${selectedModule === m.id ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-2 border-cyan-500' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                        >
                                            {m.icon}
                                            <span className="text-sm font-bold">{m.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Início</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs font-bold border-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Data Fim</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs font-bold border-none" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-cyan-600 p-6 rounded-3xl shadow-lg shadow-cyan-600/20 text-white space-y-4">
                            <h3 className="font-black flex items-center gap-2"><Printer size={20} /> Exportação</h3>
                            <button
                                onClick={() => exportToCSV(reportData, `Relatorio_${selectedModule}`)}
                                className="w-full py-3 bg-white text-cyan-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors"
                            >
                                <FileText size={18} /> Baixar Excel / CSV
                            </button>
                            <button
                                onClick={handlePrintReport}
                                className="w-full py-3 bg-cyan-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-800 transition-colors"
                            >
                                <Printer size={18} /> Imprimir / PDF
                            </button>
                        </div>
                    </div>

                    {/* Report Preview */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white">Pré-visualização</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase">{modules.find(m => m.id === selectedModule)?.name} • {reportData.length} Registros</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center gap-1">
                                    <Circle size={8} fill="currentColor" /> ONLINE
                                </span>
                            </div>
                        </div>
                        <div className="overflow-auto flex-1 p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                                    <tr>
                                        {reportData.length > 0 ? Object.keys(reportData[0]).map(key => (
                                            <th key={key} className="px-6 py-4 whitespace-nowrap">{key}</th>
                                        )) : <th className="px-6 py-4">Sem dados</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {reportData.length > 0 ? reportData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                                            {Object.keys(row).map((key, i) => {
                                                let val = row[key];
                                                if (typeof val === 'number' && (key.includes('Valor') || key.includes('Total') || key.includes('Preço') || key.includes('Salário'))) {
                                                    val = formatMoney(val);
                                                }
                                                return <td key={i} className="px-6 py-4 dark:text-gray-300 whitespace-nowrap">{val}</td>;
                                            })}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className="px-6 py-20 text-center text-slate-400 italic">
                                                Nenhum registro encontrado para este período.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



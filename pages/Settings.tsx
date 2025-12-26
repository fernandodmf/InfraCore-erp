import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Users,
    Shield,
    Building,
    Palette,
    Bell,
    Globe,
    Save,
    Plus,
    Trash2,
    Edit2,
    X,
    Check,
    Lock,
    UserPlus,
    Monitor,
    Mail,
    Phone,
    MapPin,
    Database,
    Cloud,
    ShieldCheck,
    Cpu,
    History,
    Activity,
    Server,
    Zap,
    Scale,
    Calendar,
    Wifi,
    BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, AppRole, AppSettings, AuditLog } from '../types';

const Settings = () => {
    const {
        users, roles, settings, auditLogs,
        addUser, updateUser, deleteUser,
        addRole, updateRole, deleteRole,
        updateSettings, clearAllData
    } = useApp();

    const [activeTab, setActiveTab] = useState<'company' | 'security' | 'system' | 'audit'>('company');
    const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles' | 'technical' | 'preferences'>('users');

    // Modals
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingRole, setEditingRole] = useState<AppRole | null>(null);

    // Form States
    const [tempSettings, setTempSettings] = useState<AppSettings>(settings);

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(tempSettings);
        alert('Configurações salvas com sucesso!');
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            if (users.some(u => u.id === editingUser.id)) {
                updateUser(editingUser);
            } else {
                addUser({ ...editingUser, id: Date.now().toString(), registeredAt: new Date().toLocaleDateString('pt-BR') });
            }
            setIsUserModalOpen(false);
            setEditingUser(null);
        }
    };

    const handleSaveRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            if (roles.some(r => r.id === editingRole.id)) {
                updateRole(editingRole);
            } else {
                addRole({ ...editingRole, id: Date.now().toString() });
            }
            setIsRoleModalOpen(false);
            setEditingRole(null);
        }
    };

    const permissionOptions = [
        { id: 'all', name: 'Administrador Total', category: 'Sistema' },
        { id: 'inventory.view', name: 'Visualizar Estoque', category: 'Estoque' },
        { id: 'inventory.edit', name: 'Editar Estoque', category: 'Estoque' },
        { id: 'sales.view', name: 'Visualizar Vendas', category: 'Comercial' },
        { id: 'sales.create', name: 'Criar Vendas/Orçamentos', category: 'Comercial' },
        { id: 'finance.view', name: 'Visualizar Financeiro', category: 'Financeiro' },
        { id: 'finance.admin', name: 'Gestão Financeira Total', category: 'Financeiro' },
        { id: 'fleet.view', name: 'Visualizar Frota', category: 'Logística' },
        { id: 'fleet.admin', name: 'Gestão de Frota/Manutenção', category: 'Logística' },
        { id: 'production.view', name: 'Visualizar Produção', category: 'Industrial' },
        { id: 'production.admin', name: 'Gestão de PCP/Laboratório', category: 'Industrial' },
        { id: 'employees.view', name: 'Visualizar RH', category: 'Recursos Humanos' },
        { id: 'settings.view', name: 'Acessar Configurações', category: 'Sistema' },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10 h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 px-2 leading-none">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase italic">
                        <div className="p-2.5 bg-slate-900 dark:bg-indigo-600 rounded-2xl text-white shadow-xl rotate-3">
                            <Cpu size={28} />
                        </div>
                        Painel de Controle
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-2 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={12} className="text-emerald-500 animate-pulse" /> Status do Sistema: <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-4">Operacional</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSaveSettings}
                        className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Save size={16} /> Salvar Alterações
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar shrink-0">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'company' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <Building size={16} /> Empresa
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <ShieldCheck size={16} /> Segurança
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'system' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <SettingsIcon size={16} /> Parâmetros
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                    <History size={16} /> Auditoria
                </button>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 p-8 overflow-y-auto custom-scrollbar">

                {/* COMPANY TAB */}
                {activeTab === 'company' && (
                    <div className="animate-in slide-in-from-bottom duration-500 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-8">
                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Building size={14} className="text-indigo-500" /> Identidade Visual & Jurídica
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 ring-indigo-500/20 transition-all outline-none" value={tempSettings.companyName} onChange={e => setTempSettings({ ...tempSettings, companyName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 ring-indigo-500/20 transition-all outline-none" value={tempSettings.tradeName} onChange={e => setTempSettings({ ...tempSettings, tradeName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ / Documento</label>
                                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 ring-indigo-500/20 transition-all outline-none" value={tempSettings.document} onChange={e => setTempSettings({ ...tempSettings, document: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                            <input type="email" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 ring-indigo-500/20 transition-all outline-none" value={tempSettings.email} onChange={e => setTempSettings({ ...tempSettings, email: e.target.value })} />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <MapPin size={14} className="text-indigo-500" /> Canais & Localização
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone Principal</label>
                                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 ring-indigo-500/20 transition-all outline-none" value={tempSettings.phone} onChange={e => setTempSettings({ ...tempSettings, phone: e.target.value })} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Sede</label>
                                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 ring-indigo-500/20 transition-all outline-none" value={tempSettings.address} onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })} />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                                    <Zap size={120} className="absolute -right-10 -bottom-10 text-indigo-500/20 group-hover:rotate-12 transition-transform duration-500" />
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Plano Construsys</h4>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-400">Status do Plano</span>
                                            <span className="font-black text-emerald-400 uppercase">Enterprise</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-400">Usuários</span>
                                            <span className="font-black">{users.length} / Ilimitado</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-400">Armazenamento</span>
                                            <span className="font-black">1.2 GB / 50 GB</span>
                                        </div>
                                        <div className="pt-4">
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 w-[12%]"></div>
                                            </div>
                                        </div>
                                        <button className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">Upgrade de Plano</button>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-slate-100 dark:border-slate-700">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Suporte Dedicado</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">Precisa de ajuda avançada ou treinamento personalizado? Nossa equipe está pronta.</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Phone size={14} className="text-indigo-500" /> 0800 123 4567
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <Mail size={14} className="text-indigo-500" /> vip@construsys.com
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="animate-in slide-in-from-bottom duration-500 space-y-10">
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl w-fit">
                            <button onClick={() => setActiveSubTab('users')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'users' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>Gerir Usuários</button>
                            <button onClick={() => setActiveSubTab('roles')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'roles' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>Perfis de Acesso</button>
                        </div>

                        {activeSubTab === 'users' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} /> Ativos no Sistema ({users.length})
                                    </h3>
                                    <button onClick={() => { setEditingUser({ id: '', name: '', email: '', roleId: 'operator', status: 'Ativo', registeredAt: '' }); setIsUserModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><UserPlus size={24} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map(user => (
                                        <div key={user.id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-colors border border-slate-100 dark:border-slate-700"><Edit2 size={12} /></button>
                                                    <button onClick={() => { if (confirm('Excluir acesso?')) deleteUser(user.id); }} className="p-2 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm transition-colors border border-slate-100 dark:border-slate-700"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{user.name}</p>
                                                <p className="text-xs text-slate-400 font-medium mb-4">{user.email}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500 uppercase">{roles.find(r => r.id === user.roleId)?.name || 'N/A'}</span>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{user.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'roles' && (
                            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {roles.map(role => (
                                    <div key={role.id} className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100 dark:border-slate-700">
                                                <Shield size={24} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role.permissions.length} Funções</span>
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-base mb-2 tracking-tighter">{role.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-1">{role.description}</p>
                                        <div className="mt-8 flex gap-3">
                                            <button onClick={() => { setEditingRole(role); setIsRoleModalOpen(true); }} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-900 hover:text-white transition-all">Configurar</button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => { setEditingRole({ id: '', name: '', description: '', permissions: [] }); setIsRoleModalOpen(true); }}
                                    className="p-8 border-4 border-dashed border-slate-100 dark:border-slate-800 bg-transparent rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                                >
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full"><Plus size={32} /></div>
                                    <span className="font-black uppercase text-[10px] tracking-widest">Novo Perfil</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* SYSTEM TAB */}
                {activeTab === 'system' && (
                    <div className="animate-in slide-in-from-bottom duration-500 space-y-12">
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">Parâmetros Técnicos</h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regime Tributário</label>
                                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={tempSettings.technical.taxRegime} onChange={e => setTempSettings({ ...tempSettings, technical: { ...tempSettings.technical, taxRegime: e.target.value } })}>
                                                    <option value="Simples Nacional">Simples Nacional</option>
                                                    <option value="Lucro Presumido">Lucro Presumido</option>
                                                    <option value="Lucro Real">Lucro Real</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alíquota Padrão (%)</label>
                                                <input type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={tempSettings.technical.defaultTaxRate} onChange={e => setTempSettings({ ...tempSettings, technical: { ...tempSettings.technical, defaultTaxRate: parseFloat(e.target.value) } })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início Ano Fiscal</label>
                                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={tempSettings.technical.financialYearStart} onChange={e => setTempSettings({ ...tempSettings, technical: { ...tempSettings.technical, financialYearStart: e.target.value } })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuso Horário</label>
                                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={tempSettings.technical.timezone} onChange={e => setTempSettings({ ...tempSettings, technical: { ...tempSettings.technical, timezone: e.target.value } })}>
                                                    <option value="America/Sao_Paulo">São Paulo (-3 BRT)</option>
                                                    <option value="America/Manaus">Manaus (-4 AMT)</option>
                                                    <option value="UTC">UTC (Universal)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">Interface & UX</h3>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={14} /> Tema do Sistema</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['light', 'dark', 'system'].map(t => (
                                                    <button key={t} onClick={() => setTempSettings({ ...tempSettings, theme: t as any })} className={`py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest border-2 transition-all ${tempSettings.theme === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                                                        {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Auto'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Idioma Principal</label>
                                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={tempSettings.language} onChange={e => setTempSettings({ ...tempSettings, language: e.target.value })}>
                                                    <option value="pt-BR">Português (Brasil)</option>
                                                    <option value="en-US">English (US)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moeda</label>
                                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={tempSettings.currency} onChange={e => setTempSettings({ ...tempSettings, currency: e.target.value })}>
                                                    <option value="BRL">Real (R$)</option>
                                                    <option value="USD">Dólar ($)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-slate-100 dark:border-slate-700 pt-10">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <Bell size={14} className="text-amber-500" /> Gatilhos de Notificação
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { key: 'stockAlerts', label: 'Ruptura de Estoque' },
                                        { key: 'overdueFinance', label: 'Contas Fora do Prazo' },
                                        { key: 'productionUpdates', label: 'Eventos de Produção' },
                                        { key: 'fleetMaintenance', label: 'Agenda de Manutenção' },
                                    ].map(n => (
                                        <div key={n.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                            <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">{n.label}</span>
                                            <button
                                                onClick={() => setTempSettings({ ...tempSettings, notifications: { ...tempSettings.notifications, [n.key]: !tempSettings.notifications[n.key as keyof typeof tempSettings.notifications] } })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${tempSettings.notifications[n.key as keyof typeof tempSettings.notifications] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${tempSettings.notifications[n.key as keyof typeof tempSettings.notifications] ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <Cloud size={14} className="text-blue-500" /> Backup e Segurança de Dados
                                </h3>
                                <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-700 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Backup Automático</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Nuvem Construsys Ativada</p>
                                        </div>
                                        <div className="bg-emerald-500/10 p-3 rounded-2xl">
                                            <Wifi size={24} className="text-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                            <span>Próximo Ciclo</span>
                                            <span>Hoje às 23:59</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[65%]"></div>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                                        <Cloud size={16} /> Forçar Backup Agora
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[40px] border border-rose-100 dark:border-rose-800">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-rose-900 dark:text-rose-400 uppercase tracking-tighter italic">Zona Crítica</h3>
                                    <p className="text-xs font-medium text-rose-700 dark:text-rose-500 mt-1">Ações irreversíveis que afetam toda a base de dados do ERP.</p>
                                </div>
                                <button
                                    onClick={() => { if (confirm("ESTA AÇÃO É IRREVERSÍVEL. Todos os dados (clientes, vendas, estoque, finanças) serão removidos permanentemente. Continuar?")) clearAllData(); }}
                                    className="px-8 py-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Limpar Todos os Dados
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* AUDIT LOG TAB */}
                {activeTab === 'audit' && (
                    <div className="animate-in slide-in-from-bottom duration-500 space-y-8 h-full flex flex-col">
                        <div className="shrink-0 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Log de Atividades</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Histórico completo de ações criticas no ERP.</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-indigo-600 border border-slate-100 dark:border-slate-700 transition-all"><Database size={20} /></button>
                                <button className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 hover:text-indigo-600 border border-slate-100 dark:border-slate-700 transition-all"><BarChart3 size={20} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <th className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">DATA/HORA</th>
                                        <th className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">USUÁRIO</th>
                                        <th className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">MÓDULO</th>
                                        <th className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">AÇÃO / TIPO</th>
                                        <th className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">DETALHES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                                            <td className="py-4 px-2">
                                                <p className="text-[11px] font-bold text-slate-900 dark:text-white">{log.timestamp}</p>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-[10px] flex items-center justify-center font-black text-indigo-600">{log.userName.charAt(0)}</div>
                                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{log.userName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md tracking-tighter">{log.module}</span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${log.severity === 'critical' ? 'bg-rose-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                                                    <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">{log.action}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 max-w-[300px]">
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate group-hover:whitespace-normal group-hover:truncate-none transition-all">{log.details}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="shrink-0 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Ver Histórico Completo (Auditoria PDF)</button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Modal */}
            {isUserModalOpen && editingUser && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl w-full max-w-md border dark:border-slate-700 animate-in zoom-in duration-200 overflow-hidden">
                        <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter italic">Detalhes do Usuário</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure o perfil corporativo.</p>
                            </div>
                            <button onClick={() => setIsUserModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail de Acesso</label>
                                <input type="email" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo/Função</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={editingUser.roleId} onChange={e => setEditingUser({ ...editingUser, roleId: e.target.value })}>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Inicial</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={editingUser.status} onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}>
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                                    Finalizar Acesso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Role Modal */}
            {isRoleModalOpen && editingRole && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl w-full max-w-2xl border dark:border-slate-700 animate-in zoom-in duration-200 overflow-hidden">
                        <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter italic">Definição de Cargo</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Matriz de permissões por módulo.</p>
                            </div>
                            <button onClick={() => setIsRoleModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveRole} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Perfil</label>
                                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm" value={editingRole.name} onChange={e => setEditingRole({ ...editingRole, name: e.target.value })} placeholder="Ex: Financeiro Sênior" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atribuições</label>
                                        <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 px-4 font-bold text-sm h-32 resize-none" value={editingRole.description} onChange={e => setEditingRole({ ...editingRole, description: e.target.value })} placeholder="Resumo das responsabilidades deste cargo..." required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle Granular</label>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {permissionOptions.map(opt => (
                                            <div key={opt.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-850 transition-colors group border border-transparent hover:border-indigo-100">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter">{opt.name}</span>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{opt.category}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const p = editingRole.permissions.includes(opt.id)
                                                            ? editingRole.permissions.filter(p => p !== opt.id)
                                                            : [...editingRole.permissions, opt.id];
                                                        setEditingRole({ ...editingRole, permissions: p });
                                                    }}
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${editingRole.permissions.includes(opt.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-200 dark:bg-slate-700 text-transparent hover:text-slate-400'}`}
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 text-slate-400 font-black rounded-2xl uppercase text-[9px] tracking-[0.3em]">Cancelar</button>
                                <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl shadow-slate-900/20">
                                    Ativar Configurações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

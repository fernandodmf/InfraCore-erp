import React, { useState } from 'react';
import {
    Plus, X, Users, UserPlus, Search, Download, Edit2, Trash2, Wallet, Clock, Calendar,
    CheckCircle, XCircle, DollarSign, ArrowUpRight, Fingerprint, Play, StopCircle, Timer,
    Plane, TrendingUp, AlertCircle, Filter, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee, PayrollRecord, TimeLog, Vacation, SalaryAdvance } from '../types';
import { exportToCSV } from '../utils/exportUtils';

const HR = () => {
    const {
        employees, addEmployee, updateEmployee, deleteEmployee,
        payroll, addPayroll, payPayroll,
        timeLogs, addTimeLog,
        vacations, addVacation, updateVacationStatus, deleteVacation,
        salaryAdvances, addSalaryAdvance, updateAdvanceStatus, paySalaryAdvance, deleteAdvance
    } = useApp();

    const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'vacations' | 'advances' | 'time'>('employees');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Form States
    const [empForm, setEmpForm] = useState<Partial<Employee>>({
        status: 'Ativo',
        salary: 0,
        vacationDaysAvailable: 30,
        admissionDate: new Date().toISOString().split('T')[0]
    });

    const [vacationForm, setVacationForm] = useState<Partial<Vacation>>({
        status: 'Solicitado',
        requestedAt: new Date().toLocaleDateString('pt-BR')
    });

    const [advanceForm, setAdvanceForm] = useState<Partial<SalaryAdvance>>({
        status: 'Pendente',
        requestDate: new Date().toLocaleDateString('pt-BR'),
        deductFromMonth: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
    });

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedEmployee) {
            updateEmployee({ ...selectedEmployee, ...empForm } as Employee);
        } else {
            const newEmp: Employee = {
                ...empForm,
                id: `emp-${Date.now()}`,
                name: empForm.name || '',
                role: empForm.role || '',
                department: empForm.department || '',
                email: empForm.email || '',
                status: empForm.status as any || 'Ativo',
                admissionDate: empForm.admissionDate || '',
                salary: Number(empForm.salary) || 0,
                vacationDaysAvailable: Number(empForm.vacationDaysAvailable) || 30
            } as Employee;
            addEmployee(newEmp);
        }
        setIsEmployeeModalOpen(false);
        setSelectedEmployee(null);
        setEmpForm({ status: 'Ativo', salary: 0, vacationDaysAvailable: 30 });
    };

    const handleGeneratePayroll = (e: React.FormEvent) => {
        e.preventDefault();
        const month = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });

        employees.filter(emp => emp.status === 'Ativo').forEach(emp => {
            // Verificar se há antecipações a descontar
            const advancesToDeduct = salaryAdvances.filter(
                adv => adv.employeeId === emp.id && adv.status === 'Pago' && adv.deductFromMonth === month
            );
            const totalAdvances = advancesToDeduct.reduce((sum, adv) => sum + adv.amount, 0);

            const discounts = emp.salary * 0.11 + totalAdvances;
            const record: PayrollRecord = {
                id: `pay-${emp.id}-${Date.now()}`,
                employeeId: emp.id,
                employeeName: emp.name,
                month,
                baseSalary: emp.salary,
                benefits: 500,
                overtime: 0,
                discounts,
                totalNet: emp.salary + 500 - discounts,
                status: 'Pendente'
            };
            addPayroll(record);
        });
        alert(`Folha de ${month} gerada com sucesso para ${employees.filter(e => e.status === 'Ativo').length} colaboradores!`);
        setIsPayrollModalOpen(false);
    };

    const handleSaveVacation = (e: React.FormEvent) => {
        e.preventDefault();
        const emp = employees.find(e => e.id === vacationForm.employeeId);
        if (!emp) return;

        const vacation: Vacation = {
            id: `vac-${Date.now()}`,
            employeeId: vacationForm.employeeId!,
            employeeName: emp.name,
            startDate: vacationForm.startDate!,
            endDate: vacationForm.endDate!,
            days: vacationForm.days!,
            status: 'Solicitado',
            requestedAt: new Date().toLocaleDateString('pt-BR'),
            notes: vacationForm.notes
        };
        addVacation(vacation);
        setIsVacationModalOpen(false);
        setVacationForm({ status: 'Solicitado', requestedAt: new Date().toLocaleDateString('pt-BR') });
    };

    const handleSaveAdvance = (e: React.FormEvent) => {
        e.preventDefault();
        const emp = employees.find(e => e.id === advanceForm.employeeId);
        if (!emp) return;

        const advance: SalaryAdvance = {
            id: `adv-${Date.now()}`,
            employeeId: advanceForm.employeeId!,
            employeeName: emp.name,
            amount: advanceForm.amount!,
            requestDate: new Date().toLocaleDateString('pt-BR'),
            status: 'Pendente',
            deductFromMonth: advanceForm.deductFromMonth!,
            notes: advanceForm.notes
        };
        addSalaryAdvance(advance);
        setIsAdvanceModalOpen(false);
        setAdvanceForm({
            status: 'Pendente',
            requestDate: new Date().toLocaleDateString('pt-BR'),
            deductFromMonth: new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
        });
    };

    const handleTimeClock = (type: 'In' | 'Out') => {
        const now = new Date();
        const log: TimeLog = {
            id: `log-${Date.now()}`,
            employeeId: '1',
            date: now.toLocaleDateString('pt-BR'),
            checkIn: type === 'In' ? now.toLocaleTimeString() : '08:00',
            checkOut: type === 'Out' ? now.toLocaleTimeString() : undefined,
            status: 'Presente'
        };
        addTimeLog(log);
        alert(`Ponto de ${type === 'In' ? 'Entrada' : 'Saída'} registrado às ${now.toLocaleTimeString()}`);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-cyan-600 rounded-2xl text-white shadow-xl shadow-cyan-600/20">
                            <Users size={24} />
                        </div>
                        Recursos Humanos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Gestão de pessoas, férias e antecipações salariais.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-700">
                        <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase ${activeTab === 'employees' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Colaboradores</button>
                        <button onClick={() => setActiveTab('vacations')} className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase ${activeTab === 'vacations' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Férias</button>
                        <button onClick={() => setActiveTab('advances')} className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase ${activeTab === 'advances' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Antecipações</button>
                        <button onClick={() => setActiveTab('payroll')} className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase ${activeTab === 'payroll' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Folha</button>
                        <button onClick={() => setActiveTab('time')} className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase ${activeTab === 'time' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Ponto</button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'QUADRO TOTAL', value: employees.length, sub: 'Colaboradores', icon: <Users />, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/10' },
                    { label: 'CUSTO MENSAL', value: formatCurrency(employees.reduce((acc, e) => acc + e.salary, 0)), sub: 'Salários Base', icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                    { label: 'FÉRIAS PENDENTES', value: vacations.filter(v => v.status === 'Solicitado').length, sub: 'Aguardando Aprovação', icon: <Plane />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                    { label: 'ANTECIPAÇÕES', value: formatCurrency(salaryAdvances.filter(a => a.status === 'Pendente').reduce((sum, a) => sum + a.amount, 0)), sub: 'Pendentes', icon: <TrendingUp />, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>{kpi.icon}</div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Employees Tab */}
            {activeTab === 'employees' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou cargo..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => exportToCSV(filteredEmployees, 'Colaboradores')}
                                className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl shadow-sm border dark:border-slate-600 transition-colors"
                                title="Exportar Excel"
                            >
                                <Download size={18} />
                            </button>
                            <button
                                onClick={() => { setSelectedEmployee(null); setEmpForm({ status: 'Ativo', salary: 0, vacationDaysAvailable: 30 }); setIsEmployeeModalOpen(true); }}
                                className="px-6 py-3 bg-cyan-600 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/20 uppercase tracking-widest flex items-center gap-2"
                            >
                                <UserPlus size={18} /> Novo Colaborador
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-gray-800 text-[10px] font-black text-slate-400 uppercase border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Colaborador</th>
                                    <th className="px-6 py-4">Cargo / Depto</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Férias Disp.</th>
                                    <th className="px-6 py-4 text-right">Salário</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id} className="group hover:bg-slate-50 dark:hover:bg-cyan-900/10 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-xl flex items-center justify-center font-black">
                                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white">{emp.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{emp.role}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{emp.department}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${emp.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : emp.status === 'Férias' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-black text-slate-900 dark:text-white">{emp.vacationDaysAvailable || 30} dias</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                                            {formatCurrency(emp.salary)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setSelectedEmployee(emp); setEmpForm(emp); setIsEmployeeModalOpen(true); }} className="p-2 text-slate-400 hover:text-cyan-600 transition-colors"><Edit2 size={18} /></button>
                                                <button onClick={() => { if (confirm('Excluir colaborador?')) deleteEmployee(emp.id); }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vacations Tab */}
            {activeTab === 'vacations' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsVacationModalOpen(true)}
                            className="px-6 py-3 bg-cyan-600 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/20 uppercase tracking-widest flex items-center gap-2"
                        >
                            <Plus size={18} /> Solicitar Férias
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {vacations.map(vac => (
                            <div key={vac.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg">{vac.employeeName}</h3>
                                        <p className="text-xs text-slate-400 font-bold mt-1">{vac.days} dias • {vac.startDate} a {vac.endDate}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${vac.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' :
                                            vac.status === 'Rejeitado' ? 'bg-rose-100 text-rose-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {vac.status}
                                    </span>
                                </div>
                                {vac.notes && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 italic">"{vac.notes}"</p>}
                                {vac.status === 'Solicitado' && (
                                    <div className="flex gap-2 pt-4 border-t dark:border-slate-700">
                                        <button
                                            onClick={() => updateVacationStatus(vac.id, 'Aprovado', 'Admin')}
                                            className="flex-1 py-2 bg-emerald-600 text-white font-black text-xs rounded-xl uppercase flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Aprovar
                                        </button>
                                        <button
                                            onClick={() => updateVacationStatus(vac.id, 'Rejeitado', 'Admin')}
                                            className="flex-1 py-2 bg-rose-600 text-white font-black text-xs rounded-xl uppercase flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} /> Rejeitar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {vacations.length === 0 && (
                            <div className="col-span-2 text-center py-20 text-slate-400 italic">
                                <Plane size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">Nenhuma solicitação de férias</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Salary Advances Tab */}
            {activeTab === 'advances' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAdvanceModalOpen(true)}
                            className="px-6 py-3 bg-cyan-600 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/20 uppercase tracking-widest flex items-center gap-2"
                        >
                            <Plus size={18} /> Nova Antecipação
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-gray-800 text-[10px] font-black text-slate-400 uppercase border-b dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Colaborador</th>
                                        <th className="px-6 py-4 text-right">Valor</th>
                                        <th className="px-6 py-4">Desconto em</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {salaryAdvances.map(adv => (
                                        <tr key={adv.id} className="hover:bg-slate-50 dark:hover:bg-cyan-900/10 transition-all">
                                            <td className="px-6 py-5 font-bold text-slate-800 dark:text-white">{adv.employeeName}</td>
                                            <td className="px-6 py-5 text-right font-black text-emerald-600">{formatCurrency(adv.amount)}</td>
                                            <td className="px-6 py-5 font-black text-slate-500">{adv.deductFromMonth}</td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${adv.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' :
                                                        adv.status === 'Aprovado' ? 'bg-blue-100 text-blue-700' :
                                                            adv.status === 'Rejeitado' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {adv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {adv.status === 'Pendente' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateAdvanceStatus(adv.id, 'Aprovado', 'Admin')}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white font-black text-[10px] rounded-lg hover:scale-105 transition-transform uppercase"
                                                            >
                                                                Aprovar
                                                            </button>
                                                            <button
                                                                onClick={() => updateAdvanceStatus(adv.id, 'Rejeitado', 'Admin')}
                                                                className="px-3 py-1.5 bg-rose-600 text-white font-black text-[10px] rounded-lg hover:scale-105 transition-transform uppercase"
                                                            >
                                                                Rejeitar
                                                            </button>
                                                        </>
                                                    )}
                                                    {adv.status === 'Aprovado' && (
                                                        <button
                                                            onClick={() => paySalaryAdvance(adv.id)}
                                                            className="px-4 py-1.5 bg-cyan-600 text-white font-black text-[10px] rounded-lg shadow-sm hover:scale-105 transition-transform uppercase"
                                                        >
                                                            Pagar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {salaryAdvances.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium uppercase text-xs tracking-widest">Nenhuma antecipação registrada...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <Wallet className="text-emerald-600" />
                                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">Folha de Pagamento</h3>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => exportToCSV(payroll, 'Folha_Pagamento')}
                                    className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-emerald-500 rounded-xl shadow-sm border dark:border-slate-600 transition-colors"
                                >
                                    <Download size={16} />
                                </button>
                                <button onClick={() => setIsPayrollModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-emerald-600/20">Gerar Folha Mensal</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-gray-800 text-[10px] font-black text-slate-400 uppercase border-b dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Competência</th>
                                        <th className="px-6 py-4">Colaborador</th>
                                        <th className="px-6 py-4 text-right">Líquido</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {payroll.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/10 transition-all">
                                            <td className="px-6 py-5 font-black text-slate-500">{p.month}</td>
                                            <td className="px-6 py-5 font-bold text-slate-800 dark:text-white">{p.employeeName}</td>
                                            <td className="px-6 py-5 text-right font-black text-emerald-600">{formatCurrency(p.totalNet)}</td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {p.status === 'Pendente' && (
                                                    <button onClick={() => payPayroll(p.id)} className="px-4 py-1.5 bg-emerald-600 text-white font-black text-[10px] rounded-lg shadow-sm hover:scale-105 transition-transform uppercase">Pagar</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {payroll.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium uppercase text-xs tracking-widest">Aguardando geração da folha...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-2xl text-white">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-2"><DollarSign className="text-emerald-400" /> Resumo</h3>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Provisão Mensal</p>
                                <p className="text-3xl font-black text-emerald-400">{formatCurrency(employees.reduce((acc, e) => acc + e.salary * 1.5, 0))}</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-1">Incluindo encargos patronais</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Clock Tab */}
            {activeTab === 'time' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-8 border-b dark:border-slate-700 text-center">
                            <Fingerprint size={64} className="mx-auto text-cyan-600 mb-4" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registro de Ponto</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase mt-1">Sessão atual: Carlos Mendes</p>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <button onClick={() => handleTimeClock('In')} className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl group hover:border-emerald-500 transition-all">
                                    <Play size={32} className="text-emerald-600 mb-2 group-hover:scale-125 transition-transform" />
                                    <span className="font-black text-emerald-700 uppercase text-xs">Entrada</span>
                                </button>
                                <button onClick={() => handleTimeClock('Out')} className="flex flex-col items-center justify-center p-6 bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-800 rounded-3xl group hover:border-rose-500 transition-all">
                                    <StopCircle size={32} className="text-rose-600 mb-2 group-hover:scale-125 transition-transform" />
                                    <span className="font-black text-rose-700 uppercase text-xs">Saída</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Timer className="text-cyan-600" />
                                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase">Últimos Registros</h3>
                            </div>
                        </div>
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px]">
                            {timeLogs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-cyan-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-cyan-600 font-black"><Clock size={20} /></div>
                                        <div>
                                            <p className="font-black text-xs text-slate-800 dark:text-white uppercase">{log.date}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Check-in: {log.checkIn} {log.checkOut && `• Check-out: ${log.checkOut}`}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-black rounded-full uppercase">{log.status}</span>
                                </div>
                            ))}
                            {timeLogs.length === 0 && (
                                <p className="text-center text-slate-400 py-10 italic font-medium uppercase text-xs tracking-widest">Nenhum registro hoje.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Modal */}
            {isEmployeeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">{selectedEmployee ? 'Editar' : 'Cadastrar'} Colaborador</h3>
                            <button onClick={() => setIsEmployeeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Nome Completo</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={empForm.name || ''} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Cargo</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={empForm.role || ''} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Departamento</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={empForm.department || ''} onChange={e => setEmpForm({ ...empForm, department: e.target.value })} required>
                                        <option value="">Selecione...</option>
                                        <option value="Engenharia">Engenharia</option>
                                        <option value="Financeiro">Financeiro</option>
                                        <option value="Operações">Operações</option>
                                        <option value="Recursos Humanos">Recursos Humanos</option>
                                        <option value="Vendas">Vendas</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Salário Base (R$)</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={empForm.salary || ''} onChange={e => setEmpForm({ ...empForm, salary: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Dias de Férias</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={empForm.vacationDaysAvailable || 30} onChange={e => setEmpForm({ ...empForm, vacationDaysAvailable: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">E-mail Corporativo</label>
                                <input type="email" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={empForm.email || ''} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} required />
                            </div>
                            <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-lg mt-6 uppercase tracking-widest text-xs hover:bg-cyan-500 transition-all">{selectedEmployee ? 'Salvar Alterações' : 'Contratar Colaborador'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Vacation Modal */}
            {isVacationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Solicitar Férias</h3>
                            <button onClick={() => setIsVacationModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveVacation} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Colaborador</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={vacationForm.employeeId || ''} onChange={e => setVacationForm({ ...vacationForm, employeeId: e.target.value })} required>
                                    <option value="">Selecione...</option>
                                    {employees.filter(e => e.status === 'Ativo').map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.vacationDaysAvailable || 30} dias disponíveis)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Data Início</label>
                                        <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={vacationForm.startDate || ''} onChange={e => setVacationForm({ ...vacationForm, startDate: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Data Fim</label>
                                        <input type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={vacationForm.endDate || ''} onChange={e => setVacationForm({ ...vacationForm, endDate: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Dias</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={vacationForm.days || ''} onChange={e => setVacationForm({ ...vacationForm, days: Number(e.target.value) })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Observações</label>
                                <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" rows={3} value={vacationForm.notes || ''} onChange={e => setVacationForm({ ...vacationForm, notes: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-lg mt-6 uppercase tracking-widest text-xs">Solicitar Férias</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Salary Advance Modal */}
            {isAdvanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">Antecipação Salarial</h3>
                            <button onClick={() => setIsAdvanceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveAdvance} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Colaborador</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={advanceForm.employeeId || ''} onChange={e => setAdvanceForm({ ...advanceForm, employeeId: e.target.value })} required>
                                    <option value="">Selecione...</option>
                                    {employees.filter(e => e.status === 'Ativo').map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name} (Salário: {formatCurrency(emp.salary)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Valor (R$)</label>
                                    <input type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={advanceForm.amount || ''} onChange={e => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Descontar em</label>
                                    <input type="text" placeholder="MM/YYYY" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={advanceForm.deductFromMonth || ''} onChange={e => setAdvanceForm({ ...advanceForm, deductFromMonth: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Observações</label>
                                <textarea className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" rows={3} value={advanceForm.notes || ''} onChange={e => setAdvanceForm({ ...advanceForm, notes: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl shadow-lg mt-6 uppercase tracking-widest text-xs">Solicitar Antecipação</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payroll Modal */}
            {isPayrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center text-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight mx-auto">Fechar Folha Mensal</h3>
                            <button onClick={() => setIsPayrollModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-6 text-center">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800">
                                <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">Competência Selecionada</p>
                                <p className="text-3xl font-black text-emerald-600">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Ao confirmar, o sistema gerará os lançamentos de folha para todos os <strong>{employees.filter(e => e.status === 'Ativo').length}</strong> colaboradores ativos.</p>
                            <button onClick={handleGeneratePayroll} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-xs">Confirmar Geração</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HR;

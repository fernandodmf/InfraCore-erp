import React, { useState } from 'react';
import {
    Factory,
    ClipboardList,
    CheckCircle,
    AlertTriangle,
    Play,
    Plus,
    Filter,
    X,
    Save,
    MapPin,
    Activity,
    Thermometer,
    Zap,
    ChevronRight,
    Cpu,
    Circle,
    Beaker,
    User,
    Layers,
    Archive,
    FlaskConical,
    Trash2,
    Check,
    Edit2,
    Settings,
    Clock
} from 'lucide-react';
import { ProductionOrder, InventoryItem, ProductionFormula, QualityTest, ProductionUnit } from '../types';
import { useApp } from '../context/AppContext';

const Production = () => {
    const {
        inventory, productionOrders, formulas, productionUnits,
        addProductionOrder, updateProductionOrder, deleteProductionOrder,
        startProduction, completeProduction, addQualityTest,
        addProductionUnit, updateProductionUnit, deleteProductionUnit,
        addFormula, updateFormula, deleteFormula
    } = useApp();
    const [activeTab, setActiveTab] = useState<'monitor' | 'orders' | 'formulas' | 'lab'>('monitor');

    const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<ProductionUnit | null>(null);
    const [editingFormula, setEditingFormula] = useState<ProductionFormula | null>(null);

    // Forms State
    const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
        priority: 'Média',
        status: 'Planejado',
        progress: 0,
        unitId: 'u1',
        quantity: 100,
        batch: `L${new Date().getMonth() + 1}${new Date().getDate()}-${Math.floor(Math.random() * 100)}`
    });

    const [newTest, setNewTest] = useState<Partial<QualityTest>>({
        type: 'Slump Test',
        minExpected: '10 +/- 2',
        status: 'Pendente',
        testedAt: new Date().toISOString().split('T')[0]
    });

    const [formulaForm, setFormulaForm] = useState<Partial<ProductionFormula>>({
        ingredients: [{ name: '', qty: 0, unit: 'kg' }]
    });

    const handleSaveOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const formula = formulas.find(f => f.id === newOrder.formulaId);
        const order: ProductionOrder = {
            id: Date.now().toString(),
            orderNumber: `OP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            productName: formula?.name || 'Produto Industrial',
            productId: formula?.outputProductId,
            formulaId: newOrder.formulaId,
            quantity: newOrder.quantity || 0,
            status: 'Planejado',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            priority: newOrder.priority || 'Média',
            progress: 0,
            unitId: newOrder.unitId,
            batch: newOrder.batch,
            operator: newOrder.operator,
            qualityTests: []
        };
        addProductionOrder(order);
        setIsOrderModalOpen(false);
    };

    const handleAddTest = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOrder) {
            const test: QualityTest = {
                id: Date.now().toString(),
                type: newTest.type || '',
                result: newTest.result || '',
                minExpected: newTest.minExpected || '',
                status: newTest.status || 'Pendente',
                testedAt: newTest.testedAt || '',
                tester: newTest.tester
            };
            addQualityTest(selectedOrder.id, test);
            setIsTestModalOpen(false);
        }
    };

    const handleSaveUnit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUnit) {
            if (productionUnits.some(u => u.id === editingUnit.id)) {
                updateProductionUnit(editingUnit);
            } else {
                addProductionUnit({ ...editingUnit, id: Date.now().toString() });
            }
            setIsUnitModalOpen(false);
            setEditingUnit(null);
        }
    };

    const handleSaveFormula = (e: React.FormEvent) => {
        e.preventDefault();
        const formula: ProductionFormula = {
            id: editingFormula?.id || Date.now().toString(),
            name: formulaForm.name || '',
            category: formulaForm.category || 'Concreto',
            outputProductId: formulaForm.outputProductId || 'p1',
            ingredients: formulaForm.ingredients || []
        } as ProductionFormula;

        if (editingFormula) {
            updateFormula(formula);
        } else {
            addFormula(formula);
        }
        setIsFormulaModalOpen(false);
        setEditingFormula(null);
        setFormulaForm({ ingredients: [{ name: '', qty: 0, unit: 'kg' }] });
    };

    const addIngredient = () => {
        setFormulaForm(prev => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), { name: '', qty: 0, unit: 'kg' }]
        }));
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20">
                            <Factory size={24} />
                        </div>
                        PCP & Chão de Fábrica
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium italic underline underline-offset-4 decoration-indigo-500/30">Planejamento, Controle e Operação de Usinas.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-700">
                        <button onClick={() => setActiveTab('monitor')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'monitor' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>MONITORAMENTO</button>
                        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>ORDENS (O.P.)</button>
                        <button onClick={() => setActiveTab('formulas')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'formulas' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>FÓRMULAS</button>
                        <button onClick={() => setActiveTab('lab')} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'lab' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>LABORATÓRIO</button>
                    </div>
                    <button
                        onClick={() => setIsOrderModalOpen(true)}
                        className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
                    >
                        <Plus size={18} /> Nova O.P.
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            {activeTab === 'monitor' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {productionUnits.map(unit => {
                            const activeOrder = productionOrders.find(o => o.unitId === unit.id && o.status === 'Em Produção');
                            return (
                                <div key={unit.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-2xl ${unit.status === 'Operando' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} shadow-sm`}>
                                            <Factory size={24} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${unit.status === 'Operando' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                {unit.status.toUpperCase()}
                                            </span>
                                            <button
                                                onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-black text-slate-800 dark:text-white mb-1 uppercase text-sm">{unit.name}</h3>

                                    {activeOrder ? (
                                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Ativo: {activeOrder.orderNumber}</span>
                                                <span className="text-[10px] font-black text-indigo-700">{activeOrder.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${activeOrder.progress}%` }}></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-2 truncate">{activeOrder.productName}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center h-20 text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Aguardando Carga</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Thermometer size={12} className="text-orange-400" />
                                            <span className="text-[10px] font-black">{unit.temp}°C</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap size={12} className="text-amber-400" />
                                            <span className="text-[10px] font-black">{unit.power}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <Activity className="text-indigo-600" />
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Sensores Industriais</h3>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase"><Circle size={8} fill="currentColor" /> Sistemas OK</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {productionUnits.map((u, i) => (
                                    <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition-all border border-transparent hover:border-indigo-100">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center font-black text-indigo-600 border border-slate-100 dark:border-slate-700">{i + 1}</div>
                                        <div className="flex-1">
                                            <p className="font-black text-slate-800 dark:text-white uppercase text-[10px] tracking-tight">{u.name}</p>
                                            <div className="flex gap-3 mt-1">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">TIPO: <strong className="text-slate-600 dark:text-slate-300">{u.type}</strong></span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">CAP: <strong className="text-slate-600 dark:text-slate-300">{u.capacity}</strong></span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black ${u.currentLoad > 80 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {u.currentLoad > 80 ? 'CARGA ALTA' : 'CARGA NOMINAL'}
                                        </div>
                                        <button onClick={() => { setEditingUnit(u); setIsUnitModalOpen(true); }} className="text-slate-300 hover:text-indigo-500 transition-colors"><Edit2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden flex flex-col justify-between border border-indigo-500/30">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={120} /></div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 mb-6">
                                    <Activity size={12} className="text-indigo-400 animate-pulse" />
                                    <span className="text-[9px] font-black tracking-widest uppercase">Otimização AI Ativa</span>
                                </div>
                                <h3 className="text-2xl font-black mb-6 leading-tight uppercase tracking-tight">Cálculo de Eficiência</h3>
                                <div className="space-y-4 mb-8 text-indigo-100/70">
                                    <p className="text-xs font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-4 bg-indigo-500/5 py-2">
                                        Sugestão: Aumentar o giro da Usina de Concreto em 5% para compensar a viscosidade do agregado úmido detectado.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/5 rounded-2xl">
                                            <p className="text-[8px] font-black text-indigo-400 uppercase">OEE Atual</p>
                                            <p className="text-lg font-black text-white">88.4%</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl">
                                            <p className="text-[8px] font-black text-indigo-400 uppercase">Potencial</p>
                                            <p className="text-lg font-black text-emerald-400">+4.2%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => alert("Otimização aplicada! Parâmetros da planta ajustados para máxima performance.")}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-[10px] border border-indigo-400/50"
                            >
                                Aplicar Otimização
                            </button>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="text-indigo-600" />
                                <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Planejamento e Controle de Produção (O.P.)</h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-gray-800 text-[10px] font-black text-slate-400 uppercase border-b dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-4">Status / OP</th>
                                        <th className="px-6 py-4">Produto / Lote</th>
                                        <th className="px-6 py-4">Operador / Planta</th>
                                        <th className="px-6 py-4 text-center">Progresso</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {productionOrders.map(o => (
                                        <React.Fragment key={o.id}>
                                            <tr className={`group hover:bg-slate-50 dark:hover:bg-indigo-900/10 transition-all ${selectedOrder?.id === o.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`} onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)}>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase mb-1 ${o.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-700' :
                                                        o.status === 'Em Produção' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                                                            o.status === 'Qualidade' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        <Circle size={8} fill="currentColor" /> {o.status}
                                                    </span>
                                                    <p className="font-mono text-[10px] text-slate-400 font-bold">#{o.orderNumber}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-black text-slate-900 dark:text-white text-xs uppercase">{o.productName}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{o.quantity} UNIT</span>
                                                        <span className="px-1.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] font-black text-slate-500 uppercase">{o.batch}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1"><User size={10} /> {o.operator || 'SISTEMA'}</span>
                                                        <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm uppercase" value={o.unitId} onChange={e => updateProductionOrder({ ...o, unitId: e.target.value })}>
                                                            {productionUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col items-center gap-2 max-w-[120px] mx-auto">
                                                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                            <div className={`h-full transition-all duration-500 ${o.status === 'Finalizado' ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${o.progress}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400">{o.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {o.status === 'Planejado' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); startProduction(o.id); }}
                                                                className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                                                title="Iniciar Produção (Deduzir Estoque)"
                                                            >
                                                                <Play size={16} />
                                                            </button>
                                                        )}
                                                        {o.status === 'Em Produção' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateProductionOrder({ ...o, status: 'Qualidade', progress: 90 }); }}
                                                                className="p-2 bg-amber-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                                                title="Enviar para Qualidade"
                                                            >
                                                                <FlaskConical size={16} />
                                                            </button>
                                                        )}
                                                        {o.status === 'Qualidade' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); completeProduction(o.id); }}
                                                                className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                                                title="Finalizar e Adicionar ao Estoque"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteProductionOrder(o.id); }}
                                                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                                            title="Excluir O.P."
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {selectedOrder?.id === o.id && (
                                                <tr className="bg-slate-50/80 dark:bg-slate-900/40 border-l-4 border-indigo-500">
                                                    <td colSpan={5} className="px-8 py-8 animate-in slide-in-from-top-4 duration-300">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                                            {/* Raw Materials Column */}
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Layers size={14} /> Insumos / Matéria Prima</h4>
                                                                <div className="space-y-3">
                                                                    {formulas.find(f => f.id === o.formulaId)?.ingredients.map((ing, idx) => {
                                                                        const stockItem = inventory.find(item => item.id === ing.productId);
                                                                        const requiredQty = ing.qty * o.quantity;
                                                                        const availableQty = stockItem?.quantity || 0;
                                                                        const hasEnoughStock = availableQty >= requiredQty;

                                                                        return (
                                                                            <div key={idx} className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{ing.name}</span>
                                                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-lg">{requiredQty.toFixed(2)} {ing.unit}</span>
                                                                                </div>

                                                                                {/* Location & Weight Info */}
                                                                                <div className="flex justify-between text-[9px] text-slate-400 font-medium border-t border-slate-50 dark:border-slate-700 pt-1 mt-1">
                                                                                    <span>Loc: <strong className="text-slate-600 dark:text-slate-300">{stockItem?.location || 'N/A'}</strong></span>
                                                                                    <span>Unit: {stockItem?.weight ? `${stockItem.weight} kg` : '-'}</span>
                                                                                </div>

                                                                                {!o.rawMaterialsDeducted && (
                                                                                    <div className={`flex items-center gap-1.5 text-[9px] font-bold ${hasEnoughStock ? 'text-emerald-600' : 'text-rose-600'} mt-1`}>
                                                                                        <Archive size={10} />
                                                                                        <span>Estoque: {availableQty.toFixed(2)} {stockItem?.unit || ing.unit}</span>
                                                                                        {!hasEnoughStock && <span className="ml-auto bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded uppercase">Insuficiente</span>}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    {o.rawMaterialsDeducted && (
                                                                        <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                                                            <Check size={14} /> Consumo Processado no Estoque
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Quality Column */}
                                                            <div>
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><FlaskConical size={14} /> Laudos de Qualidade</h4>
                                                                    <button
                                                                        onClick={() => setIsTestModalOpen(true)}
                                                                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                                                                    >
                                                                        <Plus size={12} />
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {o.qualityTests?.map((test, idx) => (
                                                                        <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase">{test.type}</span>
                                                                                <span className={`text-[9px] font-black px-1.5 rounded uppercase ${test.status === 'Aprovado' ? 'text-emerald-600 bg-emerald-50' : test.status === 'Reprovado' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>{test.status}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-end mt-1">
                                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Result: <strong className="text-indigo-600">{test.result}</strong></p>
                                                                                <span className="text-[8px] text-slate-400 font-mono">{test.testedAt}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {(!o.qualityTests || o.qualityTests.length === 0) && (
                                                                        <div className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl opacity-40">
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase">Sem Testes Registrados</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Log / Timeline */}
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Cronograma Operacional</h4>
                                                                <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-700">
                                                                    <div className="flex items-center gap-4 relative">
                                                                        <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 z-10 shadow-sm"></div>
                                                                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">Emissão da O.P. <span className="ml-2 font-mono text-slate-400">{o.startDate}</span></p>
                                                                    </div>
                                                                    <div className={`flex items-center gap-4 relative ${o.status !== 'Planejado' ? '' : 'opacity-30'}`}>
                                                                        <div className={`w-4 h-4 rounded-full ${o.status !== 'Planejado' ? 'bg-indigo-600' : 'bg-slate-200'} border-4 border-white dark:border-slate-800 z-10 shadow-sm`}></div>
                                                                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">Início da Produção</p>
                                                                    </div>
                                                                    <div className={`flex items-center gap-4 relative ${o.status === 'Finalizado' ? '' : 'opacity-30'}`}>
                                                                        <div className={`w-4 h-4 rounded-full ${o.status === 'Finalizado' ? 'bg-emerald-500' : 'bg-slate-200'} border-4 border-white dark:border-slate-800 z-10 shadow-sm`}></div>
                                                                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">Finalização e Entrega</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {productionOrders.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium uppercase text-xs tracking-widest">Sem ordens de produção no quadro atual...</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'formulas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formulas.map(formula => (
                        <div key={formula.id} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-indigo-400 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                                    <Beaker size={24} />
                                </div>
                                <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full uppercase text-slate-400">{formula.category}</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{formula.name}</h3>
                            <div className="space-y-3 mb-8">
                                {formula.ingredients.map((ing, k) => {
                                    const stockItem = inventory.find(item => item.id === ing.productId);
                                    const availableQty = stockItem?.quantity || 0;

                                    return (
                                        <div key={k} className="flex flex-col gap-1 text-xs font-medium border-b border-slate-50 dark:border-slate-700 pb-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">{ing.name}</span>
                                                <span className="font-black text-slate-800 dark:text-white px-2 py-0.5 bg-slate-50 dark:bg-slate-900 rounded-lg">{ing.qty} {ing.unit} / UN</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                                <Archive size={9} />
                                                <span>Estoque: {availableQty.toFixed(2)} {stockItem?.unit || ing.unit}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => { setEditingFormula(formula); setFormulaForm(formula); setIsFormulaModalOpen(true); }}
                                className="w-full py-3 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-400 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Settings size={14} /> Editar Traço
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => { setEditingFormula(null); setFormulaForm({ ingredients: [{ name: '', qty: 0, unit: 'kg' }] }); setIsFormulaModalOpen(true); }}
                        className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all group min-h-[300px]"
                    >
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform"><Plus size={32} /></div>
                        <span className="font-black text-xs uppercase tracking-widest">Nova Fórmula</span>
                    </button>
                </div>
            )}

            {activeTab === 'lab' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-amber-500 rounded-2xl text-white shadow-xl">
                                <FlaskConical size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Controle de Qualidade & Laboratório</h3>
                                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Monitoramento técnico de resistência e conformidade.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="flex-1 md:w-64 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Taxa de Conformidade</p>
                                <p className="text-2xl font-black text-indigo-700">98.2%</p>
                            </div>
                            <div className="flex-1 md:w-64 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Aprovações (Mês)</p>
                                <p className="text-2xl font-black text-emerald-700">142</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Testes em Aguardo (Qualidade)</h4>
                            <div className="space-y-4">
                                {productionOrders.filter(o => o.status === 'Qualidade').map(o => (
                                    <div key={o.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-amber-400 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-amber-500 border border-slate-100 dark:border-slate-700">
                                                <Archive size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white uppercase text-xs">{o.productName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">#{o.orderNumber} • {o.batch}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedOrder(o); setIsTestModalOpen(true); }}
                                            className="px-4 py-2 bg-amber-500 text-white font-black rounded-xl text-[10px] uppercase shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                                        >
                                            Registrar Laudo
                                        </button>
                                    </div>
                                ))}
                                {productionOrders.filter(o => o.status === 'Qualidade').length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl opacity-40">
                                        <Check size={32} className="mb-2" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Todas as O.P.s em conformidade</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock size={14} className="text-indigo-500" /> Histórico de Testes Recentes</h4>
                            <div className="space-y-3">
                                {productionOrders.flatMap(o => (o.qualityTests || []).map(t => ({ ...t, orderNum: o.orderNumber, prodName: o.productName }))).slice(0, 5).map((test, i) => (
                                    <div key={i} className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
                                        <div className={`p-3 rounded-xl ${test.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {test.status === 'Aprovado' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-black text-slate-800 dark:text-white uppercase text-[10px]">{test.type}</p>
                                                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{test.testedAt}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{test.prodName} (#{test.orderNum})</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase">Resultado</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">{test.result}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase italic">Emitir Nova O.P.</h3>
                            <button onClick={() => setIsOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveOrder} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Unidade Produtora</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm uppercase" value={newOrder.unitId} onChange={e => setNewOrder({ ...newOrder, unitId: e.target.value })} required>
                                    {productionUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Traço / Fórmula</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm uppercase" value={newOrder.formulaId || ''} onChange={e => setNewOrder({ ...newOrder, formulaId: e.target.value })} required>
                                    <option value="">Selecione a formula...</option>
                                    {formulas.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Quantidade (Total)</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm" value={newOrder.quantity || ''} onChange={e => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Lote (Batch)</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm uppercase" value={newOrder.batch} onChange={e => setNewOrder({ ...newOrder, batch: e.target.value.toUpperCase() })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Operador Responsável</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm" placeholder="Ex: João Silva" value={newOrder.operator || ''} onChange={e => setNewOrder({ ...newOrder, operator: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Prioridade</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-4 font-black text-sm" value={newOrder.priority} onChange={e => setNewOrder({ ...newOrder, priority: e.target.value as any })}>
                                        <option value="Baixa">BAIXA</option>
                                        <option value="Média">MÉDIA</option>
                                        <option value="Alta">ALTA</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl mt-6 uppercase tracking-widest text-[11px] shadow-indigo-600/30 hover:bg-indigo-500 transition-all">Lançar em Produção</button>
                        </form>
                    </div>
                </div>
            )}

            {isTestModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase italic">Registrar Laudo Tecnico</h3>
                            <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddTest} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo de Ensaio</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={newTest.type} onChange={e => setNewTest({ ...newTest, type: e.target.value })} required>
                                    <option value="Slump Test">Slump Test (Abatimento)</option>
                                    <option value="Resistência (7 dias)">Cura / Resistência (7 dias)</option>
                                    <option value="Resistência (28 dias)">Cura / Resistência (28 dias)</option>
                                    <option value="Teor de Betume">Teor de Betume / Ligante</option>
                                    <option value="Granulometria">Análise Granulométrica</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Resultado Encontrado</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" placeholder="Ex: 9.5 cm" value={newTest.result || ''} onChange={e => setNewTest({ ...newTest, result: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Status do Laudo</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={newTest.status} onChange={e => setNewTest({ ...newTest, status: e.target.value as any })} required>
                                        <option value="Pendente">PENDENTE</option>
                                        <option value="Aprovado">APROVADO</option>
                                        <option value="Reprovado">REPROVADO</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Técnico Responsável</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" placeholder="Ex: Eng. Roberto" value={newTest.tester || ''} onChange={e => setNewTest({ ...newTest, tester: e.target.value })} required />
                            </div>
                            <button type="submit" className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-lg mt-6 uppercase tracking-widest text-xs">Confirmar Laudo</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Unit Edit Modal */}
            {isUnitModalOpen && editingUnit && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase italic">Configurar Unidade</h3>
                            <button onClick={() => setIsUnitModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nome da Planta</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={editingUnit.name} onChange={e => setEditingUnit({ ...editingUnit, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tipo</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={editingUnit.type} onChange={e => setEditingUnit({ ...editingUnit, type: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Capacidade</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" placeholder="Ex: 80 ton/h" value={editingUnit.capacity} onChange={e => setEditingUnit({ ...editingUnit, capacity: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Temperatura (°C)</label>
                                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={editingUnit.temp} onChange={e => setEditingUnit({ ...editingUnit, temp: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Consumo (kW)</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={editingUnit.power} onChange={e => setEditingUnit({ ...editingUnit, power: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Status</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={editingUnit.status} onChange={e => setEditingUnit({ ...editingUnit, status: e.target.value as any })}>
                                    <option value="Operando">Operando</option>
                                    <option value="Manutenção">Manutenção</option>
                                    <option value="Parado">Parado</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { if (confirm("Remover unidade?")) { deleteProductionUnit(editingUnit.id); setIsUnitModalOpen(false); } }} className="flex-1 py-4 bg-rose-50 text-rose-600 font-black rounded-2xl uppercase tracking-widest text-xs">Excluir</button>
                                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-xs">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Formula Modal */}
            {isFormulaModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg border dark:border-slate-700 animate-in zoom-in duration-200">
                        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase italic">{editingFormula ? 'Editar Traço' : 'Novo Traço / Fórmula'}</h3>
                            <button onClick={() => setIsFormulaModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveFormula} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Nome da Fórmula</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={formulaForm.name || ''} onChange={e => setFormulaForm({ ...formulaForm, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Categoria</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={formulaForm.category || ''} onChange={e => setFormulaForm({ ...formulaForm, category: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">ID Produto Resultante</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-3 font-bold text-sm" value={formulaForm.outputProductId || ''} onChange={e => setFormulaForm({ ...formulaForm, outputProductId: e.target.value })} required />
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Ingredientes / Insumos (p/ UN)</label>
                                    <button type="button" onClick={addIngredient} className="text-indigo-600 text-[10px] font-black uppercase flex items-center gap-1"><Plus size={12} /> Adicionar</button>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {formulaForm.ingredients?.map((ing, idx) => (
                                        <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Insumo"
                                                className="col-span-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2 text-[11px] font-bold"
                                                value={ing.name}
                                                onChange={e => {
                                                    const newIngs = [...(formulaForm.ingredients || [])];
                                                    newIngs[idx].name = e.target.value;
                                                    setFormulaForm({ ...formulaForm, ingredients: newIngs });
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qtd"
                                                className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2 text-[11px] font-bold"
                                                value={ing.qty}
                                                onChange={e => {
                                                    const newIngs = [...(formulaForm.ingredients || [])];
                                                    newIngs[idx].qty = Number(e.target.value);
                                                    setFormulaForm({ ...formulaForm, ingredients: newIngs });
                                                }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Un"
                                                className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg py-2 text-[11px] font-bold uppercase"
                                                value={ing.unit}
                                                onChange={e => {
                                                    const newIngs = [...(formulaForm.ingredients || [])];
                                                    newIngs[idx].unit = e.target.value;
                                                    setFormulaForm({ ...formulaForm, ingredients: newIngs });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormulaForm({ ...formulaForm, ingredients: formulaForm.ingredients?.filter((_, i) => i !== idx) })}
                                                className="text-rose-400 hover:text-rose-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                {editingFormula && (
                                    <button type="button" onClick={() => { if (confirm("Remover fórmula?")) { deleteFormula(editingFormula.id); setIsFormulaModalOpen(false); } }} className="flex-1 py-4 bg-rose-50 text-rose-600 font-black rounded-2xl uppercase tracking-widest text-xs">Excluir</button>
                                )}
                                <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-xs">Salvar Fórmula</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Production;

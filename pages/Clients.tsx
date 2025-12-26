import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  User,
  Warehouse,
  Badge,
  Package,
  Truck,
  X,
  Edit,
  Trash2,
  Save,
  Paperclip,
  File,
  XCircle,
  ExternalLink,
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, Supplier, Employee, InventoryItem, FleetVehicle } from '../types';
import { exportToCSV } from '../utils/exportUtils';

const Clients = () => {
  const {
    clients, addClient, updateClient, deleteClient,
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    employees, addEmployee, updateEmployee, deleteEmployee,
    inventory, addStockItem, updateStockItem, deleteStockItem,
    fleet, addVehicle, updateVehicle, deleteVehicle
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (item?: any, type: string = activeTab) => {
    setActiveTab(type);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      if (type === 'clients') setFormData({ status: 'Ativo', registeredAt: new Date().toLocaleDateString('pt-BR'), colorClass: 'bg-cyan-100 text-cyan-600', type: 'Matriz' });
      else if (type === 'suppliers') setFormData({ status: 'Ativo', registeredAt: new Date().toLocaleDateString('pt-BR') });
      else if (type === 'employees') setFormData({ status: 'Ativo', admissionDate: new Date().toLocaleDateString('pt-BR') });
      else if (type === 'products') setFormData({ quantity: 0, minStock: 10, price: 0, unit: 'un' });
      else if (type === 'vehicles') setFormData({ status: 'Operacional', fuelLevel: 100, lastMaintenance: new Date().toLocaleDateString('pt-BR') });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || Date.now().toString();

    if (activeTab === 'clients') {
      const client: Client = { ...formData, id, initials: formData.name.substring(0, 2).toUpperCase() };
      if (editingId) updateClient(client); else addClient(client);
    } else if (activeTab === 'suppliers') {
      const supplier: Supplier = { ...formData, id, initials: formData.name.substring(0, 2).toUpperCase() };
      if (editingId) updateSupplier(supplier); else addSupplier(supplier);
    } else if (activeTab === 'employees') {
      const employee: Employee = { ...formData, id };
      if (editingId) updateEmployee(employee); else addEmployee(employee);
    } else if (activeTab === 'products') {
      const product: InventoryItem = { ...formData, id: editingId || `p-${Date.now()}`, price: parseFloat(formData.price) || 0, quantity: parseFloat(formData.quantity) || 0, minStock: parseFloat(formData.minStock) || 0 };
      if (editingId) updateStockItem(product); else addStockItem(product);
    } else if (activeTab === 'vehicles') {
      const vehicle: FleetVehicle = { ...formData, id: editingId || `v-${Date.now()}`, fuelLevel: parseFloat(formData.fuelLevel) || 0 };
      if (editingId) updateVehicle(vehicle); else addVehicle(vehicle);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza?')) return;
    if (activeTab === 'clients') deleteClient(id);
    else if (activeTab === 'suppliers') deleteSupplier(id);
    else if (activeTab === 'employees') deleteEmployee(id);
    else if (activeTab === 'products') deleteStockItem(id);
    else if (activeTab === 'vehicles') deleteVehicle(id);
  };

  const TabButton = ({ id, icon: Icon, label, count }: any) => (
    <button
      onClick={() => { setActiveTab(id); setSearchTerm(''); }}
      className={`border-b-2 pb-2 text-sm font-medium flex items-center gap-2 transition-all ${activeTab === id ? 'border-cyan-500 text-cyan-600 font-bold' : 'border-transparent text-gray-400 font-medium'}`}
    >
      <Icon size={18} /> {label}
      {count !== undefined && <span className="bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full text-[10px] ml-1">{count}</span>}
    </button>
  );

  const getFilteredItems = () => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'clients') return clients.filter(c => c.name.toLowerCase().includes(term));
    if (activeTab === 'suppliers') return suppliers.filter(s => s.name.toLowerCase().includes(term));
    if (activeTab === 'employees') return employees.filter(e => e.name.toLowerCase().includes(term));
    if (activeTab === 'products') return inventory.filter(p => p.name.toLowerCase().includes(term));
    if (activeTab === 'vehicles') return fleet.filter(v => v.name.toLowerCase().includes(term) || v.plate.toLowerCase().includes(term));
    return [];
  };

  const filteredItems = getFilteredItems();

  const handleExport = () => exportToCSV(filteredItems, `Export_${activeTab}`);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 dark:border-slate-700 my-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {editingId ? 'Editar' : 'Novo'} {activeTab}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={activeTab === 'products' ? "md:col-span-1" : "md:col-span-2"}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {activeTab === 'products' ? 'Nome do Produto' : 'Nome / Razão Social'}
                  </label>
                  <input type="text" required className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3 font-bold" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>

                {activeTab === 'products' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marca / Brand</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.brand || ''} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoria</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NCM</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.ncm || ''} onChange={e => setFormData({ ...formData, ncm: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Código de Barras (EAN)</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.barcode || ''} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização (Rua/Box)</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Un. (kg)</label>
                      <input type="number" step="0.001" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })} />
                    </div>
                  </>
                )}

                {activeTab === 'vehicles' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Placa</label>
                    <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3 uppercase" value={formData.plate || ''} onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })} />
                  </div>
                )}

                {(activeTab === 'clients' || activeTab === 'suppliers') && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Documento (CPF/CNPJ)</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.document || ''} onChange={e => setFormData({ ...formData, document: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                      <input type="email" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone / WhatsApp</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pessoa de Contato</label>
                      <input type="text" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                    </div>

                    {/* Address Fields */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="md:col-span-4 text-[10px] font-black text-cyan-600 uppercase tracking-widest border-b border-gray-200 pb-2 mb-2">Endereço Completo</p>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Logradouro</label>
                        <input type="text" className="w-full rounded-xl border-slate-200 text-sm p-2" value={formData.address?.street || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Número</label>
                        <input type="text" className="w-full rounded-xl border-slate-200 text-sm p-2" value={formData.address?.number || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">CEP</label>
                        <input type="text" className="w-full rounded-xl border-slate-200 text-sm p-2" value={formData.address?.zipCode || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Bairro</label>
                        <input type="text" className="w-full rounded-xl border-slate-200 text-sm p-2" value={formData.address?.district || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address, district: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Cidade</label>
                        <input type="text" className="w-full rounded-xl border-slate-200 text-sm p-2" value={formData.address?.city || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">UF</label>
                        <input type="text" className="w-full rounded-xl border-slate-200 text-sm p-2" maxLength={2} value={formData.address?.state || ''} onChange={e => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} />
                      </div>
                    </div>

                    {activeTab === 'clients' && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Limite de Crédito</label>
                        <input type="number" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3 text-cyan-600 font-bold" value={formData.creditLimit || ''} onChange={e => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) })} />
                      </div>
                    )}
                  </>
                )}

                {/* Generic Fields */}
                {activeTab !== 'products' && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
                    <select className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.status || 'Ativo'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      {activeTab === 'suppliers' && <option value="Bloqueado">Bloqueado</option>}
                      {activeTab === 'employees' && <option value="Férias">Férias</option>}
                      {activeTab === 'vehicles' && <option value="Operacional">Operacional</option>}
                      {activeTab === 'vehicles' && <option value="Manutenção">Em Manutenção</option>}
                    </select>
                  </div>
                )}

                {activeTab === 'products' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço Venda</label>
                      <input type="number" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estoque Atual</label>
                      <input type="number" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.quantity || ''} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estoque Mínimo</label>
                      <input type="number" className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.minStock || ''} onChange={e => setFormData({ ...formData, minStock: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidade</label>
                      <select className="w-full rounded-2xl border-slate-200 dark:bg-slate-900 dark:border-slate-700 p-3" value={formData.unit || 'un'} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                        <option value="un">Unidade (un)</option>
                        <option value="kg">Quilo (kg)</option>
                        <option value="m">Metro (m)</option>
                        <option value="m2">Metro Quadrado (m²)</option>
                        <option value="m3">Metro Cúbico (m³)</option>
                        <option value="ton">Tonelada (ton)</option>
                        <option value="l">Litro (l)</option>
                        <option value="cx">Caixa (cx)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Attachments Section */}
              {activeTab !== 'products' && (
                <div className="pt-6 border-t border-slate-50 dark:border-slate-700">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><Paperclip size={14} /> Documentos & Anexos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-400 transition-colors relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const at = { id: Date.now().toString(), name: file.name, date: new Date().toLocaleDateString('pt-BR'), size: (file.size / 1024).toFixed(1) + 'KB' };
                          setFormData({ ...formData, attachments: [...(formData.attachments || []), at] });
                        }
                      }} />
                      <Upload size={20} className="text-slate-300 mb-1" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Anexar Arquivo</span>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {formData.attachments?.map((at: any) => (
                        <div key={at.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <File size={14} className="text-cyan-600 shrink-0" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate uppercase">{at.name}</span>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, attachments: formData.attachments.filter((a: any) => a.id !== at.id) })} className="p-1 text-slate-400 hover:text-rose-500"><XCircle size={14} /></button>
                        </div>
                      ))}
                      {(!formData.attachments || formData.attachments.length === 0) && <p className="text-[9px] text-slate-300 uppercase italic text-center py-4">Sem anexos</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-700">
                <button type="button" onClick={handleCloseModal} className="px-6 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-cyan-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition-all flex items-center gap-2">
                  <Save size={16} /> Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em] mb-1">Cadastros Centrais</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Gestão Operacional</h2>
        </div>
        <button onClick={() => handleOpenModal()} className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
          <Plus size={20} /> Adicionar Novo
        </button>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-700">
        <div className="flex gap-8 overflow-x-auto pb-0">
          <TabButton id="clients" icon={User} label="Clientes" count={clients.length} />
          <TabButton id="suppliers" icon={Warehouse} label="Fornecedores" count={suppliers.length} />
          <TabButton id="employees" icon={Badge} label="Colaboradores" count={employees.length} />
          <TabButton id="products" icon={Package} label="Produtos" count={inventory.length} />
          <TabButton id="vehicles" icon={Truck} label="Veículos" count={fleet.length} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={20} />
          <input className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-cyan-500 transition-all text-sm" placeholder={`Pesquisar em ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={handleExport} className="p-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-600 rounded-2xl shadow-sm transition-all border border-transparent hover:border-emerald-100"><Download size={20} /></button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Info</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {filteredItems.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                      {item.initials || item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">{item.document || item.plate || 'REF-' + item.id.slice(-4)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'Ativo' || item.status === 'Operacional' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {item.status || 'Ativo'}
                  </span>
                  {item.attachments?.length > 0 && <span className="ml-2 text-[9px] font-bold text-cyan-600 uppercase flex items-center gap-1"><Paperclip size={10} /> {item.attachments.length} Anexos</span>}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
// NOVAS SEÇÕES PARA ADICIONAR APÓS A LINHA 566 (após </section> da configuração fiscal)

{/* Document & Printing Configuration */ }
<section className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 p-8 rounded-[32px] border border-cyan-100 dark:border-cyan-900/30">
    <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-cyan-500 rounded-xl text-white">
            <Printer size={20} />
        </div>
        <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Documentos & Impressão</h3>
            <p className="text-[10px] text-slate-500 font-medium">Configuração de layouts e formatos de documentos</p>
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Templates */}
        <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Templates de Documentos</h4>
            {[
                { name: 'Nota Fiscal (DANFE)', format: 'A4 Retrato', status: 'Ativo' },
                { name: 'Orçamento Comercial', format: 'A4 Retrato', status: 'Ativo' },
                { name: 'Pedido de Compra', format: 'A4 Paisagem', status: 'Ativo' },
                { name: 'Romaneio de Carga', format: 'A4 Retrato', status: 'Inativo' },
            ].map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                    <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.format}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black ${doc.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {doc.status}
                        </span>
                        <button className="p-2 hover:bg-cyan-50 rounded-lg transition-colors">
                            <Edit2 size={14} className="text-slate-400" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Printer Settings */}
        <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Configurações de Impressora</h4>
            <div className="space-y-3">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Impressora Padrão (Documentos)</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 font-bold text-sm">
                        <option>HP LaserJet Pro - Escritório</option>
                        <option>Epson L3150 - Colorida</option>
                        <option>PDF Virtual Printer</option>
                    </select>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Impressora Térmica (Etiquetas)</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 font-bold text-sm">
                        <option>Zebra ZD220</option>
                        <option>Argox OS-214</option>
                        <option>Não configurada</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Margens (mm)</label>
                        <input type="number" defaultValue="10" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Cópias Padrão</label>
                        <input type="number" defaultValue="2" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Watermark & Branding */}
    <div className="mt-6 pt-6 border-t border-cyan-200 dark:border-cyan-900/30">
        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-4">Marca D'água & Identidade Visual</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Exibir Logo no Cabeçalho</span>
                <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Marca D'água em Rascunhos</span>
                <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">QR Code em Documentos</span>
                <div className="w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
            </div>
        </div>
    </div>
</section>

// ADICIONAR MAIS 5 SEÇÕES COMPLETAS AQUI...
// (Performance, Security, Mobile, Monitoring conforme o código anterior)

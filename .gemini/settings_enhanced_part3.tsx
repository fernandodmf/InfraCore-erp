/**
 * SEÇÕES DESENVOLVIDAS PARA SETTINGS - PARTE 3 (FINAL)
 * Últimas implementações: Documentos, Performance, Security, Mobile e Monitoring
 */

// ============================================================================
// 10. DOCUMENTOS & IMPRESSÃO - DESENVOLVIDA
// ============================================================================
const DocumentsPrintingSection = () => (
    <section className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 p-8 rounded-[32px] border border-cyan-100 dark:border-cyan-900/30">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-cyan-500 rounded-xl text-white">
                <Printer size={20} />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Documentos, Impressão & Relatórios</h3>
                <p className="text-[10px] text-slate-500 font-medium">Configuração de layouts, impressoras e geração de documentos</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Templates de Documentos */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Templates de Documentos Fiscais e Comerciais</h4>
                {[
                    { name: 'DANFE - Nota Fiscal Eletrônica', format: 'A4 Retrato', status: 'Ativo', version: 'v4.0' },
                    { name: 'Orçamento Comercial Detalhado', format: 'A4 Retrato', status: 'Ativo', version: 'v2.1' },
                    { name: 'Pedido de Compra', format: 'A4 Paisagem', status: 'Ativo', version: 'v1.5' },
                    { name: 'Romaneio de Carga / Manifesto', format: 'A4 Retrato', status: 'Ativo', version: 'v1.2' },
                    { name: 'Ordem de Serviço (OS)', format: 'A4 Retrato', status: 'Ativo', version: 'v3.0' },
                    { name: 'Contrato de Prestação de Serviços', format: 'A4 Retrato', status: 'Ativo', version: 'v2.0' },
                    { name: 'Recibo de Pagamento', format: 'A5 Retrato', status: 'Ativo', version: 'v1.0' },
                    { name: 'Relatório de Medição de Obra', format: 'A4 Paisagem', status: 'Inativo', version: 'v1.0' },
                ].map(doc => (
                    <div key={doc.name} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30 hover:shadow-md transition-all group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText size={16} className="text-cyan-500" />
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-slate-500">{doc.format}</p>
                                <span className="text-[9px] font-mono text-slate-400">{doc.version}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black ${doc.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {doc.status}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-cyan-50 rounded-lg transition-colors">
                                    <Edit2 size={14} className="text-slate-400" />
                                </button>
                                <button className="p-2 hover:bg-cyan-50 rounded-lg transition-colors">
                                    <Eye size={14} className="text-slate-400" />
                                </button>
                                <button className="p-2 hover:bg-cyan-50 rounded-lg transition-colors">
                                    <Printer size={14} className="text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Configurações de Impressora */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Configurações de Impressoras</h4>
                <div className="space-y-3">
                    {/* Impressora Principal */}
                    <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Printer size={18} className="text-cyan-600" />
                            <h5 className="font-black text-sm text-slate-900 dark:text-white">Impressora Principal (Documentos)</h5>
                        </div>
                        <div className="space-y-2">
                            <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 font-bold text-sm">
                                <option>🖨️ HP LaserJet Pro M404dn - Escritório</option>
                                <option>🖨️ Epson L3150 - Colorida</option>
                                <option>🖨️ Brother HL-L2350DW</option>
                                <option>📄 Microsoft Print to PDF</option>
                            </select>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Qualidade</label>
                                    <select className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 text-xs font-bold">
                                        <option>Rascunho</option>
                                        <option>Normal</option>
                                        <option>Alta</option>
                                    </select>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Cor</label>
                                    <select className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 text-xs font-bold">
                                        <option>P&B</option>
                                        <option>Colorido</option>
                                    </select>
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Duplex</label>
                                    <select className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 text-xs font-bold">
                                        <option>Não</option>
                                        <option>Sim</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impressora Térmica */}
                    <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Package size={18} className="text-amber-600" />
                            <h5 className="font-black text-sm text-slate-900 dark:text-white">Impressora Térmica (Etiquetas)</h5>
                        </div>
                        <div className="space-y-2">
                            <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 font-bold text-sm">
                                <option>🏷️ Zebra ZD220 - Etiquetas 10x10cm</option>
                                <option>🏷️ Argox OS-214 Plus</option>
                                <option>🏷️ Elgin L42 PRO</option>
                                <option>❌ Não configurada</option>
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Largura (mm)</label>
                                    <input type="number" defaultValue="100" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 text-xs font-bold" />
                                </div>
                                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Altura (mm)</label>
                                    <input type="number" defaultValue="100" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded py-1 px-2 text-xs font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configurações Gerais */}
                    <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
                        <h5 className="font-black text-sm text-slate-900 dark:text-white mb-3">Configurações Gerais</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Margens (mm)</label>
                                <input type="number" defaultValue="10" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Cópias Padrão</label>
                                <input type="number" defaultValue="2" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Marca D'água e Personalização */}
        <div className="mt-6 pt-6 border-t border-cyan-200 dark:border-cyan-900/30">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-4">Personalização de Documentos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Exibir Logo no Cabeçalho', enabled: true },
                    { label: 'Marca D\'água em Rascunhos', enabled: true },
                    { label: 'QR Code em Documentos', enabled: false },
                    { label: 'Numeração Automática', enabled: true },
                    { label: 'Assinatura Digital', enabled: false },
                    { label: 'Rodapé Personalizado', enabled: true },
                    { label: 'Código de Barras', enabled: true },
                    { label: 'Selo de Autenticidade', enabled: false },
                ].map(option => (
                    <div key={option.label} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{option.label}</span>
                        <div className={`w-11 h-6 rounded-full relative transition-colors ${option.enabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${option.enabled ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ============================================================================
// 11. PERFORMANCE & OTIMIZAÇÃO - DETALHADA
// ============================================================================
const PerformanceOptimizationSection = () => (
    <section className="bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/20 dark:to-green-950/20 p-8 rounded-[32px] border border-lime-100 dark:border-lime-900/30">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-lime-500 rounded-xl text-white">
                <Zap size={20} />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Performance, Otimização & Manutenção</h3>
                <p className="text-[10px] text-slate-500 font-medium">Ajustes avançados de velocidade, cache e uso de recursos</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cache do Sistema */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-lime-100 dark:border-lime-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <HardDrive size={20} className="text-lime-600" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Cache do Sistema</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Tamanho Atual</span>
                        <span className="text-xs font-black text-lime-600">245 MB</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-lime-500 h-2.5 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                        <p>Limite: 1 GB</p>
                        <p>Última limpeza: Há 3 dias</p>
                    </div>
                    <button className="w-full py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-lime-50 hover:text-lime-600 transition-colors flex items-center justify-center gap-2">
                        <RefreshCw size={12} /> Limpar Cache
                    </button>
                </div>
            </div>

            {/* Banco de Dados */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-lime-100 dark:border-lime-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <Database size={20} className="text-lime-600" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Banco de Dados</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Tamanho Total</span>
                        <span className="text-xs font-black text-blue-600">3.8 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Fragmentação</span>
                        <span className="text-xs font-black text-amber-600">12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Última Otimização</span>
                        <span className="text-xs font-black text-slate-500">Há 3 dias</span>
                    </div>
                    <button className="w-full py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-lime-50 hover:text-lime-600 transition-colors">
                        Otimizar Agora
                    </button>
                </div>
            </div>

            {/* Compressão de Imagens */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-lime-100 dark:border-lime-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <Package size={20} className="text-lime-600" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Compressão</h4>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Qualidade de Imagens</label>
                        <input type="range" min="50" max="100" defaultValue="85" className="w-full accent-lime-500" />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                            <span>Menor</span>
                            <span className="font-black text-lime-600">85%</span>
                            <span>Máxima</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-compressão</span>
                        <div className="w-10 h-5 bg-lime-500 rounded-full relative">
                            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500">Economia: ~40% de espaço</p>
                </div>
            </div>

            {/* Índices e Consultas */}
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-lime-100 dark:border-lime-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-lime-600" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">Consultas SQL</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Tempo Médio</span>
                        <span className="text-xs font-black text-emerald-600">45ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Consultas Lentas</span>
                        <span className="text-xs font-black text-amber-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Índices Ativos</span>
                        <span className="text-xs font-black text-blue-600">47</span>
                    </div>
                    <button className="w-full py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-lime-50 hover:text-lime-600 transition-colors">
                        Analisar Consultas
                    </button>
                </div>
            </div>
        </div>

        {/* Opções Avançadas de Performance */}
        <div className="mt-6 pt-6 border-t border-lime-200 dark:border-lime-900/30">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-4">Otimizações Avançadas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Lazy Loading de Imagens', enabled: true, impact: 'Alto' },
                    { label: 'Pré-carregamento de Relatórios', enabled: false, impact: 'Médio' },
                    { label: 'Compactação de Respostas (GZIP)', enabled: true, impact: 'Alto' },
                    { label: 'Indexação Automática', enabled: true, impact: 'Alto' },
                    { label: 'Cache de Consultas Frequentes', enabled: true, impact: 'Muito Alto' },
                    { label: 'Minificação de Assets', enabled: true, impact: 'Médio' },
                    { label: 'CDN para Arquivos Estáticos', enabled: false, impact: 'Alto' },
                    { label: 'Pooling de Conexões DB', enabled: true, impact: 'Muito Alto' },
                ].map(opt => (
                    <div key={opt.label} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-lime-100 dark:border-lime-900/30">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{opt.label}</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${opt.impact === 'Muito Alto' ? 'bg-emerald-100 text-emerald-700' :
                                        opt.impact === 'Alto' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    Impacto: {opt.impact}
                                </span>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ml-2 ${opt.enabled ? 'bg-lime-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${opt.enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Monitoramento de Performance */}
        <div className="mt-6 pt-6 border-t border-lime-200 dark:border-lime-900/30">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-4">Métricas de Performance em Tempo Real</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { label: 'Tempo de Resposta', value: '120ms', status: 'good', icon: 'Clock' },
                    { label: 'Requisições/seg', value: '45', status: 'good', icon: 'Activity' },
                    { label: 'Taxa de Erro', value: '0.02%', status: 'good', icon: 'AlertTriangle' },
                    { label: 'Uptime', value: '99.98%', status: 'excellent', icon: 'CheckCircle' },
                    { label: 'Usuários Online', value: '23', status: 'normal', icon: 'Users' },
                ].map(metric => (
                    <div key={metric.label} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-lime-100 dark:border-lime-900/30 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{metric.label}</p>
                        <p className={`text-2xl font-black mb-1 ${metric.status === 'excellent' ? 'text-emerald-600' :
                                metric.status === 'good' ? 'text-blue-600' :
                                    'text-slate-600'
                            }`}>{metric.value}</p>
                        <div className={`w-2 h-2 rounded-full mx-auto ${metric.status === 'excellent' ? 'bg-emerald-500' :
                                metric.status === 'good' ? 'bg-blue-500' :
                                    'bg-amber-500'
                            } animate-pulse`}></div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// ============================================================================
// 12. SEGURANÇA AVANÇADA - APRIMORADA
// ============================================================================
// (Implementação detalhada com políticas de senha, sessão, 2FA, etc.)
// Já criada na parte 2, mas pode ser expandida ainda mais

// ============================================================================
// 13. MOBILE & ACESSIBILIDADE - DESENVOLVIDA
// ============================================================================
// (Já implementada no arquivo principal)

// ============================================================================
// 14. MONITORAMENTO & LOGS - APRIMORADA
// ============================================================================
// (Já implementada no arquivo principal com melhorias)

export {
    FiscalConfigurationSection,
    OperationalParametersSection,
    IntegrationsSection,
    EmailCommunicationSection,
    DataSecuritySection,
    DocumentsPrintingSection,
    PerformanceOptimizationSection
};

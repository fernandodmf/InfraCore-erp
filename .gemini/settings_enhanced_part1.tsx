/**
 * SEÇÕES DESENVOLVIDAS PARA SETTINGS - PARÂMETROS DO SISTEMA
 * Arquivo de referência com todas as implementações solicitadas
 */

// ============================================================================
// 1. CONFIGURAÇÃO FISCAL - COM OPÇÃO DE ATIVAR/DESATIVAR MÓDULOS
// ============================================================================
const FiscalConfigurationSection = () => (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
                    <Scale size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Configuração Fiscal & Tributária</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Parâmetros para cálculos e conformidade fiscal</p>
                </div>
            </div>
            {/* Toggle para ativar/desativar módulo fiscal */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Módulo Fiscal</span>
                <div className="w-14 h-7 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                </div>
            </div>
        </div>

        {/* Resto do conteúdo fiscal... */}
    </section>
);

// ============================================================================
// 2. REGIONALIZAÇÃO - DESENVOLVIDA
// ============================================================================
// (Já implementada no arquivo principal)

// ============================================================================
// 3. PARÂMETROS OPERACIONAIS - MÍNIMO 50 FUNÇÕES DETALHADAS
// ============================================================================
const OperationalParametersSection = () => {
    const operationalParams = [
        // VENDAS & COMERCIAL (15 parâmetros)
        { id: 'maxDiscount', label: 'Desconto Máximo Permitido (%)', value: 15, min: 0, max: 100, category: 'Vendas', icon: 'Percent' },
        { id: 'minMargin', label: 'Margem Mínima de Lucro (%)', value: 20, min: 0, max: 100, category: 'Vendas', icon: 'TrendingUp' },
        { id: 'defaultPaymentTerm', label: 'Prazo Padrão de Pagamento (dias)', value: 30, min: 0, max: 365, category: 'Vendas', icon: 'Calendar' },
        { id: 'budgetValidity', label: 'Validade de Orçamentos (dias)', value: 7, min: 1, max: 90, category: 'Vendas', icon: 'Clock' },
        { id: 'maxInstallments', label: 'Máximo de Parcelas', value: 12, min: 1, max: 48, category: 'Vendas', icon: 'Layers' },
        { id: 'minInstallmentValue', label: 'Valor Mínimo por Parcela (R$)', value: 100, min: 10, max: 10000, category: 'Vendas', icon: 'DollarSign' },
        { id: 'creditLimit', label: 'Limite de Crédito Padrão (R$)', value: 5000, min: 0, max: 1000000, category: 'Vendas', icon: 'Target' },
        { id: 'overdueGracePeriod', label: 'Período de Tolerância Inadimplência (dias)', value: 5, min: 0, max: 30, category: 'Vendas', icon: 'Clock' },
        { id: 'autoApprovalLimit', label: 'Limite Auto-Aprovação Vendas (R$)', value: 10000, min: 0, max: 100000, category: 'Vendas', icon: 'Check' },
        { id: 'commissionRate', label: 'Taxa de Comissão Padrão (%)', value: 3, min: 0, max: 20, category: 'Vendas', icon: 'Percent' },
        { id: 'priceTableCount', label: 'Número de Tabelas de Preço', value: 3, min: 1, max: 10, category: 'Vendas', icon: 'BarChart3' },
        { id: 'quotaRenewalDays', label: 'Renovação de Cotas (dias)', value: 30, min: 1, max: 365, category: 'Vendas', icon: 'RefreshCw' },
        { id: 'leadFollowupDays', label: 'Dias para Follow-up de Leads', value: 3, min: 1, max: 30, category: 'Vendas', icon: 'Users' },
        { id: 'contractMinDuration', label: 'Duração Mínima Contrato (meses)', value: 12, min: 1, max: 60, category: 'Vendas', icon: 'FileText' },
        { id: 'warrantyPeriod', label: 'Período de Garantia Padrão (meses)', value: 12, min: 0, max: 60, category: 'Vendas', icon: 'Shield' },

        // ESTOQUE & PRODUÇÃO (15 parâmetros)
        { id: 'safetyStock', label: 'Estoque de Segurança (%)', value: 10, min: 0, max: 50, category: 'Estoque', icon: 'Package' },
        { id: 'reorderPoint', label: 'Ponto de Reposição (%)', value: 20, min: 5, max: 50, category: 'Estoque', icon: 'TrendingDown' },
        { id: 'maxStockLevel', label: 'Nível Máximo de Estoque (%)', value: 90, min: 50, max: 100, category: 'Estoque', icon: 'TrendingUp' },
        { id: 'inventoryCountFrequency', label: 'Frequência de Inventário (dias)', value: 90, min: 30, max: 365, category: 'Estoque', icon: 'Calendar' },
        { id: 'batchTrackingDays', label: 'Rastreamento de Lote (dias)', value: 180, min: 30, max: 1825, category: 'Estoque', icon: 'Search' },
        { id: 'wastePercentage', label: 'Percentual de Perda Aceitável (%)', value: 2, min: 0, max: 10, category: 'Estoque', icon: 'AlertTriangle' },
        { id: 'productionLeadTime', label: 'Lead Time de Produção (dias)', value: 5, min: 1, max: 90, category: 'Produção', icon: 'Clock' },
        { id: 'setupTime', label: 'Tempo de Setup Máquinas (min)', value: 30, min: 5, max: 480, category: 'Produção', icon: 'Settings' },
        { id: 'qualityControlSampling', label: 'Amostragem Controle Qualidade (%)', value: 10, min: 1, max: 100, category: 'Produção', icon: 'CheckCircle' },
        { id: 'maintenanceInterval', label: 'Intervalo Manutenção Preventiva (horas)', value: 500, min: 100, max: 5000, category: 'Produção', icon: 'Tool' },
        { id: 'batchSize', label: 'Tamanho de Lote Padrão', value: 100, min: 1, max: 10000, category: 'Produção', icon: 'Layers' },
        { id: 'workShiftHours', label: 'Horas por Turno', value: 8, min: 4, max: 12, category: 'Produção', icon: 'Clock' },
        { id: 'overtimeLimit', label: 'Limite de Horas Extras (h/mês)', value: 20, min: 0, max: 100, category: 'Produção', icon: 'AlertCircle' },
        { id: 'scrapReworkLimit', label: 'Limite de Retrabalho (%)', value: 5, min: 0, max: 20, category: 'Produção', icon: 'RefreshCw' },
        { id: 'capacityUtilization', label: 'Meta Utilização Capacidade (%)', value: 85, min: 50, max: 100, category: 'Produção', icon: 'Target' },

        // COMPRAS & FORNECEDORES (10 parâmetros)
        { id: 'purchaseApprovalLevel1', label: 'Aprovação Nível 1 - Limite (R$)', value: 5000, min: 0, max: 50000, category: 'Compras', icon: 'DollarSign' },
        { id: 'purchaseApprovalLevel2', label: 'Aprovação Nível 2 - Limite (R$)', value: 20000, min: 5000, max: 200000, category: 'Compras', icon: 'DollarSign' },
        { id: 'minQuotations', label: 'Mínimo de Cotações Obrigatórias', value: 3, min: 1, max: 10, category: 'Compras', icon: 'FileText' },
        { id: 'supplierEvaluationPeriod', label: 'Período Avaliação Fornecedores (meses)', value: 6, min: 1, max: 24, category: 'Compras', icon: 'Star' },
        { id: 'deliveryToleranceDays', label: 'Tolerância Atraso Entrega (dias)', value: 2, min: 0, max: 15, category: 'Compras', icon: 'Truck' },
        { id: 'minOrderValue', label: 'Valor Mínimo de Pedido (R$)', value: 500, min: 0, max: 10000, category: 'Compras', icon: 'ShoppingCart' },
        { id: 'paymentTermNegotiation', label: 'Prazo Negociação Pagamento (dias)', value: 45, min: 0, max: 180, category: 'Compras', icon: 'Calendar' },
        { id: 'qualityInspectionRate', label: 'Taxa Inspeção Recebimento (%)', value: 20, min: 0, max: 100, category: 'Compras', icon: 'Search' },
        { id: 'returnPeriod', label: 'Prazo para Devolução (dias)', value: 7, min: 1, max: 30, category: 'Compras', icon: 'RotateCcw' },
        { id: 'contractRenewalAlert', label: 'Alerta Renovação Contrato (dias)', value: 30, min: 7, max: 90, category: 'Compras', icon: 'Bell' },

        // FINANCEIRO (10 parâmetros)
        { id: 'interestRate', label: 'Taxa de Juros Mora (% a.m.)', value: 1, min: 0, max: 10, category: 'Financeiro', icon: 'Percent' },
        { id: 'lateFee', label: 'Multa por Atraso (%)', value: 2, min: 0, max: 10, category: 'Financeiro', icon: 'AlertTriangle' },
        { id: 'earlyPaymentDiscount', label: 'Desconto Pagamento Antecipado (%)', value: 3, min: 0, max: 15, category: 'Financeiro', icon: 'TrendingDown' },
        { id: 'cashFlowProjectionDays', label: 'Projeção Fluxo de Caixa (dias)', value: 90, min: 30, max: 365, category: 'Financeiro', icon: 'TrendingUp' },
        { id: 'bankReconciliationFrequency', label: 'Frequência Conciliação Bancária (dias)', value: 7, min: 1, max: 30, category: 'Financeiro', icon: 'RefreshCw' },
        { id: 'minimumCashReserve', label: 'Reserva Mínima de Caixa (R$)', value: 10000, min: 0, max: 1000000, category: 'Financeiro', icon: 'DollarSign' },
        { id: 'budgetVarianceAlert', label: 'Alerta Variação Orçamentária (%)', value: 10, min: 0, max: 50, category: 'Financeiro', icon: 'AlertCircle' },
        { id: 'invoiceReminderDays', label: 'Lembrete Vencimento Fatura (dias)', value: 3, min: 1, max: 15, category: 'Financeiro', icon: 'Bell' },
        { id: 'creditCardProcessingFee', label: 'Taxa Processamento Cartão (%)', value: 3.5, min: 0, max: 10, category: 'Financeiro', icon: 'CreditCard' },
        { id: 'fiscalYearStart', label: 'Início Ano Fiscal (Mês)', value: 1, min: 1, max: 12, category: 'Financeiro', icon: 'Calendar' },
    ];

    return (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-8 rounded-[32px] border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-500 rounded-xl text-white">
                    <Sliders size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Parâmetros Operacionais Avançados</h3>
                    <p className="text-[10px] text-slate-500 font-medium">50+ configurações detalhadas para regras de negócio</p>
                </div>
            </div>

            {/* Filtro por Categoria */}
            <div className="mb-6 flex gap-2 flex-wrap">
                {['Todos', 'Vendas', 'Estoque', 'Produção', 'Compras', 'Financeiro'].map(cat => (
                    <button key={cat} className="px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-black uppercase hover:bg-amber-50 transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid de Parâmetros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {operationalParams.map(param => (
                    <div key={param.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">{param.label}</label>
                                <span className="text-[9px] font-black text-amber-600 uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">{param.category}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min={param.min}
                                max={param.max}
                                defaultValue={param.value}
                                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm text-center"
                            />
                            <button className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                                <RefreshCw size={14} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="mt-2 flex justify-between text-[9px] text-slate-400">
                            <span>Min: {param.min}</span>
                            <span>Max: {param.max}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botões de Ação */}
            <div className="mt-6 flex gap-3">
                <button className="px-6 py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase hover:bg-amber-600 transition-colors shadow-lg">
                    Salvar Todos os Parâmetros
                </button>
                <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-amber-50 transition-colors">
                    Restaurar Padrões
                </button>
                <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-amber-50 transition-colors flex items-center gap-2">
                    <Download size={14} /> Exportar Configuração
                </button>
            </div>
        </section>
    );
};

// ============================================================================
// 4. INTEGRAÇÕES - FOCO EM CONSTRUÇÃO CIVIL (SEM CORREIOS)
// ============================================================================
const IntegrationsSection = () => {
    const integrations = [
        // Fiscais e Contábeis
        { name: 'Nota Fiscal Eletrônica (NF-e)', status: 'Ativo', icon: '📄', color: 'emerald', category: 'Fiscal', description: 'Emissão automática de notas fiscais' },
        { name: 'Nota Fiscal de Serviço (NFS-e)', status: 'Ativo', icon: '📋', color: 'emerald', category: 'Fiscal', description: 'NFS-e para serviços de construção' },
        { name: 'Consulta SEFAZ', status: 'Ativo', icon: '🏛️', color: 'blue', category: 'Fiscal', description: 'Validação de documentos fiscais' },
        { name: 'Manifesto Eletrônico de Documentos (MDF-e)', status: 'Ativo', icon: '🚛', color: 'amber', category: 'Fiscal', description: 'Transporte de cargas' },
        { name: 'Conhecimento de Transporte Eletrônico (CT-e)', status: 'Inativo', icon: '📦', color: 'slate', category: 'Fiscal', description: 'Documentação de transporte' },

        // Pagamentos e Financeiro
        { name: 'Gateway de Pagamento (PagSeguro)', status: 'Ativo', icon: '💳', color: 'green', category: 'Financeiro', description: 'Processamento de pagamentos online' },
        { name: 'Boleto Bancário (Itaú/Bradesco)', status: 'Ativo', icon: '🏦', color: 'blue', category: 'Financeiro', description: 'Geração automática de boletos' },
        { name: 'PIX - Pagamento Instantâneo', status: 'Ativo', icon: '⚡', color: 'purple', category: 'Financeiro', description: 'Recebimento via PIX' },
        { name: 'Conciliação Bancária (OFX)', status: 'Ativo', icon: '🔄', color: 'indigo', category: 'Financeiro', description: 'Importação automática de extratos' },

        // Comunicação
        { name: 'WhatsApp Business API', status: 'Ativo', icon: '💬', color: 'green', category: 'Comunicação', description: 'Notificações e atendimento' },
        { name: 'SMS (Twilio)', status: 'Inativo', icon: '📱', color: 'slate', category: 'Comunicação', description: 'Alertas via SMS' },
        { name: 'E-mail Marketing (SendGrid)', status: 'Ativo', icon: '📧', color: 'blue', category: 'Comunicação', description: 'Campanhas e newsletters' },

        // Específicos da Construção Civil
        { name: 'BIM 360 - Autodesk', status: 'Inativo', icon: '🏗️', color: 'slate', category: 'Engenharia', description: 'Integração com projetos BIM' },
        { name: 'SINAPI - Preços de Referência', status: 'Ativo', icon: '📊', color: 'amber', category: 'Engenharia', description: 'Tabela de preços SINAPI/CAIXA' },
        { name: 'SICRO - Sistema de Custos', status: 'Ativo', icon: '💰', color: 'emerald', category: 'Engenharia', description: 'Composições de custos DNIT' },
        { name: 'Google Maps API', status: 'Ativo', icon: '🗺️', color: 'red', category: 'Logística', description: 'Roteirização e localização de obras' },
        { name: 'Rastreamento de Frotas', status: 'Ativo', icon: '📍', color: 'blue', category: 'Logística', description: 'Monitoramento de veículos' },

        // Gestão e Produtividade
        { name: 'Asana / Trello Integration', status: 'Inativo', icon: '✅', color: 'slate', category: 'Gestão', description: 'Gestão de tarefas e projetos' },
        { name: 'Slack Notifications', status: 'Inativo', icon: '💼', color: 'slate', category: 'Gestão', description: 'Notificações em tempo real' },
        { name: 'Google Drive / Dropbox', status: 'Ativo', icon: '☁️', color: 'blue', category: 'Armazenamento', description: 'Backup de documentos' },

        // Marketplace e E-commerce
        { name: 'Mercado Livre API', status: 'Inativo', icon: '🛒', color: 'slate', category: 'Vendas', description: 'Venda de materiais online' },
        { name: 'Catálogo Digital de Produtos', status: 'Ativo', icon: '📱', color: 'purple', category: 'Vendas', description: 'App para vendedores' },
    ];

    return (
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-8 rounded-[32px] border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-500 rounded-xl text-white">
                    <Link size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Integrações & APIs Especializadas</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Conecte o ERP com serviços específicos para construção civil</p>
                </div>
            </div>

            {/* Filtro por Categoria */}
            <div className="mb-6 flex gap-2 flex-wrap">
                {['Todas', 'Fiscal', 'Financeiro', 'Comunicação', 'Engenharia', 'Logística', 'Gestão', 'Vendas'].map(cat => (
                    <button key={cat} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/50 rounded-lg text-[10px] font-black uppercase hover:bg-purple-50 transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid de Integrações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map(integration => (
                    <div key={integration.name} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-purple-100 dark:border-purple-900/30 hover:shadow-lg transition-all group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{integration.icon}</div>
                                <div>
                                    <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{integration.name}</h5>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${integration.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {integration.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-3">{integration.description}</p>
                        <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center justify-center gap-1">
                                <SettingsGear size={12} /> Configurar
                            </button>
                            <button className="px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Adicionar Nova Integração */}
            <div className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-900/50 text-center">
                <Plus size={32} className="mx-auto text-purple-400 mb-2" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white mb-1">Solicitar Nova Integração</h4>
                <p className="text-xs text-slate-500 mb-4">Precisa de uma integração personalizada? Entre em contato com nosso suporte.</p>
                <button className="px-6 py-2 bg-purple-500 text-white rounded-xl text-xs font-black uppercase hover:bg-purple-600 transition-colors">
                    Solicitar Integração
                </button>
            </div>
        </section>
    );
};

// CONTINUA... (Arquivo muito grande, vou criar parte 2)

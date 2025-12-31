/**
 * SEÇÕES DESENVOLVIDAS PARA SETTINGS - PARTE 2
 * Continuação das implementações detalhadas
 */

// ============================================================================
// 5. E-MAIL & COMUNICAÇÃO - DESENVOLVIDA
// ============================================================================
const EmailCommunicationSection = () => (
    <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-8 rounded-[32px] border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500 rounded-xl text-white">
                <Mail size={20} />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">E-mail & Comunicação Avançada</h3>
                <p className="text-[10px] text-slate-500 font-medium">Configuração SMTP, templates e automações de comunicação</p>
            </div>
        </div>

        {/* Configuração SMTP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Servidor SMTP</h4>
                <div className="space-y-2">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Provedor</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm">
                            <option>Gmail (smtp.gmail.com)</option>
                            <option>Outlook (smtp-mail.outlook.com)</option>
                            <option>SendGrid</option>
                            <option>Amazon SES</option>
                            <option>Personalizado</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Porta</label>
                            <input type="number" defaultValue="587" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Segurança</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm">
                                <option>TLS</option>
                                <option>SSL</option>
                                <option>Nenhuma</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">E-mail Remetente</label>
                        <input type="email" defaultValue="noreply@infracore.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block flex items-center justify-between">
                            <span>Senha / App Password</span>
                            <button className="text-blue-500 hover:text-blue-600">
                                <Eye size={14} />
                            </button>
                        </label>
                        <input type="password" defaultValue="••••••••••••" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 font-bold text-sm" />
                    </div>
                </div>
            </div>

            {/* Templates de E-mail */}
            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Templates de E-mail</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {[
                        { name: 'Boas-vindas Novo Cliente', status: 'Ativo', lastEdit: '15/12/2024' },
                        { name: 'Confirmação de Pedido', status: 'Ativo', lastEdit: '10/12/2024' },
                        { name: 'Lembrete de Pagamento', status: 'Ativo', lastEdit: '08/12/2024' },
                        { name: 'Nota Fiscal Emitida', status: 'Ativo', lastEdit: '05/12/2024' },
                        { name: 'Orçamento Aprovado', status: 'Ativo', lastEdit: '01/12/2024' },
                        { name: 'Aviso de Vencimento', status: 'Ativo', lastEdit: '28/11/2024' },
                        { name: 'Agradecimento Pós-Venda', status: 'Inativo', lastEdit: '20/11/2024' },
                        { name: 'Pesquisa de Satisfação', status: 'Ativo', lastEdit: '15/11/2024' },
                    ].map(template => (
                        <div key={template.name} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{template.name}</h5>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${template.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {template.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Editado: {template.lastEdit}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg">
                                        <Edit2 size={12} className="text-blue-500" />
                                    </button>
                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg">
                                        <Copy size={12} className="text-slate-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-blue-50 rounded-lg">
                                        <Eye size={12} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full py-3 bg-blue-500 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Criar Novo Template
                </button>
            </div>
        </div>

        {/* Automações de E-mail */}
        <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-900/30">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-4">Automações de Comunicação</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { trigger: 'Novo Cliente Cadastrado', action: 'Enviar e-mail de boas-vindas', enabled: true },
                    { trigger: 'Pedido Confirmado', action: 'Enviar confirmação com detalhes', enabled: true },
                    { trigger: '3 dias antes do vencimento', action: 'Lembrete de pagamento', enabled: true },
                    { trigger: 'Pagamento Recebido', action: 'Agradecimento e recibo', enabled: true },
                    { trigger: 'Orçamento sem resposta (7 dias)', action: 'Follow-up automático', enabled: false },
                    { trigger: 'Aniversário do Cliente', action: 'Mensagem personalizada', enabled: false },
                ].map(automation => (
                    <div key={automation.trigger} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{automation.trigger}</p>
                                <p className="text-[10px] text-slate-500">{automation.action}</p>
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${automation.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${automation.enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Teste de Conexão */}
        <div className="mt-6 flex gap-3">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2">
                <Zap size={14} /> Testar Conexão SMTP
            </button>
            <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-black uppercase hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Mail size={14} /> Enviar E-mail de Teste
            </button>
            <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs font-black uppercase hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Download size={14} /> Exportar Configuração
            </button>
        </div>
    </section>
);

// ============================================================================
// 7. INTERFACE & UX - DESENVOLVIDA
// ============================================================================
// (Já implementada no arquivo principal)

// ============================================================================
// 8. DADOS & SEGURANÇA - DETALHADA
// ============================================================================
const DataSecuritySection = () => (
    <section className="bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900/50 dark:to-zinc-900/30 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-slate-700 rounded-xl text-white">
                <ShieldCheck size={20} />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Dados, Segurança & Compliance</h3>
                <p className="text-[10px] text-slate-500 font-medium">Backup, criptografia, LGPD e políticas de retenção</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Backup Automático */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Cloud size={24} className="text-blue-500" />
                        <div>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">Backup Automático</h4>
                            <p className="text-[10px] text-slate-500">Última execução: 30/12/2024 23:45</p>
                        </div>
                    </div>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Frequência</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-bold text-sm">
                            <option>A cada 6 horas</option>
                            <option>Diário (Recomendado)</option>
                            <option>Semanal</option>
                            <option>Mensal</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Horário Preferencial</label>
                        <input type="time" defaultValue="23:00" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-bold text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Retenção de Backups</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-bold text-sm">
                            <option>7 dias</option>
                            <option>30 dias (Recomendado)</option>
                            <option>90 dias</option>
                            <option>1 ano</option>
                            <option>Permanente</option>
                        </select>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-600 dark:text-slate-400">Espaço Utilizado</span>
                            <span className="font-black text-blue-600">2.4 GB / 50 GB</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '4.8%' }}></div>
                        </div>
                    </div>
                    <button className="w-full mt-3 py-3 bg-blue-500 text-white rounded-xl text-xs font-black uppercase hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <Download size={14} /> Executar Backup Agora
                    </button>
                </div>
            </div>

            {/* Criptografia */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <Lock size={24} className="text-amber-500" />
                    <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Criptografia de Dados</h4>
                        <p className="text-[10px] text-slate-500">Proteção end-to-end</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Dados em Trânsito (TLS 1.3)', enabled: true, level: 'Máxima' },
                        { label: 'Dados em Repouso (AES-256)', enabled: true, level: 'Máxima' },
                        { label: 'Senhas (bcrypt)', enabled: true, level: 'Alta' },
                        { label: 'Documentos Fiscais', enabled: true, level: 'Máxima' },
                        { label: 'Dados Financeiros', enabled: true, level: 'Máxima' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md mt-1 inline-block ${item.level === 'Máxima' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {item.level}
                                </span>
                            </div>
                            <CheckCircle size={18} className="text-emerald-500" />
                        </div>
                    ))}
                </div>
            </div>

            {/* LGPD & Compliance */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <Scale size={24} className="text-purple-500" />
                    <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">LGPD & Compliance</h4>
                        <p className="text-[10px] text-slate-500">Conformidade legal</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'Termo de Consentimento', status: 'Configurado' },
                        { label: 'Política de Privacidade', status: 'Atualizada' },
                        { label: 'Direito ao Esquecimento', status: 'Ativo' },
                        { label: 'Portabilidade de Dados', status: 'Ativo' },
                        { label: 'Registro de Atividades', status: 'Ativo' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                                {item.status}
                            </span>
                        </div>
                    ))}
                    <button className="w-full mt-3 py-2 bg-purple-500 text-white rounded-xl text-xs font-black uppercase hover:bg-purple-600 transition-colors">
                        Gerar Relatório LGPD
                    </button>
                </div>
            </div>
        </div>

        {/* Políticas de Retenção Detalhadas */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-4">Políticas de Retenção de Dados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { type: 'Logs de Auditoria', period: '12 meses', size: '450 MB' },
                    { type: 'Transações Financeiras', period: 'Permanente', size: '1.2 GB' },
                    { type: 'Documentos Fiscais (XML)', period: '5 anos', size: '850 MB' },
                    { type: 'E-mails Enviados', period: '6 meses', size: '320 MB' },
                    { type: 'Histórico de Vendas', period: 'Permanente', size: '680 MB' },
                    { type: 'Dados de Clientes Inativos', period: '2 anos', size: '180 MB' },
                    { type: 'Relatórios Gerenciais', period: '3 anos', size: '240 MB' },
                    { type: 'Backups Incrementais', period: '30 dias', size: '2.1 GB' },
                ].map(policy => (
                    <div key={policy.type} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-2">{policy.type}</h5>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-500">Retenção:</span>
                            <span className="text-[10px] font-black text-emerald-600">{policy.period}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Tamanho:</span>
                            <span className="text-[10px] font-black text-blue-600">{policy.size}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Ações de Segurança */}
        <div className="mt-6 flex gap-3 flex-wrap">
            <button className="px-6 py-3 bg-slate-700 text-white rounded-xl text-xs font-black uppercase hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Download size={14} /> Exportar Dados (LGPD)
            </button>
            <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-colors flex items-center gap-2">
                <FileText size={14} /> Relatório de Conformidade
            </button>
            <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Key size={14} /> Gerenciar Chaves de Criptografia
            </button>
        </div>
    </section>
);

// CONTINUA NA PARTE 3...

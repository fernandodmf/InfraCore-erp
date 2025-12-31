
export const APP_PERMISSIONS = [
    {
        category: 'Sistema & Administração',
        permissions: [
            { id: 'all', name: 'Super Admin', description: 'Acesso total e irrestrito (Cuidado!)' },
            { id: 'settings.view', name: 'Ver Configurações', description: 'Visualizar painel de controle' },
            { id: 'settings.edit', name: 'Editar Parâmetros', description: 'Alterar configurações globais' },
            { id: 'users.view', name: 'Ver Usuários', description: 'Listar usuários do sistema' },
            { id: 'users.manage', name: 'Gerir Usuários', description: 'Criar, editar e remover usuários' },
            { id: 'roles.view', name: 'Ver Perfis', description: 'Visualizar cargos e permissões' },
            { id: 'roles.manage', name: 'Gerir Permissões', description: 'Editar níveis de acesso' },
            { id: 'audit.view', name: 'Ver Auditoria', description: 'Consultar logs de sistema' },
            { id: 'audit.export', name: 'Exportar Logs', description: 'Baixar histórico de atividades' },
            { id: 'backup.manage', name: 'Gerir Backups', description: 'Realizar e restaurar backups' },
            { id: 'notifications.broadcast', name: 'Enviar Alertas', description: 'Notificar todos os usuários' },
        ]
    },
    {
        category: 'Comercial & CRM',
        permissions: [
            { id: 'sales.view', name: 'Ver Vendas', description: 'Listar pedidos e orçamentos' },
            { id: 'sales.view_all', name: 'Ver Todas Vendas', description: 'Ver vendas de outros vendedores' },
            { id: 'sales.create', name: 'Criar Pedidos', description: 'Lançar novas vendas' },
            { id: 'sales.edit', name: 'Editar Pedidos', description: 'Alterar pedidos em aberto' },
            { id: 'sales.cancel', name: 'Cancelar Vendas', description: 'Cancelar pedidos já confirmados' },
            { id: 'sales.approve', name: 'Aprovar Comercial', description: 'Liberar pedidos bloqueados' },
            { id: 'sales.discount', name: 'Desconto Livre', description: 'Aplicar descontos acima do padrão' },
            { id: 'sales.price_edit', name: 'Editar Preços', description: 'Alterar preço unitário na venda' },
            { id: 'clients.view', name: 'Ver Clientes', description: 'Consultar base de clientes' },
            { id: 'clients.manage', name: 'Gerir Clientes', description: 'Cadastrar e editar clientes' },
            { id: 'clients.credit', name: 'Definir Limite', description: 'Alterar limite de crédito' },
            { id: 'crm.leads', name: 'Gerir Leads', description: 'Acesso ao funil de oportunidades' },
        ]
    },
    {
        category: 'Compras & Suprimentos',
        permissions: [
            { id: 'purchases.view', name: 'Ver Pedidos', description: 'Consultar compras realizadas' },
            { id: 'purchases.create', name: 'Requisitar Compra', description: 'Solicitar materiais' },
            { id: 'purchases.approve_level1', name: 'Aprovar (Nível 1)', description: 'Aprovar compras até R$ 5k' },
            { id: 'purchases.approve_level2', name: 'Aprovar (Nível 2)', description: 'Aprovar compras ilimitadas' },
            { id: 'purchases.cancel', name: 'Cancelar Compras', description: 'Cancelar pedidos a fornecedores' },
            { id: 'suppliers.view', name: 'Ver Fornecedores', description: 'Listar base de fornecedores' },
            { id: 'suppliers.manage', name: 'Gerir Fornecedores', description: 'Cadastrar/Editar fornecedores' },
            { id: 'suppliers.bank_data', name: 'Dados Bancários', description: 'Ver dados de pagamento sensíveis' },
        ]
    },
    {
        category: 'Financeiro',
        permissions: [
            { id: 'finance.dashboard', name: 'Ver Dashboard', description: 'Visão geral de caixa' },
            { id: 'finance.payables', name: 'Contas a Pagar', description: 'Gerir obrigações financeiras' },
            { id: 'finance.receivables', name: 'Contas a Receber', description: 'Gerir entradas previstas' },
            { id: 'finance.transact', name: 'Lançar Movimento', description: 'Inserir receitas/despesas manuais' },
            { id: 'finance.approve', name: 'Autorizar Pagto', description: 'Aprovar baixas bancárias' },
            { id: 'finance.reconcile', name: 'Conciliação', description: 'Conferência bancária' },
            { id: 'finance.accounts', name: 'Gerir Contas', description: 'Cadastrar bancos e caixas' },
            { id: 'finance.dre', name: 'Ver DRE', description: 'Relatório de Resultados (Sensível)' },
            { id: 'finance.reports', name: 'Relatórios Fin.', description: 'Exportar dados financeiros' },
        ]
    },
    {
        category: 'Estoque & Produção',
        permissions: [
            { id: 'inventory.view', name: 'Ver Estoque', description: 'Consultar saldos atuais' },
            { id: 'inventory.move', name: 'Movimentar', description: 'Entrada/Saída manual' },
            { id: 'inventory.adjust', name: 'Ajuste de Saldo', description: 'Correção de inventário (Perda/Sobra)' },
            { id: 'inventory.cost_view', name: 'Ver Custos', description: 'Visualizar preço de custo' },
            { id: 'production.plan', name: 'Planejar PCP', description: 'Criar ordens de produção' },
            { id: 'production.execute', name: 'Apontar Produção', description: 'Registrar execução no chão de fábrica' },
            { id: 'formulas.read', name: 'Ver Fórmulas', description: 'Consultar fichas técnicas' },
            { id: 'formulas.write', name: 'Editar Eng.', description: 'Alterar composição de produtos' },
        ]
    },
    {
        category: 'Logística & Frota',
        permissions: [
            { id: 'fleet.view', name: 'Ver Frota', description: 'Consultar veículos' },
            { id: 'fleet.manage', name: 'Gerir Veículos', description: 'Cadastrar/Editar frota' },
            { id: 'fuel.log', name: 'Lançar Abast.', description: 'Registrar abastecimentos' },
            { id: 'maintenance.create', name: 'Abrir OS', description: 'Solicitar manutenção' },
            { id: 'maintenance.approve', name: 'Aprovar OS', description: 'Autorizar custos de manutenção' },
            { id: 'tires.manage', name: 'Gestão de Pneus', description: 'Controle de vida útil e rodízio' },
            { id: 'drivers.manage', name: 'Gerir Motoristas', description: 'Cadastro de condutores' },
        ]
    },
    {
        category: 'Recursos Humanos',
        permissions: [
            { id: 'employees.view', name: 'Ver Lista', description: 'Diretório de colaboradores' },
            { id: 'employees.manage', name: 'Admissão/Demissão', description: 'Gestão contratual completa' },
            { id: 'salary.view', name: 'Ver Salários', description: 'Acesso a dados salariais (Restrito)' },
            { id: 'payroll.process', name: 'Processar Folha', description: 'Cálculo de pagamentos' },
            { id: 'vacation.manage', name: 'Controle Férias', description: 'Gerir cronograma de férias' },
            { id: 'point.manage', name: 'Espelho de Ponto', description: 'Ajuste de jornada e horas' },
        ]
    },
    {
        category: 'Inteligência (BI)',
        permissions: [
            { id: 'reports.basic', name: 'Relatórios Básicos', description: 'Listagens simples' },
            { id: 'reports.advanced', name: 'Relatórios BI', description: 'Análise de dados complexa' },
            { id: 'dashboard.custom', name: 'Editar Dashboard', description: 'Personalizar visão geral' },
        ]
    }
];

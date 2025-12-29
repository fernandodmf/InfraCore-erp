
export const APP_PERMISSIONS = [
    {
        category: 'Sistema',
        permissions: [
            { id: 'all', name: 'Administrador Total', description: 'Acesso irrestrito a todo o sistema' },
            { id: 'settings.view', name: 'Visualizar Configurações', description: 'Acesso ao painel de controle e parâmetros' },
            { id: 'settings.edit', name: 'Editar Parâmetros', description: 'Alterar configurações globais do ERP' },
            { id: 'audit.view', name: 'Visualizar Auditoria', description: 'Consultar logs de atividades do sistema' },
            { id: 'audit.export', name: 'Exportar Logs', description: 'Baixar relatórios de auditoria e segurança' },
        ]
    },
    {
        category: 'Comercial & Vendas',
        permissions: [
            { id: 'sales.view', name: 'Visualizar Vendas', description: 'Consultar histórico de vendas e orçamentos' },
            { id: 'sales.create', name: 'Criar Vendas', description: 'Lançar novos pedidos e orçamentos' },
            { id: 'sales.edit', name: 'Editar Vendas', description: 'Alterar pedidos já lançados (Admin)' },
            { id: 'sales.delete', name: 'Excluir Vendas', description: 'Remover registros de vendas permanentemente' },
            { id: 'sales.approve', name: 'Aprovar Orçamentos', description: 'Autorizar propostas comerciais' },
            { id: 'sales.discount', name: 'Aplicar Descontos', description: 'Autorização para descontos manuais' },
            { id: 'clients.manage', name: 'Gerir Clientes', description: 'Cadastrar, editar e remover clientes' },
            { id: 'crm.view', name: 'Acesso CRM', description: 'Visualizar funil de vendas e leads' },
        ]
    },
    {
        category: 'Compras & Suprimentos',
        permissions: [
            { id: 'purchases.view', name: 'Visualizar Compras', description: 'Consultar pedidos de compra' },
            { id: 'purchases.create', name: 'Solicitar Compras', description: 'Criar requisições de compra' },
            { id: 'purchases.approve', name: 'Aprovar Compras', description: 'Aprovar pedidos de compra de terceiros' },
            { id: 'purchases.receive', name: 'Receber Mercadoria', description: 'Dar entrada em notas fiscais e estoque' },
            { id: 'suppliers.manage', name: 'Gerir Fornecedores', description: 'Cadastrar e editar base de fornecedores' },
        ]
    },
    {
        category: 'Financeiro',
        permissions: [
            { id: 'finance.view', name: 'Visualizar Financeiro', description: 'Acesso a dashboard, saldos e extratos' },
            { id: 'finance.transact', name: 'Lançar Transações', description: 'Adicionar receitas e despesas manuais' },
            { id: 'finance.reconcile', name: 'Conciliar Contas', description: 'Marcar transações como pagas/recebidas' },
            { id: 'finance.approve', name: 'Aprovar Pagamentos', description: 'Autorizar saídas de caixa' },
            { id: 'finance.in', name: 'Inserir Pagamentos', description: 'Inserir pagamentos' },
            { id: 'accounts.manage', name: 'Gerir Contas Bancárias', description: 'Adicionar/Editar contas e caixas' },
            { id: 'ledger.manage', name: 'Gerir Plano de Contas', description: 'Editar categorias e estrutura contábil' },
            { id: 'finance.export', name: 'Exportar Relatórios', description: 'Gerar Excel/PDF de dados financeiros' },
            { id: 'finance.delete', name: 'Excluir Transações', description: 'Excluir transações' },
        ]
    },
    {
        category: 'Estoque & Produção',
        permissions: [
            { id: 'inventory.view', name: 'Visualizar Estoque', description: 'Consultar saldos e movimentações' },
            { id: 'inventory.edit', name: 'Ajuste de Estoque', description: 'Entrada/Saída manual e correções' },
            { id: 'inventory.audit', name: 'Auditoria de Inventário', description: 'Realizar balanço e contagem física' },
            { id: 'production.view', name: 'Visualizar Produção', description: 'Ver ordens de produção e status' },
            { id: 'production.manage', name: 'Planejar Produção', description: 'Criar ordens de produção (PCP)' },
            { id: 'production.execute', name: 'Apontar Produção', description: 'Registrar produção no chão de fábrica' },
            { id: 'formulas.manage', name: 'Engenharia de Produto', description: 'Criar e editar fichas técnicas/fórmulas' },
        ]
    },
    {
        category: 'Logística & Frota',
        permissions: [
            { id: 'fleet.view', name: 'Visualizar Frota', description: 'Consultar veículos e motoristas' },
            { id: 'fleet.manage', name: 'Gestão de Veículos', description: 'Cadastrar veículos e documentação' },
            { id: 'maintenance.manage', name: 'Gestão de Manutenção', description: 'Lançar e gerir ordens de serviço' },
            { id: 'fuel.manage', name: 'Controle de Combustível', description: 'Lançar abastecimentos' },
            { id: 'tires.manage', name: 'Gestão de Pneus', description: 'Controle de rodízio e vida útil' },
        ]
    },
    {
        category: 'Recursos Humanos',
        permissions: [
            { id: 'employees.view', name: 'Visualizar Colaboradores', description: 'Consultar lista de funcionários' },
            { id: 'employees.manage', name: 'Gestão de Pessoal', description: 'Admissão e dados cadastrais' },
            { id: 'payroll.view', name: 'Visualizar Folha', description: 'Ver holerites e cálculos de pagamento' },
            { id: 'payroll.manage', name: 'Processar Folha', description: 'Gerar folha de pagamento e adiantamentos' },
            { id: 'vacation.manage', name: 'Gestão de Férias', description: 'Aprovar e agendar férias' },
            { id: 'point.view', name: 'Visualizar Pontos', description: 'Consultar ponto' },
            { id: 'point.manage', name: 'Gestão de Ponto', description: 'Gerenciar ponto' },
            { id: 'point.approve', name: 'Aprovar Ponto', description: 'Aprovar ponto' },
            { id: 'point.in', name: 'Inserir Ponto', description: 'Inserir ponto' },
            { id: 'point.delete', name: 'Excluir Ponto', description: 'Excluir ponto' },
        ]
    },
    {
        category: 'Relatórios & BI',
        permissions: [
            { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Acesso a relatórios básicos' },
            { id: 'reports.create', name: 'Criar Relatórios', description: 'Gerador de relatórios personalizados' },
            { id: 'bi.view', name: 'Acesso BI', description: 'Dashboards avançados e KPIs' },
        ]
    }
];

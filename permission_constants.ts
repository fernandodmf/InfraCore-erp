
export const APP_PERMISSIONS = [
    {
        category: 'Sistema',
        permissions: [
            { id: 'all', name: 'Administrador Total', description: 'Acesso irrestrito a todo o sistema' },
            { id: 'settings.view', name: 'Acessar Configurações', description: 'Visualizar painel de controle' },
            { id: 'settings.edit', name: 'Editar Configurações', description: 'Alterar parâmetros globais' },
            { id: 'users.manage', name: 'Gerir Usuários', description: 'Criar, editar e remover usuários' },
        ]
    },
    {
        category: 'Comercial',
        permissions: [
            { id: 'sales.view', name: 'Visualizar Vendas', description: 'Ver histórico de vendas e orçamentos' },
            { id: 'sales.create', name: 'Criar Vendas', description: 'Lançar novas vendas e orçamentos' },
            { id: 'sales.approve', name: 'Aprovar Orçamentos', description: 'Aprovar ou rejeitar orçamentos' },
            { id: 'clients.manage', name: 'Gerir Clientes', description: 'Cadastrar e editar clientes' },
        ]
    },
    {
        category: 'Compras',
        permissions: [
            { id: 'purchases.view', name: 'Visualizar Compras', description: 'Ver pedidos de compra' },
            { id: 'purchases.create', name: 'Criar Pedidos', description: 'Solicitar compras' },
            { id: 'purchases.approve', name: 'Aprovar Pedidos', description: 'Aprovar solicitações de compra' },
        ]
    },
    {
        category: 'Financeiro',
        permissions: [
            { id: 'finance.view', name: 'Visualizar Financeiro', description: 'Ver fluxo de caixa e relatórios' },
            { id: 'finance.transact', name: 'Lançar Transações', description: 'Adicionar receitas e despesas' },
            { id: 'finance.approve', name: 'Aprovar Pagamentos', description: 'Autorizar pagamentos e transferências' },
            { id: 'finance.admin', name: 'Gestão Financeira Total', description: 'Controle total de contas e DRE' },
        ]
    },
    {
        category: 'Estoque & Produção',
        permissions: [
            { id: 'inventory.view', name: 'Visualizar Estoque', description: 'Consultar níveis de estoque' },
            { id: 'inventory.edit', name: 'Movimentar Estoque', description: 'Dar entrada e saída manual' },
            { id: 'production.view', name: 'Visualizar Produção', description: 'Ver ordens de produção' },
            { id: 'production.manage', name: 'Gerir Produção', description: 'Criar ordens e fórmulas' },
        ]
    },
    {
        category: 'Logística & Frota',
        permissions: [
            { id: 'fleet.view', name: 'Visualizar Frota', description: 'Ver status dos veículos' },
            { id: 'fleet.manage', name: 'Gerir Frota', description: 'Cadastrar veículos e manutenções' },
        ]
    },
    {
        category: 'Recursos Humanos',
        permissions: [
            { id: 'employees.view', name: 'Visualizar Colaboradores', description: 'Ver lista de funcionários' },
            { id: 'employees.manage', name: 'Gerir RH', description: 'Admissão, Férias e Folha' },
        ]
    }
];

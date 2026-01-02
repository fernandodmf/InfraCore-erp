
import {
    Client, Supplier, Employee, InventoryItem, FleetVehicle,
    Transaction, Sale, Budget, PurchaseOrder, MaintenanceRecord,
    FuelLog, AuditLog, AppSettings, ProductionOrder,
    ProductionFormula, ProductionUnit, StockMovement
} from '../../types';

// Helpers
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

export const generateCameloData = () => {
    const today = new Date();
    const startDate = new Date(new Date().setFullYear(today.getFullYear() - 3)); // 3 Years History

    // 1. SETTINGS - Industrial Focus
    const settings: AppSettings = {
        companyName: 'Camelo Mineração & Pavimentação Ltda',
        tradeName: 'Camelo Aggregates',
        document: '45.123.456/0001-89',
        email: 'comercial@camelomineracao.com.br',
        phone: '(11) 3090-5500',
        address: 'Rodovia dos Bandeirantes, Km 45 - Cajamar, SP',
        currency: 'BRL',
        language: 'pt-BR',
        theme: 'dark',
        bankDetails: {
            bankName: 'Banco Safra',
            agency: '0045',
            account: '123450-9',
            pixKey: '45.123.456/0001-89',
            pixType: 'CNPJ'
        },
        notifications: { stockAlerts: true, overdueFinance: true, productionUpdates: true, fleetMaintenance: true },
        technical: { taxRegime: 'Lucro Real', defaultTaxRate: 18.5, financialYearStart: '01/01', dateFormat: 'DD/MM/YYYY', timezone: 'America/Sao_Paulo' },
        backup: { autoBackup: true, frequency: 'daily', lastBackup: new Date().toISOString() },
        operational: { minMargin: 15, defaultPaymentTerm: 28, safetyStock: 30 },
        integrations: {},
        emailConfig: { smtpServer: 'smtp.camelo.com', smtpPort: 587, senderEmail: 'sistema@camelo.com' },
        documents: { printerMain: 'HP Laserjet', printerThermal: 'Zebra', margins: 10, copies: 1, showLogo: true, watermarkDraft: true, qrCode: true, autoNumbering: true, digitalSignature: false, customFooter: true, barcode: true, authSeal: true },
        performance: { cacheSize: 500, imageQuality: 80, autoCompression: true, lazyLoading: true, preloading: true, gzip: true, autoIndexing: true, queryCache: true, minifyAssets: true, cdn: false, dbPooling: true }
    };

    // 2. PRODUCTION UNITS (Usinas)
    const productionUnits: ProductionUnit[] = [
        { id: 'unit-1', name: 'Britador Primário Metso (Mandíbula)', type: 'Britagem', status: 'Operando', capacity: '400 ton/h', currentLoad: 85, temp: 65, power: '250kW', location: 'Pedreira Setor A' },
        { id: 'unit-2', name: 'Britador Secundário Cônico', type: 'Britagem', status: 'Operando', capacity: '350 ton/h', currentLoad: 80, temp: 72, power: '200kW', location: 'Pedreira Setor B' },
        { id: 'unit-3', name: 'Usina de Asfalto CIBER iNOVA', type: 'Usina Asfalto', status: 'Operando', capacity: '120 ton/h', currentLoad: 60, temp: 165, power: '180kW', location: 'Pátio Industrial' },
        { id: 'unit-4', name: 'Central de Concreto Liebherr', type: 'Usina Concreto', status: 'Operando', capacity: '60 m³/h', currentLoad: 45, temp: 28, power: '110kW', location: 'Pátio Industrial' },
    ];

    // 3. INVENTORY & FORMULAS
    const inventory: InventoryItem[] = [
        // Matéria Prima / Extração
        { id: 'mat-1', name: 'Rocha Detonada (Gnaisse)', category: 'Matéria Prima', quantity: 15000, unit: 'ton', price: 0, costPrice: 12.50, minStock: 5000, location: 'Pilha Pulmão' },

        // Produtos Britagem (Intermediários/Finais)
        { id: 'prod-1', name: 'Pó de Pedra', category: 'Agregado', quantity: 2500, unit: 'ton', price: 45.00, costPrice: 18.00, minStock: 500, location: 'Baia 1' },
        { id: 'prod-2', name: 'Brita 0 (Pedrisco)', category: 'Agregado', quantity: 1800, unit: 'ton', price: 55.00, costPrice: 22.00, minStock: 400, location: 'Baia 2' },
        { id: 'prod-3', name: 'Brita 1', category: 'Agregado', quantity: 3200, unit: 'ton', price: 58.00, costPrice: 22.00, minStock: 600, location: 'Baia 3' },
        { id: 'prod-4', name: 'Rachão', category: 'Agregado', quantity: 5000, unit: 'ton', price: 38.00, costPrice: 15.00, minStock: 1000, location: 'Baia 4' },
        { id: 'prod-5', name: 'Areia Industrial', category: 'Agregado', quantity: 1200, unit: 'ton', price: 65.00, costPrice: 25.00, minStock: 200, location: 'Baia 5' },

        // Insumos Externos
        { id: 'ins-1', name: 'Cimento CP-V ARI (Granel)', category: 'Insumo', quantity: 120, unit: 'ton', price: 0, costPrice: 480.00, minStock: 30, supplierId: 'sup-1', location: 'Silo 1' },
        { id: 'ins-2', name: 'CAP 50/70 (Betume)', category: 'Insumo', quantity: 45, unit: 'ton', price: 0, costPrice: 3800.00, minStock: 15, supplierId: 'sup-2', location: 'Tanque Aquecido' },
        { id: 'ins-3', name: 'Aditivo Plastificante', category: 'Insumo', quantity: 2000, unit: 'L', price: 0, costPrice: 12.50, minStock: 200, supplierId: 'sup-3', location: 'Almoxarifado' },

        // Produtos Usinados (Nao estocáveis por muito tempo, mas listados para venda)
        { id: 'usn-1', name: 'Concreto FCK 25 Mpa', category: 'Concreto', quantity: 0, unit: 'm³', price: 420.00, costPrice: 310.00, minStock: 0 },
        { id: 'usn-2', name: 'Concreto FCK 40 Mpa', category: 'Concreto', quantity: 0, unit: 'm³', price: 480.00, costPrice: 360.00, minStock: 0 },
        { id: 'usn-3', name: 'CBUQ Faixa C (Capa)', category: 'Asfalto', quantity: 0, unit: 'ton', price: 550.00, costPrice: 420.00, minStock: 0 },
    ];

    const formulas: ProductionFormula[] = [
        {
            id: 'form-1', name: 'Concreto FCK 25 Padrão', category: 'Concreto',
            ingredients: [
                { productId: 'ins-1', name: 'Cimento', qty: 300, unit: 'kg' },
                { productId: 'prod-5', name: 'Areia', qty: 800, unit: 'kg' },
                { productId: 'prod-3', name: 'Brita 1', qty: 950, unit: 'kg' },
                { productId: 'ins-3', name: 'Aditivo', qty: 2.5, unit: 'L' }
            ],
            outputProductId: 'usn-1'
        },
        {
            id: 'form-2', name: 'Massa Asfáltica (CBUQ)', category: 'Asfalto',
            ingredients: [
                { productId: 'ins-2', name: 'CAP 50/70', qty: 52, unit: 'kg' },
                { productId: 'prod-1', name: 'Pó de Pedra', qty: 450, unit: 'kg' },
                { productId: 'prod-2', name: 'Pedrisco', qty: 300, unit: 'kg' },
                { productId: 'prod-3', name: 'Brita 1', qty: 200, unit: 'kg' }
            ],
            outputProductId: 'usn-3'
        }
    ];

    // 4. FLEET - Pesada
    const fleet: FleetVehicle[] = [
        { id: 'eq-1', name: 'Escavadeira CAT 336D', plate: 'CAT-336-01', type: 'Máquina', status: 'Operacional', km: 12500, fuelType: 'Diesel', brand: 'Caterpillar', model: '336D', year: 2020 },
        { id: 'eq-2', name: 'Carregadeira Volvo L120', plate: 'VOL-120-01', type: 'Máquina', status: 'Operacional', km: 18000, fuelType: 'Diesel', brand: 'Volvo', model: 'L120H', year: 2019 },
        { id: 'eq-3', name: 'Carregadeira Volvo L120', plate: 'VOL-120-02', type: 'Máquina', status: 'Manutenção', km: 22000, fuelType: 'Diesel', brand: 'Volvo', model: 'L120H', year: 2018 },
        { id: 'eq-4', name: 'Perfuratriz PW5000', plate: 'PRF-01', type: 'Máquina', status: 'Operacional', km: 5000, fuelType: 'Diesel', brand: 'Wolf', model: 'Fox 8-20', year: 2021 },
        { id: 'cam-1', name: 'Scania G500 XT 8x4', plate: 'EXT-9090', type: 'Caminhão', status: 'Operacional', km: 85000, fuelType: 'Diesel', brand: 'Scania', model: 'G500 XT', year: 2022 },
        { id: 'bt-1', name: 'Betoneira Mercedes Axor 01', plate: 'BET-0001', type: 'Caminhão', status: 'Em Rota', km: 65000, fuelType: 'Diesel', brand: 'Mercedes', model: 'Axor 3131', year: 2021 },
        { id: 'bt-2', name: 'Betoneira Mercedes Axor 02', plate: 'BET-0002', type: 'Caminhão', status: 'Operacional', km: 45000, fuelType: 'Diesel', brand: 'Mercedes', model: 'Axor 3131', year: 2022 },
        { id: 'bt-3', name: 'Betoneira VW Constellation', plate: 'BET-0003', type: 'Caminhão', status: 'Em Rota', km: 110000, fuelType: 'Diesel', brand: 'VW', model: '26.280', year: 2019 },
        { id: 'ut-1', name: 'Toyota Hilux Apoio', plate: 'APO-5555', type: 'Carro', status: 'Operacional', km: 89000, fuelType: 'Diesel', brand: 'Toyota', model: 'Hilux SRV', year: 2021 }
    ];

    // 5. PEOPLE
    const employees: Employee[] = [
        { id: 'emp-1', name: 'Eng. Ricardo Montanha', role: 'Gerente Industrial', department: 'Produção', status: 'Ativo', admissionDate: '01/01/2019', salary: 18000, email: 'ricardo@camelo.com' },
        { id: 'emp-2', name: 'João da Silva', role: 'Operador de Usina (Asfalto)', department: 'Produção', status: 'Ativo', admissionDate: '15/03/2020', salary: 5500 },
        { id: 'emp-3', name: 'Pedro Santos', role: 'Operador de Usina (Concreto)', department: 'Produção', status: 'Ativo', admissionDate: '20/05/2021', salary: 5500 },
        { id: 'emp-4', name: 'Marcos Oliveira', role: 'Mecânico Chefe', department: 'Manutenção', status: 'Ativo', admissionDate: '10/02/2020', salary: 7000 },
        { id: 'emp-5', name: 'Ana Souza', role: 'Laboratorista', department: 'Qualidade', status: 'Ativo', admissionDate: '01/08/2021', salary: 4500 },
        { id: 'emp-6', name: 'Carlos Ferreira', role: 'Motorista Betoneira', department: 'Logística', status: 'Ativo', admissionDate: '15/01/2022', salary: 3800 },
    ];

    const clients: Client[] = [
        { id: 'cli-1', name: 'ConstruVias Pavimentação', document: '12.123.123/0001-12', email: 'compras@construvias.com', phone: '(11) 4000-1111', status: 'Ativo', type: 'Parceiro', registeredAt: '01/01/2022', initials: 'CVS', colorClass: 'bg-slate-700' },
        { id: 'cli-2', name: 'Prefeitura de Cajamar', document: 'Isento', email: 'obras@cajamar.sp.gov.br', phone: '(11) 4447-0000', status: 'Ativo', type: 'Parceiro', registeredAt: '15/02/2022', initials: 'PMCJ', colorClass: 'bg-blue-600' },
        { id: 'cli-3', name: 'Tecnisa Incorporadora', document: '33.333.333/0001-33', email: 'suprimentos@tecnisa.com.br', phone: '(11) 3000-2000', status: 'Ativo', type: 'Matriz', registeredAt: '10/01/2023', initials: 'TCN', colorClass: 'bg-red-600' },
    ];

    const suppliers: Supplier[] = [
        { id: 'sup-1', name: 'Votorantim Cimentos', document: '01.000.000/0001-00', category: 'Insumos', email: 'vendas@vcimentos.com', phone: '0800', status: 'Ativo', registeredAt: '01/01/2020', initials: 'VOT' },
        { id: 'sup-2', name: 'Petrobras Distribuidora', document: '02.000.000/0001-00', category: 'Betume', email: 'comercial@br.com.br', phone: '0800', status: 'Ativo', registeredAt: '01/01/2020', initials: 'BR' },
        { id: 'sup-3', name: 'Basf Aditivos', document: '03.000.000/0001-00', category: 'Químicos', email: 'vendas@basf.com', phone: '0800', status: 'Ativo', registeredAt: '01/01/2021', initials: 'BSF' },
        { id: 'sup-4', name: 'Dinamitex Explosivos', document: '04.000.000/0001-00', category: 'Serviços', email: 'contato@dinamitex.com', phone: '(11) 9999-8888', status: 'Ativo', registeredAt: '01/01/2021', initials: 'DNM' },
    ];

    // ARRAYS TO FILL
    const transactions: Transaction[] = [];
    const sales: Sale[] = [];
    const budgets: Budget[] = [];
    const purchaseOrders: PurchaseOrder[] = [];
    const maintenanceRecords: MaintenanceRecord[] = [];
    const fuelLogs: FuelLog[] = [];
    const stockMovements: StockMovement[] = [];
    const auditLogs: AuditLog[] = [];
    const productionOrders: ProductionOrder[] = [];

    let currentDate = new Date(startDate);
    let idCounter = 1;

    // SIMULATION LOOP (3 Years)
    while (currentDate <= today) {
        const dateStr = currentDate.toLocaleDateString('pt-BR');
        // const isoDate = currentDate.toISOString().split('T')[0];
        const day = currentDate.getDay();
        const isWorkDay = day !== 0; // Works on saturdays too in mining

        if (isWorkDay) {
            // 1. SALES (High Value, High Volume)
            if (Math.random() < 0.3) { // 30% chance per day
                const client = randomItem(clients);
                const item = randomItem(inventory.filter(i => i.price > 0)); // Only saleable items
                const qty = randomInt(5, 50); // m3 or tons
                const value = qty * item.price;

                const saleId = `sale-${idCounter}`;
                // Transaction/Sale Logic
                sales.push({
                    id: saleId, date: dateStr, clientId: client.id, clientName: client.name, status: 'Conciliado',
                    items: [{ id: item.id, name: item.name, detail: 'Fornecimento Padrão', quantity: qty, unit: item.unit, price: item.price * qty, originalPrice: item.price, originalUnit: item.unit, weight: qty * 1000 }],
                    paymentMethod: 'Faturamento 28dd', type: 'Receita', category: '1.01.01',
                    description: `Forn. ${item.name} - ${qty}${item.unit}`, accountId: 'acc-main', amount: value
                });

                transactions.push({
                    id: `tr-${idCounter++}`, date: dateStr, description: `Venda ${client.initials} - ${item.name}`,
                    category: '1.01.01', accountId: 'acc-main', amount: value, status: 'Conciliado', type: 'Receita',
                    partnerId: client.id, partnerName: client.name, documentNumber: `NF-${idCounter}`, originModule: 'Vendas', originId: saleId
                });

                // Stock Out
                if (item.quantity >= qty) item.quantity -= qty; // Decrease local counter for logic only
                stockMovements.push({
                    id: `mov-${idCounter}`, itemId: item.id, itemName: item.name, type: 'Saída', quantity: qty, date: dateStr, reason: 'Venda', documentId: saleId
                });
            }

            // 2. PRODUCTION (Consuming Raw, Creating Product)
            if (Math.random() < 0.2) {
                const formula = randomItem(formulas);
                const qtyProduced = randomInt(20, 100); // tons or m3

                productionOrders.push({
                    id: `ord-${idCounter++}`, orderNumber: `OP-${idCounter}`, productName: formula.name,
                    quantity: qtyProduced, status: 'Finalizado', startDate: dateStr, dueDate: dateStr, priority: 'Média',
                    progress: 100, formulaId: formula.id, unitId: formula.category === 'Concreto' ? 'unit-4' : 'unit-3',
                    batch: `LT-${dateStr.replace(/\//g, '')}-${randomInt(1, 9)}`
                });
                // Deduct ingredients logic implied in 'Finalizado' usually, but mock doesnt need complex calc
            }

            // 3. PURCHASES (Insumos)
            if (Math.random() < 0.05) { // Less frequent, bigger volume
                const supplier = randomItem(suppliers);
                const item = randomItem(inventory.filter(i => i.category === 'Insumo' && i.supplierId === supplier.id));
                if (item) {
                    const qty = randomInt(30, 100); // tons
                    const value = qty * (item.costPrice || 100);
                    const poId = `po-${idCounter}`;
                    purchaseOrders.push({
                        id: poId, supplierId: supplier.id, supplierName: supplier.name, date: dateStr,
                        items: [{ id: item.id, name: item.name, quantity: qty, unit: item.unit, price: value }],
                        subtotal: value, total: value, status: 'Recebido', paymentTerms: '30 dias'
                    });
                    transactions.push({
                        id: `tr-${idCounter++}`, date: dateStr, description: `Compra ${supplier.initials} - ${item.name}`,
                        category: '2.01.01', accountId: 'acc-main', amount: value, status: 'Conciliado', type: 'Despesa',
                        partnerId: supplier.id, partnerName: supplier.name, originModule: 'Compras', originId: poId
                    });
                }
            }

            // 4. FUEL & MAINTENANCE (Heavy Fleet)
            if (Math.random() < 0.25) {
                const vehicle = randomItem(fleet);
                // Fuel
                const liters = randomInt(100, 300);
                const cost = liters * 5.80; // Diesel bulk price
                fuelLogs.push({
                    id: `fuel-${idCounter++}`, vehicleId: vehicle.id, date: dateStr, liters, cost, pricePerLiter: 5.80,
                    km: vehicle.km, fuelType: 'Diesel', isPaid: true
                });
                transactions.push({
                    id: `tr-${idCounter++}`, date: dateStr, description: `Diesel ${vehicle.name}`, category: '2.03.05',
                    accountId: 'acc-main', amount: cost, status: 'Conciliado', type: 'Despesa', partnerName: 'Posto Interno'
                });
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Attach Sub-arrays
    fleet.forEach(v => {
        v.fuelLogs = fuelLogs.filter(f => f.vehicleId === v.id);
        v.maintenanceHistory = maintenanceRecords.filter(m => m.vehicleId === v.id);
    });

    return {
        settings, employees, clients, suppliers, inventory, fleet,
        transactions, sales, budgets, purchaseOrders, auditLogs, stockMovements,
        productionOrders, formulas, productionUnits
    };
};

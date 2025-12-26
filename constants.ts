import { Client, FleetVehicle, Transaction } from "./types";

export const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Construtora Alpha Ltda",
    type: "Matriz",
    document: "28.938.129/0001-40",
    email: "contato@alpha.com.br",
    phone: "(11) 98765-4321",
    status: "Ativo",
    registeredAt: "12 Out, 2023",
    initials: "CA",
    colorClass: "bg-cyan-100 text-cyan-600",
  },
  {
    id: "2",
    name: "Engenharia Brasil S.A.",
    type: "Filial Sul",
    document: "10.293.485/0002-12",
    email: "financeiro@engbrasil.com",
    phone: "(51) 3344-5566",
    status: "Ativo",
    registeredAt: "15 Out, 2023",
    initials: "EB",
    colorClass: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "3",
    name: "Soluções Pavimentação",
    type: "Parceiro",
    document: "45.123.789/0001-90",
    email: "contato@solucoes.com",
    phone: "(41) 91122-3344",
    status: "Inativo",
    registeredAt: "02 Nov, 2023",
    initials: "SP",
    colorClass: "bg-orange-100 text-orange-600",
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "Hoje",
    description: "Venda Concreto #4920",
    category: "Receita Operacional",
    account: "Banco do Brasil",
    amount: 12500.0,
    status: "Conciliado",
    type: "Receita",
  },
  {
    id: "2",
    date: "Ontem",
    description: "Posto Shell - Diesel Frota",
    category: "Combustível",
    account: "Bradesco PJ",
    amount: 3250.0,
    status: "Conciliado",
    type: "Despesa",
  },
  {
    id: "3",
    date: "10 Out",
    description: "Manutenção Caminhão #04",
    category: "Manutenção",
    account: "Bradesco PJ",
    amount: 1800.0,
    status: "Pendente",
    type: "Despesa",
  },
];

export const MOCK_FLEET: FleetVehicle[] = [
  {
    id: "1",
    name: "Caminhão #04",
    plate: "ABC-1234",
    status: "Manutenção",
    fuelLevel: 45,
    lastMaintenance: "26/10",
    km: 125000,
  },
  {
    id: "2",
    name: "Escavadeira #02",
    plate: "CAT-990",
    status: "Manutenção",
    fuelLevel: 80,
    lastMaintenance: "Em andamento",
    km: 5400,
  },
  {
    id: "3",
    name: "Betoneira #05",
    plate: "XYZ-9876",
    status: "Operacional",
    fuelLevel: 65,
    lastMaintenance: "10/09",
    km: 88000,
  },
];

export const CHART_DATA_CASHFLOW = [
  { name: 'Jun', income: 40, expense: 20 },
  { name: 'Jul', income: 55, expense: 45 },
  { name: 'Ago', income: 70, expense: 50 },
  { name: 'Set', income: 65, expense: 80 },
  { name: 'Out', income: 85, expense: 40 },
  { name: 'Nov', income: 60, expense: 30 },
];

export const CHART_DATA_PRODUCTION = [
  { name: 'Jan', val: 40 },
  { name: 'Fev', val: 55 },
  { name: 'Mar', val: 45 },
  { name: 'Abr', val: 70 },
  { name: 'Mai', val: 85 },
  { name: 'Jun', val: 65 },
];

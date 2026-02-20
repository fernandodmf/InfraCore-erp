import { supabase } from '../lib/supabase';
import {
    Client, Supplier, Employee, InventoryItem, Transaction, Sale, Budget,
    PurchaseOrder, FleetVehicle, Tire, PayrollRecord,
    TimeLog, Vacation, SalaryAdvance, ProductionFormula, ProductionUnit,
    ProductionOrder, User, AppRole, AppSettings, AuditLog
} from '../../types';

// Gera UUID v4 válido para o banco de dados
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Verifica se um ID é um UUID válido
const isValidUUID = (id: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Generic Fetch
export const fetchData = async <T>(table: string): Promise<T[]> => {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`❌ Erro ao buscar [${table}]:`, error.message);
        return [];
    }
    return data as T[];
};

// Generic Create
export const createItem = async <T>(table: string, item: any): Promise<T | null> => {
    const cleanItem = { ...item };

    // Substitui IDs inválidos (numéricos, timestamp, prefixos como "p-", "v-") por UUID válido
    if (!cleanItem.id || !isValidUUID(cleanItem.id)) {
        cleanItem.id = generateUUID();
    }

    const { data, error } = await supabase
        .from(table)
        .insert(cleanItem)
        .select()
        .single();

    if (error) {
        console.error(`❌ Erro ao criar em [${table}]:`, error.message, '| Item:', cleanItem);
        throw error;
    }

    console.log(`✅ Criado em [${table}]:`, data);
    return data as T;
};

// Generic Update
export const updateItem = async <T>(table: string, id: string, updates: any): Promise<T | null> => {
    const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`❌ Erro ao atualizar [${table}] id=${id}:`, error.message);
        throw error;
    }

    console.log(`✅ Atualizado em [${table}] id=${id}`);
    return data as T;
};

// Generic Delete
export const deleteItem = async (table: string, id: string): Promise<boolean> => {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`❌ Erro ao deletar [${table}] id=${id}:`, error.message);
        throw error;
    }

    console.log(`✅ Deletado de [${table}] id=${id}`);
    return true;
};

// Specific Settings Update (Single Row)
export const updateSettings = async (settings: AppSettings) => {
    const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .single();

    if (existing) {
        return updateItem('settings', existing.id, settings);
    } else {
        return createItem('settings', settings);
    }
};

// Permission / Role Helper
export const fetchRoles = async (): Promise<AppRole[]> => {
    const { data, error } = await supabase.from('app_roles').select('*');
    if (error) {
        console.error('❌ Erro ao buscar roles:', error.message);
        return [];
    }
    return data as AppRole[];
};

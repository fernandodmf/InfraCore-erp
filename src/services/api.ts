import { supabase } from '../lib/supabase';
import {
    Client, Supplier, Employee, InventoryItem, Transaction, Sale, Budget,
    PurchaseOrder, FleetVehicle, VehicleMaintenance, Tire, PayrollRecord,
    TimeLog, Vacation, SalaryAdvance, ProductionFormula, ProductionUnit,
    ProductionOrder, User, AppRole, AppSettings, AuditLog
} from '../../types';

// Generic Fetch
export const fetchData = async <T>(table: string) => {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return [];
    }
    return data as T[];
};

// Generic Create
export const createItem = async <T>(table: string, item: any) => {
    // Remove ID if it's empty or transient to let DB handle UUID generation if needed
    // But our types use strings. DB has UUID default. 
    // If item.id is '1' (mock), we should probably delete it and let DB gen UUID.
    // Ideally, UI generates UUIDs or DB does.
    // For now, let's assume we pass the item as is, but remove 'id' if it looks fake/empty
    const { id, ...rest } = item;
    const cleanItem = (id && id.length > 5) ? item : rest; // Simple heuristic

    const { data, error } = await supabase.from(table).insert(cleanItem).select().single();
    if (error) throw error;
    return data as T;
};

// Generic Update
export const updateItem = async <T>(table: string, id: string, updates: any) => {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as T;
};

// Generic Delete
export const deleteItem = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
};

// Specific Settings Update (Single Row)
export const updateSettings = async (settings: AppSettings) => {
    // Assuming only 1 row exists or we use a fixed ID. 
    // For safety, we fetch first.
    const { data: existing } = await supabase.from('settings').select('id').limit(1).single();

    if (existing) {
        return updateItem('settings', existing.id, settings);
    } else {
        return createItem('settings', settings);
    }
};

// Permission / Role Helper
export const fetchRoles = async () => {
    const { data, error } = await supabase.from('app_roles').select('*');
    if (error) return [];
    return data as AppRole[];
};

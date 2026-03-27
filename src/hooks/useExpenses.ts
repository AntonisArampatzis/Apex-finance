import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Expense, Category, Budget } from '../types';
import { useAuth } from './useAuth';

export function useExpenses(monthKey: string) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [expRes, catRes, budRes] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id).eq('month_key', monthKey).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('budgets').select('*').eq('user_id', user.id).eq('month_key', monthKey).maybeSingle(),
    ]);
    if (expRes.data) setExpenses(expRes.data);
    if (catRes.data) setCategories(catRes.data);
    setBudget(budRes.data ?? null);
    setLoading(false);
  }, [user, monthKey]);

  useEffect(() => { if (user) fetchAll(); }, [fetchAll, user]);

  const setBudgetAmount = async (amount: number) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('budgets')
      .upsert({ user_id: user.id, month_key: monthKey, amount }, { onConflict: 'user_id,month_key' })
      .select().single();
    if (error) { console.error('setBudget error:', error.message); return; }
    if (data) setBudget(data);
  };

  const addCategory = async (name: string, color: string): Promise<boolean> => {
    if (!user) return false;
    // Insert without chaining .select() — avoids RLS select policy issues
    const { error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, name, color });
    if (error) {
      console.error('addCategory error:', error.message, error.code);
      return false;
    }
    // Refetch categories so we get the real DB row with correct id
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) setCategories(data);
    return true;
  };

  const addExpense = async (name: string, amount: number, category: Category) => {
    if (!user) return;
    const { error } = await supabase.from('expenses').insert({
      user_id: user.id, name, amount,
      category_id: category.id,
      category_name: category.name,
      category_color: category.color,
      month_key: monthKey,
      date: new Date().toISOString(),
    });
    if (error) { console.error('addExpense error:', error.message); return; }
    // Refetch to get correct server row
    const { data } = await supabase
      .from('expenses').select('*')
      .eq('user_id', user.id).eq('month_key', monthKey)
      .order('created_at', { ascending: false });
    if (data) setExpenses(data);
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await supabase.from('categories').delete().eq('id', id);
  };

  return {
    expenses, categories, budget, loading,
    setBudgetAmount, addExpense, deleteExpense, addCategory, deleteCategory,
    refetch: fetchAll,
  };
}

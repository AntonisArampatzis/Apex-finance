import React, { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { BudgetPanel } from '../components/BudgetPanel';
import { ExpensePie } from '../components/ExpensePie';
import { AddExpense } from '../components/AddExpense';
import { ExpenseList } from '../components/ExpenseList';
import { MonthSelector } from '../components/MonthSelector';
import { getCurrentMonthKey, formatMonthKey } from '../utils';

export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey());
  const {
    expenses, categories, budget, loading,
    setBudgetAmount, addExpense, deleteExpense, addCategory,
  } = useExpenses(monthKey);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const pieData = Object.entries(
    expenses.reduce<Record<string, { value: number; color: string }>>((acc, exp) => {
      if (!acc[exp.category_name]) acc[exp.category_name] = { value: 0, color: exp.category_color };
      acc[exp.category_name].value += exp.amount;
      return acc;
    }, {})
  ).map(([name, d]) => ({ name, ...d }));

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="3,21 12,5 21,21" stroke="#00D2BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="7" y1="16" x2="17" y2="16" stroke="#00D2BE" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="5" r="1.8" fill="#00D2BE"/>
            </svg>
          </div>
          <div>
            <h1 className="app-title">APEX</h1>
            <p className="app-sub">peak financial control</p>
          </div>
        </div>
        <div className="header-right">
          <MonthSelector current={monthKey} onChange={setMonthKey} />
          <div className="user-menu">
            <span className="user-email"><User size={11} />{user?.email}</span>
            <button className="signout-btn" onClick={signOut} title="Sign out">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner" />
          <span>Loading your data…</span>
        </div>
      ) : (
        <>
          <div className="top-row">
            <BudgetPanel budget={budget?.amount ?? 0} spent={totalSpent}
              onBudgetChange={setBudgetAmount} month={formatMonthKey(monthKey)} />
            <ExpensePie data={pieData} total={totalSpent} />
          </div>
          <div className="bottom-row">
            <AddExpense categories={categories} onAddExpense={addExpense} onAddCategory={addCategory} />
            <ExpenseList expenses={expenses} onDelete={deleteExpense} />
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    if (!acc[exp.category_name]) acc[exp.category_name] = [];
    acc[exp.category_name].push(exp);
    return acc;
  }, {});

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  };

  if (!expenses.length) {
    return (
      <div className="list-panel">
        <div className="panel-header">
          <span className="panel-label">EXPENSES</span>
          <span className="month-tag">0 items</span>
        </div>
        <div className="list-empty">No expenses recorded this month.</div>
      </div>
    );
  }

  return (
    <div className="list-panel">
      <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => setCollapsed(c => !c)}>
        <span className="panel-label">EXPENSES</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="month-tag">{expenses.length} items</span>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {!collapsed && (
        <div className="expense-groups">
          {Object.entries(grouped).map(([cat, items]) => {
            const catTotal = items.reduce((s, i) => s + i.amount, 0);
            const color = items[0].category_color;
            return (
              <div key={cat} className="cat-group">
                <div className="cat-group-header">
                  <span className="cat-dot" style={{ background: color }} />
                  <span className="cat-group-name">{cat}</span>
                  <span className="cat-group-total">{formatCurrency(catTotal)}</span>
                </div>
                <div className="cat-items">
                  {[...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                    <div key={exp.id} className={`expense-row ${deleting === exp.id ? 'deleting' : ''}`}>
                      <div className="exp-left">
                        <span className="exp-name">{exp.name}</span>
                        <span className="exp-date">
                          {new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="exp-right">
                        <span className="exp-amount">{formatCurrency(exp.amount)}</span>
                        <button className="delete-btn" onClick={() => handleDelete(exp.id)} disabled={deleting === exp.id}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

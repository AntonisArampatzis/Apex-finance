import React, { useState } from 'react';
import { Pencil, Check, X, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils';

interface BudgetPanelProps {
  budget: number;
  spent: number;
  onBudgetChange: (budget: number) => void;
  month: string;
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({ budget, spent, onBudgetChange, month }) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(budget.toString());

  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = remaining < 0;
  const color = isOver ? '#EF4444' : pct > 80 ? '#F59E0B' : '#10B981';

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!isNaN(val) && val >= 0) onBudgetChange(val);
    setEditing(false);
  };

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = circ * (pct / 100);

  return (
    <div className="budget-panel">
      <div className="panel-header">
        <span className="panel-label">MONTHLY BUDGET</span>
        <span className="month-tag">{month}</span>
      </div>

      <div className="budget-main">
        <div className="circular-wrap">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={circ * 0.25}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="circular-label">
            <span className="pct-val">{Math.round(pct)}%</span>
            <span className="pct-sub">used</span>
          </div>
        </div>

        <div className="budget-stats">
          <div className="stat-row">
            <Wallet size={14} />
            <span className="stat-name">Budget</span>
            {editing ? (
              <div className="inline-edit">
                <span className="currency-prefix">€</span>
                <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                  autoFocus className="budget-input" />
                <button onClick={handleSave} className="icon-btn green"><Check size={13} /></button>
                <button onClick={() => setEditing(false)} className="icon-btn red"><X size={13} /></button>
              </div>
            ) : (
              <div className="stat-value-row">
                <span className="stat-value">{formatCurrency(budget)}</span>
                <button onClick={() => { setInputVal(budget.toString()); setEditing(true); }} className="icon-btn muted">
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="stat-divider" />
          <div className="stat-row">
            <TrendingDown size={14} className="red" />
            <span className="stat-name">Spent</span>
            <span className="stat-value red">{formatCurrency(spent)}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-row">
            <TrendingUp size={14} className={isOver ? 'red' : 'green'} />
            <span className="stat-name">Remaining</span>
            <span className={`stat-value ${isOver ? 'red' : 'green'}`}>{formatCurrency(remaining)}</span>
          </div>
        </div>
      </div>

      <div className="budget-bar-track">
        <div className="budget-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

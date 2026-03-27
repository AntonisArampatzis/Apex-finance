import React, { useState } from 'react';
import { Plus, Tag, DollarSign, Palette } from 'lucide-react';
import { Category } from '../types';
import { DEFAULT_COLORS } from '../utils';

interface AddExpenseProps {
  categories: Category[];
  onAddExpense: (name: string, amount: number, category: Category) => Promise<void>;
  onAddCategory: (name: string, color: string) => Promise<boolean>;
}

export const AddExpense: React.FC<AddExpenseProps> = ({ categories, onAddExpense, onAddCategory }) => {
  const [mode, setMode] = useState<'expense' | 'category'>('expense');
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(DEFAULT_COLORS[0]);
  const [customColor, setCustomColor] = useState(DEFAULT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [catError, setCatError] = useState('');

  const handleAddExpense = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!expName.trim() || !expAmount || !expCategory) return;
    const cat = categories.find(c => c.id === expCategory);
    if (!cat) return;
    setSaving(true);
    await onAddExpense(expName.trim(), parseFloat(expAmount), cat);
    setSaving(false);
    setExpName('');
    setExpAmount('');
    setExpCategory('');
  };

  const handleAddCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSaving(true);
    setCatError('');
    const success = await onAddCategory(catName.trim(), catColor);
    setSaving(false);
    if (success) {
      setCatName('');
      setCatColor(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
      // Auto switch to expense tab so user can immediately use the new category
      setMode('expense');
    } else {
      setCatError('Failed to save category. Check your connection and try again.');
    }
  };

  return (
    <div className="add-panel">
      <div className="tab-row">
        <button className={`tab-btn ${mode === 'expense' ? 'active' : ''}`} onClick={() => setMode('expense')}>
          <DollarSign size={13} /> Add Expense
        </button>
        <button className={`tab-btn ${mode === 'category' ? 'active' : ''}`} onClick={() => setMode('category')}>
          <Tag size={13} /> New Category
        </button>
      </div>

      {mode === 'expense' && (
        <div className="form-grid">
          <div className="form-field">
            <label className="field-label">Description</label>
            <input className="field-input" placeholder="e.g. Groceries" value={expName} onChange={e => setExpName(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="field-label">Amount (€)</label>
            <input className="field-input" type="number" placeholder="0.00" min="0" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="field-label">Category</label>
            {categories.length === 0 ? (
              <div className="no-cats-hint" onClick={() => setMode('category')} style={{ cursor: 'pointer' }}>
                Click here to create a category first →
              </div>
            ) : (
              <select className="field-input field-select" value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
          <button className="submit-btn" onClick={handleAddExpense}
            disabled={saving || !expName.trim() || !expAmount || !expCategory}>
            <Plus size={16} /> {saving ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      )}

      {mode === 'category' && (
        <div className="form-grid">
          <div className="form-field">
            <label className="field-label">Category Name</label>
            <input className="field-input" placeholder="e.g. Housing" value={catName} onChange={e => setCatName(e.target.value)} />
          </div>
          <div className="form-field full-width">
            <label className="field-label">Color</label>
            <div className="color-picker-row">
              {DEFAULT_COLORS.map(c => (
                <button key={c} className={`color-swatch ${catColor === c ? 'selected' : ''}`}
                  style={{ background: c }} onClick={() => setCatColor(c)} />
              ))}
              <div className="custom-color-wrap" title="Custom color">
                <input type="color" className="custom-color-input" value={customColor}
                  onChange={e => { setCustomColor(e.target.value); setCatColor(e.target.value); }} />
                <span className="custom-color-icon"><Palette size={14} /></span>
              </div>
            </div>
          </div>
          <div className="color-preview-row">
            <span className="preview-dot" style={{ background: catColor }} />
            <span className="preview-name">{catName || 'Category name'}</span>
          </div>
          {catError && <div className="auth-error">{catError}</div>}
          <button className="submit-btn" onClick={handleAddCategory} disabled={saving || !catName.trim()}>
            <Plus size={16} /> {saving ? 'Saving…' : 'Create Category'}
          </button>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthKey, getCurrentMonthKey, addMonths } from '../utils';

interface MonthSelectorProps {
  current: string;
  onChange: (key: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ current, onChange }) => {
  const isCurrentMonth = current === getCurrentMonthKey();
  return (
    <div className="month-selector">
      <button className="nav-btn" onClick={() => onChange(addMonths(current, -1))}>
        <ChevronLeft size={16} />
      </button>
      <span className="month-display">{formatMonthKey(current)}</span>
      <button className="nav-btn" onClick={() => onChange(addMonths(current, 1))}
        disabled={isCurrentMonth} style={{ opacity: isCurrentMonth ? 0.3 : 1 }}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

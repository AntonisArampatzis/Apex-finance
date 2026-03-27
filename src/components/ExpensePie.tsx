import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { formatCurrency } from '../utils';

interface PieData { name: string; value: number; color: string; }

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.95} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="pie-tooltip">
      <span className="tt-dot" style={{ background: d.payload.color }} />
      <span className="tt-name">{d.name}</span>
      <span className="tt-val">{formatCurrency(d.value)}</span>
    </div>
  );
};

export const ExpensePie: React.FC<{ data: PieData[]; total: number }> = ({ data, total }) => {
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);

  if (!data.length) {
    return (
      <div className="pie-panel">
        <div className="panel-header"><span className="panel-label">BREAKDOWN</span></div>
        <div className="pie-empty">
          <div className="pie-empty-ring" />
          <p>No expenses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pie-panel">
      <div className="panel-header">
        <span className="panel-label">BREAKDOWN</span>
        <span className="month-tag">{formatCurrency(total)} total</span>
      </div>
      <div className="pie-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3}
              dataKey="value" activeIndex={activeIdx} activeShape={renderActiveShape}
              onMouseEnter={(_, i) => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(undefined)}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center">
          <span className="pie-center-val">{data.length}</span>
          <span className="pie-center-sub">{data.length === 1 ? 'category' : 'categories'}</span>
        </div>
      </div>
      <div className="pie-legend">
        {data.map((d, i) => (
          <div key={i} className={`legend-item ${activeIdx === i ? 'active' : ''}`}
            onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(undefined)}>
            <span className="legend-dot" style={{ background: d.color }} />
            <span className="legend-name">{d.name}</span>
            <span className="legend-pct">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
            <span className="legend-amt">{formatCurrency(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

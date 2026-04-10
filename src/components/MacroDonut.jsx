import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './MacroDonut.css';

const COLORS = ['#00e5c0', '#ffb07c', '#6b7280'];

export default function MacroDonut({ protein = 140, carbs = 210, fat = 65 }) {
  const macros = useMemo(() => [
    { name: 'Protein', grams: protein, color: COLORS[0] },
    { name: 'Carbs',   grams: carbs,   color: COLORS[1] },
    { name: 'Fat',     grams: fat,     color: COLORS[2] },
  ], [protein, carbs, fat]);

  const total = protein + carbs + fat;
  const logged = total > 0 ? 100 : 0;

  return (
    <div className="macro-card">
      <div className="macro-top">
        <h3 className="macro-title">Macro Breakdown</h3>
        <p className="macro-subtitle">Daily target distribution</p>
      </div>

      <div className="donut-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={macros}
              dataKey="grams"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={4}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {macros.map((m, i) => (
                <Cell
                  key={i}
                  fill={m.color}
                  style={{ filter: i === 0 ? 'drop-shadow(0 0 6px rgba(0,229,192,0.4))' : 'none' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="donut-center">
          <span className="donut-pct">{logged}%</span>
          <span className="donut-label">LOGGED</span>
        </div>
      </div>

      {/* Legend */}
      <div className="macro-legend">
        {macros.map((m) => (
          <div key={m.name} className="legend-item">
            <span className="legend-dot" style={{ background: m.color }} />
            <span className="legend-name">{m.name}</span>
            <span className="legend-grams">{m.grams}g</span>
            <span className="legend-pct">{total > 0 ? Math.round((m.grams / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

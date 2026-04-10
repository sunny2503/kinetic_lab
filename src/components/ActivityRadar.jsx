import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import './ActivityRadar.css';

const ACTIVITY_DATA = [
  { axis: 'Strength',    value: 82 },
  { axis: 'Cardio',      value: 68 },
  { axis: 'Flexibility',  value: 55 },
  { axis: 'Focus',       value: 74 },
];

function CustomTick({ payload, x, y, cx, cy }) {
  const dx = x - cx;
  const dy = y - cy;
  const dist = 18;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = x + (dx / len) * dist;
  const ny = y + (dy / len) * dist;

  return (
    <text
      x={nx}
      y={ny}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fill: '#8b92a5',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
      }}
    >
      {payload.value}
    </text>
  );
}

export default function ActivityRadar() {
  return (
    <div className="radar-card">
      <div className="radar-top">
        <div>
          <h3 className="radar-title">Activity Distribution</h3>
          <p className="radar-subtitle">Intensity mapping</p>
        </div>
        <div className="radar-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
      </div>

      <div className="radar-chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={ACTIVITY_DATA}>
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              radialLines={true}
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="axis"
              tick={<CustomTick />}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="value"
              stroke="#00e5c0"
              strokeWidth={2}
              fill="#00e5c0"
              fillOpacity={0.15}
              dot={{
                r: 4,
                fill: '#0f1117',
                stroke: '#00e5c0',
                strokeWidth: 2,
              }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Value chips */}
      <div className="radar-chips">
        {ACTIVITY_DATA.map((d) => (
          <div key={d.axis} className="radar-chip">
            <span className="chip-label">{d.axis}</span>
            <span className="chip-value">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

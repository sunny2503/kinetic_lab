import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import './IntakeChart.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { full, kcal } = payload[0].payload;
  return (
    <div className="intake-tooltip">
      <p className="tooltip-date">{full}</p>
      <p className="tooltip-value">{kcal.toLocaleString()} <span>kcal</span></p>
    </div>
  );
}

export default function IntakeChart({ todayCalories = 1850, goal = 2000 }) {
  const [range, setRange] = useState('week');

  // Build week data with today (Fri index=4) reflecting live calories
  const weekData = useMemo(() => {
    const base = [1720, 1890, 2050, 1680, todayCalories, 2180, 1850];
    return DAYS.map((day, i) => ({
      day,
      full: `${FULL_DAYS[i]} Oct ${17 + i}`,
      kcal: i === 4 ? todayCalories : base[i],
    }));
  }, [todayCalories]);

  const monthData = useMemo(() => [
    { day: 'Wk 1', full: 'Week 1 · Oct 1–7',   kcal: 1780 },
    { day: 'Wk 2', full: 'Week 2 · Oct 8–14',  kcal: 1920 },
    { day: 'Wk 3', full: 'Week 3 · Oct 15–21', kcal: 1860 },
    { day: 'Wk 4', full: 'Week 4 · Oct 22–28', kcal: Math.round((todayCalories + 1720 + 1890 + 2050 + 1680 + 2180 + 1850) / 7) },
  ], [todayCalories]);

  const data = range === 'week' ? weekData : monthData;

  return (
    <div className="intake-chart-card">
      <div className="chart-top">
        <div>
          <h3 className="chart-title">Caloric Intake vs Goal</h3>
          <p className="chart-subtitle">Daily intake compared to your {goal.toLocaleString()} kcal target</p>
        </div>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${range === 'week' ? 'active' : ''}`}
            onClick={() => setRange('week')}
          >Week</button>
          <button
            className={`toggle-btn ${range === 'month' ? 'active' : ''}`}
            onClick={() => setRange('month')}
          >Month</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#00e5c0" stopOpacity={0.35} />
              <stop offset="95%"  stopColor="#00e5c0" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b92a5', fontSize: 13, fontFamily: 'Inter' }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b92a5', fontSize: 12, fontFamily: 'Inter' }}
            domain={[1400, 2600]}
            tickCount={6}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'rgba(0, 229, 192, 0.15)',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />

          <ReferenceLine
            y={goal}
            stroke="#8b92a5"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: 'Goal',
              position: 'right',
              fill: '#8b92a5',
              fontSize: 12,
              fontFamily: 'Inter',
            }}
          />

          <Area
            type="monotone"
            dataKey="kcal"
            stroke="#00e5c0"
            strokeWidth={2.5}
            fill="url(#cyanGrad)"
            dot={{ r: 4, fill: '#0f1117', stroke: '#00e5c0', strokeWidth: 2 }}
            activeDot={{
              r: 7,
              fill: '#00e5c0',
              stroke: '#0f1117',
              strokeWidth: 3,
              style: { filter: 'drop-shadow(0 0 6px rgba(0,229,192,0.5))' },
            }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

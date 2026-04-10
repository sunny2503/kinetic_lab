import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import './DailyBars.css';

const GOAL = 2000;
const BAR_DEFAULT = '#2a2e39';
const BAR_ACTIVE  = '#00e5c0';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { full, kcal, today } = payload[0].payload;
  return (
    <div className="bar-tooltip">
      <p className="bar-tooltip-day">{full}{today ? ' · Today' : ''}</p>
      <p className="bar-tooltip-val">{kcal.toLocaleString()} <span>kcal</span></p>
    </div>
  );
}

export default function DailyBars({ todayCalories = 1920 }) {
  const data = useMemo(() => [
    { day: 'Mon', full: 'Monday',    kcal: 1720 },
    { day: 'Tue', full: 'Tuesday',   kcal: 1890 },
    { day: 'Wed', full: 'Wednesday', kcal: 2050 },
    { day: 'Thu', full: 'Thursday',  kcal: 1680 },
    { day: 'Fri', full: 'Friday',    kcal: todayCalories, today: true },
    { day: 'Sat', full: 'Saturday',  kcal: 1540 },
    { day: 'Sun', full: 'Sunday',    kcal: 1350 },
  ], [todayCalories]);

  return (
    <div className="bars-card">
      <div className="bars-top">
        <div>
          <h3 className="bars-title">Daily Calories</h3>
          <p className="bars-subtitle">Week View Analysis</p>
        </div>
        <div className="bars-legend">
          <span className="bl-dot" style={{ background: BAR_ACTIVE }} />
          <span className="bl-label">Today</span>
          <span className="bl-dot" style={{ background: BAR_DEFAULT }} />
          <span className="bl-label">Other</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          barCategoryGap="25%"
        >
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
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b92a5', fontSize: 12, fontFamily: 'Inter' }}
            domain={[0, 'auto']}
            tickCount={5}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}
          />

          <ReferenceLine
            y={GOAL}
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

          <Bar
            dataKey="kcal"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.today ? BAR_ACTIVE : BAR_DEFAULT}
                style={entry.today ? { filter: 'drop-shadow(0 0 8px rgba(0,229,192,0.45))' } : {}}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

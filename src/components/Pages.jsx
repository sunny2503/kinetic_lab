import React from 'react';
import './Pages.css';

/* ── Activity Page ── */
export function ActivityPage({ stats }) {
  const activities = [
    { id: 1, name: 'Morning Run', type: 'Cardio',      duration: '32 min', cal: 280, time: '6:30 AM', icon: '🏃' },
    { id: 2, name: 'Weight Training', type: 'Strength', duration: '45 min', cal: 120, time: '7:15 AM', icon: '🏋️' },
    { id: 3, name: 'Yoga Flow', type: 'Flexibility',    duration: '20 min', cal: 50,  time: '12:00 PM', icon: '🧘' },
  ];
  const totalBurned = activities.reduce((s, a) => s + a.cal, 0);

  return (
    <div className="page-container">
      <div className="page-grid-3">
        <div className="stat-mini">
          <span className="stat-mini-label">Calories Burned</span>
          <span className="stat-mini-value cyan">{stats.burned} kcal</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">Active Time</span>
          <span className="stat-mini-value">97 min</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">Sessions</span>
          <span className="stat-mini-value">{activities.length}</span>
        </div>
      </div>

      <h2 className="page-section-title">Today's Activities</h2>
      <div className="activity-list">
        {activities.map((a) => (
          <div key={a.id} className="activity-row">
            <span className="activity-emoji">{a.icon}</span>
            <div className="activity-info">
              <p className="activity-name">{a.name}</p>
              <p className="activity-meta">{a.type} · {a.duration}</p>
            </div>
            <span className="activity-time">{a.time}</span>
            <span className="activity-cal">-{a.cal} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Goals Page ── */
export function GoalsPage({ stats }) {
  const CALORIE_GOAL = 2400;
  const pct = Math.min(Math.round((stats.calories / CALORIE_GOAL) * 100), 100);

  const goals = [
    { label: 'Daily Calories',  current: stats.calories, target: CALORIE_GOAL, unit: 'kcal', color: '#00e5c0' },
    { label: 'Protein',         current: stats.protein,  target: 150,          unit: 'g',    color: '#00e5c0' },
    { label: 'Water Intake',    current: 5,              target: 8,            unit: 'glasses', color: '#5b9bf7' },
    { label: 'Calories Burned', current: stats.burned,   target: 500,          unit: 'kcal', color: '#4ade80' },
  ];

  return (
    <div className="page-container">
      <div className="goals-grid">
        {goals.map((g) => {
          const goalPct = Math.min(Math.round((g.current / g.target) * 100), 100);
          return (
            <div key={g.label} className="goal-card">
              <div className="goal-header">
                <span className="goal-label">{g.label}</span>
                <span className="goal-pct" style={{ color: g.color }}>{goalPct}%</span>
              </div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: `${goalPct}%`, background: g.color }} />
              </div>
              <div className="goal-values">
                <span>{g.current.toLocaleString()} {g.unit}</span>
                <span className="goal-target">/ {g.target.toLocaleString()} {g.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="page-section-title">Weekly Streaks</h2>
      <div className="streak-row">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <div key={d} className={`streak-day ${i < 5 ? 'completed' : i === 5 ? 'today' : ''}`}>
            <div className="streak-dot" />
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Settings Page ── */
export function SettingsPage() {
  const sections = [
    {
      title: 'Profile',
      items: [
        { label: 'Display Name', value: 'Alex Rivers', type: 'text' },
        { label: 'Email', value: 'alex@kineticlab.io', type: 'text' },
        { label: 'Plan', value: 'Premium', type: 'badge' },
      ],
    },
    {
      title: 'Nutrition Goals',
      items: [
        { label: 'Daily Calorie Target', value: '2,400 kcal', type: 'text' },
        { label: 'Protein Goal', value: '150g', type: 'text' },
        { label: 'Water Goal', value: '8 glasses', type: 'text' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Dark Mode', value: true, type: 'toggle' },
        { label: 'AI Meal Analysis', value: true, type: 'toggle' },
        { label: 'Push Notifications', value: false, type: 'toggle' },
      ],
    },
  ];

  return (
    <div className="page-container">
      {sections.map((section) => (
        <div key={section.title} className="settings-section">
          <h2 className="page-section-title">{section.title}</h2>
          <div className="settings-card">
            {section.items.map((item, i) => (
              <div key={i} className="settings-row">
                <span className="settings-label">{item.label}</span>
                {item.type === 'text' && <span className="settings-value">{item.value}</span>}
                {item.type === 'badge' && <span className="settings-badge">{item.value}</span>}
                {item.type === 'toggle' && (
                  <div className={`toggle-switch ${item.value ? 'on' : ''}`}>
                    <div className="toggle-knob" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

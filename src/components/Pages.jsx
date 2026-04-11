import React, { useState, useRef } from 'react';
import './Pages.css';

// ── Storage Keys ──
const GOALS_KEY = 'kinetic_lab_goals';
const ACTIVITIES_KEY = 'kinetic_lab_activities';
const SETTINGS_KEY = 'kinetic_lab_settings';

// ── Calorie burn formula: MET-based ──
function calcBurn(duration, intensity, weight = 70) {
  const MET = { low: 3.5, medium: 5.5, high: 8.0 };
  return Math.round((MET[intensity] * weight * duration) / 60);
}

const INTENSITY_ICONS = { low: '🟢', medium: '🟡', high: '🔴' };
const INTENSITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

/* ══════════════════════════════════
   ACTIVITY PAGE
   ══════════════════════════════════ */
export function ActivityPage({ activities, onActivityLogged, onDeleteActivity }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const formRef = useRef(null);

  const totalBurned = activities.reduce((s, a) => s + a.cal, 0);
  const totalTime = activities.reduce((s, a) => s + a.duration, 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !duration) return;

    const dur = Number(duration);
    const cal = calcBurn(dur, intensity);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const activity = {
      id: Date.now(),
      name: name.trim(),
      duration: dur,
      intensity,
      cal,
      time: timeStr,
    };

    onActivityLogged(activity);
    setName('');
    setDuration('');
    setIntensity('medium');
  }

  return (
    <div className="page-container">
      {/* Stats Row */}
      <div className="page-grid-3">
        <div className="stat-mini">
          <span className="stat-mini-label">Calories Burned</span>
          <span className="stat-mini-value cyan">{totalBurned} kcal</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">Active Time</span>
          <span className="stat-mini-value">{totalTime} min</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">Sessions</span>
          <span className="stat-mini-value">{activities.length}</span>
        </div>
      </div>

      {/* Log Activity Form */}
      <h2 className="page-section-title">Log an Activity</h2>
      <form className="activity-form" onSubmit={handleSubmit} ref={formRef}>
        <div className="af-row">
          <div className="af-field af-grow">
            <label className="af-label">Activity Name</label>
            <input
              className="af-input"
              type="text"
              placeholder="e.g. Morning Run"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="af-field af-small">
            <label className="af-label">Duration (min)</label>
            <input
              className="af-input"
              type="number"
              min="1"
              max="600"
              placeholder="30"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>
        </div>

        <div className="af-row">
          <div className="af-field af-grow">
            <label className="af-label">Intensity</label>
            <div className="intensity-group">
              {['low', 'medium', 'high'].map(level => (
                <button
                  type="button"
                  key={level}
                  className={`intensity-btn ${intensity === level ? 'active' : ''}`}
                  onClick={() => setIntensity(level)}
                >
                  <span>{INTENSITY_ICONS[level]}</span>
                  {INTENSITY_LABELS[level]}
                </button>
              ))}
            </div>
          </div>

          {name.trim() && duration && (
            <div className="af-preview">
              <span className="af-preview-label">Est. Burn</span>
              <span className="af-preview-val">-{calcBurn(Number(duration), intensity)} kcal</span>
            </div>
          )}
        </div>

        <button type="submit" className="af-submit" disabled={!name.trim() || !duration}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Activity
        </button>
      </form>

      {/* Activity List */}
      {activities.length > 0 && (
        <>
          <h2 className="page-section-title">Today's Activities</h2>
          <div className="activity-list">
            {activities.map((a) => (
              <div key={a.id} className="activity-row">
                <span className="activity-emoji">{INTENSITY_ICONS[a.intensity]}</span>
                <div className="activity-info">
                  <p className="activity-name">{a.name}</p>
                  <p className="activity-meta">{INTENSITY_LABELS[a.intensity]} · {a.duration} min</p>
                </div>
                <span className="activity-time">{a.time}</span>
                <span className="activity-cal">-{a.cal} kcal</span>
                <button className="activity-delete" onClick={() => onDeleteActivity(a.id)} title="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activities.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🏃</span>
          <p className="empty-text">No activities logged yet today</p>
          <p className="empty-sub">Use the form above to log your first workout</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   GOALS PAGE
   ══════════════════════════════════ */
export function GoalsPage({ stats, goals, onGoalsChange }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const goalRows = [
    { key: 'calorieGoal',  label: 'Daily Calories',  current: stats.calories,     unit: 'kcal',    color: '#00e5c0', icon: '🔥' },
    { key: 'proteinGoal',  label: 'Protein',          current: stats.protein,      unit: 'g',       color: '#818cf8', icon: '🥩' },
    { key: 'carbGoal',     label: 'Carbohydrates',    current: stats.carbs,        unit: 'g',       color: '#fbbf24', icon: '🍞' },
    { key: 'fatGoal',      label: 'Fat',              current: stats.fat,          unit: 'g',       color: '#f472b6', icon: '🥑' },
    { key: 'waterGoal',    label: 'Water Intake',     current: stats.water || 0,   unit: 'glasses', color: '#60a5fa', icon: '💧' },
    { key: 'burnGoal',     label: 'Calories Burned',  current: stats.burned,       unit: 'kcal',    color: '#4ade80', icon: '⚡' },
  ];

  function startEdit(key) {
    setEditing(key);
    setEditVal(String(goals[key] || ''));
  }

  function saveEdit(key) {
    const val = parseInt(editVal, 10);
    if (!isNaN(val) && val > 0) {
      onGoalsChange({ ...goals, [key]: val });
    }
    setEditing(null);
  }

  function handleKeyDown(e, key) {
    if (e.key === 'Enter') saveEdit(key);
    if (e.key === 'Escape') setEditing(null);
  }

  return (
    <div className="page-container">
      <div className="goals-header-row">
        <h2 className="page-section-title">Your Daily Targets</h2>
        <p className="goals-hint">Click any target value to edit</p>
      </div>

      <div className="goals-grid">
        {goalRows.map((g) => {
          const target = goals[g.key] || 1;
          const pct = Math.min(Math.round((g.current / target) * 100), 100);
          const isEditing = editing === g.key;

          return (
            <div key={g.key} className="goal-card-v2">
              <div className="goal-card-top">
                <div className="goal-card-icon" style={{ background: `${g.color}18`, color: g.color }}>
                  {g.icon}
                </div>
                <div className="goal-card-info">
                  <span className="goal-card-label">{g.label}</span>
                  <div className="goal-card-nums">
                    <span className="goal-card-current" style={{ color: g.color }}>{g.current.toLocaleString()}</span>
                    <span className="goal-card-slash">/</span>
                    {isEditing ? (
                      <input
                        className="goal-edit-input"
                        type="number"
                        min="1"
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={() => saveEdit(g.key)}
                        onKeyDown={e => handleKeyDown(e, g.key)}
                        autoFocus
                      />
                    ) : (
                      <span className="goal-card-target" onClick={() => startEdit(g.key)}>{target.toLocaleString()}</span>
                    )}
                    <span className="goal-card-unit">{g.unit}</span>
                  </div>
                </div>
                <span className="goal-card-pct" style={{ color: g.color }}>{pct}%</span>
              </div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: `${pct}%`, background: g.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Streak */}
      <h2 className="page-section-title">Weekly Streaks</h2>
      <div className="streak-row">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <div key={d} className={`streak-day ${i < new Date().getDay() - 1 ? 'completed' : i === new Date().getDay() - 1 ? 'today' : ''}`}>
            <div className="streak-dot" />
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   SETTINGS PAGE
   ══════════════════════════════════ */
export function SettingsPage({ onLogout, userName, userEmail, onSettingsChange, settings }) {
  const [name, setName] = useState(settings.displayName || userName || '');
  const [photoUrl, setPhotoUrl] = useState(settings.photoUrl || '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSaveProfile() {
    onSettingsChange({ ...settings, displayName: name, photoUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearAll() {
    // Clear all app data from localStorage
    const keys = ['kinetic_lab_user', 'kinetic_lab_goals', 'kinetic_lab_activities', 'kinetic_lab_meals', 'kinetic_lab_settings'];
    keys.forEach(k => localStorage.removeItem(k));
    setShowClearConfirm(false);
    // Reload to reset state
    window.location.reload();
  }

  return (
    <div className="page-container">
      {/* Profile Section */}
      <div className="settings-section">
        <h2 className="page-section-title">Profile</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Display Name</span>
            <input
              className="settings-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="settings-row">
            <span className="settings-label">Email</span>
            <span className="settings-value">{userEmail || '—'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Profile Photo URL</span>
            <input
              className="settings-input"
              type="url"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div className="settings-row">
            <span className="settings-label">Plan</span>
            <span className="settings-badge">Premium</span>
          </div>
          <div className="settings-row settings-actions-row">
            <div />
            <button className="settings-save-btn" onClick={handleSaveProfile}>
              {saved ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved!
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h2 className="page-section-title">Preferences</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Dark Mode</span>
            <div className="toggle-switch on">
              <div className="toggle-knob" />
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-label">AI Meal Analysis</span>
            <div className="toggle-switch on">
              <div className="toggle-knob" />
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-label">Push Notifications</span>
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section">
        <h2 className="page-section-title">Danger Zone</h2>
        <div className="settings-card danger-card">
          <div className="settings-row">
            <div className="danger-info">
              <span className="settings-label">Clear All Data</span>
              <span className="danger-sub">This will reset all meals, activities, goals, and settings</span>
            </div>
            {showClearConfirm ? (
              <div className="confirm-btns">
                <button className="cancel-btn" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                <button className="destroy-btn" onClick={handleClearAll}>Yes, Clear Everything</button>
              </div>
            ) : (
              <button className="danger-btn" onClick={() => setShowClearConfirm(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Clear Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="settings-section">
        <h2 className="page-section-title">Account</h2>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-label">Sign out of your account</span>
            <button className="logout-btn" onClick={onLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

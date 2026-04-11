import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import IntakeChart from './components/IntakeChart';
import MacroDonut from './components/MacroDonut';
import DailyBars from './components/DailyBars';
import ActivityRadar from './components/ActivityRadar';
import DailyLog from './components/DailyLog';
import { ActivityPage, GoalsPage, SettingsPage } from './components/Pages';
import Onboarding, { STORAGE_KEY } from './components/Onboarding';
import { LoginPage, SignupPage } from './components/AuthPages';
import { auth, onAuthStateChanged, signOut } from './firebase';

// ── Feather-style SVG Icons ──
const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconDashboard = () => <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
const IconLog = () => <Icon><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Icon>;
const IconActivity = () => <Icon><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
const IconGoals = () => <Icon><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const IconSettings = () => <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></Icon>;
const IconBell = () => <Icon><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></Icon>;

// ── Navigation Data ──
const NAV_ITEMS = [
  { id: 'Dashboard',  icon: <IconDashboard /> },
  { id: 'Daily Log',  icon: <IconLog /> },
  { id: 'Activity',   icon: <IconActivity /> },
  { id: 'Goals',      icon: <IconGoals /> },
  { id: 'Settings',   icon: <IconSettings /> },
];

const CALORIE_GOAL = 2400;
const NET_TARGET = 1600;

export default function App() {
  // ── Firebase auth state ──
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser || null);
    });
    return unsub;
  }, []);

  // ── Onboarding / user profile state ──
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // ── Live nutrition state ──
  const [stats, setStats] = useState({
    calories: 1850,
    burned: 450,
    protein: 54,
    carbs: 72,
    fat: 28,
    mealCount: 2,
  });

  const net = stats.calories - stats.burned;
  const pct = Math.min(Math.round((stats.calories / CALORIE_GOAL) * 100), 100);

  const handleMealLogged = useCallback((meal) => {
    setStats((prev) => ({
      ...prev,
      calories: prev.calories + meal.calories,
      protein: prev.protein + meal.protein,
      carbs: prev.carbs + meal.carbs,
      fat: prev.fat + meal.fat,
      mealCount: prev.mealCount + 1,
    }));
  }, []);

  // ── Logout handler ──
  const handleLogout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem(STORAGE_KEY);
    setUserProfile(null);
    setActiveTab('Dashboard');
    setAuthPage('login');
  }, []);

  // ── Derive display name & avatar ──
  const displayName = userProfile?.name || firebaseUser?.displayName || 'User';
  const userEmail = firebaseUser?.email || '';
  // Generate a consistent avatar from the user's email
  const avatarSeed = userEmail ? encodeURIComponent(userEmail) : '12';
  const avatarUrl = firebaseUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0f1117&textColor=00e5c0&radius=50`;

  // ── Page Router ──
  function renderPage() {
    switch (activeTab) {
      case 'Daily Log':
        return <DailyLog onMealLogged={handleMealLogged} />;
      case 'Activity':
        return <ActivityPage stats={stats} />;
      case 'Goals':
        return <GoalsPage stats={stats} />;
      case 'Settings':
        return <SettingsPage onLogout={handleLogout} userName={displayName} userEmail={userEmail} />;
      default:
        return (
          <div className="dashboard-container" key="dashboard">
            {/* Metrics Row */}
            <section className="metrics-row">
              {/* Total Calories */}
              <div className="metric-card">
                <div className="metric-header">
                  Total Calories
                  <div className="metric-icon"><IconLog /></div>
                </div>
                <div className="metric-value">{stats.calories.toLocaleString()} <span className="metric-unit">kcal</span></div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${pct}%`}} />
                </div>
                <div className="progress-labels">
                  <span>0</span>
                  <span>Goal: {CALORIE_GOAL.toLocaleString()}</span>
                </div>
              </div>

              {/* Calories Burned */}
              <div className="metric-card">
                <div className="metric-header">
                  Calories Burned
                  <div className="metric-icon icon-green"><IconActivity /></div>
                </div>
                <div className="metric-value">{stats.burned.toLocaleString()} <span className="metric-unit">kcal</span></div>
                <div className="metric-trend trend-green">
                  <span className="trend-arrow">↑</span> 12% from yesterday
                </div>
              </div>

              {/* Net Intake */}
              <div className="metric-card">
                <div className="metric-header">
                  Net Intake
                  <div className="metric-icon"><IconDashboard /></div>
                </div>
                <div className="metric-value">{net.toLocaleString()} <span className="metric-unit">kcal</span></div>
                <div className="metric-sub">
                  <span className="target-label">Target: {NET_TARGET.toLocaleString()} kcal</span>
                  <span className={`target-status ${net <= NET_TARGET ? 'on-track' : 'over'}`}>
                    {net <= NET_TARGET ? 'On Track' : 'Over'}
                  </span>
                </div>
              </div>

              {/* Water Intake */}
              <div className="metric-card">
                <div className="metric-header">
                  Water Intake
                  <div className="metric-icon icon-blue"><IconActivity /></div>
                </div>
                <div className="metric-value">64 <span className="metric-unit">oz</span></div>
                <div className="segmented-bar">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`segment ${i < 5 ? 'filled' : ''}`} />
                  ))}
                </div>
                <div className="progress-labels">
                  <span>5 of 8 glasses</span>
                  <span>62%</span>
                </div>
              </div>
            </section>

            {/* Charts Row 1 */}
            <section className="charts-row">
              <IntakeChart todayCalories={stats.calories} goal={CALORIE_GOAL} />
              <MacroDonut protein={stats.protein} carbs={stats.carbs} fat={stats.fat} />
            </section>

            {/* Charts Row 2 */}
            <section className="charts-row">
              <DailyBars todayCalories={stats.calories} />
              <ActivityRadar />
            </section>
          </div>
        );
    }
  }

  // ══════════════════════════════════
  // RENDER FLOW: Loading → Auth → Onboarding → Dashboard
  // ══════════════════════════════════

  // 1. Firebase still initializing
  if (firebaseUser === undefined) {
    return (
      <div className="auth-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="auth-spinner" style={{ width: 36, height: 36, borderColor: 'rgba(0,229,192,0.2)', borderTopColor: 'var(--primary)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    );
  }

  // 2. Not authenticated → show Login or Signup
  if (!firebaseUser) {
    if (authPage === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthPage('signup')} />;
  }

  // 3. Authenticated but no profile → show Onboarding
  if (!userProfile) {
    return (
      <Onboarding
        initialName={firebaseUser.displayName || ''}
        onComplete={(userData) => setUserProfile(userData)}
      />
    );
  }

  // 4. Fully authenticated + onboarded → Dashboard
  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>
          </div>
          <div className="brand-text">Kinetic<span>Lab</span></div>
          <span className="ai-badge">AI</span>
        </div>

        <nav className="nav-menu">
          {NAV_ITEMS.map(({ id, icon }) => {
            const badge = id === 'Daily Log' ? stats.mealCount : null;
            return (
              <div
                key={id}
                className={`nav-item ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                {icon}
                <span className="nav-label">{id}</span>
                {badge != null && <span className="nav-badge">{badge}</span>}
              </div>
            );
          })}
        </nav>

        <div className="user-profile">
          <div className="avatar" style={{backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover'}} />
          <div className="user-info">
            <h4>{displayName}</h4>
            <p>Premium Member</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">{activeTab}</h1>
          </div>

          <div className="header-search">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search metrics, logs…" className="search-input" />
          </div>

          <div className="header-right">
            <span className="header-date">
              {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' — '}
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
            <button className="action-btn bell-btn">
              <IconBell />
              <span className="bell-dot" />
            </button>
            <div className="header-avatar" style={{backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover'}} />
            <button className="action-btn primary" onClick={() => setActiveTab('Daily Log')}>+ Quick Log</button>
          </div>
        </header>

        <div className="page-wrapper" key={activeTab}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

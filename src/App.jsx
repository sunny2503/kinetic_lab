import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import './App.css';
import IntakeChart from './components/IntakeChart';
import MacroDonut from './components/MacroDonut';
import DailyBars from './components/DailyBars';
import ActivityRadar from './components/ActivityRadar';
import DailyLog from './components/DailyLog';
import { ActivityPage, GoalsPage, SettingsPage } from './components/Pages';
import Onboarding, { STORAGE_KEY } from './components/Onboarding';
import { LoginPage, SignupPage } from './components/AuthPages';
import { auth, isFirebaseConfigured, onAuthStateChanged, signOut } from './firebase';

// ── localStorage helpers ──
function load(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}
function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ── Storage keys ──
const MEALS_KEY = 'kinetic_lab_meals';
const ACTIVITIES_KEY = 'kinetic_lab_activities';
const GOALS_KEY = 'kinetic_lab_goals';
const SETTINGS_KEY = 'kinetic_lab_settings';

const DEFAULT_GOALS = {
  calorieGoal: 2400,
  proteinGoal: 150,
  carbGoal: 250,
  fatGoal: 65,
  waterGoal: 8,
  burnGoal: 500,
};

const DEFAULT_MEALS = [
  { id: 1, time: '8:15 AM',  name: 'Oatmeal with Blueberries', calories: 320, protein: 12, carbs: 54, fat: 6,  ai: false },
  { id: 2, time: '12:30 PM', name: 'Grilled Chicken Salad',     calories: 480, protein: 42, carbs: 18, fat: 22, ai: false },
];

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

export default function App() {
  // ── Firebase auth state ──
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [authPage, setAuthPage] = useState('login');

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Bypass Firebase if credentials aren't set
      setFirebaseUser({ uid: 'guest', displayName: 'Guest', isGuest: true });
      return;
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser || null);
    });
    return unsub;
  }, []);

  // ── Unified App State ──
  const initialData = useMemo(() => {
    const data = load('kinetic_lab_state', {});
    // Fallback to legacy keys if the unified state is empty
    return {
      userProfile: data.userProfile || load(STORAGE_KEY, null),
      meals: data.meals || load(MEALS_KEY, DEFAULT_MEALS),
      activities: data.activities || load(ACTIVITIES_KEY, []),
      goals: data.goals || load(GOALS_KEY, DEFAULT_GOALS),
      settings: data.settings || load(SETTINGS_KEY, {}),
      water: data.water || 0,
      notifications: data.notifications || []
    };
  }, []);

  const [userProfile, setUserProfile] = useState(initialData.userProfile);
  const [meals, setMeals] = useState(initialData.meals);
  const [activities, setActivities] = useState(initialData.activities);
  const [goals, setGoals] = useState(initialData.goals);
  const [settings, setSettings] = useState(initialData.settings);
  const [water, setWater] = useState(initialData.water);
  const [notifications, setNotifications] = useState(initialData.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  // Unified persistence to localStorage under a single key
  useEffect(() => {
    save('kinetic_lab_state', { userProfile, meals, activities, goals, settings, water, notifications });
  }, [userProfile, meals, activities, goals, settings, water, notifications]);

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [now, setNow] = useState(new Date());



  // ── Derived nutrition stats (computed from meals + activities) ──
  const stats = useMemo(() => {
    const s = meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const burned = activities.reduce((acc, a) => acc + a.cal, 0);

    return {
      ...s,
      burned,
      mealCount: meals.length,
      water: water, // sync actual water state here
    };
  }, [meals, activities, water]);

  const calorieGoal = goals.calorieGoal || 2400;
  const net = stats.calories - stats.burned;
  const netTarget = Math.round(calorieGoal * 0.67);
  const pct = Math.min(Math.round((stats.calories / calorieGoal) * 100), 100);

  // ── Handlers ──
  const handleMealLogged = useCallback((meal) => {
    setMeals(prev => [...prev, meal]);
  }, []);

  const handleActivityLogged = useCallback((activity) => {
    setActivities(prev => [...prev, activity]);
  }, []);

  const handleDeleteActivity = useCallback((id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleGoalsChange = useCallback((newGoals) => {
    setGoals(newGoals);
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    // Also update userProfile name if changed
    if (newSettings.displayName && userProfile) {
      const updated = { ...userProfile, name: newSettings.displayName };
      setUserProfile(updated);
      save(STORAGE_KEY, updated);
    }
  }, [userProfile]);

  const handleLogout = useCallback(async () => {
    if (isFirebaseConfigured) {
      try { await signOut(auth); } catch(e) { console.error(e); }
    }
    localStorage.removeItem('kinetic_lab_state');
    // Clear legacy keys too just in case
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MEALS_KEY);
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(GOALS_KEY);
    localStorage.removeItem(SETTINGS_KEY);

    setUserProfile(null);
    setActiveTab('Dashboard');
    setAuthPage('login');
    if (!isFirebaseConfigured) {
       setFirebaseUser(undefined);
       setTimeout(() => setFirebaseUser({ uid: 'guest', displayName: 'Guest', isGuest: true }), 100);
    }
  }, []);

  // ── Derive display name & avatar ──
  const displayName = settings.displayName || userProfile?.name || firebaseUser?.displayName || 'User';
  const userEmail = firebaseUser?.email || '';
  const avatarUrl = settings.photoUrl || firebaseUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0f1117&textColor=00e5c0&radius=50`;

  // ── Push Notifications Engine ──
  const notifRef = useRef({ displayName, pct });
  useEffect(() => { notifRef.current = { displayName, pct }; }, [displayName, pct]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Live clock & notification scheduler
    const t = setInterval(() => {
      const d = new Date();
      setNow(d);
      
      const hour = d.getHours();
      const minute = d.getMinutes();
      const dateStr = d.toDateString();

      const sendNotif = (id, title, body) => {
        const sentList = load('kinetic_notifs_sent', {});
        if (sentList[id]) return;
        
        sentList[id] = true;
        save('kinetic_notifs_sent', sentList);
        
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
        setNotifications(prev => [{
          id: Date.now(),
          title,
          body,
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        }, ...prev]);
      };

      const ref = notifRef.current;

      // 1. Meal Reminder — Every day at 8am, 1pm, and 7pm
      if ((hour === 8 || hour === 13 || hour === 19) && minute === 0) {
        sendNotif(`meal_${dateStr}_${hour}`, "🍽️ Time to log your meal!", `Time to log your meal, ${ref.displayName}!`);
      }
      
      // 2. Water Reminder — Every 2 hours (0, 2, 4...)
      if (hour % 2 === 0 && minute === 0) {
        sendNotif(`water_${dateStr}_${hour}`, "💧 Hydration Check", "Have you had water recently? Stay hydrated!");
      }
      
      // 3. Goal Check — At 9pm daily
      if (hour === 21 && minute === 0) {
        let msg = ref.pct >= 100 ? "Amazing job hitting your goal!" : "You've got this, don't give up!";
        sendNotif(`goal_${dateStr}_${hour}`, "📊 Daily Goal Check", `You've hit ${ref.pct}% of your calorie goal today. ${msg}`);
      }
    }, 60_000);
    
    return () => clearInterval(t);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // ── Page Router ──
  function renderPage() {
    switch (activeTab) {
      case 'Daily Log':
        return <DailyLog meals={meals} goals={goals} onMealLogged={handleMealLogged} />;
      case 'Activity':
        return (
          <ActivityPage
            activities={activities}
            onActivityLogged={handleActivityLogged}
            onDeleteActivity={handleDeleteActivity}
          />
        );
      case 'Goals':
        return <GoalsPage stats={stats} goals={goals} onGoalsChange={handleGoalsChange} />;
      case 'Settings':
        return (
          <SettingsPage
            onLogout={handleLogout}
            userName={displayName}
            userEmail={userEmail}
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
        );
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
                  <span>Goal: {calorieGoal.toLocaleString()}</span>
                </div>
              </div>

              {/* Calories Burned */}
              <div className="metric-card">
                <div className="metric-header">
                  Calories Burned
                  <div className="metric-icon icon-green"><IconActivity /></div>
                </div>
                <div className="metric-value">{stats.burned.toLocaleString()} <span className="metric-unit">kcal</span></div>
                <div className="progress-bar" style={{background: 'rgba(74, 222, 128, 0.12)'}}>
                  <div className="progress-fill" style={{width: `${Math.min(Math.round((stats.burned / (goals.burnGoal || 500)) * 100), 100)}%`, background: 'linear-gradient(90deg, #4ade80, #22c55e)'}} />
                </div>
                <div className="progress-labels">
                  <span>0</span>
                  <span>Goal: {(goals.burnGoal || 500).toLocaleString()}</span>
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
                  <span className="target-label">Target: {netTarget.toLocaleString()} kcal</span>
                  <span className={`target-status ${net <= netTarget ? 'on-track' : 'over'}`}>
                    {net <= netTarget ? 'On Track' : 'Over'}
                  </span>
                </div>
              </div>

              {/* Water Intake */}
              <div className="metric-card">
                <div className="metric-header">
                  Water Intake
                  <div className="metric-icon icon-blue"><IconActivity /></div>
                </div>
                <div className="metric-value">{stats.water} <span className="metric-unit">glasses</span></div>
                <div className="segmented-bar">
                  {[...Array(goals.waterGoal || 8)].map((_, i) => (
                    <div key={i} className={`segment ${i < stats.water ? 'filled' : ''}`} />
                  ))}
                </div>
                <div className="progress-labels">
                  <span>{stats.water} of {goals.waterGoal || 8} glasses</span>
                  <span>{Math.round((stats.water / (goals.waterGoal || 8)) * 100)}%</span>
                </div>
              </div>
            </section>

            {/* Charts Row 1 */}
            <section className="charts-row">
              <IntakeChart todayCalories={stats.calories} goal={calorieGoal} />
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
            let badge = null;
            if (id === 'Daily Log') badge = stats.mealCount;
            if (id === 'Activity') badge = activities.length || null;
            return (
              <div
                key={id}
                className={`nav-item ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                {icon}
                <span className="nav-label">{id}</span>
                {badge != null && badge > 0 && <span className="nav-badge">{badge}</span>}
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
            <div className="notification-wrapper">
              <button className="action-btn bell-btn" onClick={handleOpenNotifications}>
                <IconBell />
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notif-header">Notifications</div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No new notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="notif-item">
                          <div className="notif-item-title">{n.title}</div>
                          <div className="notif-item-body">{n.body}</div>
                          <div className="notif-item-time">{n.time}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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

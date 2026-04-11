import React, { useState, useMemo } from 'react';
import './Onboarding.css';

const STORAGE_KEY = 'kinetic_lab_user';

/** Mifflin-St Jeor BMR + activity multiplier */
function calculateCalories({ gender, age, weight, height, activityLevel }) {
  let bmr;
  if (gender === 'Male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'Female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 78; // midpoint
  }

  const multipliers = {
    Sedentary: 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
  };

  const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2));
  return tdee;
}

function getMacros(calories, goal) {
  // Adjust for goal
  let adjusted = calories;
  if (goal === 'Lose Weight') adjusted = Math.round(calories * 0.8);
  else if (goal === 'Gain Muscle') adjusted = Math.round(calories * 1.1);

  // Protein 30%, Carbs 40%, Fat 30%
  const protein = Math.round((adjusted * 0.3) / 4);
  const carbs = Math.round((adjusted * 0.4) / 4);
  const fat = Math.round((adjusted * 0.3) / 9);
  return { calories: adjusted, protein, carbs, fat };
}

// ── Checkmark SVG ──
const CheckSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// ══════════════════════════════════
// STEP 1 — Personal Info
// ══════════════════════════════════
function StepPersonal({ data, onChange }) {
  return (
    <>
      <h2 className="step-title">Tell us about yourself</h2>
      <p className="step-subtitle">We'll use this to personalize your experience and calculate your targets.</p>

      <div className="form-group">
        <label className="form-label">Your Name</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. Alex Rivers"
          value={data.name}
          onChange={e => onChange('name', e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Age</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 25"
          min="10" max="100"
          value={data.age}
          onChange={e => onChange('age', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Gender</label>
        <div className="radio-group">
          {['Male', 'Female', 'Other'].map(g => (
            <label key={g} className={`radio-card ${data.gender === g ? 'selected' : ''}`}>
              <input type="radio" name="gender" value={g} checked={data.gender === g} onChange={() => onChange('gender', g)} />
              {g}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════
// STEP 2 — Body Metrics
// ══════════════════════════════════
function StepMetrics({ data, onChange }) {
  return (
    <>
      <h2 className="step-title">Body Metrics</h2>
      <p className="step-subtitle">Enter your current weight and height for accurate calorie calculations.</p>

      <div className="form-group">
        <label className="form-label">Current Weight (kg)</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 70"
          min="20" max="300"
          value={data.weight}
          onChange={e => onChange('weight', e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Height (cm)</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 175"
          min="100" max="250"
          value={data.height}
          onChange={e => onChange('height', e.target.value)}
        />
      </div>
    </>
  );
}

// ══════════════════════════════════
// STEP 3 — Goal
// ══════════════════════════════════
const GOALS = [
  { id: 'Lose Weight', emoji: '🔥', desc: 'Burn fat and get lean with a calorie deficit' },
  { id: 'Maintain', emoji: '⚖️', desc: 'Stay balanced with your current physique' },
  { id: 'Gain Muscle', emoji: '💪', desc: 'Build muscle with a calorie surplus' },
];

function StepGoal({ data, onChange }) {
  return (
    <>
      <h2 className="step-title">What's your goal?</h2>
      <p className="step-subtitle">Choose a fitness goal and we'll tailor your calorie & macro targets.</p>

      <div className="goal-cards">
        {GOALS.map(g => (
          <div key={g.id} className={`goal-card ${data.goal === g.id ? 'selected' : ''}`} onClick={() => onChange('goal', g.id)}>
            <div className="goal-icon">{g.emoji}</div>
            <div>
              <div className="goal-label">{g.id}</div>
              <div className="goal-desc">{g.desc}</div>
            </div>
            <div className="goal-check">
              {data.goal === g.id && <CheckSVG />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════
// STEP 4 — Activity Level
// ══════════════════════════════════
const ACTIVITIES = [
  { id: 'Sedentary', emoji: '🪑', desc: 'Little or no exercise' },
  { id: 'Lightly Active', emoji: '🚶', desc: 'Exercise 1–3 days/week' },
  { id: 'Moderately Active', emoji: '🏃', desc: 'Exercise 3–5 days/week' },
  { id: 'Very Active', emoji: '🏋️', desc: 'Intense exercise 6–7 days' },
];

function StepActivity({ data, onChange }) {
  return (
    <>
      <h2 className="step-title">Activity Level</h2>
      <p className="step-subtitle">How active are you on a typical week? This affects your daily calorie needs.</p>

      <div className="activity-cards">
        {ACTIVITIES.map(a => (
          <div key={a.id} className={`activity-card ${data.activityLevel === a.id ? 'selected' : ''}`} onClick={() => onChange('activityLevel', a.id)}>
            <div className="activity-emoji">{a.emoji}</div>
            <div className="activity-title">{a.id}</div>
            <div className="activity-desc">{a.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════
// STEP 5 — Summary
// ══════════════════════════════════
function StepSummary({ data }) {
  const tdee = calculateCalories({
    gender: data.gender,
    age: Number(data.age),
    weight: Number(data.weight),
    height: Number(data.height),
    activityLevel: data.activityLevel,
  });

  const { calories, protein, carbs, fat } = getMacros(tdee, data.goal);

  return (
    <>
      <h2 className="step-title">Your Personalized Plan</h2>
      <p className="step-subtitle">Based on your profile, here's your recommended daily target.</p>

      <div className="summary-hero">
        <div className="summary-calories">{calories.toLocaleString()}</div>
        <div className="summary-calories-label">Calories / Day</div>
      </div>

      <div className="summary-macros">
        <div className="macro-card protein">
          <div className="macro-value">{protein}</div>
          <div className="macro-unit">grams</div>
          <div className="macro-name">Protein</div>
        </div>
        <div className="macro-card carbs">
          <div className="macro-value">{carbs}</div>
          <div className="macro-unit">grams</div>
          <div className="macro-name">Carbs</div>
        </div>
        <div className="macro-card fat">
          <div className="macro-value">{fat}</div>
          <div className="macro-unit">grams</div>
          <div className="macro-name">Fat</div>
        </div>
      </div>

      <div className="summary-details">
        <div className="summary-row">
          <span className="summary-key">Name</span>
          <span className="summary-val">{data.name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Goal</span>
          <span className="summary-val">{data.goal}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Activity</span>
          <span className="summary-val">{data.activityLevel}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">BMR → TDEE</span>
          <span className="summary-val">{tdee.toLocaleString()} kcal</span>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════
// MAIN ONBOARDING COMPONENT
// ══════════════════════════════════
export default function Onboarding({ onComplete, initialName = '' }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [slideKey, setSlideKey] = useState(0);

  const [data, setData] = useState({
    name: initialName,
    age: '',
    gender: '',
    weight: '',
    height: '',
    goal: '',
    activityLevel: '',
  });

  const handleChange = (field, val) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const STEPS = [
    <StepPersonal data={data} onChange={handleChange} />,
    <StepMetrics data={data} onChange={handleChange} />,
    <StepGoal data={data} onChange={handleChange} />,
    <StepActivity data={data} onChange={handleChange} />,
    <StepSummary data={data} />,
  ];

  // Validation per step
  const isValid = useMemo(() => {
    switch (step) {
      case 0: return data.name.trim() && data.age && data.gender;
      case 1: return data.weight && data.height;
      case 2: return !!data.goal;
      case 3: return !!data.activityLevel;
      case 4: return true;
      default: return false;
    }
  }, [step, data]);

  const goNext = () => {
    if (!isValid) return;
    if (step === 4) {
      // Save and finish
      const tdee = calculateCalories({
        gender: data.gender,
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        activityLevel: data.activityLevel,
      });
      const macros = getMacros(tdee, data.goal);
      const userData = { ...data, ...macros, tdee, onboardedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      onComplete(userData);
      return;
    }
    setDirection('forward');
    setSlideKey(k => k + 1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection('back');
    setSlideKey(k => k + 1);
    setStep(s => s - 1);
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        {/* Brand */}
        <div className="onboarding-brand">
          <div className="onboarding-brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>
          </div>
          <div className="onboarding-brand-text">Kinetic<span>Lab</span></div>
        </div>

        {/* Stepper */}
        <div className="onboarding-stepper">
          {[1, 2, 3, 4, 5].map((n, i) => (
            <div key={n} className="stepper-step">
              <div className={`stepper-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
                {i < step ? <CheckSVG /> : n}
              </div>
              {i < 4 && <div className={`stepper-line ${i < step ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="onboarding-card">
          <div className="slide-wrapper">
            <div key={slideKey} className={`slide ${direction === 'back' ? 'slide-back' : ''}`}>
              {STEPS[step]}
            </div>
          </div>

          {/* Buttons */}
          {step < 4 ? (
            <div className="onboarding-buttons">
              {step > 0 ? (
                <button className="btn-back" onClick={goBack}>← Back</button>
              ) : <div />}
              <button className="btn-next" disabled={!isValid} onClick={goNext}>
                Continue <ArrowRight />
              </button>
            </div>
          ) : (
            <button className="btn-launch" onClick={goNext}>
              🚀 Let's Go — Start Tracking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { STORAGE_KEY };

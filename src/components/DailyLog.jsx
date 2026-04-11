import React, { useState, useRef, useEffect } from 'react';
import './DailyLog.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

export default function DailyLog({ meals = [], goals, onMealLogged }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const [pendingMeal, setPendingMeal] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const inputRef = useRef(null);
  const listEndRef = useRef(null);

  // Compute running totals
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meals]);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setInsight(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      const mediaType = file.type || 'image/jpeg';

      try {
        const res = await fetch(`${API_BASE}/api/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String, mediaType }),
        });
        const data = await res.json();
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        const newMeal = {
          id: Date.now(),
          time: timeStr,
          name: data.food_name || 'Analyzed Meal',
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          ai: true,
          photoBase64: reader.result // save the data URL to display it
        };

        setInsight(data.insight);
        setPendingMeal(newMeal);
      } catch (err) {
        console.error('Failed to analyze image:', err);
        setInsight('Could not analyze the image.');
      } finally {
        setLoading(false);
        // Reset file input
        e.target.value = null;
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const mealName = input.trim();
    setInput('');
    setLoading(true);
    setInsight(null);

    try {
      const res = await fetch(`${API_BASE}/api/analyze-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal: mealName, dailyTotal: totals }),
      });

      const data = await res.json();

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      const newMeal = {
        id: Date.now(),
        time: timeStr,
        name: data.meal || mealName,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        ai: true,
      };

      setInsight(data.insight);
      setPendingMeal(newMeal);

    } catch (err) {
      console.error('Failed to analyze meal:', err);
      setInsight('Could not reach AI — please check your connection.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleConfirmPending() {
    if (pendingMeal && onMealLogged) {
      onMealLogged(pendingMeal);
    }
    
    // Fetch upgraded weekly insights
    if (goals) {
      setInsightLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/meal-insight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meals: [...meals, pendingMeal],
            goals: goals
          })
        });
        const data = await res.json();
        setWeeklyInsight(data);
      } catch (err) {
        console.error('Failed to fetch weekly insight', err);
      } finally {
        setInsightLoading(false);
      }
    }

    setPendingMeal(null);
    setInsight(null);
    inputRef.current?.focus();
  }

  function handleCancelPending() {
    setPendingMeal(null);
    setInsight(null);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <div className="daily-log">
      {/* Summary Bar */}
      <div className="log-summary">
        <div className="summary-item">
          <span className="summary-val">{totals.calories.toLocaleString()}</span>
          <span className="summary-label">kcal total</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-val highlight">{totals.protein}g</span>
          <span className="summary-label">Protein</span>
        </div>
        <div className="summary-item">
          <span className="summary-val" style={{color: '#ffb07c'}}>{totals.carbs}g</span>
          <span className="summary-label">Carbs</span>
        </div>
        <div className="summary-item">
          <span className="summary-val" style={{color: '#6b7280'}}>{totals.fat}g</span>
          <span className="summary-label">Fat</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-val">{meals.length}</span>
          <span className="summary-label">Meals</span>
        </div>
      </div>

      {/* Meal List */}
      <div className="meal-list">
        {meals.map((meal) => (
          <div key={meal.id} className={`meal-entry ${meal.ai ? 'ai-entry' : ''}`}>
            {meal.photoBase64 && (
              <div className="meal-thumb" style={{backgroundImage: `url(${meal.photoBase64})`}} />
            )}
            <div className="meal-time">{meal.time}</div>
            <div className="meal-details">
              <div className="meal-name">
                {meal.name}
                {meal.ai && <span className="ai-tag">AI</span>}
              </div>
              <div className="meal-macros">
                <span className="macro-pill">{meal.protein}g P</span>
                <span className="macro-pill carb">{meal.carbs}g C</span>
                <span className="macro-pill fat">{meal.fat}g F</span>
              </div>
            </div>
            <div className="meal-cal">{meal.calories} kcal</div>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>

      {/* Old inline AI Insight is removed or can be kept, but we are replacing with the new structured one */}

      {insightLoading && (
        <div className="weekly-insight-card loading-insight">
           <div className="spinner" /> Analyzing weekly patterns...
        </div>
      )}

      {/* Upgraded Weekly AI Insight Card */}
      {weeklyInsight && !insightLoading && (
        <div className="weekly-insight-card">
          <div className="weekly-insight-header">
            <div className="insight-icon cyan-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h4>Kinetic AI Analysis</h4>
          </div>
          
          <div className="insight-grid">
            <div className="insight-box">
              <span className="box-label">Pattern Detected</span>
              <p>{weeklyInsight.pattern}</p>
            </div>
            <div className="insight-box">
              <span className="box-label">Macro Balance</span>
              <p>{weeklyInsight.macros}</p>
            </div>
          </div>
          
          <div className="insight-suggestion">
            <strong>Suggestion:</strong> {weeklyInsight.suggestion}
          </div>
          
          <div className="insight-motivation">
            "{weeklyInsight.motivation}"
          </div>
        </div>
      )}

      {/* Pending Meal Confirmation */}
      {pendingMeal && (
        <div className="pending-meal-card">
          <div className="pending-header">
            <h4>Confirm Meal</h4>
            <button className="icon-btn" onClick={handleCancelPending}>×</button>
          </div>
          <div className="pending-body">
            <div className="pending-name">{pendingMeal.name}</div>
            <div className="pending-cal">{pendingMeal.calories} kcal</div>
          </div>
          <div className="pending-macros">
            <div className="macro-stat"><span>{pendingMeal.protein}g</span> Protein</div>
            <div className="macro-stat"><span>{pendingMeal.carbs}g</span> Carbs</div>
            <div className="macro-stat"><span>{pendingMeal.fat}g</span> Fat</div>
          </div>
          <div className="pending-actions">
            <button className="cancel-btn" onClick={handleCancelPending}>Cancel</button>
            <button className="confirm-btn" onClick={handleConfirmPending}>Add to Log</button>
          </div>
        </div>
      )}

      {/* AI Chat Input */}
      <form className="ai-input-bar" onSubmit={handleSubmit}>
        <div className="input-glow" />
        <label className="ai-camera-btn">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
            disabled={loading || !!pendingMeal}
          />
          <CameraIcon />
        </label>
        <input
          ref={inputRef}
          type="text"
          className="ai-input"
          placeholder={loading ? 'Analyzing with Vision/AI...' : 'Log a meal — e.g. "100g oatmeal"'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || !!pendingMeal}
        />
        <button type="submit" className="ai-send" disabled={loading || !input.trim() || !!pendingMeal}>
          {loading ? (
            <div className="spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

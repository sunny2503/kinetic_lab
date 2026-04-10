import React, { useState, useRef, useEffect } from 'react';
import './DailyLog.css';

const INITIAL_MEALS = [
  { id: 1, time: '8:15 AM',  name: 'Oatmeal with Blueberries', calories: 320, protein: 12, carbs: 54, fat: 6,  ai: false },
  { id: 2, time: '12:30 PM', name: 'Grilled Chicken Salad',     calories: 480, protein: 42, carbs: 18, fat: 22, ai: false },
];

export default function DailyLog({ onMealLogged }) {
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const mealName = input.trim();
    setInput('');
    setLoading(true);
    setInsight(null);

    try {
      const res = await fetch('/api/analyze-meal', {
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

      setMeals((prev) => [...prev, newMeal]);
      setInsight(data.insight);

      // Notify parent to update dashboard stats
      if (onMealLogged) {
        onMealLogged(newMeal);
      }
    } catch (err) {
      console.error('Failed to analyze meal:', err);
      setInsight('Could not reach AI — please check your connection.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
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

      {/* AI Insight */}
      {insight && (
        <div className="ai-insight">
          <div className="insight-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <p>{insight}</p>
        </div>
      )}

      {/* AI Chat Input */}
      <form className="ai-input-bar" onSubmit={handleSubmit}>
        <div className="input-glow" />
        <div className="ai-input-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="ai-input"
          placeholder={loading ? 'Analyzing with AI...' : 'Log a meal — e.g. "Grilled salmon with rice"'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="ai-send" disabled={loading || !input.trim()}>
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

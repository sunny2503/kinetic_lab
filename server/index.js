import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a precision nutrition AI assistant for the "Kinetic Lab" calorie tracking app.

When a user tells you what they ate, you must:
1. Estimate the calories and macronutrients (protein, carbs, fat) as accurately as possible.
2. Provide a short, personalized insight based on their daily progress.

ALWAYS respond in this exact JSON format and nothing else:
{
  "meal": "Name of the meal",
  "calories": 450,
  "protein": 30,
  "carbs": 45,
  "fat": 15,
  "insight": "A short personalized insight about their nutrition progress"
}

Rules:
- Be accurate with calorie and macro estimates based on typical serving sizes.
- If the user specifies a quantity, use that. Otherwise assume a standard single serving.
- The insight should be encouraging, specific, and reference their daily progress.
- Keep the insight under 120 characters.
- Always return valid JSON only — no markdown, no code fences, no extra text.`;

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { meal, dailyTotal } = req.body;

    if (!meal) {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    const userMessage = `I just ate: "${meal}". My daily totals so far: ${dailyTotal.calories} kcal consumed, goal is 2400 kcal. Protein: ${dailyTotal.protein}g, Carbs: ${dailyTotal.carbs}g, Fat: ${dailyTotal.fat}g.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({
      error: 'AI analysis failed',
      meal: req.body.meal || 'Unknown',
      calories: 250,
      protein: 15,
      carbs: 30,
      fat: 10,
      insight: 'Estimation unavailable — using approximate values.',
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`⚡ Kinetic Lab API running on http://localhost:${PORT}`);
});

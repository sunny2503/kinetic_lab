import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a precision nutrition AI assistant for the "Kinetic Lab" calorie tracking app.

When a user tells you what they ate, you must:
1. Estimate the calories and macronutrients (protein, carbs, fat) as accurately as possible.
2. Provide a short, personalized insight based on their daily progress.

If provided, you MUST use the "Open Food Facts 100g Baseline" to calculate the final values based on the portion size the user specified.

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
- Be accurate with calorie and macro estimates based on typical serving sizes or user input.
- The insight should be encouraging and specific. Keep it under 120 characters.
- Return valid JSON only — no markdown, no extra text.`;

app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { meal, dailyTotal } = req.body;

    if (!meal) {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    // 1. Search Open Food Facts
    let offContext = '';
    try {
      const offRes = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(meal)}&search_simple=1&action=process&json=1&page_size=1`);
      const offData = await offRes.json();

      if (offData && offData.products && offData.products.length > 0) {
        const p = offData.products[0];
        const n = p.nutriments;
        offContext = `\n\nOPEN FOOD FACTS BASELINE for "${p.product_name || meal}":\n` +
                     `- Calories: ${n['energy-kcal_100g'] || 0} kcal per 100g\n` +
                     `- Protein: ${n.proteins_100g || 0}g per 100g\n` +
                     `- Carbs: ${n.carbohydrates_100g || 0}g per 100g\n` +
                     `- Fat: ${n.fat_100g || 0}g per 100g\n\n` +
                     `Use this baseline to mathematically calculate the final values for the user's portion size.`;
      }
    } catch (apiErr) {
      console.warn('Open Food Facts API error:', apiErr.message);
    }

    const userMessage = `I just ate: "${meal}". My daily totals so far: ${dailyTotal.calories} kcal consumed. Protein: ${dailyTotal.protein}g, Carbs: ${dailyTotal.carbs}g, Fat: ${dailyTotal.fat}g.${offContext}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
      error: 'AI analysis failed'
    });
  }
});

const INSIGHT_SYSTEM_PROMPT = `You are a precision nutrition AI assistant for Kinetic Lab.
The user will provide their full week's meal history and their daily macro/calorie goals.
You must analyze this data and return EXACTLY this JSON structure, and nothing else (no markdown, no extra text):
{
  "pattern": "A short sentence detecting a pattern (e.g. You tend to eat most of your carbs at night).",
  "macros": "A short sentence checking if macros are balanced or flagging consistent lows/highs.",
  "suggestion": "One specific food or snack suggestion to help hit their remaining daily goal.",
  "motivation": "A motivational one-liner based on their progress."
}`;

app.post('/api/meal-insight', async (req, res) => {
  try {
    const { meals, goals } = req.body;
    
    // Determine the current totals from meals (assuming meals array is today's for simplicity)
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const userMessage = `
User Goals: ${goals.calorieGoal} kcal, ${goals.proteinGoal}g protein, ${goals.carbGoal}g carbs, ${goals.fatGoal}g fat.
Today's Current Totals: ${totals.calories} kcal, ${totals.protein}g protein, ${totals.carbs}g carbs, ${totals.fat}g fat.
Meal History (recent logs): ${JSON.stringify(meals.slice(-10))}

Analyze and return the JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: INSIGHT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error('Insight API error:', err.message);
    res.status(500).json({ error: 'Insight analysis failed' });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;
    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'Image data missing' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Explicit requested model
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Identify the food items in this image and estimate the total calories, protein, carbs, and fat. Return as JSON exactly like this, no markdown or extra text: { "food_name": "...", "calories": 450, "protein": 30, "carbs": 45, "fat": 15, "insight": "Look delicious! ..." }'
            }
          ]
        }
      ]
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch(err) {
    console.error('Image analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze meal from image.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`⚡ Kinetic Lab API running on http://localhost:${PORT}`);
});

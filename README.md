<div align="center">

# 🧪 Kinetic Lab
### Precision Analysis · AI-Powered Calorie & Fitness Tracker

![Version](https://img.shields.io/badge/version-0.0.0-00e5c0?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

A sleek, dark-themed fitness dashboard that combines real-time calorie tracking with an AI-powered meal logging assistant — built with React, Recharts, and the Anthropic Claude API.

![Kinetic Lab Dashboard Preview](./public/preview.png)

</div>

---

## ✨ Features

- **🤖 AI Meal Logging** — Type a meal name and Claude instantly estimates its calories and macros
- **📊 Interactive Dashboard** — Live charts for caloric intake, daily calories, macro breakdown, and activity distribution
- **📈 Weekly Analytics** — Line chart and bar chart views with Week/Month toggle
- **🍩 Macro Breakdown** — Donut chart tracking Protein, Carbs, and Fat in real time
- **🔷 Activity Distribution** — Radar chart across Strength, Cardio, Flexibility, and Focus
- **💧 Water Intake Tracker** — Segmented progress bar for daily hydration goals
- **🎯 Goal Tracking** — Set and monitor Net Intake targets
- **🔔 Notifications** — Bell icon with alert support in the header
- **📱 Responsive Design** — Works seamlessly across desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8 |
| Charts | Recharts 3 |
| Backend | Express 5, Node.js |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Styling | Custom CSS with dark theme |
| Dev Tools | ESLint, Vite HMR |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- An [Anthropic API Key](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sunny2503/kinetic_lab.git
cd kinetic_lab

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

### Environment Setup

Add your Anthropic API key to the `.env` file:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### Running the App

```bash
# Start the backend server
node server/index.js

# In a separate terminal, start the frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
kinetic_lab/
├── public/                  # Static assets
├── server/                  # Express backend
│   └── index.js             # API routes + Claude integration
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── CalorieChart.jsx
│   │   ├── MacroDonut.jsx
│   │   ├── DailyCaloriesBar.jsx
│   │   └── ActivityRadar.jsx
│   ├── pages/               # Route-level pages
│   │   ├── Dashboard.jsx
│   │   ├── DailyLog.jsx
│   │   ├── Activity.jsx
│   │   ├── Goals.jsx
│   │   └── Settings.jsx
│   ├── App.jsx              # Root component + routing
│   └── main.jsx             # Entry point
├── .env                     # Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🤖 AI Integration

Kinetic Lab uses the **Anthropic Claude API** for intelligent meal analysis. When a user logs a meal, the AI:

1. Estimates **calories** based on the meal name and portion
2. Breaks down **macros** — Protein, Carbs, and Fat in grams
3. Updates all **dashboard charts** in real time
4. Provides a **personalized insight** (e.g. *"You're 200 kcal under your goal — consider a light snack"*)

The AI chat input lives in the **Daily Log** page.

---

## 📦 Available Scripts

```bash
npm run dev        # Start development server (Vite HMR)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## 🗺️ Roadmap

- [ ] User authentication & profiles
- [ ] Persistent meal history with database
- [ ] Food photo recognition via AI vision
- [ ] Export reports as PDF
- [ ] Mobile app (React Native)
- [ ] Integration with wearables (Apple Health, Fitbit)

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by [sunny2503](https://github.com/sunny2503)

⭐ Star this repo if you find it useful!

</div>

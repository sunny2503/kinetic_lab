# Deploying Kinetic Lab

Follow these steps to deploy Kinetic Lab securely across Vercel (Frontend) and Render (Backend).

## Step 1: Deploy Backend to Render
Your Node.js Express server runs independently to securely proxy requests to the Anthropic API.

1. Create a new account / log into [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing this project.
4. Set the following environment configurations:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Advanced** and add these Environment Variables:
   - `ANTHROPIC_API_KEY`: *(Your secret Anthropic Claude API Key)*
   - `FRONTEND_URL`: Leave blank or set to your Vercel URL later to restrict CORS (e.g., `https://kinetic-lab.vercel.app`).
6. Click **Create Web Service**. Wait until it is successfully deployed.
7. Note down the rendered URL (e.g. `https://kinetic-backend.onrender.com`).

---

## Step 2: Deploy Frontend to Vercel
Your React frontend connects dynamically to the Render backend via an environment variable.

1. Go to [Vercel](https://vercel.com/) and create a **New Project**.
2. Import this same GitHub repository.
3. Vercel will automatically detect `Vite`. Leave the Build Command as `npm run build`.
4. Open the **Environment Variables** drop-down and add all necessary keys (see `.env.example`).
   - *Critically Required:* 
     - `VITE_API_URL`: The URL of your newly launched Render backend (e.g., `https://kinetic-backend.onrender.com`).
     - `VITE_FIREBASE_*`: Fill in all your Firebase config elements for Authentication to pass cleanly.
5. Click **Deploy**.
6. Vercel will build the frontend using your updated Vite configuration and safely deploy it.

---

## Technical Enhancements Covered
- **No API expose:** All SDK calls operate locally in `server/index.js`, preventing scraping and protecting your expensive Claude API usage.
- **SPA Redirection:** `vercel.json` intercepts all frontend routing queries, pushing traffic accurately to `index.html` preventing React-router 404s.
- **CORS Lockdowns:** Your backend checks the standard Render environment to ensure endpoints accept frontend ingress flawlessly.
- **Health Verification:** Test your server instantly by loading `<render-url>/health` returning `{ "status": "ok" }`.

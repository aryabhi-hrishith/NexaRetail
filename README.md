# NexaRetail — AI-Driven Promotion & Inventory Alignment Planner

Full-stack application combining a React + Tailwind frontend with a
Python ML pipeline exposed as a Flask REST API.

## Project Structure

```
dev/
+-- frontend/          # React 19 + Vite + Tailwind CSS 4 + Recharts
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   +-- context/AppContext.jsx   # Global state + live API fetching
¦   ¦   +-- pages/
¦   ¦   +-- services/
¦   ¦       +-- api.js               # Fetch wrapper for backend endpoints
¦   ¦       +-- mockData.js          # Offline fallback data
¦   ¦       +-- recommendationEngine.js
¦   +-- vite.config.js               # Proxies /api/* -> localhost:5000 in dev
¦   +-- package.json
¦
+-- backend/           # Python ML API (Flask)
¦   +-- app.py         # Flask REST API server
¦   +-- src/
¦   ¦   +-- data_prep.py
¦   ¦   +-- forecasting.py          # scikit-learn RandomForest demand forecast
¦   ¦   +-- personalization.py      # K-Means customer segmentation
¦   ¦   +-- inventory.py            # Stock-risk scoring
¦   ¦   +-- promotion_engine.py     # AI promotion recommendations
¦   +-- data/                       # CSV data files
¦   +-- requirements.txt
¦
+-- backend-temp/      # Original cloned repo (kept for reference)
```

## Quick Start

### 1. Start the backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# API running at http://localhost:5000
```

### 2. Start the frontend

```bash
cd frontend
npm install   # first time only
npm run dev
# App running at http://localhost:5173
```

The Vite dev server automatically proxies `/api/*` to the Flask backend.
If the backend is not running, the frontend falls back to built-in mock data.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/overview` | KPI metrics |
| GET | `/api/products` | Products with inventory & risk |
| GET | `/api/forecast` | 7-day demand forecast |
| GET | `/api/customers/segments` | Customer segment summary + detail |
| GET | `/api/customers/preferences` | Segment ? category preferences |
| GET | `/api/promotions` | Full promotion plan |
| GET | `/api/promotions?segment=0` | Promotions for a specific segment |
| GET | `/api/sales/daily` | Daily aggregated sales history |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Recharts, React Router 7 |
| Backend | Python 3.10+, Flask 3, scikit-learn, pandas, NumPy |
| ML | Random Forest (demand), K-Means (segmentation) |
| Data | 4 CSV files — 30 products, 120 customers, 180-day history |

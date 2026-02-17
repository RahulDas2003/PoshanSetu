# 🍎 SmartAI Nutrition App

An AI-powered nutrition tracking and meal planning application built with the MERN stack.

## Features

- 📸 **AI Food Analysis** - Scan food photos for instant nutrition info
- 🍽️ **Smart Meal Logging** - Easy tracking with search & quick-add
- 📊 **Beautiful Dashboard** - Charts, progress rings, and insights
- 🎯 **Personalized Goals** - Auto-calculated targets based on your profile
- 🤖 **AI Recommendations** - Smart meal suggestions

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **APIs**: OpenFoodFacts (free), CalorieNinjas

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- CalorieNinjas API key (free at https://calorieninjas.com)

### Installation

1. Clone the repository
2. Set up backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and API keys
   npm install
   npm run dev
   ```

3. Set up frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Project Structure

```
smartai-nutrition-app/
├── backend/           # Express.js API
│   ├── src/
│   │   ├── config/    # Database config
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── server.js
│
├── frontend/          # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── services/
│
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Health Check
- `GET /api/health` - Check API status

## License

ISC

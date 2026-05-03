# Nudg

AI-powered matching platform. Your agent meets their agent. If they click, you get a date.

## Structure

```
nudg/
  mobile/     # React Native + Expo app
  backend/    # Python + FastAPI + Claude API
  shared/     # Shared types
```

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

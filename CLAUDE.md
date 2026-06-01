# HouseOS — AI-Powered House Architecture Builder

## Project Overview
Full-stack SaaS platform for AI-powered house design, 2D/3D floor plans, construction cost estimation, and architect collaboration.

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite + Material UI + React Three Fiber + Zustand + React Query
- **Backend:** Node.js + Express.js + MongoDB + Mongoose + JWT + Cloudinary + Socket.io
- **AI:** OpenAI API (gpt-4o)
- **Auth:** JWT + Google OAuth

## Project Structure
```
HouseOS/
├── client/          # React frontend (Vite + TS)
├── server/          # Express backend
├── CLAUDE.md
└── .gitignore
```

## Run Commands
- **Frontend:** `cd client && npm run dev` (port 5173)
- **Backend:** `cd server && npm run dev` (port 5000)
- **Both:** Run both simultaneously in separate terminals

## Environment Variables
### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://kabirbiswas131:29959Mkb@cluster0.laui9vf.mongodb.net/?appName=Cluster0
JWT_SECRET=houseos_jwt_secret_key_2024
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

## MongoDB URI
`mongodb+srv://kabirbiswas131:29959Mkb@cluster0.laui9vf.mongodb.net/?appName=Cluster0`

## Key Features
1. Auth system (JWT + Google OAuth, roles: homeowner/architect/builder/admin)
2. Dashboard with stats, charts, timeline
3. Project management (CRUD + archive + share)
4. 2D Floor Plan Builder (canvas-based drag-and-drop)
5. 3D House Generator (React Three Fiber)
6. AI House Generator wizard (OpenAI)
7. AI Architect Assistant chat
8. Construction Cost Estimator with BOQ
9. Interior Design Studio
10. Architect Marketplace
11. Collaboration (Socket.io real-time)
12. Export system (PDF/PNG/DXF)
13. Admin panel
14. Subscription tiers (Free/Pro/Enterprise)

## API Base
All backend routes: `/api/*`

## Git
- GitHub Username: KKABIR07
- Repo: HomeOS (public)
- Remote: https://github.com/KKABIR07/HomeOS.git

## Status
- [ ] Backend scaffolded
- [ ] Frontend scaffolded
- [ ] Auth implemented
- [ ] Dashboard implemented
- [ ] Project management implemented
- [ ] Floor plan builder implemented
- [ ] 3D viewer implemented
- [ ] AI features implemented

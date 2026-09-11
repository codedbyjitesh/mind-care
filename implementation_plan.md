# Implementation Plan - MIND CARE: Student Mental Wellness Portal

"MIND CARE" is a full-stack mental wellness application for students built using modern Angular (v19/20+ standalone components), Node.js, Express, and MongoDB Atlas. The project follows clean architecture principles suitable for a BSc IT research project and viva defense.

## Workspace Status
- The workspace directory `c:\Users\Jitesh\OneDrive\Desktop\Roshni` is currently empty.
- We will construct the project with two main subdirectories: `frontend` (Angular application) and `backend` (Express + Mongoose application), plus root level `README.md` and `.gitignore`.

---

## Technical Stack & Architecture

- **Frontend**: Angular (20+), TypeScript, HTML, Vanilla CSS (Custom design system with soft gradients, glassmorphism cards, responsive layouts), Chart.js / ng2-charts, Angular Router, Angular HttpClient, Reactive Forms.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB Atlas connection), JWT (`jsonwebtoken`), `bcryptjs`, `dotenv`, `cors`.
- **Database**: MongoDB Atlas (with local MongoDB fallback options).
- **AI Integration (Optional)**: Gemini API (Backend proxy, strict non-clinical disclaimer).

---

## Incremental Execution Plan

As specified in the project requirements, implementation will be executed strictly in phases. We begin with **PHASE 1**.

### PHASE 1: Project Setup, Core Infrastructure & Connection (CURRENT PHASE)
1. **Directory Setup**: Create root `MindCare/` folder layout containing `frontend/` and `backend/`.
2. **Backend Setup**:
   - Initialize Node.js package (`package.json`) with dependencies: `express`, `mongoose`, `dotenv`, `cors`, `jsonwebtoken`, `bcryptjs`.
   - Setup environment configuration (`.env` and `.env.example`).
   - Setup MongoDB Atlas connection module (`config/db.js`) with error handling.
   - Create basic Express server (`server.js`) with JSON middleware, CORS, and health check route `/api/health`.
3. **Frontend Setup**:
   - Initialize modern Angular application using Angular CLI (Standalone components, CSS styling, Routing enabled).
   - Configure proxy / API service (`src/app/services/api.service.ts`) pointing to `http://localhost:5000/api`.
   - Build calm, modern Design System in `src/styles.css` (CSS variables, soft blue/teal/green color palette, rounded glassmorphism cards, no horizontal scroll).
   - Create core components: `NavbarComponent`, `FooterComponent`, `HomeComponent` (landing page with project overview, call-to-action, features preview).
4. **Verification & Testing**:
   - Verify MongoDB Atlas / local MongoDB connection logs.
   - Test `/api/health` endpoint on Express backend.
   - Test Angular frontend compilation and Home page rendering.
   - Verify HTTP communication between Angular frontend and Express backend.

---

### Future Phases (Overview)
- **PHASE 2**: Authentication (User model, JWT, Register/Login, Route guards, `/api/auth/me`, Admin check).
- **PHASE 3**: Core Student Features (Mood Tracker, Stress Assessment, Private Daily Journal).
- **PHASE 4**: Dashboard & Analytics (Interactive charts with Chart.js, statistics, personalized recommendations).
- **PHASE 5**: Wellness Resources & Tools (Meditation breathing timer, Sleep tracker, Habit tracker, Goal tracking).
- **PHASE 6**: Admin Panel & Content Management (Manage users, tips, resources, meditation audio/guides).
- **PHASE 7**: Optional AI Wellness Assistant (Gemini API proxy on Express, strict non-clinical safety prompt).
- **PHASE 8**: Polish, UI Refinements, Security Audit, Seed Data Script & Final Documentation (`README.md`).

---

## Proposed Changes (Phase 1 Detail)

### Backend (`/backend`)
- `package.json`: Node dependencies (`express`, `mongoose`, `dotenv`, `cors`, `jsonwebtoken`, `bcryptjs`, `nodemon`).
- `.env` & `.env.example`: Configuration parameters (`PORT=5000`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=http://localhost:4200`).
- `config/db.js`: Mongoose connection setup with MongoDB Atlas URI and fallback handling.
- `server.js`: Main Express entry point with health check route and error handler.

### Frontend (`/frontend`)
- Modern Angular standalone component structure.
- `src/styles.css`: Custom CSS design system with CSS custom properties (color variables, glassmorphism, responsive grid).
- `src/app/components/home/home.component.*`: Landing page showcasing project features, emergency help notice, and quick navigation.
- `src/app/components/navbar/navbar.component.*`: Responsive navigation bar.
- `src/app/components/footer/footer.component.*`: Footer with disclaimer.
- `src/app/services/api.service.ts`: Centralized HTTP service for backend interaction.

---

## Verification Plan

### Automated / Command Verification
1. Run backend server: `npm start` in `/backend` and verify console outputs "Server running on port 5000" and "MongoDB Connected".
2. Test GET `http://localhost:5000/api/health` returns status `{ status: 'OK', message: 'MindCare API is running' }`.
3. Run Angular frontend: `npm start` / `ng serve` in `/frontend` and verify error-free compilation.
4. Verify HTTP request from Angular Home page to backend `/api/health` succeeds.

### Manual Verification
- Verify responsiveness across desktop (1920px, 1200px), tablet (768px), and mobile (375px) viewports in browser.
- Ensure zero horizontal scrollbars on all screen sizes.

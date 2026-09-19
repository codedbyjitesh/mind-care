# Mind Care – Student Mental Wellness Portal (Full-Stack Implementation Plan)

Build a complete, fully functional full-stack web application called **Mind Care – Student Mental Wellness Portal** designed as a BSc IT final-year project. Every feature connects a modern Angular frontend, Express.js REST API, and persistent MongoDB Atlas database with role-based auth, validation, loading/empty/error states, and responsive design (no Tailwind CSS).

---

## 1. Architectural Overview & Component Structure

```
MIND CARE ARCHITECTURE
├── Backend (Node.js + Express.js + Mongoose + JWT + Nodemailer)
│   ├── config/ (db.js)
│   ├── models/ (User, MoodEntry, StressAssessment, Journal, SleepEntry, Habit, Goal, WellnessTip, WellnessResource, MeditationResource, NotificationSettings, Notification)
│   ├── controllers/ (auth, user, mood, stress, journal, sleep, habit, goal, wellness, notification, analytics, admin)
│   ├── routes/ (auth, user, mood, stress, journal, sleep, habit, goal, wellness, notification, analytics, admin)
│   ├── middleware/ (authMiddleware, adminMiddleware, validate)
│   ├── services/ (emailService, scheduler)
│   └── utils/ (seed.js)
└── Frontend (Angular 21 Standalone + TypeScript + CSS + Chart.js)
    ├── core/ (guards, interceptors, models)
    ├── services/ (AuthService, UserService, MoodService, StressService, JournalService, SleepService, HabitService, GoalService, WellnessService, NotificationService, AnalyticsService, AdminService)
    └── components/
        ├── auth/ (login, register, forgot-password, reset-password, verify-email)
        ├── dashboard/ (overview metrics, Chart.js trends, quick actions, personalized tips)
        ├── profile/ (view/edit details, change password, notification prefs)
        ├── mood/ (daily mood tracker, emoji score 1-5, note, history, edit/delete)
        ├── stress/ (5-question daily stress assessment, score, level, non-clinical disclaimer)
        ├── journal/ (private encrypted/isolated diary, search, date filter, CRUD)
        ├── history/ (combined mood & stress timeline, date & period filters)
        ├── analytics/ (multi-metric charts: mood line, stress bar, sleep duration/quality, habits)
        ├── wellness/ (personalized recommendations engine based on recent mood/stress/sleep)
        ├── meditation/ (interactive breathing timer: inhale-hold-exhale circle animation, audio/guides)
        ├── sleep/ (sleep/wake duration calculation, quality rating, trends)
        ├── habits/ (daily habit tracker, streaks, completion toggling, progress %)
        ├── goals/ (wellness goals, target dates, progress bar, status update)
        ├── notifications/ (in-app alerts, read status, reminder configuration)
        ├── resources/ (9-category mental health library, search, external links)
        ├── help/ (crisis lines, Tele-MANAS, Kiran, emergency guidance, strict disclaimers)
        ├── settings/ (preferences, reminder times)
        └── admin/ (content CMS for tips, resources, meditation, user management; NO journal access)
```

---

## 2. The 16 Required Features Implementation Matrix

| # | Feature | Backend Route(s) | MongoDB Model | Frontend Component / Route |
|---|---|---|---|---|
| 1 | **Registration & Login** | `POST /api/auth/register`, `login`, `me` | `User` | `/login`, `/register` |
| 2 | **Student Profile** | `GET/PUT /api/users/me`, `PUT /api/auth/change-password` | `User` | `/profile` |
| 3 | **Daily Mood Tracking** | `GET/POST/PUT/DELETE /api/mood` | `MoodEntry` | `/mood` |
| 4 | **Daily Stress Assessment** | `GET/POST /api/stress`, `GET /api/stress/latest` | `StressAssessment` | `/stress` |
| 5 | **Personal Journal** | `GET/POST/PUT/DELETE /api/journals` | `Journal` | `/journal` |
| 6 | **Mood / Stress History** | `GET /api/mood/history`, `GET /api/stress/history` | `MoodEntry`, `StressAssessment` | `/history` |
| 7 | **Dashboard with Charts** | `GET /api/analytics/dashboard` | Aggregated from entries | `/dashboard` |
| 8 | **Personalized Wellness Tips** | `GET /api/wellness/tips` (with auto-recommendation) | `WellnessTip` | `/wellness` |
| 9 | **Meditation / Breathing Timer** | `GET /api/wellness/meditation` | `MeditationResource` | `/meditation` |
| 10 | **Sleep Tracking** | `GET/POST/PUT/DELETE /api/sleep` | `SleepEntry` | `/sleep` |
| 11 | **Habit / Wellness Tracking** | `GET/POST/PUT/DELETE /api/habits`, `/complete` | `Habit` | `/habits` |
| 12 | **Wellness Goals** | `GET/POST/PUT/DELETE /api/goals` | `Goal` | `/goals` |
| 13 | **Notifications / Reminders** | `GET/PUT /api/notifications`, `/settings` | `Notification`, `NotificationSettings` | `/notifications` |
| 14 | **Resource Library** | `GET /api/wellness/resources` | `WellnessResource` | `/resources` |
| 15 | **Emergency / Help Support** | Static verified crisis contacts & guidelines | Configurable support data | `/help` |
| 16 | **Admin Content Panel** | `GET/POST/PUT/DELETE /api/admin/*` | Tips, Resources, Meditation, Users | `/admin` |

---

## 3. Database Models Specification

1. **User**: `name`, `email`, `password` (bcrypt hash), `role` (`student` | `admin`), `emailVerified`, `emailNotifications`, `isActive`, `createdAt`, `updatedAt`
2. **MoodEntry**: `userId`, `date` (YYYY-MM-DD), `mood` (`Very Happy`, `Happy`, `Neutral`, `Sad`, `Very Sad`), `score` (1-5), `note`, timestamps. Unique compound index `[userId, date]`.
3. **StressAssessment**: `userId`, `date`, `answers` (array of 5 integer scores 0-4), `score` (0-20), `level` (`Low` (0-6), `Moderate` (7-13), `High` (14-20)), timestamps.
4. **Journal**: `userId`, `title`, `content`, `mood`, `date`, timestamps. STRICT PRIVACY: Indexed only by `userId`.
5. **SleepEntry**: `userId`, `date`, `sleepTime`, `wakeTime`, `duration` (hours float), `quality` (`Very Poor`, `Poor`, `Average`, `Good`, `Excellent`), `note`, timestamps.
6. **Habit**: `userId`, `title`, `description`, `frequency` (`daily`, `weekly`), `startDate`, `active`, `completionHistory` (`[{ date: String, completed: Boolean }]`), `streak`, timestamps.
7. **Goal**: `userId`, `title`, `description`, `startDate`, `targetDate`, `progress` (0-100), `status` (`Active`, `Completed`, `Cancelled`), timestamps.
8. **WellnessTip**: `title`, `description`, `category`, `condition` (`general`, `stress_high`, `mood_low`, `sleep_low`), `active`, timestamps.
9. **WellnessResource**: `title`, `description`, `category` (9 categories: `Stress Management`, `Meditation`, `Sleep`, `Study Balance`, `Time Management`, `Exercise`, `Mindfulness`, `General Wellness`, `Support`), `url`, `active`, timestamps.
10. **MeditationResource**: `title`, `description`, `category`, `duration` (minutes), `url`, `active`, timestamps.
11. **NotificationSettings**: `userId`, `moodReminder` (boolean), `stressReminder`, `journalReminder`, `habitReminder`, `wellnessReminder`, `reminderTime` (HH:MM), timestamps.
12. **Notification**: `userId`, `type`, `title`, `message`, `read` (boolean), `createdAt`.

---

## 4. Security & Privacy Rules

> [!IMPORTANT]
> - **Student Journal Privacy**: Admin controllers and routes NEVER include student journals. Any attempt to query journals enforces `req.user._id === journal.userId`.
> - **User Data Isolation**: Every student endpoint filters strictly by authenticated `req.user._id`.
> - **Admin Authorization**: `adminMiddleware` verifies `req.user.role === 'admin'`. Frontend has `AdminGuard` to prevent unauthorized client route transitions.
> - **Non-Clinical Disclaimer**: Visible prominently on Stress Assessment and Help page: *"Mind Care is for general wellness awareness and is not a clinical medical or psychological diagnosis. If you are in distress, please contact emergency support or a medical professional."*

---

## 5. Implementation Phases

### Phase 1: Backend Models, Controllers, Routes & Seed Data
- Create all 11 new Mongoose models in `backend/models/`.
- Implement controllers:
  - `userController.js`
  - `moodController.js`
  - `stressController.js`
  - `journalController.js`
  - `sleepController.js`
  - `habitController.js`
  - `goalController.js`
  - `wellnessController.js` (with personalization logic)
  - `notificationController.js`
  - `analyticsController.js` (aggregation for dashboard)
  - `adminController.js`
- Implement router mounts in `backend/server.js`.
- Create comprehensive seed script (`backend/utils/seed.js`) with:
  - Default admin user (`admin@mindcare.edu` / `Admin@12345`)
  - Initial wellness tips covering all conditions (stress high, sleep low, mood low, general)
  - 15+ curated mental health resources across all 9 categories
  - 6+ meditation guides and breathing exercises

### Phase 2: Frontend Angular Services & Chart.js Integration
- Install `chart.js` in `frontend/`.
- Build reusable services:
  - `UserService`, `MoodService`, `StressService`, `JournalService`, `SleepService`, `HabitService`, `GoalService`, `WellnessService`, `NotificationService`, `AnalyticsService`, `AdminService`.
- Create HTTP Interceptor or token provider to append Bearer JWT automatically to API calls.

### Phase 3: Frontend Feature Components (16 Features)
1. **Auth & Profile**: Complete `/profile`, `/settings`.
2. **Mood & Stress**: `/mood` (emoji buttons, score, notes, edit/delete modal, date filter), `/stress` (interactive 5-question card, real-time score indicator, suggestions), `/history` (combined timeline with filters).
3. **Journal**: `/journal` (clean rich writing interface, mood selector, search input, date filter, edit/delete, private badge).
4. **Sleep & Habits & Goals**:
   - `/sleep` (time pickers, auto-calculated duration, quality chips, history table).
   - `/habits` (habit cards with streak flame, daily checkmark toggle button, completion bar).
   - `/goals` (target date countdown, progress slider, status chips).
5. **Wellness, Meditation & Resources**:
   - `/wellness` (personalized alert cards highlighting immediate suggestions according to student metrics).
   - `/meditation` (animated breathing circle with 4-phase timer: Inhale -> Hold -> Exhale -> Hold, duration presets 2m/5m/10m, audio/ambient sound links).
   - `/resources` (search bar, 9 category filter pill tabs, external resource cards).
   - `/help` (national/international helplines: Tele-MANAS 14416, Kiran 1800-599-0019, Vandrevala 9999 666 555, crisis action plan).
6. **Dashboard & Analytics**:
   - `/dashboard`: Unified hub with quick actions, today's snapshot, summary cards, and embedded responsive charts.
   - `/analytics`: In-depth mood trajectory, stress trends, sleep distribution, habit consistency charts.
7. **Notifications**:
   - `/notifications`: Notification center, reminder toggles, time picker.
8. **Admin CMS Panel**:
   - `/admin`: Stats cards, tabs to add/edit/delete wellness tips, resource items, meditation guides, and manage student active status.

### Phase 4: Verification & Final Testing
- Run automated end-to-end API test script exercising all 16 endpoints against MongoDB Atlas.
- Verify Angular build passes with zero errors and no horizontal overflow on mobile (375px), tablet (768px), and desktop (1440px).
- Verify role isolation: test that a student cannot call admin APIs and admin cannot access journal content.

---

## 6. Verification Plan

### Automated API Validation
Create a comprehensive test script `backend/utils/testAllFeatures.js` that sequentially verifies:
1. Register a student & login.
2. Update student profile & fetch profile.
3. Record daily mood, retrieve today's mood, edit mood.
4. Submit stress assessment, verify calculation (score & level), fetch latest.
5. Create journal entry, search journal, edit journal, delete journal.
6. Record sleep entry, verify auto-duration calculation.
7. Create habit, toggle completion, verify streak calculation.
8. Create goal, update progress to 100%, verify completed status.
9. Fetch personalized wellness tips matching stress/mood state.
10. Fetch meditation guides & breathing options.
11. Update notification settings, fetch notifications.
12. Fetch mental-health resources with category filter.
13. Login as Admin, add new wellness tip, edit tip, delete tip.
14. Admin adds resource, edits resource, deletes resource.
15. Verify student privacy: Admin cannot query `/api/journals` of students.

### Manual / Browser Verification
- Build and run `ng serve` and `server.js`.
- Perform full browser walkthrough via browser subagent covering:
  - Student registration & login.
  - Interactive mood selection & stress assessment submission.
  - Interactive breathing timer animation.
  - Habit completion check.
  - Dashboard Chart.js canvas rendering.
  - Admin CMS actions.
  - Viewport responsive inspection (375px, 768px, 1440px).

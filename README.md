# 🌸 MIND CARE – Student Mental Wellness Portal

> BSc IT Research Project — Full-Stack Web Application  
> **Stack:** Angular 20+ | Node.js | Express.js | MongoDB Atlas | JWT | Nodemailer | Gmail SMTP

---

## 📋 Project Overview

Mind Care is a full-stack student wellness portal that helps students:
- Track daily **mood** and **stress levels**
- Maintain a private, encrypted **journal**
- Practice **guided meditation** and breathing exercises
- Access curated **wellness resources**
- Receive optional **email wellness reminders**

---

## 🗂️ Folder Structure

```
Roshni/
├── backend/             ← Node.js + Express API
│   ├── config/          ← MongoDB connection
│   ├── controllers/     ← Route handlers
│   ├── middleware/      ← JWT auth guard
│   ├── models/          ← Mongoose schemas
│   ├── routes/          ← Express routers
│   ├── services/        ← Nodemailer email service
│   ├── utils/           ← Token generator, scheduler, seed
│   ├── .env             ← Secret environment variables (DO NOT COMMIT)
│   ├── .env.example     ← Safe template to share
│   └── server.js        ← Entry point
└── frontend/            ← Angular 20+ application
    └── src/app/
        ├── components/  ← All Angular pages
        ├── guards/      ← Route protection
        └── services/    ← AuthService, API calls
```

---

## ⚙️ Environment Setup

### Backend — `backend/.env`

Copy `.env.example` and fill in your values:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/Mind-care?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

> ⚠️ **NEVER** commit `.env` to GitHub. It is listed in `.gitignore`.

---

## 📧 Gmail App Password Setup

Mind Care uses a **Gmail App Password** (not your real Gmail password) for email delivery.

### Steps:

1. Go to **Google Account** → **Security**
2. Enable **2-Step Verification** (required)
3. Search for **"App passwords"**
4. Select **App: Mail**, **Device: Windows Computer**
5. Google generates a **16-character App Password** like: `xxxx xxxx xxxx xxxx`
6. Paste it into `EMAIL_PASSWORD=` in your `.env`

> If you see Gmail SMTP timeout errors locally, your ISP/router may block port 587.  
> In dev mode, verification links are automatically printed in the **backend terminal** instead.

---

## 🚀 How to Run

### Backend (Terminal 1)

```bash
cd backend
npm install
npm start
# → http://localhost:5000
```

### Frontend (Terminal 2)

```bash
cd frontend
npm install
npm start
# → http://localhost:4200
```

### Seed Demo Data (optional)

```bash
cd backend
npm run seed
# Creates admin@mindcare.edu / admin123
#         student@test.com / student123
# Both are pre-verified for immediate testing
```

---

## 🔑 Authentication Flow

### Registration → Email Verification → Login

```
Student fills Register form
        ↓
Backend: hash password, create user
        ↓
Generate random 32-byte token → SHA-256 hash stored in DB
        ↓
Send Verification Email (link valid 24 hours)
        ↓
Student clicks link → Angular reads token from URL
        ↓
GET /api/auth/verify-email?token=TOKEN
        ↓
Backend: hash token, find user, set emailVerified=true
        ↓
Welcome email sent → Student can now Login
```

### Forgot Password Flow

```
Click "Forgot Password?" on Login
        ↓
Enter email → POST /api/auth/forgot-password
        ↓
Backend: generate reset token → SHA-256 hash in DB (30 min expiry)
        ↓
Password Reset Email sent
        ↓
Student clicks link → /reset-password?token=TOKEN
        ↓
Enter new password → POST /api/auth/reset-password
        ↓
Backend: verify token, hash new password, save → Token invalidated
```

### Change Password (while logged in)

```
Dashboard → Profile → Change Password
        ↓
Enter current + new password
        ↓
PUT /api/auth/change-password  (JWT required)
        ↓
Backend: verify current password → hash new → save
```

---

## 🌐 API Endpoints

### Public Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register new student account |
| `POST` | `/api/auth/login` | Login (returns JWT) |
| `GET`  | `/api/auth/verify-email?token=TOKEN` | Verify email address |
| `POST` | `/api/auth/resend-verification` | Resend verification email |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET`  | `/api/health` | Server health check |

### Protected Endpoints (JWT Required)

| Method | Route | Description |
|--------|-------|-------------|
| `GET`  | `/api/auth/me` | Get current user profile |
| `PUT`  | `/api/auth/profile` | Update display name |
| `PUT`  | `/api/auth/change-password` | Change password |
| `GET`  | `/api/auth/settings` | Get notification preferences |
| `PUT`  | `/api/auth/settings` | Update notification preferences |

---

## 📬 Email Notifications

Students can enable/disable email reminders from **Dashboard → Notifications**:

| Reminder | Time | Description |
|----------|------|-------------|
| 😊 Daily Mood | 9:00 AM | "How are you feeling today?" |
| 🧘 Meditation | 1:00 PM | "Take a short breathing break." |
| 📓 Journal | 8:00 PM | "Take a few minutes to reflect." |

> Reminders are sent only to **verified users** who have opted in.  
> No private wellness data (mood scores, journal text) is ever sent by email.

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| Password hashing | bcryptjs (salt rounds: 10) |
| Verification tokens | `crypto.randomBytes(32)` → SHA-256 hashed in DB |
| Reset tokens | Same secure method, 30-min expiry |
| Token single-use | Cleared from DB after use |
| JWT auth | 7-day expiry, sent in `Authorization: Bearer` header |
| Account enumeration | Generic responses for forgot-password / resend |
| Protected routes | Angular `authGuard` + Express `protect` middleware |
| Email security | App Passwords only, credentials never exposed to frontend |

---

## 🧪 Testing the Email System Locally

### When Gmail SMTP is blocked (no internet / firewall):

Verification and reset links are **automatically printed in the backend terminal**:

```
[Email Service Dev Fallback] EMAIL VERIFICATION LINK FOR student@test.com:
👉 Link: http://localhost:4200/verify-email?token=abc123...
```

Copy the link and paste it in your browser to test the full flow.

### Full Test Checklist

| Test | Steps |
|------|-------|
| ✅ Register | Fill form → see "Check your email" screen |
| ✅ Verify email | Click link from email (or terminal) |
| ✅ Login | Login after verification |
| ✅ Login blocked | Try login before verifying → see resend button |
| ✅ Forgot password | Click "Forgot Password?" → email link sent |
| ✅ Reset password | Open reset link → enter new password |
| ✅ Login new password | Login with new password |
| ✅ Change password | Dashboard → Profile → Change Password |
| ✅ Notification settings | Dashboard → Notifications → toggle & save |
| ✅ Expired token | Wait for token to expire → see "Resend" option |

---

## 📦 Backend Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.21.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.7.0",
  "node-cron": "^3.x",
  "nodemailer": "^6.9.15"
}
```

---

## 🎓 Research Project Notes

This application was built as a **BSc IT Final Year Research Project** to study:

- Full-stack web architecture (Angular + Node.js + MongoDB)
- Secure authentication patterns (JWT, bcrypt, token expiry)
- Email-driven verification systems
- Student mental wellness support tools

> **Disclaimer:** Mind Care is a non-clinical student wellness tool. It is not a substitute for professional mental health support.

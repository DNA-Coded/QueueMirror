# QueueMirror — Know The Wait Before You Go

**QueueMirror** is a crowd-powered queue intelligence platform designed to help users bypass long wait lines at physical service centers. Using real-time metrics, predictive analytics, and gamified contribution mechanics, QueueMirror transforms physical wait times into actionable data.

---

## 🚀 Key Features

* **Dual-Theme Engine**: Toggle between Light Mode (Stitch layout) and Glacier Glassmorphism Dark Mode (Stitch Night layout) instantly.
* **Wait Prediction Engine**: Calculates estimated wait times (`Estimated Wait = People Ahead × Processing Speed`) using real-time report inputs and historical peak congestion graphs.
* **Interactive Live Map**: Real-time Leaflet maps showing locations styled with pulsing color status markers (Green: Low, Amber: Medium, Red: High Delay) and optional Heatmap density overlays.
* **Gamified Contribution Tiers**: Earn XP points (+10 XP for submitting wait reports, +5 XP for validating others' reports, and +20 XP for verified reports) to rank up from *Explorer* to *Queue Legend* on regional leaderboards.
* **Moderation Console**: Admin panel allowing moderators to monitor system uptime, trace activity logs, delete spam reports, and manage user statuses.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, React Leaflet, Recharts, React Router DOM, Axios
* **Backend**: Node.js, Express, TypeScript, Mongoose, JWT Auth, Google Auth Library, Multer, Cloudinary
* **Database**: MongoDB (Atlas or Local)

---

## 📁 Repository Structure

```text
queuemirror/
├── package.json               # Root workspace script orchestrator
├── README.md                  # Documentation entry point
├── client/                    # React frontend application
│   ├── index.html             # Fonts, Leaflet CSS and SEO tags
│   ├── tailwind.config.js     # Extended color and sizing variables
│   └── src/
│       ├── main.tsx           # Mount point
│       ├── App.tsx            # Routes configurations
│       ├── index.css          # Design system tokens and animations
│       ├── components/        # Sidebar, ThemeToggle, AuthModal
│       ├── contexts/          # ThemeContext, AuthContext
│       └── pages/             # LandingPage, MapPage, DetailPage, DashboardPage, etc.
└── server/                    # Node.js Express backend server
    ├── package.json           # Dependencies and typescript runs
    ├── tsconfig.json          # NodeNext modules configurations
    ├── src/
    │   ├── index.ts           # Express setup, mongoose connect, and database seeding
    │   ├── middleware/        # Auth verify and Cloudinary/Multer uploaders
    │   ├── models/            # User, Location, QueueReport, Contribution schemas
    │   ├── routes/            # REST API route binders
    │   └── controllers/       # Auth, Location, Queue, Analytics, Admin engines
    └── .env                   # Environmental variables configuration
```

---

## ⚙️ Running Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and [MongoDB](https://www.mongodb.com/) running locally (or use a MongoDB Atlas connection string).

### 2. Quick Setup & Run
From the root workspace directory, run:

```bash
# 1. Install all dependencies for root, client, and server
npm run install-all

# 2. Start the development server (runs client on :5173 and server on :5000 concurrently)
npm run dev
```

### 3. Environmental Configuration
Modify `server/.env` to configure ports, JWT secrets, and connect production services:
* `MONGODB_URI`: MongoDB connection string (defaults to `mongodb://127.0.0.1:27017/queuemirror`)
* `JWT_SECRET`: Token signature key
* `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET`: Optional cloud storage configurations (will fall back to base64 Data URLs if blank).

---

## 👤 Admin Access / Credentials
To access the Admin panel, login using:
* **Email**: `admin@queuemirror.com`
* **Password**: `admin123`

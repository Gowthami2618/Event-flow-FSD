# EventFlow — Smart Event Planning & Management Platform

A production-style full-stack event management platform built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Configure Environment Variables

Edit `server/.env` and replace the MongoDB URI:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventflow
```

### 2. Start the Backend
```bash
cd server
npm run dev
```

### 3. Seed the Database (run once)
```bash
cd server
node seed.js
```

### 4. Start the Frontend
```bash
cd client
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 🔑 Demo Credentials

After seeding, use these to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventflow.com | Admin@123 |

Create additional accounts via the Register page (attendee or organizer).

---

## 📁 Project Structure

```
EventFlow/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── common/      # Navbar, Sidebar, ProtectedRoute
│       │   ├── attendee/    # Attendee-specific components
│       │   ├── organizer/   # Organizer-specific components
│       │   └── admin/       # Admin-specific components
│       ├── context/         # React Context (AuthContext)
│       ├── hooks/           # Custom hooks
│       ├── layouts/         # DashboardLayout
│       ├── pages/           # Page components by role
│       │   ├── auth/        # Login, Register
│       │   ├── attendee/    # Dashboard, Events, Tickets
│       │   ├── organizer/   # Dashboard, Create/Edit Events
│       │   └── admin/       # Dashboard, Users, Analytics
│       ├── services/        # Axios API service modules
│       └── utils/           # Utility functions
│
└── server/                  # Node.js + Express backend
    ├── src/
    │   ├── config/          # Database configuration
    │   ├── controllers/     # Route controllers
    │   ├── middleware/       # Auth, upload, validation
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # Express routes
    │   ├── services/        # Business logic
    │   └── utils/           # Token generation, audit logger
    ├── uploads/             # Uploaded images
    └── seed.js              # Database seeder
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** + **Vite 8**
- **React Router v7** — client-side routing
- **Axios** — HTTP client
- **Lucide React** — icons
- **Recharts** — analytics charts
- **QRCode** — digital ticket generation
- **Custom Glassmorphism CSS** — no CSS frameworks

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose**
- **JWT** — authentication
- **bcryptjs** — password hashing
- **Multer** — file uploads
- **express-validator** — input validation
- **Helmet** + **express-rate-limit** — security
- **Morgan** — request logging

---

## 👥 User Roles

### Attendee
- Browse and search events
- Register/cancel for events
- View digital tickets with QR codes
- Write reviews for attended events
- Receive notifications

### Organizer
- Create and manage events
- Submit events for admin approval
- View attendees and scan QR codes for check-in
- Manage event budget and expenses
- View analytics (views, registrations, revenue)
- Respond to reviews

### Admin
- Approve/reject events
- Manage all users (suspend/unsuspend/delete)
- Manage categories
- View platform analytics
- Access audit logs

> ⚠️ **Security**: Public registration cannot create admin accounts. Admin accounts must be seeded directly.

---

## 🛡️ API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Private |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/profile` | Private |

### Events
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/events` | Public |
| GET | `/api/events/:id` | Public |
| POST | `/api/events` | Organizer |
| PUT | `/api/events/:id` | Organizer |
| DELETE | `/api/events/:id` | Organizer/Admin |
| PUT | `/api/events/:id/submit` | Organizer |
| GET | `/api/events/organizer/my-events` | Organizer |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/dashboard` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/events/:id/approve` | Admin |
| PUT | `/api/admin/events/:id/reject` | Admin |
| GET | `/api/admin/audit-logs` | Admin |

# Student Management System

A full-stack web application built for managing student records, featuring a custom UI, Cloudinary photo uploads, and an activity logging system.

## Features

- Dashboard: Real-time analytics with custom CSS charts (Course distribution, Gender ratio).
- Student CRUD: Complete Create, Read, Update, Delete functionality.
- Photo Uploads: Drag-and-drop image upload to Cloudinary.
- Advanced Data Table: Server-side pagination, search by multiple fields, sorting, and filtering.
- Activity Log: Complete audit trail tracking all creations, updates, and deletions.
- Modern UI: Custom CSS design system featuring glassmorphism, responsive layouts, and skeleton loaders.

## Tech Stack

- Frontend: React, Vite, React Router DOM, React Icons
- Backend: Node.js, Express.js
- Database: PostgreSQL (hosted on Neon)
- ORM: Prisma
- Storage: Cloudinary (Image hosting)
- Validation: Zod (Backend validation)

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- A free account on Neon (https://neon.tech/) for PostgreSQL database.
- A free account on Cloudinary (https://cloudinary.com/) for image storage.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd student-management-system
```

### 2. Environment Variables
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
# PostgreSQL Database URL
DATABASE_URL=postgresql://<user>:<password>@<host>/<dbname>?sslmode=require

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Ports
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Backend Setup
```bash
cd server
npm install

# Run database migrations
npx prisma migrate dev --name init

# Start backend server
node src/server.js
# Or with nodemon: npm run dev
```
The API will be available at `http://localhost:5000/api`

### 4. Frontend Setup
```bash
# Open a new terminal tab
cd client
npm install

# Start Vite dev server
npm run dev
```
The app will be available at `http://localhost:5173`

## API Documentation

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check endpoint |
| GET | `/api/students` | Fetch paginated/filtered list of students |
| GET | `/api/students/stats` | Fetch dashboard analytics |
| GET | `/api/students/:id` | Fetch a single student profile |
| POST | `/api/students` | Create a new student (multipart/form-data) |
| PUT | `/api/students/:id` | Update a student (multipart/form-data) |
| DELETE | `/api/students/:id` | Delete a student and their Cloudinary photo |
| GET | `/api/activity-logs` | Fetch paginated activity log timeline |

## Architecture Note
This project uses a layered backend architecture (Routes -> Controllers -> Services -> Prisma) ensuring separation of concerns. The frontend features a custom-built design system in `ui.css` avoiding heavy UI libraries like Tailwind or Material-UI to demonstrate fundamental CSS proficiency.

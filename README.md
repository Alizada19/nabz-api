# Hemoglobin Admin - Blood Donation & Logistics Management System

Hemoglobin Admin is a clinical logistics and donor management portal. It integrates a secure, modern React + TypeScript single-page application (SPA) directly into a Laravel 13.5 REST API backend, providing dynamic stats visualizations, live donor geolocation matches, real-time clinical notifications, and administrative tracking.

---

## Technical Stack

- **Backend:** Laravel 13.5 (REST API, Sanctum Token Auth, SQLite/MySQL support)
- **Frontend:** React 19, TypeScript, Axios, React Query (TanStack), Tailwind CSS, Vite
- **Iconography & Styling:** Google Material Symbols, Custom cool clinical neutral slate palettes (VitalFlow Design System)

---

## Installation & Setup

Follow these steps sequentially to setup and run the Hemoglobin portal locally:

### 1. Prerequisites
Ensure you have the following installed on your machine:
- PHP >= 8.3
- Composer
- NodeJS >= 20
- npm (or yarn / bun)

### 2. Backend Installation (Laravel API)
1. Clone the repository and navigate into the project directory:
   ```bash
   cd nabz-api
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Configure database in `.env`. By default, we support a lightweight SQLite database for testing, but you can connect MySQL or PostgreSQL:
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   ```
   *Note: If using SQLite, create an empty file inside `database/` named `database.sqlite`:*
   ```bash
   touch database/database.sqlite
   ```
5. Generate application key:
   ```bash
   php artisan key:generate
   ```
6. Run migrations and seed tables:
   ```bash
   php artisan migrate --seed
   ```
7. Start local Laravel dev server:
   ```bash
   php artisan serve
   ```
   The backend API will be running at `http://127.0.0.1:8000/`.

---

### 3. Frontend Setup (React SPA)
1. Install Node.js packages:
   ```bash
   npm install
   ```
2. Build frontend assets for production:
   ```bash
   npm run build
   ```
   Or start the live hot-reload development server:
   ```bash
   npm run dev
   ```

---

## Application Usage Guide

### 1. Secure Authentication Login
- Direct your browser to `http://127.0.0.1:8000/login`.
- **Default Administrative Credentials:**
  - **Email:** `admin@nabz.com`
  - **Password:** `password`
- Security interceptors will issue a secure Sanctum mobile API token and persist session context inside `localStorage`.

### 2. Live Clinical Modules

Once logged in, the left-hand navigation sidebar enables administrative access over all core entities:

- **Dashboard:** Instantly view active metrics widgets (Total users, registered donors, available donors, urgent active requests) mapped alongside clinical monthly request trend metrics.
- **Users Management:** Fully searchable tabular listing of clinical administrators, doctors, and users. Supports creating new personnel records with built-in validation states.
- **Donors Directory:** Integrated geolocated matching of blood donors using coordinates. View donor status badges, contact numbers, blood group type, and distance mapping in kilometers.
- **Blood Requests:** View active blood needs, urgency levels, hospital locations, and trigger state modifications (e.g., Approve request, complete, or cancel clinical requisitions).
- **Notifications & Profile Settings:** Access clinical alerts or customize personal blood type, coordinates, and match readiness parameters dynamically.

---

## Production Builds and Troubleshooting

### Compilation Errors
If you run into missing module errors during `npm run build`, make sure you have installed standard router and query libraries:
```bash
npm install react-router-dom axios @tanstack/react-query lucide-react
```

### Reset Database Seeds
If you wish to refresh and recreate baseline clinical statistics:
```bash
php artisan migrate:fresh --seed
```

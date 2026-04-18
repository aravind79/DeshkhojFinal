# DeshKhoj Business Directory

Welcome to the DeshKhoj repository! This guide provides everything you need to know to understand, run, and deploy the DeshKhoj web application.

## 🛠️ Technology Stack

DeshKhoj is built using a modern, scalable full-stack JavaScript architecture:

*   **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** MySQL (Relational Database)
*   **Hosting:**
    *   Frontend: Vercel
    *   Backend: Hostinger (Shared Hosting / Node.js Environment)
    *   Database: Hostinger MySQL Database

---

## 📂 Project Structure

*   `/frontend` - Contains the entire Next.js application (User Interface, Forms, Search).
*   `/backend` - Contains the Node.js API (Authentication, Database Queries, File Uploads).
*   `setup_mysql.sql` - The complete database schema and initial table structure.
*   `fix_production_mysql.sql` - The latest database alterations (adds necessary columns for the forms).

---

## 💻 Local Development Setup

Follow these steps to run the project on your local machine for development or testing.

### Prerequisites
*   Node.js (v18 or higher)
*   MySQL Server (XAMPP, MAMP, or standalone)
*   Git

### 1. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench).
2. Create a new database named `deshkhoj_db`.
3. Import `setup_mysql.sql` into this new database.
4. Import `fix_production_mysql.sql` into the same database to ensure all columns are up to date.

### 2. Backend Setup
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=deshkhoj_db
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(The server will start on `http://localhost:5000`)*

### 3. Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *(The website will start on `http://localhost:3000`)*

---

## 🚀 Production Deployment Guide

Deploying the application requires updating the live servers with your latest code.

### 1. Deploying the Frontend (Vercel)
The frontend is designed to be hosted on Vercel for fast, global delivery.

1. Create an account on [Vercel.com](https://vercel.com/).
2. Click **Add New Project** and connect your GitHub repository.
3. Select the `frontend` directory as the **Root Directory**.
4. In the Environment Variables section, add:
   *   `NEXT_PUBLIC_API_URL`: `https://your-backend-domain.com/api`
5. Click **Deploy**. Vercel will automatically build and publish the website. Every time you push changes to GitHub, Vercel will auto-update.

### 2. Deploying the Backend (Hostinger)
The backend is hosted on Hostinger using their Node.js environment (Phusion Passenger). 

**Step 1: Build the Code**
You must compile the TypeScript code into JavaScript before uploading.
1. Run this command locally inside the `backend` folder:
   ```bash
   npm run build
   ```
2. This creates a `dist` folder. Zip the contents of the `dist` folder along with `package.json` into a file (e.g., `backend_deploy.zip`).

**Step 2: Upload to Hostinger**
1. Log into your Hostinger hPanel and open the **File Manager**.
2. Navigate to your Node.js application directory (usually `domains/yourdomain.com/nodejs`).
3. **IMPORTANT:** Delete the existing `dist` folder to prevent file locks.
4. Upload `backend_deploy.zip` and extract it.

**Step 3: Force Restart the Server**
Hostinger's Node.js runs constantly in the background. To force it to load your newly uploaded code:
1. Go into the `tmp` folder inside your `nodejs` directory.
2. Open the file named `restart.txt` (or create an empty text file named `restart.txt` if it doesn't exist).
3. Type a single space and click **Save**.
4. *The exact moment you save this file, the server will instantly reboot and load your new code!*

---

## 🛠️ Making Changes in the Future

If you want to add new features or modify existing ones:

1. Always test changes locally first by running both the frontend and backend simultaneously.
2. If you change a database query in the backend (`backend/src/routes/`), make sure your live Hostinger database has the exact same columns.
3. If you add new pages to the frontend (`frontend/src/app/`), simply commit and push them to GitHub. Vercel will handle the rest!

Enjoy building with DeshKhoj!

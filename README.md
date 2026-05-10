# Bee Chat SaaS Platform

A real-time chat and customer support platform built with **React**, **PHP**, and **MySQL**.

## 🚀 Getting Started

### 1. Database Setup (XAMPP)
1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Go to **phpMyAdmin**: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Create a new database named `bee_chat`.
4. Import the schema file: `database/mysql_schema.sql`.

### 2. Backend Configuration
The API is located in `server/api/`. 
- The database connection is configured in `server/api/config.php`.
- Ensure your project folder is located in `C:\xampp\htdocs\Bee`.

### 3. Frontend Setup
1. Navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** PHP (PDO).
- **Database:** MySQL.
- **Real-time:** Socket.io (Configured for future implementation).

## 📂 Project Structure
- `client/`: React frontend application.
- `server/api/`: PHP backend API endpoints.
- `database/`: Database schema files.
- `assets/`: Project images and static assets.

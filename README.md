# 🐝 Bee Chat Pro

Bee Chat Pro is a comprehensive, multi-tenant SaaS platform for real-time customer support, powered by AI.

## 🚀 Key Features
- **Real-Time Messaging**: Instant communication between visitors and agents.
- **AI Knowledge Base**: Train your AI with manual articles or by uploading **PDF, Word, and TXT** documents.
- **Dynamic SEO & Branding**: Fully customizable widget and platform metadata via the SuperAdmin dashboard.
- **Lead Generation**: Automated visitor tracking and contact information capture.
- **Internal Team Lounge**: Collaborative workspace for support agents.

## 📚 User Documentation
For detailed guides on how to use the platform, please refer to the documentation in the following directory:
`C:\Users\abinp\.gemini\antigravity\brain\eb017fc2-0869-4304-8c6f-4a332846bc9a\BEE_CHAT_DOCUMENTATION.md`

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: PHP 8.x, MySQL (PDO).
- **AI Engine**: Keyword-based retrieval with automated document parsing (PDF.js / Mammoth.js).
- **Auth**: JWT-based secure authentication.

---

## 🏗️ Project Structure
- `client/`: React frontend application.
- `server/api/`: PHP backend API endpoints.
- `database/`: Database schema files.
- `scratch/`: Diagnostic and training scripts.

---

## 🚀 Getting Started

### 1. Database Setup (XAMPP)
1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Go to **phpMyAdmin**: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Create a new database named `bee_chat`.
4. Import the schema file: `database/mysql_schema.sql`.

### 2. Backend Configuration
- The API is located in `server/api/`. 
- The database connection is configured in `server/api/config.php`.
- Ensure your project folder is located in `C:\xampp\htdocs\Bee`.

### 3. Frontend Setup
1. Navigate to the `client` folder and install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

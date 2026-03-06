# 🚀 Smart Marks - AI-Powered Bookmark Manager

**Smart Marks** is a modern Chrome extension built to save web snippets instantly and generate AI summaries using **Groq (Llama 3.3)**. It leverages **Supabase** for secure, cloud-based data storage.



## ✨ Features
- **Instant Save:** Highlight any text on a webpage and save it with one click.
- **AI Summary:** Generate a concise, 15-word summary using the Llama 3.3 70B model.
- **Modern UI:** Sleek, dark-mode interface built with React and Tailwind-style aesthetics.
- **Cloud Sync:** Your notes are stored securely in the cloud via Supabase.

---

## 🛠️ Installation & Setup

Because this project uses environment variables for security, you will need your own API keys to run it locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Plasmo HQ](https://www.plasmo.com/) framework (the project's foundation).

### 2. Clone the Repository
```bash
git clone [https://github.com/Gaplaster3600/smart-marks.git](https://github.com/Gaplaster3600/smart-marks.git)
cd smart-marks
npm install

3. Environment Variables (.env)
Create a .env file in the root directory (refer to .env.example) and fill in your credentials:

PLASMO_PUBLIC_GROQ_API_KEY=your_groq_api_key
PLASMO_PUBLIC_SUPABASE_URL=your_supabase_project_url
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Note: Never commit the .env file to GitHub. The .gitignore is already configured to keep your keys safe.

4. Run in Development Mode
Bash
npm run dev
Then, load the extension in Chrome by selecting the build/chrome-mv3-dev folder via Manage Extensions > Load unpacked.

🏗️ Technology Stack
Framework: Plasmo

Frontend: React + TypeScript

Database: Supabase

AI Engine: Groq Cloud (Llama 3.3 70B model)

📝 License
This project is for personal use and portfolio purposes.

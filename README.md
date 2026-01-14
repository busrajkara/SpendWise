# SpendWise - AI-Powered Personal Finance Assistant

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![React](https://img.shields.io/badge/React-v18+-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-informational.svg)

SpendWise is an AI-augmented personal finance assistant that helps you track expenses and income, automate recurring financial activity, and forecast end-of-month outcomes with smart analytics. It combines a clean, modern UI with robust backend services to give you real-time visibility into your money, proactive alerts, and data-driven insights for better financial decisions.

---

## 🚀 Key Features

- 💡 **Smart Insights & Forecasting**  
  Predictive analysis of your end-of-month spending based on current habits. SpendWise analyzes your month-to-date expenses, computes a daily average, and projects your total spending to help you stay ahead of potential budget overruns.

- 🔁 **Recurring Transactions (Automation)**  
  Automated monthly income and expense generation powered by **Node-Cron**. Mark a transaction as recurring and SpendWise will automatically create the corresponding entry each month on the appropriate day, with safeguards to prevent duplicate creation on server restarts.

- 📊 **Dynamic Dashboard & Visual Analytics**  
  Interactive charts built with **Recharts** provide a clear overview of your financial health: category breakdowns, daily trends, and a dedicated “Smart Insights” section for forecasts and comparisons.

- 💰 **Budget Management & Threshold Alerts**  
  Define category-based monthly budget limits and monitor your usage through visual progress indicators. Color-coded alerts (green / yellow / red) help you quickly see which categories are safe, approaching limits, or overspending.

- 🔐 **Secure Authentication**  
  JWT-based authentication with protected API routes ensures that your financial data is accessible only to you. Tokens are validated on each request to sensitive endpoints.

- 📤 **Data Export (CSV)**  
  Export your full transaction history as a **CSV** file in one click, allowing you to perform additional offline analysis or import into other tools.

- 🎨 **Modern, Responsive UI**  
  Built with **React**, **Vite**, and **Tailwind CSS**, SpendWise delivers a fast, responsive, and visually refined dark-themed interface that works smoothly across devices.

---

## 🧱 Tech Stack

| Layer      | Technologies                                                                 |
|-----------|------------------------------------------------------------------------------|
| Backend   | Node.js, Express, Prisma ORM, PostgreSQL, JSON Web Tokens (JWT)             |
| Frontend  | React, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios                    |

---

## ⚙️ Installation & Setup

Follow the steps below to run SpendWise locally.

### Prerequisites

- **Node.js** (v18+ recommended)  
- **PostgreSQL** database instance  
- Git (if you are cloning from GitHub)

---

### 1. Backend Setup (Server)

From the project root directory:

```bash
# Install backend dependencies
npm install
```

Create an `.env` file in the project root and configure your environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/spendwise_db"
JWT_SECRET="your_jwt_secret_here"
```

Apply database migrations and generate the Prisma client:

```bash
npx prisma migrate dev --name init
```

Start the backend server:

```bash
npm run dev    # or: node src/server.js
```

The API will be available at:

- `http://localhost:3000`

The recurring transactions **cron job** is initialized when the server starts and runs daily at midnight.

---

### 2. Frontend Setup (Client)

In a new terminal window, navigate to the client folder:

```bash
cd client

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

By default, the frontend will be available at:

- `http://localhost:5173`

Open this URL in your browser to start using SpendWise.

---

## 📈 Core Workflows

- **Track Transactions**  
  Add, edit, delete, and filter income and expenses by category and date. Each transaction is linked to a category (income or expense) for accurate reporting.

- **Automated Recurring Transactions**  
  When creating a transaction, mark it as recurring to have SpendWise automatically generate a new entry each month, using a Node-Cron scheduled job on the server.

- **Smart Insights & Forecasting**  
  The dashboard’s “Smart Insights” section shows:
  - Current month spending to date  
  - Projected end-of-month spending  
  - Remaining budget based on your configured category budgets  
  - Comparison with the same period from the previous month  

- **Budgets & Alerts**  
  Set a monthly budget per category and track how much of that budget has been used. Visual indicators warn you when you are close to or above your limit.

- **CSV Export**  
  Download your full transaction history as a CSV file for archiving, sharing, or further analysis in spreadsheet tools.

---

## 🧭 Future Roadmap

Planned enhancements for future releases include:

- 📱 **Mobile App (iOS & Android)**  
  A dedicated mobile application for on-the-go expense tracking and instant notifications.

- 🧾 **AI-Powered Receipt Scanning**  
  Automatically parse and categorize expenses from uploaded or photographed receipts using OCR and AI.

- 🤖 **Smarter Recommendations**  
  Personalized suggestions for saving opportunities, budget adjustments, and spending optimization based on your historical behavior.

- 🌍 **Multi-Language Support**  
  Extend beyond the current language to fully support a global audience with localized formats and translations.

---

## 👤 Author

**busrajkara**

If you have suggestions, ideas, or want to contribute, feel free to open an issue or a pull request on the GitHub repository.

---

SpendWise helps you take control of your money with automation, analytics, and clear insights. 💸✨

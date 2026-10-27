# SpendSmart 💰 - Smart Personal Expense Tracker

**SpendSmart** is a modern, responsive, and beginner-friendly personal expense tracker website built with **HTML5, CSS3, and Vanilla JavaScript**. It helps you track your daily spending, categorize expenses, view visual category breakdowns, monitor monthly spending summaries, and manage your budget—all in **Indian Rupees (₹)**.

---

## ✨ Features

- **➕ Add Expenses**: Quickly log an expense with a description/title, amount in ₹, transaction date, and category.
- **₹ Currency in Indian Rupees**: Displays amounts formatted according to the Indian numbering system (`₹XX,XXX.XX`).
- **📋 Transaction History**: View all transactions neatly formatted with distinct category badges, readable dates, amounts, and quick actions.
- **🗑️ Delete & Clear**: Delete individual expenses with one click, or clear all expenses at once with a safety prompt.
- **🔍 Search & Filter**: Filter transactions by category, filter by month, or search transactions by description in real-time.
- **📊 Category-wise Chart**: Interactive visual doughnut chart (powered by Chart.js) showing your spending distribution by category.
- **📅 Monthly Spending Summary**: Dynamic monthly cards showing month-by-month spending, transaction counts, and percentage of overall budget.
- **💾 Local Storage Persistence**: All expense records and theme settings are safely stored in your browser's `localStorage`. Your data is preserved even if you refresh or close the browser!
- **🌓 Light & Dark Modes**: Clean, modern dark mode and light mode with a single-click toggle and automatic preference saving.
- **📱 100% Responsive Design**: Looks clean and works smoothly on mobile phones, tablets, laptops, and desktop screens.
- **🔔 Toast Notifications**: Interactive, animated toast feedback when adding, deleting, or switching themes.

---

## 📁 File Structure

```text
SpendSmart/
│
├── index.html       # HTML5 structure, semantic markup, and dashboard layout
├── style.css        # Modern CSS styles, CSS variables, responsive design & dark/light themes
├── script.js        # JavaScript logic: state, calculations, LocalStorage, Chart.js, filters
└── README.md        # Documentation, feature guide, and running instructions
```

---

## 🚀 How to Run the Website

You don't need any complex build tools, node modules, or installations to run SpendSmart. You can open and use it immediately using any of the methods below:

### Method 1: Direct File Opening (Easiest)
1. Open the `SpendSmart` folder on your computer (`c:\Users\Dell\OneDrive\Desktop\SpendSmart`).
2. Double-click **`index.html`** or right-click `index.html` and select **Open with** > your preferred browser (Google Chrome, Microsoft Edge, Brave, Firefox, etc.).
3. The application will immediately open in your browser ready to use!

### Method 2: Using VS Code Live Server
1. Open the `SpendSmart` folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey) if you haven't already.
3. Right-click on `index.html` in the file explorer and click **"Open with Live Server"**.
4. The website will automatically open at `http://127.0.0.1:5500/index.html` with hot-reloading enabled.

### Method 3: Using Python (Built-in Local Server)
If you have Python installed:
1. Open PowerShell or Command Prompt in the `SpendSmart` folder:
   ```powershell
   cd "c:\Users\Dell\OneDrive\Desktop\SpendSmart"
   python -m http.server 8000
   ```
2. Open your browser and navigate to:
   ```text
   http://localhost:8000
   ```

---

## 💡 How It Works (For Beginners)

Here is a quick overview of how the code is structured:

1. **`index.html`**:
   - Organizes the user interface into distinct sections: Header, Metric Cards, Add Expense Form, Category Chart, Monthly Summary, and Transaction Table.
   - Imports Google Fonts (`Plus Jakarta Sans`), Font Awesome Icons, and `Chart.js` via CDN.

2. **`style.css`**:
   - Uses **CSS Custom Properties (Variables)** (`:root` and `[data-theme="dark"]`) to switch colors seamlessly between light and dark themes.
   - Uses **CSS Grid** and **Flexbox** for a modern, mobile-friendly card layout.

3. **`script.js`**:
   - **`localStorage`**: Uses `localStorage.getItem('spendsmart_expenses')` and `localStorage.setItem(...)` to read and save your expenses.
   - **Indian Rupee Formatting**: Uses the native JavaScript `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
   - **Chart.js**: Aggregates expenses by category and renders an interactive doughnut chart.
   - **Event Listeners**: Listens to form submissions, button clicks, search keystrokes, and category selections to update the UI without reloading the page.

---

## 🎨 Supported Expense Categories

- 🍔 **Food & Dining**
- 🛒 **Groceries**
- 🚗 **Transportation**
- 🛍️ **Shopping**
- 💡 **Bills & Utilities**
- 🎬 **Entertainment**
- 💊 **Health & Medical**
- 📚 **Education**
- ✈️ **Travel**
- 📦 **Other**

---

## 🔒 Privacy & Data Storage

- All your data is stored locally in your web browser using `localStorage`.
- No account or sign-up is required, and no data is sent to any external server.

---

Enjoy tracking your expenses with **SpendSmart**! 🚀


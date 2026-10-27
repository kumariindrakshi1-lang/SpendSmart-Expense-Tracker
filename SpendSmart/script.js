/**
 * ==============================================================================
 * SpendSmart - Simple, Beginner-Friendly Expense Tracker Logic
 * ==============================================================================
 * Features:
 * - LocalStorage persistence for expenses & theme preference
 * - Add, delete, and list transactions
 * - Category-wise Chart.js visual breakdown
 * - Monthly spending summary cards & calculations
 * - Indian Rupee (₹) currency formatting
 * - Light & Dark mode toggle
 * - Search & Category filtering
 * ==============================================================================
 */

// -----------------------------------------------------------------------------
// 1. DOM Elements Selection
// -----------------------------------------------------------------------------
const expenseForm = document.getElementById('expenseForm');
const expenseTitle = document.getElementById('expenseTitle');
const expenseAmount = document.getElementById('expenseAmount');
const expenseDate = document.getElementById('expenseDate');
const expenseCategory = document.getElementById('expenseCategory');

const totalExpenseDisplay = document.getElementById('totalExpenseDisplay');
const monthExpenseDisplay = document.getElementById('monthExpenseDisplay');
const totalCountDisplay = document.getElementById('totalCountDisplay');
const topCategoryDisplay = document.getElementById('topCategoryDisplay');
const chartTotalBadge = document.getElementById('chartTotalBadge');
const currentMonthLabel = document.getElementById('currentMonthLabel');

const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const chartEmptyState = document.getElementById('chartEmptyState');
const monthlyBreakdownGrid = document.getElementById('monthlyBreakdownGrid');
const monthFilter = document.getElementById('monthFilter');

const categoryFilter = document.getElementById('categoryFilter');
const searchTransactions = document.getElementById('searchTransactions');
const filterStatusBar = document.getElementById('filterStatusBar');
const filterStatusText = document.getElementById('filterStatusText');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const toastContainer = document.getElementById('toastContainer');
const currentYearSpan = document.getElementById('currentYear');

// -----------------------------------------------------------------------------
// 2. Application State & Category Config
// -----------------------------------------------------------------------------
let expenses = [];
let categoryChart = null;

// Category metadata: icons, badge classes, and chart color palette
const CATEGORY_CONFIG = {
  'Food & Dining': {
    icon: 'fa-utensils',
    className: 'cat-food',
    color: '#f59e0b',
  },
  'Groceries': {
    icon: 'fa-cart-shopping',
    className: 'cat-groceries',
    color: '#10b981',
  },
  'Transportation': {
    icon: 'fa-car',
    className: 'cat-transport',
    color: '#0ea5e9',
  },
  'Shopping': {
    icon: 'fa-bag-shopping',
    className: 'cat-shopping',
    color: '#ec4899',
  },
  'Bills & Utilities': {
    icon: 'fa-bolt',
    className: 'cat-bills',
    color: '#6366f1',
  },
  'Entertainment': {
    icon: 'fa-film',
    className: 'cat-entertainment',
    color: '#a855f7',
  },
  'Health & Medical': {
    icon: 'fa-heart-pulse',
    className: 'cat-health',
    color: '#ef4444',
  },
  'Education': {
    icon: 'fa-graduation-cap',
    className: 'cat-education',
    color: '#eab308',
  },
  'Travel': {
    icon: 'fa-plane',
    className: 'cat-travel',
    color: '#14b8a6',
  },
  'Other': {
    icon: 'fa-box',
    className: 'cat-other',
    color: '#94a3b8',
  },
};

// Initial sample data for first-time visitors
const INITIAL_SAMPLE_EXPENSES = [
  {
    id: 'sample-1',
    title: 'Monthly Supermarket Groceries',
    amount: 3250,
    date: getFormattedDate(0), // Today
    category: 'Groceries',
  },
  {
    id: 'sample-2',
    title: 'Electricity & Wifi Bill',
    amount: 1800,
    date: getFormattedDate(-2), // 2 days ago
    category: 'Bills & Utilities',
  },
  {
    id: 'sample-3',
    title: 'Weekend Dinner with Friends',
    amount: 1450,
    date: getFormattedDate(-5), // 5 days ago
    category: 'Food & Dining',
  },
  {
    id: 'sample-4',
    title: 'Metro / Fuel Expenses',
    amount: 600,
    date: getFormattedDate(-8), // 8 days ago
    category: 'Transportation',
  },
];

// Helper to get ISO date string offset by days
function getFormattedDate(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// -----------------------------------------------------------------------------
// 3. Utility Functions
// -----------------------------------------------------------------------------

/**
 * Format a number as Indian Rupees (INR)
 * Example: 15400 -> "₹15,400"
 */
function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format ISO date string (YYYY-MM-DD) into readable format (e.g. "27 Oct 2026")
 */
function formatReadableDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Show a friendly floating toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'circle-info';
  if (type === 'success') iconName = 'circle-check';
  if (type === 'danger') iconName = 'circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid fa-${iconName}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Automatically remove toast from DOM after animation completes (3 seconds)
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// -----------------------------------------------------------------------------
// 4. Local Storage Functions
// -----------------------------------------------------------------------------

/**
 * Load expenses from browser localStorage
 */
function loadExpensesFromStorage() {
  const savedData = localStorage.getItem('spendsmart_expenses');
  if (savedData) {
    try {
      expenses = JSON.parse(savedData);
    } catch (e) {
      console.error('Error parsing localStorage expenses', e);
      expenses = [];
    }
  } else {
    // First time opening the app: load sample expenses
    expenses = [...INITIAL_SAMPLE_EXPENSES];
    saveExpensesToStorage();
  }
}

/**
 * Save current expenses array to localStorage
 */
function saveExpensesToStorage() {
  localStorage.setItem('spendsmart_expenses', JSON.stringify(expenses));
}

// -----------------------------------------------------------------------------
// 5. Theme Management (Light / Dark Mode)
// -----------------------------------------------------------------------------

function initTheme() {
  const savedTheme = localStorage.getItem('spendsmart_theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('spendsmart_theme', theme);

  if (theme === 'dark') {
    themeIcon.className = 'fa-solid fa-sun';
    themeText.textContent = 'Light Mode';
  } else {
    themeIcon.className = 'fa-solid fa-moon';
    themeText.textContent = 'Dark Mode';
  }

  // Update chart legend/labels if chart exists
  if (categoryChart) {
    updateChartTheme();
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

function updateChartTheme() {
  if (!categoryChart) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f8fafc' : '#0f172a';

  if (categoryChart.options.plugins && categoryChart.options.plugins.legend) {
    categoryChart.options.plugins.legend.labels.color = textColor;
  }
  categoryChart.update();
}

// -----------------------------------------------------------------------------
// 6. UI Render Functions
// -----------------------------------------------------------------------------

/**
 * Update Top Metric / Summary Cards
 */
function updateDashboardMetrics() {
  // 1. Total Expenses
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  totalExpenseDisplay.textContent = formatRupees(total);
  chartTotalBadge.textContent = `${formatRupees(total)} Total`;
  totalCountDisplay.textContent = expenses.length;

  // 2. Current Month's Spending
  const now = new Date();
  const currentMonth = now.getMonth(); // 0 to 11
  const currentYear = now.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  currentMonthLabel.textContent = `${monthNames[currentMonth]} Spend`;

  const thisMonthTotal = expenses.reduce((sum, item) => {
    if (!item.date) return sum;
    const [y, m] = item.date.split('-');
    if (parseInt(y, 10) === currentYear && parseInt(m, 10) === currentMonth + 1) {
      return sum + Number(item.amount);
    }
    return sum;
  }, 0);

  monthExpenseDisplay.textContent = formatRupees(thisMonthTotal);

  // 3. Top Spending Category
  if (expenses.length === 0) {
    topCategoryDisplay.textContent = 'None';
  } else {
    const categoryTotals = {};
    expenses.forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
    });

    let topCategory = 'None';
    let maxSpent = -1;

    for (const [cat, spent] of Object.entries(categoryTotals)) {
      if (spent > maxSpent) {
        maxSpent = spent;
        topCategory = cat;
      }
    }

    topCategoryDisplay.textContent = topCategory;
  }
}

/**
 * Filter transactions based on category, month and search text
 */
function getFilteredExpenses() {
  const selectedCategory = categoryFilter.value;
  const selectedMonth = monthFilter.value; // "ALL" or "YYYY-MM"
  const searchTerm = searchTransactions.value.trim().toLowerCase();

  return expenses.filter((item) => {
    // Category match
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    // Month match
    const itemMonthKey = item.date ? item.date.slice(0, 7) : '';
    const matchesMonth = selectedMonth === 'ALL' || itemMonthKey === selectedMonth;

    // Search query match
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesMonth && matchesSearch;
  });
}

/**
 * Render the transactions list in the table
 */
function renderTransactions() {
  const filtered = getFilteredExpenses();

  // Handle active filter status bar display
  const hasActiveFilter =
    categoryFilter.value !== 'ALL' ||
    monthFilter.value !== 'ALL' ||
    searchTransactions.value.trim() !== '';

  if (hasActiveFilter) {
    filterStatusBar.style.display = 'flex';
    filterStatusText.textContent = `Showing ${filtered.length} of ${expenses.length} transaction(s)`;
  } else {
    filterStatusBar.style.display = 'none';
  }

  // Handle empty state
  if (filtered.length === 0) {
    transactionList.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  // Sort by date descending (latest first)
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build table rows
  transactionList.innerHTML = sorted
    .map((item) => {
      const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['Other'];
      return `
        <tr data-id="${item.id}">
          <td>
            <strong>${formatReadableDate(item.date)}</strong>
          </td>
          <td>
            <span>${escapeHtml(item.title)}</span>
          </td>
          <td>
            <span class="category-badge ${config.className}">
              <i class="fa-solid ${config.icon}"></i>
              ${escapeHtml(item.category)}
            </span>
          </td>
          <td class="expense-amount-cell">
            ${formatRupees(item.amount)}
          </td>
          <td class="text-center">
            <button
              class="delete-btn"
              onclick="deleteExpense('${item.id}')"
              title="Delete this expense"
              aria-label="Delete ${escapeHtml(item.title)}"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}

/**
 * Simple HTML escaping to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Calculate & Render Monthly Spending Summary Cards
 */
function renderMonthlySummary() {
  // Group expenses by Month & Year
  const monthlyMap = {};

  expenses.forEach((item) => {
    if (!item.date) return;
    const monthKey = item.date.slice(0, 7); // "YYYY-MM"
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        key: monthKey,
        total: 0,
        count: 0,
      };
    }
    monthlyMap[monthKey].total += Number(item.amount);
    monthlyMap[monthKey].count += 1;
  });

  const sortedMonthKeys = Object.keys(monthlyMap).sort((a, b) => b.localeCompare(a));

  // Populate monthFilter dropdown options
  const currentFilterVal = monthFilter.value;
  monthFilter.innerHTML = '<option value="ALL">All Months</option>';

  sortedMonthKeys.forEach((key) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const monthLabel = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const option = document.createElement('option');
    option.value = key;
    option.textContent = monthLabel;
    if (key === currentFilterVal) {
      option.selected = true;
    }
    monthFilter.appendChild(option);
  });

  // Calculate highest monthly spending for progress bars
  const totalOverall = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  if (sortedMonthKeys.length === 0) {
    monthlyBreakdownGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 1.5rem;">
        No monthly spending records yet.
      </div>
    `;
    return;
  }

  // Render month cards
  monthlyBreakdownGrid.innerHTML = sortedMonthKeys
    .map((key) => {
      const data = monthlyMap[key];
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      const percent = totalOverall > 0 ? Math.round((data.total / totalOverall) * 100) : 0;

      return `
        <div class="month-item-card">
          <div class="month-item-header">
            <span class="month-item-name">${monthName}</span>
            <span class="month-item-count">${data.count} expense${data.count === 1 ? '' : 's'}</span>
          </div>
          <div class="month-item-amount">${formatRupees(data.total)}</div>
          <div class="month-progress-bar-bg" title="${percent}% of all-time expenses">
            <div class="month-progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
          <div class="month-item-footer">
            <span>Share of Total</span>
            <span><strong>${percent}%</strong></span>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Render or Update the Category Chart (Chart.js)
 */
function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  // Aggregate expenses by category
  const categoryTotals = {};
  expenses.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount);
  });

  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  // If no expenses, show empty chart state
  if (categories.length === 0) {
    canvas.style.display = 'none';
    chartEmptyState.style.display = 'flex';
    if (categoryChart) {
      categoryChart.destroy();
      categoryChart = null;
    }
    return;
  }

  canvas.style.display = 'block';
  chartEmptyState.style.display = 'none';

  // Gather colors for each category from config
  const backgroundColors = categories.map((cat) => {
    return CATEGORY_CONFIG[cat] ? CATEGORY_CONFIG[cat].color : '#94a3b8';
  });

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#f8fafc' : '#0f172a';

  if (categoryChart) {
    // Update existing chart
    categoryChart.data.labels = categories;
    categoryChart.data.datasets[0].data = amounts;
    categoryChart.data.datasets[0].backgroundColor = backgroundColors;
    categoryChart.options.plugins.legend.labels.color = textColor;
    categoryChart.update();
  } else {
    // Initialize new Chart.js Doughnut Chart
    const ctx = canvas.getContext('2d');
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [
          {
            data: amounts,
            backgroundColor: backgroundColors,
            borderWidth: 2,
            borderColor: isDark ? '#151d2e' : '#ffffff',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              color: textColor,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 12,
                weight: '600',
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return ` ${label}: ${formatRupees(value)}`;
              },
            },
          },
        },
        cutout: '62%',
      },
    });
  }
}

/**
 * Re-render all views and updates
 */
function refreshAll() {
  updateDashboardMetrics();
  renderCategoryChart();
  renderMonthlySummary();
  renderTransactions();
}

// -----------------------------------------------------------------------------
// 7. Event Handlers & Actions
// -----------------------------------------------------------------------------

/**
 * Add a new expense
 */
function handleAddExpense(e) {
  e.preventDefault();

  const title = expenseTitle.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const date = expenseDate.value;
  const category = expenseCategory.value;

  // Validation
  if (!title) {
    showToast('Please enter an expense description', 'danger');
    expenseTitle.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid amount greater than ₹0', 'danger');
    expenseAmount.focus();
    return;
  }

  if (!date) {
    showToast('Please select a date', 'danger');
    expenseDate.focus();
    return;
  }

  if (!category) {
    showToast('Please select a category', 'danger');
    expenseCategory.focus();
    return;
  }

  // Create new expense object
  const newExpense = {
    id: 'exp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: title,
    amount: amount,
    date: date,
    category: category,
  };

  // Add to top of list
  expenses.unshift(newExpense);
  saveExpensesToStorage();
  refreshAll();

  // Reset form inputs
  expenseForm.reset();
  setDefaultDate();
  showToast(`Added "${title}" for ${formatRupees(amount)}`, 'success');
}

/**
 * Delete single expense
 */
window.deleteExpense = function (id) {
  const itemToDelete = expenses.find((item) => item.id === id);
  const title = itemToDelete ? itemToDelete.title : 'Expense';

  expenses = expenses.filter((item) => item.id !== id);
  saveExpensesToStorage();
  refreshAll();

  showToast(`Deleted "${title}"`, 'danger');
};

/**
 * Clear all expenses
 */
function handleClearAll() {
  if (expenses.length === 0) {
    showToast('There are no expenses to clear', 'info');
    return;
  }

  const confirmed = window.confirm(
    'Are you sure you want to clear ALL expenses? This action cannot be undone.'
  );

  if (confirmed) {
    expenses = [];
    saveExpensesToStorage();
    refreshAll();
    showToast('All expenses cleared successfully', 'info');
  }
}

/**
 * Set the date picker to today's date by default
 */
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  expenseDate.value = today;
}

/**
 * Reset all transaction filter inputs
 */
function resetFilters() {
  categoryFilter.value = 'ALL';
  monthFilter.value = 'ALL';
  searchTransactions.value = '';
  renderTransactions();
  showToast('Filters reset', 'info');
}

// -----------------------------------------------------------------------------
// 8. Initialization & Event Listeners
// -----------------------------------------------------------------------------
function initializeApp() {
  // Display current year in footer
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Set default date input to today
  setDefaultDate();

  // Initialize theme
  initTheme();

  // Load saved expenses
  loadExpensesFromStorage();

  // Initial render
  refreshAll();

  // Event Listeners
  expenseForm.addEventListener('submit', handleAddExpense);
  themeToggleBtn.addEventListener('click', toggleTheme);
  categoryFilter.addEventListener('change', renderTransactions);
  monthFilter.addEventListener('change', renderTransactions);
  searchTransactions.addEventListener('input', renderTransactions);
  resetFiltersBtn.addEventListener('click', resetFilters);
  clearAllBtn.addEventListener('click', handleClearAll);
}

// Run after DOM has loaded
document.addEventListener('DOMContentLoaded', initializeApp);


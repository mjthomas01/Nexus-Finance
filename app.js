// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm0GXMlLQuR4knkgrXJb4tU4B5h7hJI-k",
  authDomain: "expense-tracker-2de85.firebaseapp.com",
  projectId: "expense-tracker-2de85",
  storageBucket: "expense-tracker-2de85.firebasestorage.app",
  messagingSenderId: "473337148593",
  appId: "1:473337148593:web:acc8c341036e1f1c9ede90",
  measurementId: "G-CT7Q0DWJ9Z"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Auth State
let currentUser = null;
let isLoginMode = true;

// Auth DOM Elements
const loginView = document.getElementById('login-view');
const appContent = document.getElementById('app-content');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleLink = document.getElementById('auth-toggle-link');
const authToggleText = document.getElementById('auth-toggle-text');
const logoutBtn = document.getElementById('logout-btn');
const authError = document.getElementById('auth-error');

// DOM Elements
const listEl = document.getElementById('transaction-list');
const emptyStateEl = document.getElementById('empty-state');
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const filterInput = document.getElementById('filter-type');
const themeToggle = document.getElementById('theme-toggle');

const walletSelect = document.getElementById('wallet');
const fromWalletSelect = document.getElementById('from-wallet');
const toWalletSelect = document.getElementById('to-wallet');
const standardFields = document.getElementById('standard-fields');
const transferFields = document.getElementById('transfer-fields');
const manageWalletsBtn = document.getElementById('manage-wallets-btn');
const walletModal = document.getElementById('wallet-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const walletForm = document.getElementById('wallet-form');
const walletNameInput = document.getElementById('wallet-name');
const walletInitialBalanceInput = document.getElementById('wallet-initial-balance');
const walletIconInput = document.getElementById('wallet-icon');
const modalWalletList = document.getElementById('modal-wallet-list');
const walletsContainer = document.getElementById('wallets-container');
const walletSubmitBtn = document.getElementById('wallet-submit-btn');
const walletCancelBtn = document.getElementById('wallet-cancel-btn');

// Dashboard Tabs & Chart DOM
const tabTransactions = document.getElementById('tab-transactions');
const tabDashboard = document.getElementById('tab-dashboard');
const transactionsView = document.getElementById('transactions-view');
const dashboardView = document.getElementById('dashboard-view');
const dashboardMonthFilter = document.getElementById('dashboard-month-filter');
const chartCanvas = document.getElementById('expense-pie-chart');
const emptyChartState = document.getElementById('empty-chart-state');
const incomeExpenseCanvas = document.getElementById('income-expense-chart');
const emptyBarChartState = document.getElementById('empty-bar-chart-state');

// Split Expense DOM
const splitCheckboxWrap = document.getElementById('split-checkbox-wrap');
const isSplitCheckbox = document.getElementById('is-split');
const splitFields = document.getElementById('split-fields');
const splitPeopleInput = document.getElementById('split-people');
const splitWalletSelect = document.getElementById('split-wallet');

// State
let transactions = [];
let wallets = [];
let theme = localStorage.getItem('theme') || 'dark';
let editingWalletId = null;
let expenseChart = null;
let incomeExpenseChart = null;

// Categories Database
const TRANSACTION_CATEGORIES = [
  {
    "category_id": "income",
    "display_name": "Income",
    "icon_slug": "dollar-sign",
    "subs": [
      { "category_id": "salary", "display_name": "Salary", "icon_slug": "briefcase" },
      { "category_id": "freelance_business", "display_name": "Freelance & Business", "icon_slug": "monitor" },
      { "category_id": "investments", "display_name": "Investments", "icon_slug": "trending-up" },
      { "category_id": "refunds_gifts", "display_name": "Refunds & Gifts", "icon_slug": "gift" }
    ]
  },
  {
    "category_id": "housing",
    "display_name": "Housing",
    "icon_slug": "home",
    "subs": [
      { "category_id": "rent_mortgage", "display_name": "Rent & Mortgage", "icon_slug": "key" },
      { "category_id": "property_tax", "display_name": "Property Tax", "icon_slug": "file-text" },
      { "category_id": "home_maintenance", "display_name": "Home Maintenance", "icon_slug": "tool" }
    ]
  },
  {
    "category_id": "utilities",
    "display_name": "Utilities",
    "icon_slug": "zap",
    "subs": [
      { "category_id": "electricity", "display_name": "Electricity", "icon_slug": "lightning-bolt" },
      { "category_id": "water_sewer", "display_name": "Water & Sewer", "icon_slug": "droplet" },
      { "category_id": "internet_cable", "display_name": "Internet & Cable", "icon_slug": "wifi" },
      { "category_id": "trash_recycling", "display_name": "Trash & Recycling", "icon_slug": "trash" }
    ]
  },
  {
    "category_id": "food_dining",
    "display_name": "Food & Dining",
    "icon_slug": "restaurant",
    "subs": [
      { "category_id": "groceries", "display_name": "Groceries", "icon_slug": "shopping-cart" },
      { "category_id": "dining_out", "display_name": "Dining Out", "icon_slug": "utensils" },
      { "category_id": "coffee_shops", "display_name": "Coffee Shops", "icon_slug": "coffee" }
    ]
  },
  {
    "category_id": "transportation",
    "display_name": "Transportation",
    "icon_slug": "car",
    "subs": [
      { "category_id": "gas_fuel", "display_name": "Gas & Fuel", "icon_slug": "fuel" },
      { "category_id": "public_transit", "display_name": "Public Transit", "icon_slug": "train" },
      { "category_id": "auto_maintenance", "display_name": "Auto Maintenance", "icon_slug": "wrench" },
      { "category_id": "parking_tolls", "display_name": "Parking & Tolls", "icon_slug": "parking" }
    ]
  },
  {
    "category_id": "health_fitness",
    "display_name": "Health & Fitness",
    "icon_slug": "heart",
    "subs": [
      { "category_id": "medical_dental", "display_name": "Medical & Dental", "icon_slug": "plus-square" },
      { "category_id": "pharmacy", "display_name": "Pharmacy", "icon_slug": "pill" },
      { "category_id": "gym_memberships", "display_name": "Gym Memberships", "icon_slug": "activity" },
      { "category_id": "sports_activities", "display_name": "Sports & Activities", "icon_slug": "dribbble" }
    ]
  },
  {
    "category_id": "entertainment",
    "display_name": "Entertainment",
    "icon_slug": "film",
    "subs": [
      { "category_id": "movies_theater", "display_name": "Movies & Theater", "icon_slug": "ticket" },
      { "category_id": "concerts_events", "display_name": "Concerts & Events", "icon_slug": "music" },
      { "category_id": "hobbies", "display_name": "Hobbies", "icon_slug": "star" },
      { "category_id": "subscriptions", "display_name": "Subscriptions", "icon_slug": "tv" }
    ]
  },
  {
    "category_id": "shopping",
    "display_name": "Shopping",
    "icon_slug": "shopping-bag",
    "subs": [
      { "category_id": "clothing_shoes", "display_name": "Clothing & Shoes", "icon_slug": "scissors" },
      { "category_id": "electronics_gadgets", "display_name": "Electronics & Gadgets", "icon_slug": "smartphone" },
      { "category_id": "home_goods", "display_name": "Home Goods", "icon_slug": "package" },
      { "category_id": "gifts", "display_name": "Gifts", "icon_slug": "gift" }
    ]
  },
  {
    "category_id": "education",
    "display_name": "Education",
    "icon_slug": "book",
    "subs": [
      { "category_id": "tuition", "display_name": "Tuition", "icon_slug": "award" },
      { "category_id": "books_supplies", "display_name": "Books & Supplies", "icon_slug": "book-open" },
      { "category_id": "student_loans", "display_name": "Student Loans", "icon_slug": "briefcase" }
    ]
  },
  {
    "category_id": "financial_obligations",
    "display_name": "Financial Obligations",
    "icon_slug": "dollar-sign",
    "subs": [
      { "category_id": "life_insurance", "display_name": "Life Insurance", "icon_slug": "shield" },
      { "category_id": "credit_card_payments", "display_name": "Credit Card Payments", "icon_slug": "credit-card" },
      { "category_id": "taxes", "display_name": "Taxes", "icon_slug": "file-text" },
      { "category_id": "child_support_alimony", "display_name": "Child Support/Alimony", "icon_slug": "users" }
    ]
  },
  {
    "category_id": "personal_care",
    "display_name": "Personal Care",
    "icon_slug": "smile",
    "subs": [
      { "category_id": "hair_salon", "display_name": "Hair & Salon", "icon_slug": "scissors" },
      { "category_id": "spa_massage", "display_name": "Spa & Massage", "icon_slug": "sunset" },
      { "category_id": "cosmetics", "display_name": "Cosmetics", "icon_slug": "eye" }
    ]
  }
];

function populateCategoryDropdown() {
  categoryInput.innerHTML = '';
  const currentType = typeInput.value; // 'expense' or 'income'
  
  TRANSACTION_CATEGORIES.forEach(mainCat => {
    // Show only "income" main category for Income type, and hide it for Expense type.
    if (currentType === 'income' && mainCat.category_id !== 'income') return;
    if (currentType === 'expense' && mainCat.category_id === 'income') return;

    const optgroup = document.createElement('optgroup');
    optgroup.label = mainCat.display_name;
    
    mainCat.subs.forEach(subCat => {
      const option = document.createElement('option');
      option.value = subCat.category_id;
      option.text = subCat.display_name;
      optgroup.appendChild(option);
    });
    
    categoryInput.appendChild(optgroup);
  });
}

function toggleTransferFields() {
  if (typeInput.value === 'transfer') {
    standardFields.classList.add('hidden');
    transferFields.classList.remove('hidden');
    splitCheckboxWrap.classList.add('hidden');
    splitFields.classList.add('hidden');
    isSplitCheckbox.checked = false;
  } else {
    standardFields.classList.remove('hidden');
    transferFields.classList.add('hidden');
    populateCategoryDropdown();
    
    // Show Split checkbox only for Expense
    if (typeInput.value === 'expense') {
      splitCheckboxWrap.classList.remove('hidden');
      splitCheckboxWrap.style.display = 'flex';
    } else {
      splitCheckboxWrap.classList.add('hidden');
      splitCheckboxWrap.style.display = 'none';
      splitFields.classList.add('hidden');
      isSplitCheckbox.checked = false;
    }
  }
}

function toggleSplitFields() {
  if (isSplitCheckbox.checked) {
    splitFields.classList.remove('hidden');
  } else {
    splitFields.classList.add('hidden');
  }
}

// Initialize App
function init() {
  // Set today's date as default in form
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  // Set Theme
  applyTheme(theme);

  // Init Categories Dropdown dynamically
  typeInput.addEventListener('change', toggleTransferFields);
  toggleTransferFields();

  isSplitCheckbox.addEventListener('change', toggleSplitFields);

  // Init Dashboard Month Filter to current month
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  dashboardMonthFilter.value = currentYearMonth;
  dashboardMonthFilter.addEventListener('change', renderDashboard);

  // Tab Switching logic
  const tabTransactionsBtn = document.getElementById('tab-transactions');
  const tabDashboardBtn = document.getElementById('tab-dashboard');
  
  if (tabTransactionsBtn && tabDashboardBtn) {
    tabTransactionsBtn.addEventListener('click', () => switchTab('transactions'));
    tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
  } else {
    console.error("Tab buttons not found in DOM");
  }

  // Event Listeners
  form.addEventListener('submit', addTransaction);
  filterInput.addEventListener('change', renderDOM);
  themeToggle.addEventListener('click', toggleTheme);

  // Wallet Modal
  manageWalletsBtn.addEventListener('click', () => walletModal.classList.remove('hidden'));
  closeModalBtn.addEventListener('click', () => {
    walletModal.classList.add('hidden');
    resetWalletForm();
  });
  walletForm.addEventListener('submit', addWallet);
  walletCancelBtn.addEventListener('click', resetWalletForm);

  // Firestore Real-time Listeners
  window.walletUnsubscribe = db.collection("wallets")
    .where("userId", "==", currentUser.uid)
    .onSnapshot((snapshot) => {
    let loaded = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loaded.sort((a, b) => a.createdAt && b.createdAt ? a.createdAt.toDate() - b.createdAt.toDate() : 0);
    wallets = loaded;
    updateWalletDOM();
    updateValues(); // Refresh balances when wallets change
  });

  window.txUnsubscribe = db.collection("transactions")
    .where("userId", "==", currentUser.uid)
    .onSnapshot((snapshot) => {
    let newTx = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort transactions locally to ensure absolute newest is on top for same dates
    newTx.sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate() - a.createdAt.toDate();
      }
      return 0;
    });
    
    transactions = newTx;
    renderDOM();
  }, (error) => {
    console.error("Error fetching transactions: ", error);
    alert("Could not load transactions from database.");
  });
}

// ==========================================
// TABS & NAVIGATION
// ==========================================
function switchTab(tabName) {
  // Always query fresh in case of global scope issues
  const tabTx = document.getElementById('tab-transactions');
  const tabDash = document.getElementById('tab-dashboard');
  const viewTx = document.getElementById('transactions-view');
  const viewDash = document.getElementById('dashboard-view');

  if (tabName === 'transactions') {
    tabTx.classList.add('active');
    tabDash.classList.remove('active');
    
    // Style adjustments
    tabTx.style.background = 'var(--accent-primary)';
    tabTx.style.color = 'white';
    tabDash.style.background = 'var(--glass-bg)';
    tabDash.style.color = 'var(--text-primary)';
    
    viewTx.classList.remove('hidden');
    viewDash.classList.add('hidden');
  } else if (tabName === 'dashboard') {
    tabDash.classList.add('active');
    tabTx.classList.remove('active');
    
    // Style adjustments
    tabDash.style.background = 'var(--accent-primary)';
    tabDash.style.color = 'white';
    tabTx.style.background = 'var(--glass-bg)';
    tabTx.style.color = 'var(--text-primary)';
    
    viewDash.classList.remove('hidden');
    viewTx.classList.add('hidden');
    
    // Small timeout to ensure hidden class removal completes before Chart.js calculates width
    setTimeout(renderDashboard, 10);
  }
}

// Expose switchTab globally for inline HTML onclick handlers
window.switchTab = switchTab;

function updateWalletDOM() {
  // Populate dropdowns
  walletSelect.innerHTML = '';
  fromWalletSelect.innerHTML = '';
  toWalletSelect.innerHTML = '';
  splitWalletSelect.innerHTML = '';

  if (wallets.length === 0) {
    const defaultOption = new Option("Please create a wallet", "");
    walletSelect.add(defaultOption.cloneNode(true));
    fromWalletSelect.add(defaultOption.cloneNode(true));
    toWalletSelect.add(defaultOption.cloneNode(true));
    splitWalletSelect.add(defaultOption.cloneNode(true));
  } else {
    wallets.forEach(wallet => {
      walletSelect.add(new Option(wallet.name, wallet.id));
      fromWalletSelect.add(new Option(wallet.name, wallet.id));
      toWalletSelect.add(new Option(wallet.name, wallet.id));
      splitWalletSelect.add(new Option(wallet.name, wallet.id));
    });
    
    // Intelligently set defaults so they don't overlap if possible
    if (wallets.length > 1) {
      toWalletSelect.selectedIndex = 1;
      
      // Try to find a wallet with "split" or "tab" in the name for split default
      const splitIdx = wallets.findIndex(w => w.name.toLowerCase().includes('split') || w.name.toLowerCase().includes('tab'));
      if (splitIdx !== -1 && splitIdx !== walletSelect.selectedIndex) {
        splitWalletSelect.selectedIndex = splitIdx;
      } else {
        splitWalletSelect.selectedIndex = 1;
      }
    }
  }

  // Populate Modal List
  modalWalletList.innerHTML = '';
  wallets.forEach(wallet => {
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    li.innerHTML = `
      <div class="tx-info">
        <div class="tx-icon" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">
          <i data-feather="${wallet.icon}"></i>
        </div>
        <div class="tx-details">
          <h4>${wallet.name}</h4>
          <p>Initial: ${formatter.format(wallet.initialBalance)}</p>
        </div>
      </div>
      <div class="tx-actions" style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="icon-btn" onclick="editWallet('${wallet.id}')" aria-label="Edit" style="color: var(--accent-primary); padding: 0.5rem;">
          <i data-feather="edit-2" style="width: 16px; height: 16px;"></i>
        </button>
        <button class="delete-btn" onclick="removeWallet('${wallet.id}')" aria-label="Delete">
          <i data-feather="trash-2"></i>
        </button>
      </div>
    `;
    modalWalletList.appendChild(li);
  });

  setTimeout(() => feather.replace(), 0);
}

function resetWalletForm() {
  editingWalletId = null;
  walletNameInput.value = '';
  walletInitialBalanceInput.value = '';
  walletSubmitBtn.innerHTML = 'Add Wallet';
  walletCancelBtn.classList.add('hidden');
}

window.editWallet = function(id) {
  const wallet = wallets.find(w => w.id === id);
  if (!wallet) return;
  
  editingWalletId = id;
  walletNameInput.value = wallet.name;
  walletInitialBalanceInput.value = wallet.initialBalance;
  walletIconInput.value = wallet.icon;
  
  walletSubmitBtn.innerHTML = 'Update Wallet';
  walletCancelBtn.classList.remove('hidden');
}

async function addWallet(e) {
  e.preventDefault();
  if (walletNameInput.value.trim() === '') return;

  const walletData = {
    userId: currentUser.uid,
    name: walletNameInput.value.trim(),
    initialBalance: +walletInitialBalanceInput.value,
    icon: walletIconInput.value
  };

  try {
    if (editingWalletId) {
      await db.collection("wallets").doc(editingWalletId).update(walletData);
    } else {
      walletData.createdAt = new Date();
      await db.collection("wallets").add(walletData);
    }
    resetWalletForm();
  } catch (error) {
    console.error("Error saving wallet: ", error);
  }
}

window.removeWallet = async function(id) {
  try {
    await db.collection("wallets").doc(id).delete();
  } catch (error) {
    console.error("Error removing wallet: ", error);
  }
}

// Currency Formatter
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// Add Transaction (Firebase)
async function addTransaction(e) {
  e.preventDefault();

  if (descInput.value.trim() === '' || amountInput.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }

  let transactionData = {
    userId: currentUser.uid,
    desc: descInput.value.trim(),
    amount: +amountInput.value,
    type: typeInput.value,
    date: dateInput.value,
    createdAt: new Date()
  };

  if (typeInput.value === 'transfer') {
    if (fromWalletSelect.value === toWalletSelect.value || !fromWalletSelect.value || !toWalletSelect.value) {
      alert("Please select two distinct valid wallets for a transfer.");
      return;
    }
    transactionData.fromWallet = fromWalletSelect.value;
    transactionData.toWallet = toWalletSelect.value;
  } else {
    if (!walletSelect.value) {
      alert("Please select a wallet to charge.");
      return;
    }
    transactionData.category = categoryInput.value;
    transactionData.wallet = walletSelect.value;
    
    if (typeInput.value === 'expense' && isSplitCheckbox.checked) {
      const p = +splitPeopleInput.value;
      if (p < 2) {
         alert("Please enter a valid number of people to split with (at least 2).");
         return;
      }
      if (!splitWalletSelect.value) {
         alert("Please select a Split Wallet where owed funds should be tracked.");
         return;
      }
      if (splitWalletSelect.value === walletSelect.value) {
         alert("Please select a different wallet for the split funds destination. By paying with and splitting to the exact same wallet, the math zeroes out.");
         return;
      }
      transactionData.isSplit = true;
      transactionData.splitPeople = p;
      transactionData.splitWallet = splitWalletSelect.value;
    }
  }

  try {
    // Disable form while saving (optional UX improvement)
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-feather="loader"></i> Saving...';
    btn.disabled = true;
    feather.replace();

    await db.collection("transactions").add(transactionData);
    
    // Reset Form fields Except Date
    descInput.value = '';
    amountInput.value = '';
    isSplitCheckbox.checked = false;
    splitPeopleInput.value = '';
    splitFields.classList.add('hidden');
    
    // Restore button
    btn.innerHTML = originalText;
    btn.disabled = false;
    feather.replace();

  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error saving transaction. Check console.");
  }
}

// Delete Transaction (Firebase)
async function removeTransaction(id) {
  try {
    await db.collection("transactions").doc(id).delete();
  } catch (error) {
    console.error("Error removing document: ", error);
    alert("Error deleting transaction.");
  }
}

// Render the DOM
function renderDOM() {
  listEl.innerHTML = '';
  
  const filterVal = filterInput.value;
  const filteredTxs = transactions.filter(t => {
      if (filterVal === 'all') return true;
      return t.type === filterVal;
  });

  if (filteredTxs.length === 0) {
    emptyStateEl.classList.remove('hidden');
  } else {
    emptyStateEl.classList.add('hidden');
    filteredTxs.forEach(addTransactionDOM);
  }

  // Needs timeout for feather icons to render in newly created DOM nodes
  setTimeout(() => {
    feather.replace();
  }, 0);

  updateValues();
}

// Add Transaction to DOM List
function addTransactionDOM(transaction) {
  const item = document.createElement('li');
  item.classList.add('transaction-item');

  if (transaction.type === 'transfer') {
    const fromW = wallets.find(w => w.id === transaction.fromWallet)?.name || 'Unknown';
    const toW = wallets.find(w => w.id === transaction.toWallet)?.name || 'Unknown';
    item.classList.add('tx-expense'); 

    item.innerHTML = `
      <div class="tx-info">
        <div class="tx-icon" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">
          <i data-feather="refresh-cw"></i>
        </div>
        <div class="tx-details">
          <h4>${transaction.desc}</h4>
          <p>
            <span class="tx-category"><i data-feather="arrow-right" style="width: 12px; height: 12px;"></i> Transfer</span>
            <span>${new Date(transaction.date).toLocaleDateString()}</span>
          </p>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">${fromW} → ${toW}</p>
        </div>
      </div>
      <div class="tx-amount-actions">
        <div class="tx-amount" style="color: var(--text-primary);">
          ${formatter.format(transaction.amount)}
        </div>
        <button class="delete-btn" onclick="removeTransaction('${transaction.id}')" aria-label="Delete">
          <i data-feather="trash-2"></i>
        </button>
      </div>
    `;
  } else {
    const isIncome = transaction.type === 'income';
    let catName = transaction.category || 'General';
    let catIcon = 'tag';

    if (transaction.category) {
      for (const mainCat of TRANSACTION_CATEGORIES) {
        const subCat = mainCat.subs.find(sub => sub.category_id === transaction.category);
        if (subCat) {
          catName = subCat.display_name;
          catIcon = subCat.icon_slug;
          break;
        }
      }
    }

    const walletName = wallets.find(w => w.id === transaction.wallet)?.name || 'Unknown';
    item.classList.add(isIncome ? 'tx-income' : 'tx-expense');

    let splitContent = '';
    let displayAmount = transaction.amount;

    if (transaction.isSplit) {
      const splitW = wallets.find(w => w.id === transaction.splitWallet)?.name || 'Unknown';
      const userShare = transaction.amount / transaction.splitPeople;
      const owedPortion = transaction.amount - userShare;
      displayAmount = userShare;
      splitContent = `<span style="margin-left:8px; color: var(--accent-primary);"><i data-feather="users" style="width: 10px; height: 10px;"></i> Split (1/${transaction.splitPeople}) → ${splitW} (+${formatter.format(owedPortion)})</span>`;
    }

    item.innerHTML = `
      <div class="tx-info">
        <div class="tx-icon">
          <i data-feather="${isIncome ? 'trending-up' : 'trending-down'}"></i>
        </div>
        <div class="tx-details">
          <h4>${transaction.desc}</h4>
          <p>
            <span class="tx-category"><i data-feather="${catIcon}" style="width: 12px; height: 12px;"></i> ${catName}</span>
            <span>${new Date(transaction.date).toLocaleDateString()}</span>
          </p>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
            <i data-feather="credit-card" style="width: 10px; height: 10px;"></i> ${walletName}
            ${splitContent}
          </p>
        </div>
      </div>
      <div class="tx-amount-actions">
        <div class="tx-amount">
          ${isIncome ? '+' : '-'}${formatter.format(displayAmount)}
        </div>
        <button class="delete-btn" onclick="removeTransaction('${transaction.id}')" aria-label="Delete">
          <i data-feather="trash-2"></i>
        </button>
      </div>
    `;
  }

  listEl.appendChild(item);
}

// Update Totals
function updateValues() {
  walletsContainer.innerHTML = '';
  let globalTotal = 0;
  
  wallets.forEach(wallet => {
    let balance = wallet.initialBalance || 0;
    
    transactions.forEach(t => {
      if (t.type === 'income' && t.wallet === wallet.id) {
        balance += t.amount;
      } else if (t.type === 'expense') {
        if (t.isSplit) {
          const userShare = t.amount / t.splitPeople;
          const owedPortion = t.amount - userShare;
          if (t.wallet === wallet.id) balance -= t.amount;
          if (t.splitWallet === wallet.id) balance += owedPortion;
        } else {
          if (t.wallet === wallet.id) balance -= t.amount;
        }
      } else if (t.type === 'transfer') {
        if (t.fromWallet === wallet.id) balance -= t.amount;
        if (t.toWallet === wallet.id) balance += t.amount;
      }
    });

    globalTotal += balance;

    const div = document.createElement('div');
    div.classList.add('card', 'glass', balance >= 0 ? 'income-card' : 'expense-card');
    div.innerHTML = `
      <div class="card-header">
        <h3>${wallet.name}</h3>
        <i data-feather="${wallet.icon}"></i>
      </div>
      <h2 style="color: var(--text-primary)">${formatter.format(balance)}</h2>
    `;
    walletsContainer.appendChild(div);
  });

  // Global Total Card
  const globalCard = document.createElement('div');
  globalCard.classList.add('card', 'glass', 'balance-card');
  globalCard.innerHTML = `
    <div class="card-header">
      <h3>Global Net Worth</h3>
      <i data-feather="pie-chart"></i>
    </div>
    <h2 style="color: ${globalTotal >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatter.format(globalTotal)}</h2>
  `;
  walletsContainer.insertBefore(globalCard, walletsContainer.firstChild);

  setTimeout(() => feather.replace(), 0);
}

// Theme Management
function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  localStorage.setItem('theme', theme);
}

function applyTheme(currentTheme) {
  const icon = themeToggle.querySelector('i');
  if (currentTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
    if(icon) icon.setAttribute('data-feather', 'moon');
  } else {
    document.body.removeAttribute('data-theme');
    if(icon) icon.setAttribute('data-feather', 'sun');
  }
  setTimeout(() => {
    feather.replace();
  }, 0);
}

// --- AUTO-START ---
// Removed init() here because it is now triggered dynamically by onAuthStateChanged

// --- AUTHENTICATION LOGIC ---
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loginView.classList.add('hidden');
    appContent.classList.remove('hidden');
    init(); // Boot data
  } else {
    currentUser = null;
    loginView.classList.remove('hidden');
    appContent.classList.add('hidden');
    
    // Clear state
    transactions = [];
    wallets = [];
    renderDOM();
    updateWalletDOM();
    updateValues();
    
    // Unsubscribe listeners from old user
    if(window.walletUnsubscribe) window.walletUnsubscribe();
    if(window.txUnsubscribe) window.txUnsubscribe();
  }
});

authToggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  authTitle.textContent = isLoginMode ? 'Sign In' : 'Create Account';
  authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
  authToggleText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
  authToggleLink.textContent = isLoginMode ? 'Sign Up' : 'Login';
});

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = authEmail.value;
  const password = authPassword.value;
  
  // Clear any previous error
  authError.textContent = '';
  
  const btn = authSubmitBtn;
  const originalText = btn.textContent;
  btn.textContent = 'Please wait...';
  btn.disabled = true;

  const authPromise = isLoginMode 
    ? auth.signInWithEmailAndPassword(email, password)
    : auth.createUserWithEmailAndPassword(email, password);
    
  authPromise.catch(error => {
    console.error("Auth Error details:", error);
    // Specifically handle the 400 Bad Request error typically caused by disabled Email Auth
    if(error.code === 'auth/operation-not-allowed') {
        authError.textContent = "Error: Email/Password Authentication is not enabled in your Firebase Console. Please refer to the setup instructions.";
    } else {
        authError.textContent = error.message;
    }
  }).finally(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  });
});

logoutBtn.addEventListener('click', () => {
  auth.signOut().catch(e => console.error(e));
});

const googleProvider = new firebase.auth.GoogleAuthProvider();
const googleSignInBtn = document.getElementById('google-signin-btn');

if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', () => {
    const originalText = googleSignInBtn.innerHTML;
    googleSignInBtn.innerHTML = 'Please wait...';
    googleSignInBtn.disabled = true;
    authError.textContent = '';

    auth.signInWithPopup(googleProvider)
      .catch(error => {
        console.error("Google Sign-In Error details:", error);
        authError.textContent = error.message;
      })
      .finally(() => {
        googleSignInBtn.innerHTML = originalText;
        googleSignInBtn.disabled = false;
      });
  });
}

// --- DASHBOARD CHARTS LOGIC ---

function aggregateIncomeVsExpense(yearMonth) {
  let income = 0;
  let expense = 0;
  
  const filtered = transactions.filter(t => t.date.substring(0, 7) === yearMonth);
  
  filtered.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else if (t.type === 'expense') {
      let cost = t.amount;
      if (t.isSplit) {
        cost = t.amount / t.splitPeople;
      }
      expense += cost;
    }
  });
  
  return { income, expense };
}

function aggregateExpensesByMonth(yearMonth) {
  const aggregated = {};
  
  // Filter for ONLY expenses in the selected month
  const expenses = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    // t.date format is YYYY-MM-DD, we need YYYY-MM
    return t.date.substring(0, 7) === yearMonth;
  });

  expenses.forEach(t => {
    // Determine category display name
    let catName = 'General';
    if (t.category) {
      for (const mainCat of TRANSACTION_CATEGORIES) {
        const subCat = mainCat.subs.find(sub => sub.category_id === t.category);
        if (subCat) {
          catName = subCat.display_name;
          break;
        }
      }
    }

    // Determine cost to attribute (user's personal share if split)
    let cost = t.amount;
    if (t.isSplit) {
      cost = t.amount / t.splitPeople;
    }

    if (!aggregated[catName]) {
      aggregated[catName] = 0;
    }
    aggregated[catName] += cost;
  });

  return aggregated;
}

function renderIncomeExpenseChart(yearMonth, isLight, textColor) {
  const dataMap = aggregateIncomeVsExpense(yearMonth);
  
  if (dataMap.income === 0 && dataMap.expense === 0) {
    incomeExpenseCanvas.style.display = 'none';
    emptyBarChartState.classList.remove('hidden');
    if (incomeExpenseChart) {
      incomeExpenseChart.destroy();
      incomeExpenseChart = null;
    }
    return;
  } else {
    incomeExpenseCanvas.style.display = 'block';
    emptyBarChartState.classList.add('hidden');
  }

  if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
  }

  const ctx = incomeExpenseCanvas.getContext('2d');
  incomeExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        label: 'Amount',
        data: [dataMap.income, dataMap.expense],
        backgroundColor: [
          '#2ec4b6', // Success Teal
          '#ff9f1c'  // Danger Orange
        ],
        borderRadius: 6,
        borderWidth: 0,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,41,59,0.9)',
          titleColor: isLight ? '#0f172a' : '#f8fafc',
          bodyColor: isLight ? '#64748b' : '#cbd5e1',
          borderColor: isLight ? '#e2e8f0' : '#334155',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          displayColors: false,
          callbacks: {
            label: function(context) {
               return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            font: { family: "'Outfit', sans-serif" }
          },
          grid: {
            color: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColor,
            font: { family: "'Outfit', sans-serif", size: 14 }
          },
          grid: { display: false }
        }
      }
    }
  });
}

function renderDashboard() {
  // 1. Get chosen month
  const yearMonth = dashboardMonthFilter.value;
  if (!yearMonth) return;
  
  const isLight = theme === 'light';
  const textColor = isLight ? '#64748b' : '#94a3b8';

  // 2. Render Bar Chart
  renderIncomeExpenseChart(yearMonth, isLight, textColor);

  // 3. Aggregate Data for Pie Chart
  const dataMap = aggregateExpensesByMonth(yearMonth);
  const labels = Object.keys(dataMap);
  const data = Object.values(dataMap);

  // 4. Handle Empty State for Pie Chart
  if (labels.length === 0) {
    chartCanvas.style.display = 'none';
    emptyChartState.classList.remove('hidden');
    if (expenseChart) {
      expenseChart.destroy();
      expenseChart = null;
    }
    return;
  } else {
    chartCanvas.style.display = 'block';
    emptyChartState.classList.add('hidden');
  }

  // 5. Determine Colors (Harmonious palette based on app theme)
  const bgColors = [
    '#ff9f1c', '#ffbf69', '#2ec4b6', '#cbf3f0', '#ffffff', 
    '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9',
    '#3b82f6', '#1e40af', '#4c1d95', '#9d174d', '#7c2d12'
  ];

  // 6. Render Chart.js Pie Chart
  if (expenseChart) {
    expenseChart.destroy();
  }

  const ctx = chartCanvas.getContext('2d');
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: isLight ? '#ffffff' : '#1e293b',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: {
              family: "'Outfit', sans-serif",
              size: 13
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,41,59,0.9)',
          titleColor: isLight ? '#0f172a' : '#f8fafc',
          bodyColor: isLight ? '#64748b' : '#cbd5e1',
          borderColor: isLight ? '#e2e8f0' : '#334155',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
              }
              return label;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

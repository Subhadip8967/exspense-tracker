import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calendar, DollarSign, PieChart, TrendingUp, CreditCard, Tag, FileText, ChevronLeft, ChevronRight, Save } from 'lucide-react';

const CATEGORIES = [
  "Food", "Transport", "Housing", "Utilities", "Health", 
  "Entertainment", "Shopping", "Investment", "Education", "Other"
];

const PAYMENT_METHODS = ["Cash", "Credit Card", "Debit Card", "UPI/Digital", "Bank Transfer"];

export default function App() {
  // State
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('my_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [view, setView] = useState('dashboard'); // dashboard, history, analytics
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food',
    description: '',
    paymentMethod: 'Cash'
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('my_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.date) return;

    const expense = {
      id: Date.now().toString(),
      ...newExpense,
      amount: parseFloat(newExpense.amount)
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Food',
      description: '',
      paymentMethod: 'Cash'
    });
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // derived state for formulas
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses, currentMonth, currentYear]);

  const currentYearExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses, currentYear]);

  // Group by Month logic
  const expensesByMonth = useMemo(() => {
    const grouped = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += e.amount;
    });
    return Object.entries(grouped).sort().reverse();
  }, [expenses]);

  // Group by Category Logic (Current Month)
  const categoryBreakdown = useMemo(() => {
    const grouped = {};
    expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).forEach(e => {
      if (!grouped[e.category]) grouped[e.category] = 0;
      grouped[e.category] += e.amount;
    });
    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  }, [expenses, currentMonth, currentYear]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6" /> ExpenseTracker
            </h1>
            <p className="text-blue-100 text-xs mt-1">Plan. Track. Save.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold shadow hover:bg-blue-50 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">This Month</h3>
            <p className="text-3xl font-bold text-gray-900">${currentMonthExpenses.toFixed(2)}</p>
            <div className="text-xs text-gray-400 mt-2">
               {new Date().toLocaleString('default', { month: 'long' })} {currentYear}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">This Year</h3>
            <p className="text-3xl font-bold text-blue-600">${currentYearExpenses.toFixed(2)}</p>
            <div className="text-xs text-gray-400 mt-2">
               Total for {currentYear}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">All Time</h3>
            <p className="text-3xl font-bold text-green-600">${totalExpenses.toFixed(2)}</p>
            <div className="text-xs text-gray-400 mt-2">
               Lifetime Spend
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-lg shadow-sm mb-6 border border-gray-100">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${view === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${view === 'history' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            History
          </button>
        </div>

        {/* View Content */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Monthly Breakdown
              </h3>
              <div className="space-y-3">
                {expensesByMonth.length > 0 ? expensesByMonth.map(([key, amount]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">{key}</span>
                    <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm text-center py-4">No data yet.</p>
                )}
              </div>
            </div>

            {/* Category Spend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" /> Top Categories (This Month)
              </h3>
               <div className="space-y-3">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map(([cat, amount]) => (
                  <div key={cat} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{cat}</span>
                      <span className="font-medium text-gray-900">${amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((amount / currentMonthExpenses) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )) : (
                   <p className="text-gray-400 text-sm text-center py-4">No expenses this month.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-gray-700">Recent Transactions</h3>
               <span className="text-xs text-gray-500">{expenses.length} records</span>
             </div>
             <div className="divide-y divide-gray-100">
               {expenses.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">
                   <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                   <p>No expenses recorded yet.</p>
                 </div>
               ) : (
                 expenses.map((expense) => (
                   <div key={expense.id} className="p-4 hover:bg-blue-50 transition flex justify-between items-center group">
                     <div className="flex items-start gap-3">
                       <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          {expense.category === 'Food' && <Tag className="w-5 h-5" />}
                          {expense.category !== 'Food' && <DollarSign className="w-5 h-5" />}
                       </div>
                       <div>
                         <p className="font-semibold text-gray-800">{expense.description || expense.category}</p>
                         <div className="flex gap-2 text-xs text-gray-500 mt-1">
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {expense.date}</span>
                           <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> {expense.paymentMethod}</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                       <button 
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-400 text-xs hover:text-red-600 mt-1 opacity-0 group-hover:opacity-100 transition"
                       >
                         Delete
                       </button>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">Add New Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="text-blue-100 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-7 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newExpense.paymentMethod}
                    onChange={e => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  placeholder="What was this for?"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition mt-2"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

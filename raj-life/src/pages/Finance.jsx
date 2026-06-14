import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Finance() {
  const { data, addFinanceItem, deleteFinanceItem } = useApp();
  const [activeCategory, setActiveCategory] = useState('income');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', description: '', person: '' });

  const categories = [
    { id: 'income', label: 'Income', icon: '💵', color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'expenses', label: 'Expenses', icon: '🛒', color: 'red', gradient: 'from-red-500 to-rose-600' },
    { id: 'loans', label: 'Loans', icon: '🏦', color: 'amber', gradient: 'from-amber-500 to-orange-600' },
    { id: 'creditCards', label: 'Credit Card', icon: '💳', color: 'purple', gradient: 'from-purple-500 to-violet-600' },
    { id: 'otherIncome', label: 'Other Income', icon: '🎁', color: 'cyan', gradient: 'from-cyan-500 to-blue-600' }
  ];

  const currentCategory = categories.find(c => c.id === activeCategory);
  const items = data.finance[activeCategory] || [];
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    addFinanceItem(activeCategory, formData);
    setFormData({ title: '', amount: '', description: '', person: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-20 -mt-20"></div>
        <h2 className="text-2xl font-bold gradient-text mb-1">💰 Finance Manager</h2>
        <p className="text-slate-400 text-sm">Track your money flow</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setShowForm(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
              activeCategory === cat.id
                ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Total Card */}
      <div className={`glass-card p-5 border-l-4 border-${currentCategory.color}-500`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total {currentCategory.label}</p>
            <p className={`text-2xl md:text-3xl font-bold text-${currentCategory.color}-400`}>
              ₹{total.toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center`}>
            <span className="text-2xl">{currentCategory.icon}</span>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="glow-button w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
      >
        {showForm ? '✕ Cancel' : `+ Add ${currentCategory.label}`}
      </button>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4 animate-fade-in">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={activeCategory === 'loans' ? 'e.g., Home Loan' : 'e.g., Salary'}
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Amount (₹) *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          {(activeCategory === 'loans') && (
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Person / Bank</label>
              <input
                type="text"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                placeholder="Loan from whom?"
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional note..."
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="glow-button w-full py-3 rounded-xl text-white font-semibold"
          >
            ✓ Save {currentCategory.label}
          </button>
        </form>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">{currentCategory.icon}</p>
            <p className="text-slate-400">No {currentCategory.label.toLowerCase()} added yet</p>
            <p className="text-slate-500 text-sm mt-1">Tap the button above to add</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="glass-card p-4 flex items-center justify-between group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm">{currentCategory.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{item.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.person && <span className="text-xs text-indigo-400">👤 {item.person}</span>}
                    {item.description && <span className="text-xs text-slate-500">{item.description}</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold text-${currentCategory.color}-400`}>
                  ₹{Number(item.amount).toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => deleteFinanceItem(activeCategory, item.id)}
                  className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all opacity-70 group-hover:opacity-100"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {items.length > 0 && (
        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-slate-400 text-sm">{items.length} entries</span>
          <span className={`font-bold text-${currentCategory.color}-400`}>
            Total: ₹{total.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  );
}

export default Finance;

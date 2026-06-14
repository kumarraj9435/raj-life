import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Payments() {
  const { data, addPayment, togglePayment, deletePayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({ title: '', amount: '', dueDate: '', category: 'bill', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.dueDate) return;
    addPayment(formData);
    setFormData({ title: '', amount: '', dueDate: '', category: 'bill', description: '' });
    setShowForm(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredPayments = data.payments.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !p.done;
    if (filter === 'done') return p.done;
    if (filter === 'overdue') {
      const due = new Date(p.dueDate);
      due.setHours(0, 0, 0, 0);
      return !p.done && due < today;
    }
    if (filter === 'upcoming') {
      const due = new Date(p.dueDate);
      due.setHours(0, 0, 0, 0);
      const threeDays = new Date(today);
      threeDays.setDate(threeDays.getDate() + 3);
      return !p.done && due >= today && due <= threeDays;
    }
    return true;
  });

  const totalPending = data.payments.filter(p => !p.done).reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = data.payments.filter(p => p.done).reduce((sum, p) => sum + Number(p.amount), 0);

  const getDaysLeft = (dueDate) => {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, color: 'text-red-400', bg: 'bg-red-500/20' };
    if (diff === 0) return { text: 'Due Today!', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (diff <= 3) return { text: `${diff} days left`, color: 'text-amber-400', bg: 'bg-amber-500/20' };
    return { text: `${diff} days left`, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  };

  const categoryIcons = {
    bill: '📄',
    emi: '🏦',
    rent: '🏠',
    subscription: '📺',
    insurance: '🛡️',
    tax: '📋',
    other: '💸'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -mr-20 -mt-20"></div>
        <h2 className="text-2xl font-bold gradient-text mb-1">💸 Payments & Bills</h2>
        <p className="text-slate-400 text-sm">Never miss a payment - get reminders 3 days before!</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-sm text-slate-400">Pending: ₹{totalPending.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-sm text-slate-400">Paid: ₹{totalPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Reminder Alert */}
      {data.payments.filter(p => {
        if (p.done) return false;
        const due = new Date(p.dueDate);
        due.setHours(0, 0, 0, 0);
        const threeDays = new Date(today);
        threeDays.setDate(threeDays.getDate() + 3);
        return due >= today && due <= threeDays;
      }).length > 0 && (
        <div className="glass-card p-4 border-l-4 border-amber-500 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <span className="text-amber-400 font-semibold text-sm">Upcoming Payments (Next 3 Days)!</span>
          </div>
          <div className="space-y-1">
            {data.payments.filter(p => {
              if (p.done) return false;
              const due = new Date(p.dueDate);
              due.setHours(0, 0, 0, 0);
              const threeDays = new Date(today);
              threeDays.setDate(threeDays.getDate() + 3);
              return due >= today && due <= threeDays;
            }).map(p => (
              <p key={p.id} className="text-xs text-slate-300">
                • {p.title} - ₹{Number(p.amount).toLocaleString('en-IN')} (Due: {new Date(p.dueDate).toLocaleDateString('en-IN')})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All', icon: '📋' },
          { id: 'pending', label: 'Pending', icon: '⏳' },
          { id: 'upcoming', label: '3 Days', icon: '⚠️' },
          { id: 'overdue', label: 'Overdue', icon: '🔴' },
          { id: 'done', label: 'Paid', icon: '✅' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="glow-button w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
      >
        {showForm ? '✕ Cancel' : '+ Add Payment / Bill'}
      </button>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Payment Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Electricity Bill, EMI, Rent"
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Amount (₹) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Amount"
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="bill">📄 Bill</option>
              <option value="emi">🏦 EMI</option>
              <option value="rent">🏠 Rent</option>
              <option value="subscription">📺 Subscription</option>
              <option value="insurance">🛡️ Insurance</option>
              <option value="tax">📋 Tax</option>
              <option value="other">💸 Other</option>
            </select>
          </div>
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
            💸 Add Payment
          </button>
        </form>
      )}

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-slate-400">No payments found</p>
            <p className="text-slate-500 text-sm mt-1">Add your upcoming bills and payments</p>
          </div>
        ) : (
          filteredPayments.map(payment => {
            const daysInfo = getDaysLeft(payment.dueDate);
            return (
              <div
                key={payment.id}
                className={`glass-card p-4 flex items-center gap-3 group hover:border-indigo-500/40 transition-all ${
                  payment.done ? 'opacity-60' : ''
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => togglePayment(payment.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    payment.done
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-500 hover:border-indigo-400'
                  }`}
                >
                  {payment.done && <span className="text-white text-xs">✓</span>}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[payment.category] || '💸'}</span>
                    <p className={`font-medium ${payment.done ? 'line-through text-slate-500' : 'text-white'}`}>
                      {payment.title}
                    </p>
                  </div>
                  {payment.description && (
                    <p className="text-xs text-slate-500 mt-0.5 ml-7">{payment.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 ml-7 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                      📅 {new Date(payment.dueDate).toLocaleDateString('en-IN')}
                    </span>
                    {!payment.done && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${daysInfo.bg} ${daysInfo.color}`}>
                        {daysInfo.text}
                      </span>
                    )}
                    {payment.done && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        ✅ Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Delete */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-400 text-sm">
                    ₹{Number(payment.amount).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => deletePayment(payment.id)}
                    className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all opacity-60 group-hover:opacity-100 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {data.payments.length > 0 && (
        <div className="glass-card p-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {filteredPayments.length} of {data.payments.length} payments
          </span>
          <span className="text-orange-400 font-medium">
            Pending: ₹{totalPending.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  );
}

export default Payments;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Birthdays() {
  const { data, addBirthday, deleteBirthday } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', relation: '', notes: '' });

  const birthdays = data.birthdays || [];

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const getDaysUntilBirthday = (dateStr) => {
    if (!dateStr) return 999;
    const parts = dateStr.split('-');
    // format: MM-DD or YYYY-MM-DD
    let month, day;
    if (parts.length === 2) {
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
    } else {
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    }
    const thisYear = today.getFullYear();
    let bday = new Date(thisYear, month - 1, day);
    if (bday < today) {
      bday = new Date(thisYear + 1, month - 1, day);
    }
    const diff = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isTodayBirthday = (dateStr) => {
    if (!dateStr) return false;
    return getDaysUntilBirthday(dateStr) === 0 || getDaysUntilBirthday(dateStr) === 365;
  };

  const getAge = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const year = parseInt(parts[0]);
    if (year < 1900) return null;
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    if (parts.length === 2) {
      return `${day} ${monthNames[parseInt(parts[0]) - 1]}`;
    }
    const year = parts[0];
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return `${day} ${monthNames[month - 1]}${year >= 1900 ? `, ${year}` : ''}`;
  };

  const sortedBirthdays = [...birthdays].sort((a, b) => {
    return getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date);
  });

  const todayBirthdays = sortedBirthdays.filter(b => getDaysUntilBirthday(b.date) === 0);
  const upcomingBirthdays = sortedBirthdays.filter(b => {
    const days = getDaysUntilBirthday(b.date);
    return days > 0 && days <= 7;
  });

  const handleAdd = async () => {
    if (!form.name || !form.date) return;
    await addBirthday(form);
    setForm({ name: '', date: '', relation: '', notes: '' });
    setShowForm(false);
  };

  const relationEmoji = {
    'Family': '👨‍👩‍👧',
    'Friend': '👫',
    'Work': '💼',
    'Other': '⭐',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full -mr-16 -mt-16"></div>
        <h2 className="text-2xl font-bold gradient-text mb-1">🎂 Birthdays</h2>
        <p className="text-slate-400 text-sm">Kabhi kisi ka birthday mat bhoolna!</p>
      </div>

      {/* Today's Birthdays */}
      {todayBirthdays.length > 0 && (
        <div className="glass-card p-5 border-2 border-pink-500/50 animate-pulse-slow">
          <h3 className="text-lg font-bold text-pink-400 mb-3 flex items-center gap-2">
            🎉 Aaj Birthday Hai!
          </h3>
          {todayBirthdays.map(b => (
            <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl">
                🎂
              </div>
              <div>
                <p className="text-white font-bold text-lg">{b.name}</p>
                <p className="text-pink-300 text-sm">{b.relation} {getAge(b.date) ? `• ${getAge(b.date)} saal` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming in 7 days */}
      {upcomingBirthdays.length > 0 && (
        <div className="glass-card p-5 border border-amber-500/30">
          <h3 className="text-base font-semibold text-amber-400 mb-3 flex items-center gap-2">
            ⏰ Is Hafte Aaane Wale
          </h3>
          <div className="space-y-2">
            {upcomingBirthdays.map(b => {
              const days = getDaysUntilBirthday(b.date);
              return (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{relationEmoji[b.relation] || '⭐'}</span>
                    <div>
                      <p className="text-white font-medium">{b.name}</p>
                      <p className="text-slate-400 text-xs">{formatDate(b.date)}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {days} din baaki
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Birthdays */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>🎈</span> Sabke Birthday
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="glow-button px-4 py-2 rounded-xl text-white text-sm font-semibold"
          >
            + Add Birthday
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="mb-4 p-4 rounded-xl bg-slate-800/60 border border-indigo-500/30 space-y-3">
            <h4 className="text-sm font-semibold text-indigo-300">Naya Birthday Add Karo</h4>
            <input
              type="text"
              placeholder="Naam (e.g., Maa, Rahul)"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
            />
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Birthday Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>
            <select
              value={form.relation}
              onChange={e => setForm({...form, relation: e.target.value})}
              className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none text-sm"
            >
              <option value="">Rishta chunein</option>
              <option value="Family">👨‍👩‍👧 Family</option>
              <option value="Friend">👫 Dost</option>
              <option value="Work">💼 Kaam</option>
              <option value="Other">⭐ Aur koi</option>
            </select>
            <input
              type="text"
              placeholder="Note (optional)"
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 glow-button py-3 rounded-xl text-white font-semibold text-sm"
              >
                ✅ Save Karo
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-3 rounded-xl bg-slate-700 text-slate-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Birthday List */}
        {sortedBirthdays.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            Koi birthday nahi hai abhi! Upar se add karo 🎂
          </p>
        ) : (
          <div className="space-y-3">
            {sortedBirthdays.map(b => {
              const days = getDaysUntilBirthday(b.date);
              const age = getAge(b.date);
              const isToday = days === 0;
              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isToday
                      ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40'
                      : 'bg-slate-800/40 hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isToday ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-slate-700'
                    }`}>
                      {isToday ? '🎂' : (relationEmoji[b.relation] || '⭐')}
                    </div>
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {b.name}
                        {isToday && <span className="text-xs text-pink-300 animate-bounce">🎉 Aaj!</span>}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {formatDate(b.date)}
                        {age && ` • ${age} saal`}
                        {b.relation && ` • ${b.relation}`}
                      </p>
                      {b.notes && <p className="text-slate-500 text-xs mt-0.5">{b.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      days === 0
                        ? 'bg-pink-500/30 text-pink-300'
                        : days <= 7
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {days === 0 ? 'Aaj! 🎉' : `${days}d`}
                    </span>
                    <button
                      onClick={() => deleteBirthday(b.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors text-sm p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Birthdays;

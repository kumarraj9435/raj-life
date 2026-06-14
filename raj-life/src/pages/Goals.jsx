import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Goals() {
  const { data, addGoal, updateGoalProgress, toggleGoal, deleteGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'personal', deadline: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    addGoal(formData);
    setFormData({ title: '', category: 'personal', deadline: '', description: '' });
    setShowForm(false);
  };

  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter(g => g.done).length;
  const inProgressGoals = totalGoals - completedGoals;

  const categoryIcons = {
    personal: '🧘',
    career: '💼',
    health: '🏃',
    finance: '💰',
    education: '📚',
    travel: '✈️',
    relationship: '❤️',
    other: '⭐'
  };

  const categoryColors = {
    personal: 'from-indigo-500 to-blue-600',
    career: 'from-emerald-500 to-teal-600',
    health: 'from-rose-500 to-pink-600',
    finance: 'from-amber-500 to-orange-600',
    education: 'from-violet-500 to-purple-600',
    travel: 'from-cyan-500 to-sky-600',
    relationship: 'from-red-500 to-rose-600',
    other: 'from-slate-500 to-gray-600'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full -mr-20 -mt-20"></div>
        <h2 className="text-2xl font-bold gradient-text mb-1">🎯 Life Goals</h2>
        <p className="text-slate-400 text-sm">Dream big, achieve bigger!</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-sm text-slate-400">Achieved: {completedGoals}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
            <span className="text-sm text-slate-400">In Progress: {inProgressGoals}</span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {totalGoals > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Overall Goal Achievement</span>
            <span className="text-lg font-bold text-indigo-400">
              {Math.round(data.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)}%
            </span>
          </div>
          <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.round(data.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">0%</span>
            <span className="text-xs text-slate-500">Keep going! 💪</span>
            <span className="text-xs text-slate-500">100%</span>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="glow-button w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
      >
        {showForm ? '✕ Cancel' : '+ Add New Goal'}
      </button>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Goal Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's your dream?"
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="personal">🧘 Personal</option>
                <option value="career">💼 Career</option>
                <option value="health">🏃 Health</option>
                <option value="finance">💰 Finance</option>
                <option value="education">📚 Education</option>
                <option value="travel">✈️ Travel</option>
                <option value="relationship">❤️ Relationship</option>
                <option value="other">⭐ Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal in detail..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            className="glow-button w-full py-3 rounded-xl text-white font-semibold"
          >
            🎯 Set Goal
          </button>
        </form>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {data.goals.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-5xl mb-3">🎯</p>
            <p className="text-slate-400 text-lg">No goals set yet</p>
            <p className="text-slate-500 text-sm mt-1">Set your life goals and start achieving them!</p>
          </div>
        ) : (
          data.goals.map(goal => (
            <div key={goal.id} className={`glass-card p-5 space-y-3 group hover:border-indigo-500/40 transition-all ${goal.done ? 'opacity-75' : ''}`}>
              {/* Goal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${categoryColors[goal.category]} flex items-center justify-center flex-shrink-0`}>
                    <span>{categoryIcons[goal.category]}</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${goal.done ? 'line-through text-slate-500' : 'text-white'}`}>
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 text-xs opacity-60 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400">
                  {categoryIcons[goal.category]} {goal.category}
                </span>
                {goal.deadline && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                    📅 {new Date(goal.deadline).toLocaleDateString('en-IN')}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${goal.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {goal.done ? '✅ Achieved' : '🔄 In Progress'}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Progress</span>
                  <span className="text-xs font-bold text-indigo-400">{goal.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.progress >= 100
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                {!goal.done && (
                  <>
                    <button
                      onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100))}
                      className="flex-1 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 transition-all"
                    >
                      +10% Progress
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 25, 100))}
                      className="flex-1 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-all"
                    >
                      +25% Progress
                    </button>
                  </>
                )}
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    goal.done
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {goal.done ? '↩ Reopen' : '✅ Mark Done'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Motivational Footer */}
      <div className="glass-card p-5 text-center">
        <p className="text-lg">💫</p>
        <p className="text-slate-400 text-sm italic mt-1">
          "The future belongs to those who believe in the beauty of their dreams"
        </p>
        <p className="text-slate-500 text-xs mt-1">- Eleanor Roosevelt</p>
      </div>
    </div>
  );
}

export default Goals;

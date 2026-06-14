import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function Tasks() {
  const { data, addTask, toggleTask, deleteTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({ title: '', type: 'daily', priority: 'medium', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    addTask(formData);
    setFormData({ title: '', type: 'daily', priority: 'medium', description: '' });
    setShowForm(false);
  };

  const filteredTasks = data.tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'daily') return task.type === 'daily';
    if (filter === 'weekly') return task.type === 'weekly';
    if (filter === 'done') return task.done;
    if (filter === 'pending') return !task.done;
    return true;
  });

  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.done).length;

  const priorityColors = {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' }
  };

  const typeColors = {
    daily: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    weekly: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    important: { bg: 'bg-pink-500/20', text: 'text-pink-400' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-20 -mt-20"></div>
        <h2 className="text-2xl font-bold gradient-text mb-1">✅ Task Manager</h2>
        <p className="text-slate-400 text-sm">Stay organized, get things done!</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-sm text-slate-400">Done: {doneTasks}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-sm text-slate-400">Pending: {totalTasks - doneTasks}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Today's Progress</span>
          <span className="text-sm font-bold text-indigo-400">
            {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All', icon: '📋' },
          { id: 'daily', label: 'Daily', icon: '☀️' },
          { id: 'weekly', label: 'Weekly', icon: '📅' },
          { id: 'pending', label: 'Pending', icon: '⏳' },
          { id: 'done', label: 'Done', icon: '✅' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
              filter === f.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
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
        {showForm ? '✕ Cancel' : '+ Add New Task'}
      </button>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need to do?"
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="daily">☀️ Daily</option>
                <option value="weekly">📅 Weekly</option>
                <option value="important">🔥 Important</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional details..."
              className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="glow-button w-full py-3 rounded-xl text-white font-semibold"
          >
            ✓ Add Task
          </button>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-slate-400">No tasks found</p>
            <p className="text-slate-500 text-sm mt-1">
              {filter === 'all' ? 'Add your first task!' : `No ${filter} tasks`}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`glass-card p-4 flex items-center gap-3 group hover:border-indigo-500/40 transition-all ${
                task.done ? 'opacity-70' : ''
              } border-l-4 ${priorityColors[task.priority]?.border || 'border-slate-500'}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.done
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-500 hover:border-indigo-400'
                }`}
              >
                {task.done && <span className="text-white text-xs">✓</span>}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.done ? 'line-through text-slate-500' : 'text-white'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColors[task.type]?.bg} ${typeColors[task.type]?.text}`}>
                    {task.type}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColors[task.priority]?.bg} ${priorityColors[task.priority]?.text}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all opacity-60 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {data.tasks.length > 0 && (
        <div className="glass-card p-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Showing {filteredTasks.length} of {data.tasks.length} tasks
          </span>
          <span className="text-emerald-400 font-medium">
            🎉 {doneTasks} completed
          </span>
        </div>
      )}
    </div>
  );
}

export default Tasks;

import React from 'react';
import { useApp } from '../context/AppContext';

function Dashboard() {
  const { data, currentMonth, syncing } = useApp();

  const totalIncome = [...data.finance.income, ...data.finance.otherIncome]
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = data.finance.expenses
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalLoans = data.finance.loans
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const totalCreditCard = data.finance.creditCards
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.done).length;
  const pendingTasks = totalTasks - completedTasks;

  const totalGoals = data.goals.length;
  const completedGoals = data.goals.filter(g => g.done).length;
  const avgGoalProgress = totalGoals > 0
    ? Math.round(data.goals.reduce((sum, g) => sum + (g.progress || 0), 0) / totalGoals)
    : 0;

  const todayTasks = data.tasks.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.createdAt).toDateString() === today || t.type === 'daily';
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full -ml-12 -mb-12"></div>
        <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
          Namaste, Raj! 🙏
        </h2>
        <p className="text-slate-400">Here's your life at a glance</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
            📅 {currentMonth}
          </span>
          {syncing && (
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 animate-pulse">
              🔄 Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Finance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="stat-card glass-card p-4 md:p-5 border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💵</span>
            <span className="text-xs text-slate-400">Income</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-emerald-400">
            ₹{totalIncome.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="stat-card glass-card p-4 md:p-5 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛒</span>
            <span className="text-xs text-slate-400">Expenses</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-red-400">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="stat-card glass-card p-4 md:p-5 border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏦</span>
            <span className="text-xs text-slate-400">Loans</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-amber-400">
            ₹{totalLoans.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="stat-card glass-card p-4 md:p-5 border-l-4 border-purple-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💳</span>
            <span className="text-xs text-slate-400">Credit Card</span>
          </div>
          <p className="text-lg md:text-xl font-bold text-purple-400">
            ₹{totalCreditCard.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className="glass-card p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Net Balance</p>
            <p className={`text-2xl md:text-3xl font-bold ${totalIncome - totalExpenses - totalLoans - totalCreditCard >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ₹{(totalIncome - totalExpenses - totalLoans - totalCreditCard).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl md:text-3xl">
              {totalIncome - totalExpenses - totalLoans - totalCreditCard >= 0 ? '😊' : '😟'}
            </span>
          </div>
        </div>
      </div>

      {/* Tasks & Goals Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasks Summary */}
        <div className="glass-card p-5 md:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>✅</span> Tasks Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Tasks</span>
              <span className="font-bold text-white">{totalTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Completed</span>
              <span className="font-bold text-emerald-400">{completedTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pending</span>
              <span className="font-bold text-amber-400">{pendingTasks}</span>
            </div>
            <div className="mt-4">
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete
              </p>
            </div>
          </div>
        </div>

        {/* Goals Summary */}
        <div className="glass-card p-5 md:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🎯</span> Goals Progress
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Goals</span>
              <span className="font-bold text-white">{totalGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Achieved</span>
              <span className="font-bold text-emerald-400">{completedGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">In Progress</span>
              <span className="font-bold text-indigo-400">{totalGoals - completedGoals}</span>
            </div>
            <div className="mt-4">
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${avgGoalProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {avgGoalProgress}% average progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="glass-card p-5 md:p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> Today's Tasks
        </h3>
        {todayTasks.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No tasks for today! Add some from the Tasks tab 🎉</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                <span className={`w-3 h-3 rounded-full ${task.done ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`flex-1 ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.title}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {task.done ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Finance Chart */}
      <div className="glass-card p-5 md:p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📈</span> Finance Chart - {currentMonth}
        </h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { label: 'Income', value: totalIncome, color: 'from-emerald-400 to-emerald-600', icon: '💵' },
            { label: 'Expenses', value: totalExpenses, color: 'from-red-400 to-red-600', icon: '🛒' },
            { label: 'Loans', value: totalLoans, color: 'from-amber-400 to-amber-600', icon: '🏦' },
            { label: 'Credit', value: totalCreditCard, color: 'from-purple-400 to-purple-600', icon: '💳' },
          ].map(item => {
            const maxVal = Math.max(totalIncome, totalExpenses, totalLoans, totalCreditCard, 1);
            const height = Math.max((item.value / maxVal) * 120, 20);
            return (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="relative flex items-end h-32">
                  <div
                    className={`w-12 md:w-16 bg-gradient-to-t ${item.color} rounded-t-lg transition-all duration-700`}
                    style={{ height: `${height}px` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400">{item.icon} {item.label}</span>
                <span className="text-xs font-bold">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Sheets Link */}
      <div className="glass-card p-4 text-center">
        <a 
          href="https://docs.google.com/spreadsheets/d/1sQdhC6dlVDJYiBkS_lJdgzSHYJ0HGzgf_5VWgabhS-I/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          📊 View Google Sheet →
        </a>
      </div>
    </div>
  );
}

export default Dashboard;

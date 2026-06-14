import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GOOGLE_SCRIPT_URL } from '../config';
import { setupSheets } from '../services/googleSheets';

function Settings() {
  const { password, changePassword, syncFromSheet, syncing, lastSynced, data } = useApp();
  const [showPassChange, setShowPassChange] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [backupStatus, setBackupStatus] = useState('');
  const [setupStatus, setSetupStatus] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passForm.newPass.length < 4) {
      setPassError('New password must be at least 4 characters');
      return;
    }
    if (passForm.newPass !== passForm.confirm) {
      setPassError('New passwords do not match!');
      return;
    }

    changePassword(passForm.newPass);
    setPassSuccess('Password changed successfully! Now this password will work on all devices. ✅');
    setPassForm({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPassSuccess(''), 5000);
  };

  const handleBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      appName: 'Raj Life',
      data: data
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RajLife_Backup_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Backup downloaded! ✅');
    setTimeout(() => setBackupStatus(''), 3000);
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const restored = JSON.parse(event.target.result);
        if (restored.data) {
          localStorage.setItem('rajlife-data', JSON.stringify(restored.data));
          setBackupStatus('Backup restored! Refreshing... ✅');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setBackupStatus('Invalid backup file ❌');
        }
      } catch {
        setBackupStatus('Error reading backup file ❌');
      }
    };
    reader.readAsText(file);
  };

  const handleSetupSheets = async () => {
    setSetupStatus('Setting up sheets...');
    const result = await setupSheets();
    if (result && result.success) {
      setSetupStatus('Google Sheets setup done! ✅');
    } else {
      setSetupStatus('Setup failed. Check your Apps Script URL. ❌');
    }
    setTimeout(() => setSetupStatus(''), 4000);
  };

  const handleForceSync = async () => {
    setSetupStatus('Syncing...');
    await syncFromSheet();
    setSetupStatus('Synced from Google Sheets! ✅');
    setTimeout(() => setSetupStatus(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-500/10 to-indigo-500/10 rounded-full -mr-20 -mt-20"></div>
        <h2 className="text-2xl font-bold gradient-text mb-1">⚙️ Settings</h2>
        <p className="text-slate-400 text-sm">Manage your app, security & data</p>
      </div>

      {/* Google Sheets Section */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📊</span> Google Sheets Connection
        </h3>
        
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
            <div>
              <p className="text-sm text-slate-300">Status</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' 
                  ? '🟢 Connected' 
                  : '🔴 Not configured'}
              </p>
            </div>
            {lastSynced && (
              <span className="text-xs text-emerald-400">Last sync: {lastSynced}</span>
            )}
          </div>

          {/* Google Sheet Link */}
          <a
            href="https://docs.google.com/spreadsheets/d/1sQdhC6dlVDJYiBkS_lJdgzSHYJ0HGzgf_5VWgabhS-I/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all"
          >
            <p className="text-sm text-indigo-400">📎 Open Google Sheet →</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">docs.google.com/spreadsheets/d/1zhZA7...</p>
          </a>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSetupSheets}
              className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-all"
            >
              🔧 Setup Sheets
            </button>
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
            >
              {syncing ? '🔄 Syncing...' : '☁️ Sync Now'}
            </button>
          </div>

          {setupStatus && (
            <p className="text-xs text-center text-indigo-300 animate-pulse">{setupStatus}</p>
          )}
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💾</span> Backup & Restore
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleBackup}
            className="p-4 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-all flex items-center gap-3"
          >
            <span className="text-2xl">📥</span>
            <div className="text-left">
              <p className="font-medium">Download Backup</p>
              <p className="text-xs text-slate-500">Save all data as JSON file</p>
            </div>
          </button>

          <label className="p-4 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all flex items-center gap-3 cursor-pointer">
            <span className="text-2xl">📤</span>
            <div className="text-left">
              <p className="font-medium">Restore Backup</p>
              <p className="text-xs text-slate-500">Load data from JSON file</p>
            </div>
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>

        {backupStatus && (
          <p className="text-xs text-center text-cyan-300 animate-pulse">{backupStatus}</p>
        )}
      </div>

      {/* Password Section */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🔒</span> Password & Security
        </h3>

        <div className="p-3 rounded-xl bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">App Lock</p>
              <p className="text-xs text-slate-500 mt-0.5">Password synced via Google Sheets (works on all devices)</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">🟢 Active</span>
          </div>
        </div>

        {/* Show Current Password */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Current Password:</span>
            <span className="text-lg font-bold text-indigo-400 tracking-widest">{password}</span>
          </div>
        </div>

        <button
          onClick={() => setShowPassChange(!showPassChange)}
          className="w-full p-3 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-all"
        >
          {showPassChange ? '✕ Cancel' : '🔑 Change Password'}
        </button>

        {showPassChange && (
          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Current Password</label>
              <input
                type="password"
                value={passForm.current}
                onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                placeholder="Enter current password"
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">New Password</label>
              <input
                type="password"
                value={passForm.newPass}
                onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                placeholder="Enter new password (min 4 chars)"
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                placeholder="Confirm new password"
                className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-600 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {passError && <p className="text-xs text-red-400">❌ {passError}</p>}
            {passSuccess && <p className="text-xs text-emerald-400">{passSuccess}</p>}

            <button
              type="submit"
              className="glow-button w-full py-3 rounded-xl text-white font-semibold"
            >
              ✓ Update Password
            </button>
          </form>
        )}
      </div>

      {/* App Info */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>ℹ️</span> App Info
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2">
            <span className="text-sm text-slate-400">App Name</span>
            <span className="text-sm text-white font-medium">✨ Raj Life</span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="text-sm text-slate-400">Version</span>
            <span className="text-sm text-indigo-400">2.0.0</span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="text-sm text-slate-400">Storage</span>
            <span className="text-sm text-emerald-400">Google Sheets + Local</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="glass-card p-4 text-center">
        <p className="text-slate-500 text-xs">Made with ❤️ for Raj</p>
      </div>
    </div>
  );
}

export default Settings;

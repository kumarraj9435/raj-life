import React, { useState } from 'react';

function LockScreen({ onUnlock, currentPassword }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onUnlock(pin);
    if (!success) {
      setError('Wrong password! Try again.');
      setShake(true);
      setTimeout(() => { setShake(false); setError(''); }, 2000);
      setPin('');
    }
  };

  const handleKeypad = (num) => {
    if (pin.length < 10) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className={`w-full max-w-sm space-y-8 ${shake ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Raj Life</h1>
          <p className="text-slate-400 text-sm mt-2">Enter password to unlock</p>
        </div>

        {/* Pin Display */}
        <div className="flex justify-center gap-2">
          {pin.length === 0 ? (
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              {pin.split('').map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-red-400 text-sm animate-pulse">🔴 {error}</p>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter password..."
            className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-600 text-white text-center text-lg tracking-widest placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            autoFocus
          />

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypad(String(num))}
                className="h-14 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xl font-medium hover:bg-slate-700 hover:border-indigo-500/50 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 active:scale-95 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypad('0')}
              className="h-14 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xl font-medium hover:bg-slate-700 hover:border-indigo-500/50 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/30 active:scale-95 transition-all"
            >
              ⌫
            </button>
          </div>

          {/* Unlock Button */}
          <button
            type="submit"
            className="glow-button w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2"
          >
            🔓 Unlock
          </button>
        </form>

        {/* Show Password Toggle */}
        <div className="text-center space-y-2">
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            {showPassword ? '🙈 Hide Password' : '👁️ Show Password'}
          </button>
          {showPassword && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
              <p className="text-xs text-slate-400">Current Password:</p>
              <p className="text-lg font-bold text-indigo-400 tracking-widest mt-1">{currentPassword}</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom animation style */}
      <style>{`
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

export default LockScreen;

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentMonth } from '../config';
import {
  getAllData, addItemToSheet, deleteItemFromSheet, updateItemInSheet,
  getAvailableMonths, createNewMonth, setupSheets,
  getPasswordFromSheet, savePasswordToSheet,
  getAllBirthdays, addBirthdayToSheet, deleteBirthdayFromSheet
} from '../services/googleSheets';

const AppContext = createContext();

const defaultData = {
  finance: { income: [], expenses: [], loans: [], creditCards: [], otherIncome: [] },
  tasks: [], goals: [], payments: [], birthdays: []
};

const LS_MONTH_KEY  = 'rajlife_month';
const LS_MONTHS_KEY = 'rajlife_months';

const lsGet = (key, fallback = null) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

export function AppProvider({ children }) {
  const [data, setData]                     = useState(defaultData);
  const [loading, setLoading]               = useState(true);
  const [currentMonth, setCurrentMonth]     = useState(() => lsGet(LS_MONTH_KEY, getCurrentMonth()));
  const [availableMonths, setAvailableMonths] = useState(() => lsGet(LS_MONTHS_KEY, [getCurrentMonth()]));
  const [syncing, setSyncing]               = useState(false);
  const [lastSynced, setLastSynced]         = useState(null);
  const [syncError, setSyncError]           = useState(null);
  const [isLocked, setIsLocked]             = useState(true);
  const [password, setPassword]             = useState('1234');
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [reminders, setReminders]           = useState([]);
  const [birthdayReminders, setBirthdayReminders] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentMonthRef = useRef(currentMonth);
  useEffect(() => { currentMonthRef.current = currentMonth; }, [currentMonth]);
  const syncIntervalRef = useRef(null);

  // ── Password ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getPasswordFromSheet().then(p => {
      if (p) setPassword(p);
      setPasswordLoaded(true);
    });
  }, []);

  const changePassword = async (newPass) => {
    setPassword(newPass);
    await savePasswordToSheet(newPass);
  };

  const unlock = (inputPass) => {
    if (inputPass === password) { setIsLocked(false); return true; }
    return false;
  };

  // ── MAIN SYNC: Google Sheet se seedha data lao ────────────────────────────
  const syncFromSheet = useCallback(async (month) => {
    setSyncing(true);
    setSyncError(null);
    try {
      const targetMonth = (month || currentMonthRef.current).trim();

      // Dono ek saath fetch karo — fast hoga
      const [sheetData, bdays] = await Promise.all([
        getAllData(targetMonth),
        getAllBirthdays()
      ]);

      if (sheetData) {
        setData({
          finance: {
            income:      sheetData.income      || [],
            expenses:    sheetData.expenses    || [],
            loans:       sheetData.loans       || [],
            creditCards: sheetData.creditCards || [],
            otherIncome: sheetData.otherIncome || []
          },
          tasks:     sheetData.tasks     || [],
          goals:     sheetData.goals     || [],
          payments:  sheetData.payments  || [],
          birthdays: bdays               || []
        });
        setLastSynced(new Date().toLocaleTimeString('en-IN'));
        setSyncError(null);
      } else {
        setSyncError('Sheet se data nahi aaya.');
      }
    } catch (err) {
      setSyncError('Internet check karo.');
      console.error('Sync error:', err);
    }
    setSyncing(false);
    setLoading(false);
  }, []);

  // ── Unlock hone ke baad sab load karo ────────────────────────────────────
  useEffect(() => {
    if (!isLocked) {
      const init = async () => {
        setIsInitializing(true);
        setLoading(true);
        try {
          await setupSheets();
          await syncFromSheet();
          const months = await getAvailableMonths();
          if (months && months.length > 0) {
            setAvailableMonths(months);
            lsSet(LS_MONTHS_KEY, months);
          }
        } catch (err) {
          console.error('Init error:', err);
        } finally {
          setIsInitializing(false);
        }
      };
      init();

      // Har 15 second mein auto-sync — koi bhi device pe entry karo, dikh jayega
      syncIntervalRef.current = setInterval(() => {
        syncFromSheet(currentMonthRef.current);
      }, 15000);

      return () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      };
    }
  }, [isLocked, syncFromSheet]);

  // ── Reminders ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date();
    const upcoming = (data.birthdays || []).filter(b => {
      if (!b.date) return false;
      const parts = b.date.split('-');
      let m, d;
      if (parts.length >= 3) { m = parseInt(parts[1]); d = parseInt(parts[2]); }
      else if (parts.length === 2) { m = parseInt(parts[0]); d = parseInt(parts[1]); }
      else return false;
      let bday = new Date(today.getFullYear(), m - 1, d);
      if (bday < today) bday = new Date(today.getFullYear() + 1, m - 1, d);
      return Math.ceil((bday - today) / 86400000) <= 3;
    });
    setBirthdayReminders(upcoming);
  }, [data.birthdays]);

  useEffect(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const threeDays = new Date(today); threeDays.setDate(threeDays.getDate() + 3);
    setReminders((data.payments || []).filter(p => {
      if (p.done) return false;
      const d = new Date(p.dueDate); d.setHours(0,0,0,0);
      return d >= today && d <= threeDays;
    }));
  }, [data.payments]);

  // ── Month ─────────────────────────────────────────────────────────────────
  const changeMonth = async (month) => {
    const m = month.trim();
    setCurrentMonth(m); lsSet(LS_MONTH_KEY, m);
    await syncFromSheet(m);
  };

  const handleCreateMonth = async (month) => {
    const m = month.trim();
    await createNewMonth(m);
    const months = await getAvailableMonths();
    if (months) { setAvailableMonths(months); lsSet(LS_MONTHS_KEY, months); }
    setCurrentMonth(m); lsSet(LS_MONTH_KEY, m);
    await syncFromSheet(m);
  };

  // ── Finance ───────────────────────────────────────────────────────────────
  // Optimistic update: pehle UI mein dikhao, phir Sheet mein save karo
  const addFinanceItem = async (category, item) => {
    const newItem = { ...item, id: Date.now(), createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => ({
      ...prev,
      finance: { ...prev.finance, [category]: [...prev.finance[category], newItem] }
    }));
    await addItemToSheet(category, item, currentMonth);
  };

  const deleteFinanceItem = async (category, id) => {
    setData(prev => ({
      ...prev,
      finance: { ...prev.finance, [category]: prev.finance[category].filter(i => i.id !== id) }
    }));
    await deleteItemFromSheet(category, id);
  };

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = async (task) => {
    const newTask = { ...task, id: Date.now(), done: false, createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    await addItemToSheet('tasks', task, currentMonth);
  };

  const toggleTask = async (id) => {
    let newDone;
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id === id) { newDone = !t.done; return { ...t, done: newDone }; }
        return t;
      })
    }));
    await updateItemInSheet('tasks', id, { done: newDone });
  };

  const deleteTask = async (id) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    await deleteItemFromSheet('tasks', id);
  };

  // ── Goals ─────────────────────────────────────────────────────────────────
  const addGoal = async (goal) => {
    const newGoal = { ...goal, id: Date.now(), done: false, progress: 0, createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    await addItemToSheet('goals', goal, currentMonth);
  };

  const updateGoalProgress = async (id, progress) => {
    const done = progress >= 100;
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, progress, done } : g)
    }));
    await updateItemInSheet('goals', id, { progress, done });
  };

  const toggleGoal = async (id) => {
    let newDone, newProgress;
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === id) { newDone = !g.done; newProgress = newDone ? 100 : g.progress; return { ...g, done: newDone, progress: newProgress }; }
        return g;
      })
    }));
    await updateItemInSheet('goals', id, { done: newDone, progress: newProgress });
  };

  const deleteGoal = async (id) => {
    setData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    await deleteItemFromSheet('goals', id);
  };

  // ── Payments ──────────────────────────────────────────────────────────────
  const addPayment = async (payment) => {
    const newPayment = { ...payment, id: Date.now(), done: false, createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    await addItemToSheet('payments', payment, currentMonth);
  };

  const togglePayment = async (id) => {
    let newDone;
    setData(prev => ({
      ...prev,
      payments: prev.payments.map(p => {
        if (p.id === id) { newDone = !p.done; return { ...p, done: newDone }; }
        return p;
      })
    }));
    await updateItemInSheet('payments', id, { done: newDone });
  };

  const deletePayment = async (id) => {
    setData(prev => ({ ...prev, payments: prev.payments.filter(p => p.id !== id) }));
    await deleteItemFromSheet('payments', id);
  };

  // ── Birthdays ─────────────────────────────────────────────────────────────
  const addBirthday = async (birthday) => {
    const newBirthday = { ...birthday, id: Date.now(), createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, birthdays: [...(prev.birthdays || []), newBirthday] }));
    await addBirthdayToSheet(birthday);
  };

  const deleteBirthday = async (id) => {
    setData(prev => ({ ...prev, birthdays: (prev.birthdays || []).filter(b => b.id !== id) }));
    await deleteBirthdayFromSheet(id);
  };

  return (
    <AppContext.Provider value={{
      data, loading, currentMonth, availableMonths, syncing, lastSynced, syncError,
      isLocked, isInitializing, reminders, birthdayReminders, password, passwordLoaded,
      unlock, changePassword, changeMonth, handleCreateMonth, syncFromSheet,
      addFinanceItem, deleteFinanceItem, addTask, toggleTask, deleteTask,
      addGoal, updateGoalProgress, toggleGoal, deleteGoal,
      addPayment, togglePayment, deletePayment, addBirthday, deleteBirthday
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

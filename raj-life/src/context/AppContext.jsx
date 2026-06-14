import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentMonth } from '../config';
import {
  getAllData,
  addItemToSheet,
  deleteItemFromSheet,
  updateItemInSheet,
  getAvailableMonths,
  createNewMonth,
  setupSheets,
  getPasswordFromSheet,
  savePasswordToSheet,
  getAllBirthdays,
  addBirthdayToSheet,
  deleteBirthdayFromSheet
} from '../services/googleSheets';

const AppContext = createContext();

const defaultData = {
  finance: {
    income: [],
    expenses: [],
    loans: [],
    creditCards: [],
    otherIncome: []
  },
  tasks: [],
  goals: [],
  payments: [],
  birthdays: []
};

const LS_DATA_KEY   = 'rajlife_data';
const LS_MONTH_KEY  = 'rajlife_month';
const LS_MONTHS_KEY = 'rajlife_months';

const lsGet = (key, fallback = null) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const SYNC_INTERVAL_MS = 30 * 1000;

export function AppProvider({ children }) {
  const [data, setData] = useState(() => lsGet(LS_DATA_KEY, defaultData));
  const [currentMonth, setCurrentMonth] = useState(
    () => lsGet(LS_MONTH_KEY, getCurrentMonth())
  );
  const [availableMonths, setAvailableMonths] = useState(
    () => lsGet(LS_MONTHS_KEY, [getCurrentMonth()])
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('1234');
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [birthdayReminders, setBirthdayReminders] = useState([]);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentMonthRef = useRef(currentMonth);
  useEffect(() => { currentMonthRef.current = currentMonth; }, [currentMonth]);
  const syncIntervalRef = useRef(null);

  // ── Password ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadPassword = async () => {
      const sheetPass = await getPasswordFromSheet();
      if (sheetPass) setPassword(sheetPass);
      setPasswordLoaded(true);
    };
    loadPassword();
  }, []);

  const changePassword = async (newPass) => {
    setPassword(newPass);
    await savePasswordToSheet(newPass);
  };

  const unlock = (inputPass) => {
    if (inputPass === password) { setIsLocked(false); return true; }
    return false;
  };

  // ── Sync from Sheet ───────────────────────────────────────────────────────
  const syncFromSheet = useCallback(async (month) => {
    setSyncing(true);
    setSyncError(null);
    try {
      const targetMonth = (month || currentMonthRef.current).trim();
      const sheetData = await getAllData(targetMonth);
      if (sheetData) {
        setData(prev => {
          const updated = {
            ...prev,
            finance: {
              income:      sheetData.income      || [],
              expenses:    sheetData.expenses    || [],
              loans:       sheetData.loans       || [],
              creditCards: sheetData.creditCards || [],
              otherIncome: sheetData.otherIncome || []
            },
            tasks:    sheetData.tasks    || [],
            goals:    sheetData.goals    || [],
            payments: sheetData.payments || []
          };
          lsSet(LS_DATA_KEY, updated);
          return updated;
        });
        lsSet(LS_MONTH_KEY, targetMonth);
        setLastSynced(new Date().toLocaleTimeString('en-IN'));
        setSyncError(null);
      } else {
        setSyncError('Sheet se connect nahi hua.');
      }
    } catch (err) {
      setSyncError('Sync fail hua. Internet check karo.');
      console.error('Sync error:', err);
    }
    setSyncing(false);
  }, []);

  const loadBirthdays = useCallback(async () => {
    const bdays = await getAllBirthdays();
    if (bdays) {
      setData(prev => {
        const updated = { ...prev, birthdays: bdays };
        lsSet(LS_DATA_KEY, updated);
        return updated;
      });
    }
  }, []);

  // ── Init after unlock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLocked) {
      const init = async () => {
        setIsInitializing(true);
        try {
          await setupSheets();
          await syncFromSheet();
          const months = await getAvailableMonths();
          if (months && months.length > 0) {
            setAvailableMonths(months);
            lsSet(LS_MONTHS_KEY, months);
          }
          await loadBirthdays();
        } catch (err) {
          console.error('Init error:', err);
        } finally {
          setIsInitializing(false);
        }
      };
      init();

      syncIntervalRef.current = setInterval(async () => {
        await syncFromSheet(currentMonthRef.current);
      }, SYNC_INTERVAL_MS);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
      };
    }
  }, [isLocked, syncFromSheet, loadBirthdays]);

  // ── Reminders ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date();
    const upcoming = (data.birthdays || []).filter(b => {
      if (!b.date) return false;
      const parts = b.date.split('-');
      let month, day;
      if (parts.length >= 3) { month = parseInt(parts[1]); day = parseInt(parts[2]); }
      else if (parts.length === 2) { month = parseInt(parts[0]); day = parseInt(parts[1]); }
      else return false;
      const thisYear = today.getFullYear();
      let bday = new Date(thisYear, month - 1, day);
      if (bday < today) bday = new Date(thisYear + 1, month - 1, day);
      const diff = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));
      return diff <= 3;
    });
    setBirthdayReminders(upcoming);
  }, [data.birthdays]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const upcoming = (data.payments || []).filter(p => {
      if (p.done) return false;
      const payDate = new Date(p.dueDate);
      payDate.setHours(0, 0, 0, 0);
      return payDate >= today && payDate <= threeDaysLater;
    });
    setReminders(upcoming);
  }, [data.payments]);

  // ── Month ─────────────────────────────────────────────────────────────────
  const changeMonth = async (month) => {
    const trimmedMonth = month.trim();
    setCurrentMonth(trimmedMonth);
    lsSet(LS_MONTH_KEY, trimmedMonth);
    await syncFromSheet(trimmedMonth);
  };

  const handleCreateMonth = async (month) => {
    const trimmedMonth = month.trim();
    await createNewMonth(trimmedMonth);
    const months = await getAvailableMonths();
    if (months) { setAvailableMonths(months); lsSet(LS_MONTHS_KEY, months); }
    setCurrentMonth(trimmedMonth);
    lsSet(LS_MONTH_KEY, trimmedMonth);
    await syncFromSheet(trimmedMonth);
  };

  // ── Finance ───────────────────────────────────────────────────────────────
  const addFinanceItem = async (category, item) => {
    const newItem = { ...item, id: Date.now(), createdAt: new Date().toISOString(), month: currentMonth };
    // Pehle UI mein dikhao
    setData(prev => {
      const updated = {
        ...prev,
        finance: { ...prev.finance, [category]: [...prev.finance[category], newItem] }
      };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    // Phir Sheet mein save karo
    await addItemToSheet(category, item, currentMonth);
  };

  const deleteFinanceItem = async (category, id) => {
    setData(prev => {
      const updated = {
        ...prev,
        finance: { ...prev.finance, [category]: prev.finance[category].filter(i => i.id !== id) }
      };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await deleteItemFromSheet(category, id);
  };

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = async (task) => {
    const newTask = { ...task, id: Date.now(), done: false, createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => {
      const updated = { ...prev, tasks: [...prev.tasks, newTask] };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await addItemToSheet('tasks', task, currentMonth);
  };

  const toggleTask = async (id) => {
    let newDone;
    setData(prev => {
      const updated = {
        ...prev,
        tasks: prev.tasks.map(t => {
          if (t.id === id) { newDone = !t.done; return { ...t, done: newDone }; }
          return t;
        })
      };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await updateItemInSheet('tasks', id, { done: newDone });
  };

  const deleteTask = async (id) => {
    setData(prev => {
      const updated = { ...prev, tasks: prev.tasks.filter(t => t.id !== id) };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await deleteItemFromSheet('tasks', id);
  };

  // ── Goals ─────────────────────────────────────────────────────────────────
  const addGoal = async (goal) => {
    const newGoal = { ...goal, id: Date.now(), done: false, progress: 0, createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => {
      const updated = { ...prev, goals: [...prev.goals, newGoal] };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await addItemToSheet('goals', goal, currentMonth);
  };

  const updateGoalProgress = async (id, progress) => {
    const done = progress >= 100;
    setData(prev => {
      const updated = {
        ...prev,
        goals: prev.goals.map(g => g.id === id ? { ...g, progress, done } : g)
      };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await updateItemInSheet('goals', id, { progress, done });
  };

  const toggleGoal = async (id) => {
    let newDone, newProgress;
    setData(prev => {
      const updated = {
        ...prev,
        goals: prev.goals.map(g => {
          if (g.id === id) {
            newDone = !g.done;
            newProgress = newDone ? 100 : g.progress;
            return { ...g, done: newDone, progress: newProgress };
          }
          return g;
        })
      };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await updateItemInSheet('goals', id, { done: newDone, progress: newProgress });
  };

  const deleteGoal = async (id) => {
    setData(prev => {
      const updated = { ...prev, goals: prev.goals.filter(g => g.id !== id) };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await deleteItemFromSheet('goals', id);
  };

  // ── Payments ──────────────────────────────────────────────────────────────
  const addPayment = async (payment) => {
    const newPayment = { ...payment, id: Date.now(), done: false, createdAt: new Date().toISOString(), month: currentMonth };
    setData(prev => {
      const updated = { ...prev, payments: [...prev.payments, newPayment] };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await addItemToSheet('payments', payment, currentMonth);
  };

  const togglePayment = async (id) => {
    let newDone;
    setData(prev => {
      const updated = {
        ...prev,
        payments: prev.payments.map(p => {
          if (p.id === id) { newDone = !p.done; return { ...p, done: newDone }; }
          return p;
        })
      };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await updateItemInSheet('payments', id, { done: newDone });
  };

  const deletePayment = async (id) => {
    setData(prev => {
      const updated = { ...prev, payments: prev.payments.filter(p => p.id !== id) };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await deleteItemFromSheet('payments', id);
  };

  // ── Birthdays ─────────────────────────────────────────────────────────────
  const addBirthday = async (birthday) => {
    const newBirthday = { ...birthday, id: Date.now(), createdAt: new Date().toISOString() };
    setData(prev => {
      const updated = { ...prev, birthdays: [...(prev.birthdays || []), newBirthday] };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await addBirthdayToSheet(birthday);
  };

  const deleteBirthday = async (id) => {
    setData(prev => {
      const updated = { ...prev, birthdays: (prev.birthdays || []).filter(b => b.id !== id) };
      lsSet(LS_DATA_KEY, updated);
      return updated;
    });
    await deleteBirthdayFromSheet(id);
  };

  return (
    <AppContext.Provider value={{
      data, currentMonth, availableMonths, syncing, lastSynced, syncError,
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

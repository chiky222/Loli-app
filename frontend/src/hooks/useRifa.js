import { useState, useCallback } from 'react';
import { api } from '../api';

export function useRifa() {
  const [rifaData, setRifaData]       = useState({});
  const [sorteoHistory, setSorteoHistory] = useState([]);
  const [lastWinner, setLastWinner]   = useState(null);
  const [toast, setToast]             = useState({ msg: '', show: false });

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  const loadAll = useCallback(async () => {
    const [tickets, history] = await Promise.all([
      api.get('/api/tickets'),
      api.get('/api/sorteo'),
    ]);
    setRifaData(tickets);
    const mapped = history.map(h => ({
      num: h.num,
      buyer: { name: h.buyer_name, phone: h.buyer_phone },
      date: h.drawn_at,
    }));
    setSorteoHistory(mapped);
    if (mapped.length) setLastWinner({ num: mapped[mapped.length - 1].num });
  }, []);

  const saveTicket = useCallback(async (num, body) => {
    await api.put(`/api/tickets/${num}`, body);
    setRifaData(prev => ({
      ...prev,
      [num]: { ...body, date: new Date().toLocaleDateString('es-AR') },
    }));
  }, []);

  const releaseTicket = useCallback(async (num) => {
    await api.del(`/api/tickets/${num}`);
    setRifaData(prev => { const n = { ...prev }; delete n[num]; return n; });
  }, []);

  const togglePay = useCallback(async (num) => {
    const res = await api.patch(`/api/tickets/${num}/pay`);
    setRifaData(prev => ({ ...prev, [num]: { ...prev[num], paid: res.paid } }));
    return res.paid;
  }, []);

  const addSorteoWinner = useCallback(async (num, buyer) => {
    const res = await api.post('/api/sorteo', {
      num,
      buyer_name:  buyer?.name  || '',
      buyer_phone: buyer?.phone || '',
    });
    const entry = { num, buyer, date: res.drawn_at };
    setSorteoHistory(prev => [...prev, entry]);
    setLastWinner({ num });
    return entry;
  }, []);

  const resetSorteo = useCallback(async () => {
    await api.del('/api/sorteo');
    setSorteoHistory([]);
    setLastWinner(null);
  }, []);

  const resetApp = useCallback(async () => {
    await api.del('/api/reset');
    setRifaData({});
    setSorteoHistory([]);
    setLastWinner(null);
  }, []);

  return {
    rifaData, sorteoHistory, lastWinner,
    toast, showToast,
    loadAll, saveTicket, releaseTicket, togglePay,
    addSorteoWinner, resetSorteo, resetApp,
  };
}

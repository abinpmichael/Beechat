import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bell, Inbox, MessageSquare, Trash2, CheckSquare, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/notifications.php`;

export default function NotificationsHistory() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNotifications(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await axios.post(API, { action: 'mark_read', id }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      showToast('Acknowledged alert.');
    } catch {
      showToast('Failed to acknowledge.');
    }
  };

  const markAllRead = async () => {
    try {
      await axios.post(API, { action: 'mark_read' }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showToast('All alerts acknowledged.');
    } catch {
      showToast('Failed to acknowledge all.');
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Delete all alerts from history?')) return;
    try {
      await axios.post(API, { action: 'clear_all' }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNotifications([]);
      showToast('Alert history cleared.');
    } catch {
      showToast('Failed to clear history.');
    }
  };

  return (
    <div className="space-y-6" style={{ minHeight: 'calc(100vh - 11rem)' }}>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold border border-white/20">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Alert Vault</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Audit log of system actions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} disabled={notifications.every(n => n.is_read)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all disabled:opacity-50">
            <CheckSquare className="w-4 h-4" /> Acknowledge All
          </button>
          <button onClick={clearAll} disabled={notifications.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black hover:bg-rose-100 transition-all disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Clear Vault
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Retrieving logs...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm"><Bell className="w-10 h-10" /></div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Silence is Golden</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No alerts registered in database</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div key={n.id} className={`p-6 flex gap-6 items-center justify-between hover:bg-slate-50/50 transition-all ${!n.is_read ? 'bg-indigo-50/10' : ''}`}>
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'ticket' ? 'bg-emerald-50 text-emerald-500' : n.type === 'followup_required' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                    {n.type === 'ticket' ? <Inbox className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate">{n.title}</h4>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${n.type === 'ticket' ? 'bg-emerald-100 text-emerald-700' : n.type === 'followup_required' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-black uppercase tracking-widest mt-2">
                      <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                      Acknowledge
                    </button>
                  )}
                  {n.link && (
                    <a href={n.link} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                      Navigate
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

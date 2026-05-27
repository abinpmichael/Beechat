import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard, MessageSquare, Globe, Users,
  Settings as SettingsIcon, LogOut, Bell, Search,
  ChevronRight, Plus, TrendingUp, Activity, Zap,
  Menu, Radio, History, Clock, UserCheck, Hash, Shield,
  Sparkles, BrainCircuit, Rocket, Heart, AlertCircle, CreditCard, Lock, HelpCircle, X,
  CheckCircle2, Inbox, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatConsole from './ChatConsole';
import Websites from './Websites';
import Leads from './Leads';
import Settings from './Settings';
import TeamPage from './TeamPage';
import TeamChat from './TeamChat';
import SuperAdmin from './SuperAdmin';
import Help from './Help';
import Tickets from './Tickets';
import NotificationsHistory from './NotificationsHistory';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../config';

const STATS_URL = `${API_BASE_URL}/stats.php`;

// --- ULTIMATE CUTE BEE (MEGA-KAWAII CHIBI EDITION) ---
const TopBee = ({ size = 40, animated = true }) => {
  const [isWiggling, setIsWiggling] = useState(false);
  
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 1200);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [animated]);

  return (
    <motion.svg 
      width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { 
        y: isWiggling ? [0, -12, 0] : [0, -4, 0],
        rotate: isWiggling ? [0, 10, -10, 7, 0] : [0, 3, -3, 0],
        scale: isWiggling ? [1, 1.1, 1] : [1, 1.02, 1],
        filter: ["drop-shadow(0 0 0px rgba(251,191,36,0))", "drop-shadow(0 0 30px rgba(251,191,36,0.6))", "drop-shadow(0 0 0px rgba(251,191,36,0))"]
      } : {}}
      transition={{ duration: isWiggling ? 0.5 : 3.5, repeat: isWiggling ? 0 : Infinity, ease: "easeInOut" }}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="megaKawaiiFuzzDash" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneyDash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeDash" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushDash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneyDash)" filter="url(#megaKawaiiFuzzDash)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneyDash)" filter="url(#megaKawaiiFuzzDash)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneyDash)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushDash)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushDash)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeDash)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeDash)" />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M46 55Q48 50 50 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        </g>
        <path d="M36 75Q38 78 40 75Q42 78 44 75" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <motion.g animate={animated ? { rotate: [-15, 15] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ originX: '40px', originY: '30px' }}>
          <path d="M30 35Q25 10 15 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M50 35Q55 10 65 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }} d="M15 15L17 13L15 11L13 13Z" fill="#FF85A2" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} d="M65 15L67 13L65 11L63 13Z" fill="#FF85A2" />
        </motion.g>
      </motion.g>

      <motion.g 
        animate={animated ? { rotateX: [0, -85, 0], scale: [1, 1.1, 1], opacity: [0.9, 0.5, 0.9] } : {}} 
        transition={{ duration: 0.02, repeat: Infinity }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <path d="M50 50C70 10 130 10 130 50C130 90 70 130 50 110C30 130 -30 90 -30 50C-30 10 30 10 50 50Z" fill="#F0F9FF" fillOpacity="0.4" stroke="#BAE6FD" strokeWidth="1" transform="scale(0.6) translate(40, -20)" />
      </motion.g>
    </motion.svg>
  );
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [waitingCount, setWaitingCount]   = useState(0);
  const [showWelcome, setShowWelcome]     = useState(false);
  const [sysSettings, setSysSettings]     = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen]     = useState(false);
  const dummyVisitors = [
    { sessionId: 'mock1', country: 'United States', ip: '192.168.1.12', page: '/pricing', browser: 'Chrome', device: 'Desktop', sessionDuration: 124, visitorUid: 'Visitor (8F2A)' },
    { sessionId: 'mock2', country: 'United Kingdom', ip: '82.12.3.4', page: '/features', browser: 'Safari', device: 'Mobile', sessionDuration: 45, visitorUid: 'Visitor (9B3C)' },
    { sessionId: 'mock3', country: 'India', ip: '103.4.5.6', page: '/', browser: 'Firefox', device: 'Desktop', sessionDuration: 312, visitorUid: 'Visitor (1E7D)' },
    { sessionId: 'mock4', country: 'Canada', ip: '99.2.3.1', page: '/blog', browser: 'Edge', device: 'Desktop', sessionDuration: 89, visitorUid: 'Visitor (4C2F)' },
    { sessionId: 'mock5', country: 'Germany', ip: '46.5.6.7', page: '/about', browser: 'Chrome', device: 'Mobile', sessionDuration: 12, visitorUid: 'Visitor (A1B2)' }
  ];
  const [liveVisitors, setLiveVisitors]   = useState(dummyVisitors);
  const maxNotifIdRef = useRef(0);

  const fetchNotifs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications.php`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const newNotifs = res.data;
      if (Array.isArray(newNotifs) && newNotifs.length > 0) {
        const unreadNew = newNotifs.filter(n => !n.is_read && n.id > maxNotifIdRef.current);
        const maxId = Math.max(...newNotifs.map(n => n.id));
        if (maxNotifIdRef.current > 0 && unreadNew.length > 0) {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
        }
        if (maxId > maxNotifIdRef.current) {
          maxNotifIdRef.current = maxId;
        }
      }
      setNotifications(newNotifs);
    } catch (e) { }
  };

  useEffect(() => {
    fetchNotifs();
    const t = setInterval(fetchNotifs, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user || !user.tenant_id) return;

    // Connect to Socket.IO server on port 3000
    const socket = io(SOCKET_URL);

    // Join room for this tenant
    socket.emit('join_tenant', user.tenant_id);

    // Listen to real-time notifications
    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);

      // Play alert sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});

      // Show native browser notification if allowed
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message });
      }
    });

    // Listen to active visitor events
    socket.on('live_visitors_list', (list) => {
      if (list && list.length > 0) {
        setLiveVisitors(list);
      } else {
        setLiveVisitors(dummyVisitors);
      }
    });

    // Request notification permission if not prompted yet
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAllRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/notifications.php`, { action: 'mark_read' }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchNotifs();
    } catch (e) { }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const hasSeen = localStorage.getItem('bee_welcome_seen');
    if (!hasSeen && user?.is_superadmin === 0) setShowWelcome(true);
  }, [user]);

  const closeWelcome = () => { localStorage.setItem('bee_welcome_seen', 'true'); setShowWelcome(false); };

  useEffect(() => {
    const fetchWaiting = async () => {
      try {
        const r = await axios.get(STATS_URL, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setWaitingCount(r.data.waiting || 0);
      } catch { }
    };
    fetchWaiting(); const t = setInterval(fetchWaiting, 5000); return () => clearInterval(t);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings.php`).then(res => setSysSettings(res.data));
  }, []);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    ...(parseInt(sysSettings.enable_live_chat ?? 1) === 1 ? [
      { name: 'Live Console', path: '/dashboard/leads', icon: Radio, badge: waitingCount },
      { name: 'Communications', path: '/dashboard/chats', icon: MessageSquare },
    ] : []),
    { name: 'Team Lounge', path: '/dashboard/team', icon: MessageSquare },
    { name: 'Neural Tickets', path: '/dashboard/tickets', icon: Inbox },
    { name: 'My Domains', path: '/dashboard/websites', icon: Globe },
    { name: 'Hive Members', path: '/dashboard/agents', icon: Users },
    { name: 'Neural Config', path: '/dashboard/settings', icon: SettingsIcon },
    ...(parseInt(sysSettings.enable_ticketing ?? 1) === 1 ? [
      { name: 'Intelligence Hub', path: '/dashboard/help', icon: HelpCircle },
    ] : []),
    ...(user?.is_superadmin === 1 || user?.role === 'superadmin' ? [{ name: 'Sovereign View', path: '/dashboard/super-admin', icon: Shield }] : []),
  ];

  const isRestricted = user?.status !== 'active' && user?.is_superadmin !== 1;

  return (
    <div className="flex h-screen bg-[#fcfdfe] overflow-hidden text-slate-700 relative selection:bg-amber-100 selection:text-amber-600">
      {/* Paywall Overlay */}
      {isRestricted && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 md:border-[8px] border-white text-center relative overflow-hidden"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-rose-50 text-rose-500 rounded-xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner border border-rose-100"><Lock className="w-8 h-8 md:w-12 md:h-12" /></div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter mb-3 uppercase">Access Restricted</h2>
            <p className="text-base md:text-xl text-slate-400 font-bold mb-8 md:mb-10 leading-relaxed uppercase tracking-widest">Plan Renewal Required.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <Link to="/dashboard/settings" className="bg-amber-500 text-white py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-base md:text-lg shadow-xl shadow-amber-100 hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"><CreditCard className="w-5 h-5 md:w-6 md:h-6" /> Upgrade</Link>
              <button onClick={logout} className="bg-slate-100 text-slate-600 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-base md:text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"><LogOut className="w-5 h-5 md:w-6 md:h-6" /> Sign Out</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || window.innerWidth > 1024) && (
          <motion.aside initial={{ x: -320 }} animate={{ x: 0, width: isSidebarOpen ? (window.innerWidth > 1024 ? 300 : 280) : 100 }} exit={{ x: -320 }}
            className={`bg-white border-r-2 border-slate-50 flex flex-col z-50 absolute lg:relative h-full transition-all shadow-2xl shadow-slate-100`}
          >
            <div className="p-6 md:p-8 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4 group">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg shadow-xl shadow-amber-500/10 flex items-center justify-center p-1 md:p-1.5 border-2 border-slate-50 overflow-hidden"><TopBee size={24} /></div>
                {isSidebarOpen && <span className="font-black text-lg md:text-xl tracking-tighter text-slate-900 uppercase">BEE<span className="text-amber-500">CHAT</span></span>}
              </div>
              {!isSidebarOpen && window.innerWidth < 1024 && <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400"><X /></button>}
            </div>
            <nav className="flex-1 px-4 md:px-5 space-y-2 md:space-y-3 mt-6 md:mt-10 no-scrollbar overflow-y-auto">
              {navItems.map((item) => {
                const isActive = item.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                    className={`flex items-center gap-4 md:gap-5 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-[1.5rem] transition-all group relative ${isActive ? 'bg-amber-500 text-white shadow-xl shadow-amber-200' : 'text-slate-400 hover:bg-slate-50 hover:text-amber-500'}`}>
                    <Icon className={`w-6 h-6 md:w-7 md:h-7 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {isSidebarOpen && <span className="font-black text-[11px] md:text-[12px] uppercase tracking-widest md:tracking-[0.2em] flex-1">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 md:p-6 border-t-2 border-slate-50">
              <button onClick={logout} className="flex items-center gap-4 md:gap-5 px-4 md:px-5 py-4 md:py-5 w-full text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl md:rounded-[1.25rem] transition-all group">
                <LogOut className="w-6 h-6 md:w-7 md:h-7 shrink-0 group-hover:-translate-x-1 transition-transform" />
                {isSidebarOpen && <span className="font-black text-[11px] md:text-[12px] uppercase tracking-widest md:tracking-[0.2em]">Terminate</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/20">
        <header className="h-20 md:h-28 bg-white/80 backdrop-blur-3xl border-b-2 border-slate-50 px-6 md:px-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-500 border border-slate-100"><Menu className="w-6 h-6 md:w-7 md:h-7" /></button>
            <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-inner">
              <Search className="w-5 h-5 text-slate-300" />
              <input type="text" placeholder="Neural Search..." className="bg-transparent border-none focus:ring-0 w-64 outline-none text-xs font-black uppercase tracking-widest text-slate-600 placeholder:text-slate-300" />
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 md:p-3 hover:bg-slate-100 rounded-xl text-slate-400 border border-transparent hover:border-slate-100">
                <Bell className="w-6 h-6 md:w-7 md:h-7" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 md:top-3 md:right-3 w-4 h-4 md:w-5 md:h-5 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black">{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <motion.div initial={{ opacity:0, y:10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:10, scale:0.95 }}
                      className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-4xl border-2 border-slate-50 z-50 overflow-hidden"
                    >
                      <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between bg-white">
                        <h4 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Neural Alerts</h4>
                        <button onClick={markAllRead} className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-600 transition-colors">Acknowledge All</button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-slate-50/20">
                        {notifications.length === 0 ? (
                          <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100"><TopBee size={32} /></div>
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Hive is silent</p>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className={`p-6 border-b border-slate-50 flex gap-4 items-start hover:bg-white transition-all group ${!n.is_read ? 'bg-white' : 'opacity-60'}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'ticket' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                {n.type === 'ticket' ? <Inbox className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-amber-500 transition-colors">{n.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-2">{n.message}</p>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{n.created_at}</span>
                              </div>
                              {!n.is_read && <div className="w-2 h-2 bg-pink-500 rounded-full mt-2" />}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-6 text-center border-t-2 border-slate-50 bg-white">
                         <Link to="/dashboard/notifications" onClick={() => setIsNotifOpen(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">View All Activities</Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 md:gap-5 pl-4 md:pl-8 border-l-2 border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] md:text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">{user?.name}</p>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-amber-500 mt-1">{user?.role}</p>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.25rem] bg-amber-500 flex items-center justify-center text-white font-black text-lg shadow-2xl shadow-amber-200 border-2 md:border-4 border-white/20">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div 
              key={location.pathname.split('/')[2] || 'root'} 
              initial={{ opacity:0, y:10 }} 
              animate={{ opacity:1, y:0 }} 
              exit={{ opacity:0, y:-10 }} 
              transition={{ duration:0.15, ease: "easeOut" }}
              className="min-h-full"
            >
              <Routes>
                <Route path="/" element={<Overview statsUrl={STATS_URL} liveVisitors={liveVisitors} />} />
                <Route path="/chats" element={<ChatConsole />} />
                <Route path="/team" element={<TeamChat />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/websites" element={<Websites />} />
                <Route path="/agents" element={<TeamPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/notifications" element={<NotificationsHistory />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeWelcome} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-3xl overflow-hidden border-4 md:border-[8px] border-white">
              <div className="bg-amber-500 p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125"><TopBee size={80} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-300" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] opacity-80">Welcome to the Empire</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight mb-2 uppercase">Initialize Hive.</h2>
                  <p className="text-amber-50 font-bold uppercase tracking-widest text-[9px] md:text-xs opacity-90">3 Steps to Dominance.</p>
                </div>
              </div>
              <div className="p-8 md:p-12 space-y-6 md:space-y-8">
                {[
                  { icon: Globe, title: "1. Estate Connection", desc: "Initialize your domain in 'My Domains'." },
                  { icon: BrainCircuit, title: "2. Logic Ingestion", desc: "Feed the hive with knowledge base articles." },
                  { icon: Zap, title: "3. Neural Activation", desc: "Toggle 'AI Bot' to active mode." }
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 md:gap-6 group">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-50 text-amber-500 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform"><step.icon className="w-5 h-5 md:w-7 md:h-7" /></div>
                    <div>
                      <h4 className="text-lg md:text-xl font-black text-slate-900 mb-1 uppercase tracking-tighter">{step.title}</h4>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[9px] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
                <button onClick={closeWelcome} className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl shadow-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter">Commence Build <ChevronRight className="w-5 h-5 md:w-7 md:h-7" /></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- HIVE INSIGHTS (AI SUMMARY) ---
const HiveInsights = () => (
  <div className="glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border-2 border-white shadow-2xl shadow-amber-500/5 bg-white relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="w-24 h-24 text-amber-500" /></div>
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
        <Sparkles className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Neural Insights</h4>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">AI System Analysis</p>
      </div>
    </div>
    <div className="space-y-6">
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-900 uppercase">Traffic Surge Detected</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">Your colony saw a 12% increase in visitor engagement today. AI handled 88% of initial pings autonomously.</p>
      </div>
      <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <span className="text-[10px] font-black text-slate-900 uppercase">Conversion Velocity</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">High intent detected in "Pricing" queries. Consider active human intervention for these cells.</p>
      </div>
    </div>
  </div>
);

// --- COLONY PULSE MAP (LIVE VISITOR VISUALIZER) ---
const ColonyPulseMap = ({ liveVisitors = [] }) => {
  const getCoordinates = (visitor) => {
    let hash = 0;
    const str = (visitor.country || '') + (visitor.ip || '') + (visitor.sessionId || '');
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const top = 15 + Math.abs(hash % 70) + '%';
    const left = 15 + Math.abs((hash >> 8) % 70) + '%';
    return { top, left };
  };

  return (
    <div className="glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border-2 border-white shadow-2xl shadow-amber-500/5 bg-slate-900 text-white relative overflow-hidden lg:col-span-2">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative z-10">
        <div>
          <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            Colony Pulse
          </h4>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1.5">Live Resident Origins & Activity</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shrink-0">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{liveVisitors.length} Bees Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Visual Map Silhouette */}
        <div className="lg:col-span-1 relative h-64 bg-slate-800/30 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10,20 Q30,10 50,20 T90,20 M10,50 Q30,40 50,50 T90,50 M10,80 Q30,70 50,80 T90,80' stroke='%23fff' fill='none'/%3E%3C/svg%3E")` }} />
          
          {liveVisitors.map((visitor, i) => {
            const coords = getCoordinates(visitor);
            return (
              <div key={visitor.sessionId || i} className="absolute" style={{ top: coords.top, left: coords.left }}>
                <motion.div 
                  animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, delay: (i * 0.4) % 2 }}
                  className="w-5 h-5 bg-emerald-500/30 rounded-full"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,1)]" />
              </div>
            );
          })}

          <div className="relative z-10 text-center my-auto">
            {liveVisitors.length === 0 ? (
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No active pings</p>
            ) : (
              <div>
                <p className="text-4xl font-black tracking-tighter text-white animate-pulse">{liveVisitors.length}</p>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">Live Beings</p>
              </div>
            )}
          </div>

          <div className="relative z-10 flex items-center gap-2">
             <div className="flex -space-x-2">
                {liveVisitors.slice(0, 3).map((v, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-amber-500 flex items-center justify-center text-[8px] font-black text-white">
                    🐝
                  </div>
                ))}
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
               {liveVisitors.length > 0 ? `${liveVisitors.length} Session Cells` : 'Silence'}
             </span>
          </div>
        </div>

        {/* Live Visitor Details Grid */}
        <div className="lg:col-span-2 bg-slate-800/20 rounded-[2rem] border border-white/5 overflow-hidden flex flex-col justify-between max-h-[16rem] overflow-y-auto custom-scrollbar">
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest sticky top-0 bg-slate-900 z-10">
                  <th className="px-6 py-4">Visitor / Origin</th>
                  <th className="px-6 py-4">Current Page</th>
                  <th className="px-6 py-4">Specs</th>
                  <th className="px-6 py-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px]">
                {liveVisitors.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                      Waiting for active visitors...
                    </td>
                  </tr>
                ) : (
                  liveVisitors.map((visitor) => (
                    <tr key={visitor.sessionId} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm" title={visitor.country}>{visitor.country === 'United States' ? '🇺🇸' : visitor.country === 'Canada' ? '🇨🇦' : visitor.country === 'India' ? '🇮🇳' : '🌐'}</span>
                          <div>
                            <p className="font-black text-white truncate max-w-[100px]">{visitor.visitorUid || 'Anonymous'}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{visitor.ip || 'Unknown IP'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-wider max-w-[120px] truncate block">
                          {visitor.page || '/'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="font-bold uppercase text-[8px] tracking-widest bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/5">{visitor.browser || 'Browser'}</span>
                          <span className="font-bold uppercase text-[8px] tracking-widest bg-slate-800 px-1.5 py-0.5 rounded text-white border border-white/5">{visitor.device || 'desktop'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="font-black text-emerald-400 font-mono">{visitor.sessionDuration || 0}s</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function Overview({ statsUrl, liveVisitors = [] }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await axios.get(statsUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setStats(r.data);
      } catch { } finally { setLoading(false); }
    };
    fetch(); const t = setInterval(fetch, 8000); return () => clearInterval(t);
  }, [statsUrl]);

  const cards = stats ? [
    { label: 'Live Residents', value: stats.online_now || 0, icon: Radio, color: 'from-emerald-400 to-emerald-600', note: `${stats.live_chats || 0} active` },
    { label: 'Lead Ingestion', value: stats.total_leads || 0, icon: Target, color: 'from-amber-500 to-amber-700', note: `${stats.ended_today || 0} today` },
    { label: 'Avg Response', value: `${stats.avg_response_time || 0}s`, icon: Clock, color: 'from-blue-400 to-blue-600', note: 'last 24h' },
    { label: 'Colony Assets', value: stats.websites || 0, icon: Globe, color: 'from-slate-700 to-slate-900', note: `${stats.agents || 0} agents` },
  ] : [];

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Hive <span className="text-amber-500">Intelligence</span></h2>
          <p className="text-slate-400 font-black mt-1.5 uppercase tracking-[0.3em] text-[8px] md:text-[9px]">Real-time system execution metrics.</p>
        </div>
        <button onClick={() => navigate('/dashboard/leads')} className="bg-amber-500 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
          <Radio className="w-5 h-5 md:w-6 md:h-6" /> Live Console
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {loading ? Array(4).fill(0).map((_,i) => <div key={i} className="glass p-8 rounded-[2.5rem] animate-pulse h-40 bg-white/50"/>) : cards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} whileHover={{ y:-5 }} className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden group bg-white border-2 border-slate-50 shadow-xl shadow-amber-500/5 cursor-default">
              <div className={`absolute top-0 right-0 w-20 md:w-28 h-20 md:h-28 bg-gradient-to-br ${stat.color} opacity-[0.08] rounded-bl-[4rem] md:rounded-bl-[5rem] group-hover:scale-150 transition-transform duration-700`}/>
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className={`bg-gradient-to-br ${stat.color} p-3.5 md:p-4 rounded-xl md:rounded-[1.25rem] text-white shadow-lg`}><Icon className="w-5 h-5 md:w-6 md:h-6" /></div>
                <span className="text-[8px] md:text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 md:px-3 py-1 rounded-full uppercase tracking-widest border border-amber-100">{stat.note}</span>
              </div>
              <div>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{stat.value ?? '0'}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="glass p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] border-2 border-slate-50 relative overflow-hidden bg-white shadow-xl shadow-amber-500/5">
        <div className="flex items-center justify-between mb-10 md:mb-16">
          <div>
            <h3 className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight flex items-center gap-3 uppercase"><TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-amber-500" /> Platform Velocity</h3>
            <p className="text-slate-400 text-[9px] md:text-[10px] font-black mt-2 uppercase tracking-[0.4em]">Neural ingestion rate — Last 7 Days</p>
          </div>
        </div>
        <div className="h-64 md:h-80 flex items-end gap-4 md:gap-10 px-4 md:px-8 relative">
          {loading ? Array(7).fill(0).map((_,i) => <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl md:rounded-t-[2.5rem] animate-pulse" style={{ height: `${20+i*10}%` }} />) : stats?.daily_stats?.map((day, i) => {
            const max = Math.max(...stats.daily_stats.map(d => d.count)) || 1;
            const h = (day.count / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 md:gap-6 group">
                <div className="w-full relative h-64 md:h-80 flex items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(h, 8)}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-slate-900 rounded-t-xl md:rounded-t-[2.5rem] group-hover:bg-amber-500 transition-all shadow-xl relative"
                  ><div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all">{day.count}</div></motion.div>
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {!loading && stats?.plan_utilization && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
           <div className="glass p-10 md:p-12 rounded-[3rem] border-2 border-slate-50 bg-white shadow-xl shadow-amber-500/5">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Zap className="w-6 h-6" /></div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Empire Quota</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Resource Utilization</p>
                 </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Assets (Websites)</span>
                    <span className="text-xs font-black text-slate-900">{stats.plan_utilization.websites_used} / {stats.plan_utilization.websites_max}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.plan_utilization.websites_used / stats.plan_utilization.websites_max) * 100}%` }} className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Units (Agents)</span>
                    <span className="text-xs font-black text-slate-900">{stats.plan_utilization.agents_used} / {stats.plan_utilization.agents_max}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.plan_utilization.agents_used / stats.plan_utilization.agents_max) * 100}%` }} className="h-full bg-slate-900 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                  </div>
                </div>
              </div>
           </div>

           <div className="glass p-10 md:p-12 rounded-[3rem] border-2 border-slate-50 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
              <Shield className="w-12 h-12 text-amber-500 mb-6" />
              <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Plan Security</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8">Your account is secured with Enterprise-grade encryption. Need more seats or assets? Upgrade your hive anytime.</p>
              <button onClick={() => navigate('/dashboard/settings')} className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Upgrade Empire</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
         <HiveInsights />
         <ColonyPulseMap liveVisitors={liveVisitors} />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard, MessageSquare, Globe, Users,
  Settings as SettingsIcon, LogOut, Bell, Search,
  ChevronRight, Plus, TrendingUp, Activity, Zap,
  Menu, Radio, History, Clock, UserCheck, Hash, Shield,
  Sparkles, BrainCircuit, Rocket, Heart, AlertCircle, CreditCard, Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatConsole from './ChatConsole';
import Websites from './Websites';
import Leads from './Leads';
import Settings from './Settings';
import TeamPage from './TeamPage';
import TeamChat from './TeamChat';
import SuperAdmin from './SuperAdmin';

const STATS_URL = 'http://localhost/Bee/server/api/stats.php';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [waitingCount, setWaitingCount]   = useState(0);
  const [showWelcome, setShowWelcome]     = useState(false);

  useEffect(() => {
    // Show welcome guide to non-superadmins who haven't seen it
    const hasSeen = localStorage.getItem('bee_welcome_seen');
    if (!hasSeen && user?.is_superadmin === 0) {
      setShowWelcome(true);
    }
  }, [user]);

  const closeWelcome = () => {
    localStorage.setItem('bee_welcome_seen', 'true');
    setShowWelcome(false);
  };

  // Poll waiting count for nav badge
  useEffect(() => {
    const fetchWaiting = async () => {
      try {
        const r = await axios.get(STATS_URL, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setWaitingCount(r.data.waiting || 0);
      } catch { /* silent */ }
    };
    fetchWaiting();
    const t = setInterval(fetchWaiting, 5000);
    return () => clearInterval(t);
  }, []);

  const navItems = [
    { name: 'Overview',      path: '/dashboard',          icon: LayoutDashboard },
    { name: 'Live Chats',    path: '/dashboard/leads',    icon: Radio,           badge: waitingCount },
    { name: 'Conversations', path: '/dashboard/chats',    icon: MessageSquare },
    { name: 'Team Lounge',  path: '/dashboard/team',     icon: MessageSquare },
    { name: 'My Websites',   path: '/dashboard/websites', icon: Globe },
    { name: 'Team Members',  path: '/dashboard/agents',   icon: Users },
    { name: 'Settings',      path: '/dashboard/settings', icon: SettingsIcon },
    // Only show Super Admin to the platform owner
    ...(user?.is_superadmin === 1 ? [{ name: 'Super Admin', path: '/dashboard/super-admin', icon: Shield }] : []),
  ];

  const isExpiringSoon = user?.plan?.expires_at && 
    (new Date(user.plan.expires_at).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000); // 3 days

    (new Date(user.plan.expires_at).getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000); // 3 days

  const isRestricted = user?.status !== 'active' && user?.is_superadmin !== 1;

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden text-slate-700 relative">
      {/* Paywall Overlay */}
      {isRestricted && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl bg-white rounded-[4rem] p-12 shadow-2xl border-4 border-white text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 premium-gradient" />
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Lock className="w-12 h-12" />
            </div>
            
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Subscription Required</h2>
            <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed">
              Your access to the Bee Chat dashboard is currently restricted. <br/>
              Please renew your plan or upgrade to continue managing your agents and websites.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/dashboard/settings" 
                className="premium-gradient text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" /> View Pricing Plans
              </Link>
              <button 
                onClick={logout}
                className="bg-slate-100 text-slate-600 py-5 rounded-3xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
              >
                <LogOut className="w-6 h-6" /> Log Out
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <Shield className="w-4 h-4" /> Secure Payment via Stripe
            </div>
          </motion.div>
        </div>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        className="glass border-r border-slate-200/50 flex flex-col z-20 relative"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-10 h-10 object-contain drop-shadow-sm" alt="Bee Chat" />
            {isSidebarOpen && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} className="font-black text-2xl tracking-tighter text-slate-900 uppercase">
                HIVE<span className="text-indigo-600">CHAT</span>
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => {
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                  isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                }`}>
                <Icon className="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" />
                {isSidebarOpen && (
                  <motion.span initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} className="font-semibold text-sm flex-1">
                    {item.name}
                  </motion.span>
                )}
                {isSidebarOpen && item.badge > 0 && (
                  <span className="bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{item.badge}</span>
                )}
                {!isSidebarOpen && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border border-white"/>
                )}
                {isActive && <motion.div layoutId="activeTab" className="absolute -left-1 w-2 h-8 bg-white rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={logout}
            className="flex items-center gap-4 px-4 py-4 w-full text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group">
            <LogOut className="w-6 h-6 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-semibold text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200/50 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-slate-100/50 px-4 py-2.5 rounded-2xl border border-slate-200/50 focus-within:bg-white focus-within:ring-2 ring-indigo-100 transition-all">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Global search..." className="bg-transparent border-none focus:ring-0 w-64 outline-none text-sm font-medium" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 group">
                <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {waitingCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-pink-500 rounded-full border-2 border-white animate-pulse"/>}
              </button>
            </div>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">{user?.role}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl premium-gradient flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200 border-2 border-white">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isExpiringSoon && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-amber-900">Subscription Expiring Soon</h4>
                  <p className="text-sm text-amber-700 font-medium">Your plan will expire on {new Date(user.plan.expires_at).toLocaleDateString()}. Renew now to avoid service interruption.</p>
                </div>
              </div>
              <Link to="/dashboard/settings?tab=billing" className="px-6 py-3 bg-amber-500 text-white font-black rounded-xl shadow-lg shadow-amber-100 hover:scale-105 transition-all">
                Renew Now
              </Link>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-15 }} transition={{ duration:0.2 }}>
              <Routes>
                <Route path="/"        element={<Overview />} />
                <Route path="/chats"   element={<ChatConsole />} />
                <Route path="/team"    element={<TeamChat />} />
                <Route path="/leads"   element={<Leads />} />
                <Route path="/websites" element={<Websites />} />
                 <Route path="/agents"  element={<TeamPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeWelcome}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white"
            >
              <div className="premium-gradient p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <Rocket className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Welcome to the Hive</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight leading-tight mb-2">Let's Launch Your <br/>AI Assistant</h2>
                  <p className="text-indigo-100 font-medium text-lg">Follow these 3 simple steps to start automating your support 24/7.</p>
                </div>
              </div>

              <div className="p-12 space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
                    <Globe className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">1. Connect Your Website</h4>
                    <p className="text-slate-500 font-medium">Head to 'My Websites' and add your domain to get your unique chat widget script.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-purple-100/50">
                    <BrainCircuit className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">2. Train Your AI Brain</h4>
                    <p className="text-slate-500 font-medium">Add some FAQ items in the Knowledge Base. This is what your bot will use to answer customers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-amber-100/50">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">3. Launch Auto-Pilot</h4>
                    <p className="text-slate-500 font-medium">Toggle the 'AI Bot' switch to Active. Your bot will now handle support while you sleep!</p>
                  </div>
                </div>

                <button 
                  onClick={closeWelcome}
                  className="w-full py-5 premium-gradient text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  Got it, Let's Build! <ChevronRight className="w-6 h-6" />
                </button>

                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for your business
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Overview with REAL data ──────────────────────────────── */
function Overview() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await axios.get(STATS_URL, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setStats(r.data);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetch();
    const t = setInterval(fetch, 8000);
    return () => clearInterval(t);
  }, []);

  const cards = stats ? [
    { label: 'Online Now',         value: stats.online_now,     icon: Radio,          color: 'from-emerald-400 to-emerald-600', note: `${stats.live_chats} in chat` },
    { label: 'Total Leads',        value: stats.total_leads,    icon: Users,           color: 'from-indigo-500 to-indigo-700', note: `${stats.ended_today} ended today` },
    { label: 'Total Messages',     value: stats.total_messages, icon: MessageSquare,   color: 'from-purple-500 to-pink-600',  note: 'all time activity' },
    { label: 'Active Websites',    value: stats.websites,       icon: Globe,           color: 'from-orange-400 to-amber-600',  note: `${stats.agents} agents` },
  ] : [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Overview</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1">Real-time performance metrics — live data.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard/leads')} className="premium-gradient text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
            <Radio className="w-5 h-5" /> Live Chat Console
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array(4).fill(0).map((_,i) => (
          <div key={i} className="glass p-6 rounded-[2.5rem] animate-pulse h-40 bg-slate-100"/>
        )) : cards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} whileHover={{ y:-5 }} className="glass p-6 rounded-[2.5rem] relative overflow-hidden group cursor-default">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.04] rounded-bl-[5rem] group-hover:scale-150 transition-transform duration-700`}/>
              <div className="flex items-center justify-between mb-6">
                <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-3xl text-white shadow-xl shadow-indigo-100`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">{stat.note}</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value ?? '—'}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Activity Graph */}
      <div className="glass p-10 rounded-[3rem] border border-slate-200/50 relative overflow-hidden">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-600" /> Platform Activity
            </h3>
            <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">New leads across all sites — Last 7 Days</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">Growth: +{(stats?.total_leads / 10).toFixed(1)}%</div>
          </div>
        </div>

        <div className="h-64 flex items-end gap-3 md:gap-6 px-4 relative">
          {/* Chart Grid Lines */}
          <div className="absolute inset-x-0 top-0 h-px bg-slate-100/50" />
          <div className="absolute inset-x-0 top-1/4 h-px bg-slate-100/50" />
          <div className="absolute inset-x-0 top-2/4 h-px bg-slate-100/50" />
          <div className="absolute inset-x-0 top-3/4 h-px bg-slate-100/50" />
          
          {loading ? Array(7).fill(0).map((_,i) => (
            <div key={i} className="flex-1 bg-slate-50 rounded-t-2xl animate-pulse" style={{ height: `${20+i*10}%` }} />
          )) : stats?.daily_stats?.map((day, i) => {
            const max = Math.max(...stats.daily_stats.map(d => d.count)) || 1;
            const h = (day.count / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full relative h-64 flex items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(h, 5)}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-2xl group-hover:from-indigo-500 group-hover:to-purple-500 transition-all shadow-lg shadow-indigo-100 relative"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.count}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live visitors */}
        <div className="lg:col-span-2 glass p-8 rounded-[3rem]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-500"/> Live Visitors Right Now
            </h3>
            <button onClick={() => navigate('/dashboard/leads')} className="text-xs font-black text-indigo-500 hover:text-indigo-700">View All →</button>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
          ) : !stats?.recent_live?.length ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-300">
              <Radio className="w-10 h-10 mb-3 opacity-30"/>
              <p className="font-bold text-sm">No live visitors right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recent_live.map((lead, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-all cursor-pointer group" onClick={() => navigate('/dashboard/leads')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs font-mono">
                      {(lead.visitor_uid||'BEE').slice(-3)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 font-mono">{lead.visitor_uid || 'BEE-??????'}</p>
                      <p className="text-xs text-slate-400 font-bold">{lead.domain} · {lead.phone||'No contact'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(!lead.assigned_to || lead.chat_status === 'waiting') ? (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-black px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">WAITING</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2.5 py-1 rounded-full border border-emerald-200">ACTIVE</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agents */}
        <div className="glass p-8 rounded-[3rem]">
          <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500"/> Team Members
          </h3>
          {loading ? (
            <div className="space-y-4">{Array(4).fill(0).map((_,i) => <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
          ) : !stats?.agent_list?.length ? (
            <div className="text-center text-slate-300 py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30"/>
              <p className="text-sm font-bold">No agents yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.agent_list.map((a, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm">
                      {a.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{a.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{a.role}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/dashboard/agents')} className="w-full mt-6 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-black text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            Manage Team
          </button>
        </div>
      </div>
    </div>
  );
}



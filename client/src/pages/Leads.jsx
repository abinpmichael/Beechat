import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MessageSquare, Globe, X, Send,
  UserPlus, PhoneOff, ArrowRightLeft, Users,
  History, Radio, Hash, Clock, CheckCircle, Bell, Shield, Bot, Image, FileText, Loader2, Share2, Inbox
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const API    = `${API_BASE_URL}/leads.php`;
const CONV   = `${API_BASE_URL}/conversations.php`;
const AGENTS = `${API_BASE_URL}/agents.php`;

function getToken()  { return localStorage.getItem('token'); }
function authH()     { return { Authorization: `Bearer ${getToken()}` }; }
function parseUser() {
  try {
    const t = getToken();
    if (!t) return { id:1, name:'Agent' };
    const part = t.includes('.') ? t.split('.')[1] : t;
    return JSON.parse(atob(part));
  } catch { return { id:1, name:'Agent' }; }
}

// --- SUPER PERFECT BEE ---
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
        <filter id="megaKawaiiFuzzLeads" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneyLeads" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeLeads" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushLeads" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneyLeads)" filter="url(#megaKawaiiFuzzLeads)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneyLeads)" filter="url(#megaKawaiiFuzzLeads)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneyLeads)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushLeads)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushLeads)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeLeads)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeLeads)" />
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

export default function Leads() {
  const [tab,          setTab]          = useState('live');   // live | history
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [selected,     setSelected]     = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [agents,       setAgents]       = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [prevWaiting,  setPrevWaiting]  = useState(0);
  const [liveEnabled,  setLiveEnabled]  = useState(true);
  const scrollRef = useRef();
  const audioRef  = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const activeChatStateRef = useRef({ leadId: null, length: 0 });
  const user = parseUser();

  /* ─── helpers ──────────────────────────────────────────── */
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 5000); };
  const isWaiting = (l) => l.is_live == 1 && (!l.assigned_to || l.chat_status === 'waiting');
  const isActive  = (l) => l.is_live == 1 && l.assigned_to && l.chat_status === 'active';

  /* ─── fetch leads ───────────────────────────────────────── */
  const fetchLeads = async () => {
    try {
      const filter = tab === 'live' ? 'live' : 'history';
      const r = await axios.get(`${API}?filter=${filter}`, { headers: authH() });
      setLeads(Array.isArray(r.data) ? r.data : []);
      setLoading(false);
    } catch { /* silent */ }
  };

  const fetchMessages = async (lead) => {
    if (!lead) return;
    try {
      const r = await axios.get(`${CONV}?leadId=${lead.id}`);
      const newMsgs = Array.isArray(r.data) ? r.data : [];
      
      if (activeChatStateRef.current.leadId !== lead.id) {
        activeChatStateRef.current = { leadId: lead.id, length: newMsgs.length };
      } else {
        const prevLength = activeChatStateRef.current.length;
        if (newMsgs.length > prevLength) {
          const newSlice = newMsgs.slice(prevLength);
          const hasVisitorMsg = newSlice.some(m => m.sender_type !== 'agent');
          if (hasVisitorMsg) {
            audioRef.current.play().catch(() => {});
          }
        }
        activeChatStateRef.current.length = newMsgs.length;
      }
      
      setMessages(newMsgs);
    } catch { /* silent */ }
  };

  const fetchAgents = async () => {
    try {
      const r = await axios.get(AGENTS, { headers: authH() });
      setAgents(Array.isArray(r.data) ? r.data : []);
    } catch { /* silent */ }
  };

  /* ─── polling ───────────────────────────────────────────── */
  useEffect(() => {
    setLeads([]); setLoading(true); setSelected(null); setMessages([]);
    fetchLeads();
    const t = setInterval(fetchLeads, 4000);
    return () => clearInterval(t);
  }, [tab]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings.php`).then(res => {
      setLiveEnabled(parseInt(res.data.enable_live_chat ?? 1) === 1);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected);
    const t = setInterval(() => fetchMessages(selected), 2000);
    return () => clearInterval(t);
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) {
      activeChatStateRef.current = { leadId: null, length: 0 };
    }
  }, [selected?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* ─── new visitor alert ─────────────────────────────────── */
  useEffect(() => {
    const count = leads.filter(isWaiting).length;
    if (count > prevWaiting) {
      audioRef.current.play().catch(() => {});
      showToast(`🔔 New visitor waiting! (${count} total)`);
      document.title = '🔔 NEW CHAT REQUEST!';
      setTimeout(() => { document.title = 'Bee Chat'; }, 5000);
    }
    setPrevWaiting(count);
  }, [leads]);

  /* ─── actions ───────────────────────────────────────────── */
  const claim = async (lead) => {
    try {
      await axios.post(CONV, { action:'claim', leadId:lead.id, agentId:user.id, agentName:user.name||'Agent' });
      const updated = { ...lead, assigned_to:user.id, chat_status:'active' };
      setLeads(p => p.map(l => l.id===lead.id ? updated : l));
      setSelected(updated);
      fetchMessages(updated);
      fetchAgents();
    } catch { showToast('❌ Could not claim chat.'); }
  };

  const openChat = (lead) => {
    setSelected(lead); setShowTransfer(false);
    fetchMessages(lead);
    if (isActive(lead)) fetchAgents();
  };

  const sendMessage = async (e, contentOverride = null) => {
    if (e) e.preventDefault();
    const content = contentOverride || input.trim();
    if (!content || !selected) return;
    if (!contentOverride) setInput('');
    const tmp = { content, sender_type:'agent', agent_name:user.name||'Me', created_at:new Date().toISOString() };
    setMessages(p => [...p, tmp]);
    try {
      await axios.post(CONV, { action:'send', leadId:selected.id, content, sender:'agent', agentId:user.id, agentName:user.name||'Agent' });
    } catch { showToast('❌ Message failed.'); setMessages(p => p.filter(m => m !== tmp)); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API_BASE_URL}/upload.php`, formData);
      if (res.data.url) sendMessage(null, res.data.url);
    } catch (err) { showToast("❌ Upload failed"); }
  };

  const endChat = async () => {
    if (!selected || !window.confirm('End this chat?')) return;
    try {
      await axios.post(CONV, { action:'end_chat', leadId:selected.id, agentId:user.id, agentName:user.name||'Agent' });
      setLeads(p => p.filter(l => l.id !== selected.id));
      setSelected(null); setMessages([]);
      showToast('✅ Chat ended successfully.');
    } catch { showToast('❌ Could not end chat.'); }
  };

  const transfer = async (toAgent) => {
    if (!selected) return;
    try {
      await axios.post(CONV, { action:'transfer', leadId:selected.id, agentId:user.id, agentName:user.name||'Agent', toAgentId:toAgent.id, toAgentName:toAgent.name });
      setLeads(p => p.filter(l => l.id !== selected.id));
      setSelected(null); setShowTransfer(false);
      showToast(`🔄 Transferred to ${toAgent.name}`);
    } catch { showToast('❌ Transfer failed.'); }
  };

  const flagFollowup = async () => {
    if (!selected) return;
    try {
      await axios.post(CONV, { action:'flag_followup', leadId:selected.id, agentId:user.id, agentName:user.name||'Agent' });
      setSelected(p => ({ ...p, followup_required: 1 }));
      setLeads(p => p.map(l => l.id===selected.id ? { ...l, followup_required: 1 } : l));
      showToast('📧 Flagged for email follow-up.');
    } catch { showToast('❌ Failed to flag.'); }
  };

  const saveNotes = async (notes) => {
    if (!selected) return;
    try {
      await axios.post(CONV, { action:'update_notes', leadId:selected.id, notes });
      setSelected(p => ({ ...p, internal_notes: notes }));
      setLeads(p => p.map(l => l.id===selected.id ? { ...l, internal_notes: notes } : l));
    } catch { /* silent */ }
  };

  const shareToTeam = async () => {
    if (!selected) return;
    try {
      await axios.post(`${API_BASE_URL}/internal_chat.php`, { 
        receiverId: 0, // General Group
        content: `[TICKET:${selected.id}]` 
      }, { headers: authH() });
      showToast('📢 Shared to Team Lounge!');
    } catch { showToast('❌ Failed to share.'); }
  };

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', priority: 'medium', department: 'Support', message: '', email: '' });

  const convertToTicket = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/tickets.php?action=convert_lead`, {
        ...ticketForm,
        leadId: selected.id,
        email: ticketForm.email || (selected.details ? (typeof selected.details === 'string' ? JSON.parse(selected.details).email : selected.details.email) : '')
      }, { headers: authH() });
      if (res.data.success) {
        showToast(`✅ Ticket #${res.data.tracking_id} created!`);
        setShowTicketModal(false);
        setTab('history');
      } else {
        showToast(`❌ Conversion failed: ${res.data.error || 'Unknown error'}`);
      }
    } catch (err) {
      showToast(`❌ Conversion failed: ${err.response?.data?.error || err.message}`);
    }
  };

  /* ─── filtered list ─────────────────────────────────────── */
  const filtered = leads.filter(l =>
    (l.visitor_uid||'').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone||'').toLowerCase().includes(search.toLowerCase()) ||
    (l.domain||'').toLowerCase().includes(search.toLowerCase())
  );

  const waitingCount = leads.filter(isWaiting).length;

  /* ─────────────────────────────────────────────────────────── */
  if (!liveEnabled) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
          <Shield className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Live Chat Disabled</h2>
        <p className="text-lg text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          The real-time human chat functionality has been globally disabled by the platform administrator. 
          Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-0" style={{minHeight:'calc(100vh - 11rem)'}}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-80,opacity:0}}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold border border-white/20 whitespace-nowrap">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Modal */}
      <AnimatePresence>
        {showTicketModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowTicketModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{opacity:0, scale:0.9, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.9, y:20}} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-4xl border-4 border-white overflow-hidden">
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Escalate to Ticket</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1">Convert live session to neural ticket</p>
                 </div>
                 <button onClick={() => setShowTicketModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
              </div>
              <form onSubmit={convertToTicket} className="p-8 space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Ticket Subject</label>
                    <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100" placeholder="e.g. Technical Issue with Widget" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Priority</label>
                       <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100" value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm, priority: e.target.value})}>
                          <option value="low">LOW</option>
                          <option value="medium">MEDIUM</option>
                          <option value="high">HIGH</option>
                          <option value="urgent">URGENT</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Department</label>
                       <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100" value={ticketForm.department} onChange={e => setTicketForm({...ticketForm, department: e.target.value})}>
                          <option value="Support">SUPPORT</option>
                          <option value="Billing">BILLING</option>
                          <option value="Technical">TECHNICAL</option>
                          <option value="Sales">SALES</option>
                       </select>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Internal Description</label>
                    <textarea required rows="4" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-100" placeholder="Describe the issue for the support team..." value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all">Generate Ticket <CheckCircle className="inline-block ml-2 w-5 h-5" /></button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setTab('live')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${tab==='live' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
            <Radio className="w-4 h-4"/>
            Live Visitors
            {waitingCount > 0 && <span className="bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{waitingCount}</span>}
          </button>
          <button onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${tab==='history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
            <History className="w-4 h-4"/>
            Chat History
          </button>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bee Agent</p>
              <p className="text-xs font-black text-slate-900 leading-none">{user.name || 'Admin'}</p>
           </div>
           <TopBee size={32} />
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        {/* ── LEFT sidebar ─────────────────────────────────── */}
        <div className="w-72 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, phone, domain..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 ring-indigo-200"/>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-300 text-sm">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                {tab === 'live'
                  ? <><Users className="w-10 h-10 mx-auto mb-3 text-slate-200"/><p className="text-slate-400 text-sm font-bold">No live visitors</p><p className="text-slate-300 text-xs mt-1">Visitors appear when they request a human agent</p></>
                  : <><History className="w-10 h-10 mx-auto mb-3 text-slate-200"/><p className="text-slate-400 text-sm font-bold">No chat history</p></>
                }
              </div>
            ) : filtered.map(lead => (
              <button key={lead.id} onClick={() => openChat(lead)}
                className={`w-full p-4 text-left border-b border-slate-50 transition-all hover:bg-slate-50 ${selected?.id===lead.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs">
                      {(lead.visitor_uid||'BEE').slice(-3)}
                    </div>
                    {tab === 'live' && (
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isWaiting(lead) ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}/>
                    )}
                    {tab === 'history' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-slate-300"/>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-black text-slate-900 text-[10px] font-mono">#{lead.id} {lead.visitor_uid || 'BEE-??????'}</p>
                      <div className="flex gap-1">
                        {lead.followup_required == 1 && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-black px-1.5 py-0.5 rounded-full border border-blue-200">FOLLOW-UP</span>
                        )}
                        {tab === 'live' && isWaiting(lead) && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 font-black px-1.5 py-0.5 rounded-full border border-amber-200">TICKET</span>
                        )}
                        {tab === 'history' && (
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded-full">RESOLVED</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-900 font-black truncate">{lead.ticket_subject || 'Support Request'}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-slate-400 truncate font-bold flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5 shrink-0"/>{lead.domain}
                      </p>
                      {lead.tenant_name && (
                        <span className="text-[8px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tight truncate max-w-[80px]">
                          {lead.tenant_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT chat / detail ───────────────────────────── */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-100 px-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 font-black flex items-center justify-center text-xs font-mono">
                  {(selected.visitor_uid||'BEE').slice(-3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900 text-sm font-mono">TKT-#{selected.id} | {selected.visitor_uid||'BEE-??????'}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selected.chat_status === 'ended' ? 'bg-emerald-100 text-emerald-700' : 
                      selected.chat_status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selected.chat_status === 'ended' ? 'Resolved' : selected.chat_status === 'active' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <span className="text-slate-900">{selected.ticket_subject || 'Support Request'}</span>
                    <span className="mx-1 opacity-20">|</span>
                    <Globe className="w-2.5 h-2.5"/>{selected.domain}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tab==='live' && isWaiting(selected) && (
                  <button onClick={() => claim(selected)}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    <UserPlus className="w-3.5 h-3.5"/> Claim Chat
                  </button>
                )}
                <button onClick={shareToTeam} title="Share to Team Lounge"
                  className="p-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:text-indigo-600 hover:border-indigo-100 transition-all">
                  <Share2 className="w-4 h-4"/>
                </button>
                {tab==='live' && isActive(selected) && (<>
                  <button onClick={() => setShowTicketModal(true)}
                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                    <Inbox className="w-3.5 h-3.5"/> Escalate
                  </button>
                  <button onClick={flagFollowup}
                    disabled={selected.followup_required == 1}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${selected.followup_required == 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                    <Bell className="w-3.5 h-3.5"/> {selected.followup_required == 1 ? 'Escalated' : 'Mail Follow-up'}
                  </button>
                  <button onClick={() => { setShowTransfer(p=>!p); fetchAgents(); }}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">
                    <ArrowRightLeft className="w-3.5 h-3.5"/> Transfer
                  </button>
                  <button onClick={endChat}
                    className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5"/> Resolve Ticket
                  </button>
                </>)}
                <button onClick={() => { setSelected(null); setMessages([]); setShowTransfer(false); }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* Transfer panel */}
            <AnimatePresence>
              {showTransfer && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  className="bg-amber-50 border-b border-amber-100 overflow-hidden shrink-0">
                  <div className="p-4">
                    <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">Select agent to transfer to:</p>
                    {agents.length === 0
                      ? <p className="text-xs text-amber-600 font-bold">No other agents available.</p>
                      : <div className="flex flex-wrap gap-2">
                          {agents.map(a => (
                            <button key={a.id} onClick={() => transfer(a)}
                              className="flex items-center gap-1.5 bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                              {a.name} <span className="opacity-50">·</span> {a.role}
                            </button>
                          ))}
                        </div>
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Visitor Metadata Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-6 overflow-x-auto no-scrollbar shrink-0">
               <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                     <Globe className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Origin</p>
                     <p className="text-[11px] font-bold text-slate-700 leading-none mt-1">{selected.country || 'Searching...'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                     <FileText className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="max-w-[200px]">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Viewing Page</p>
                     <p className="text-[11px] font-bold text-slate-700 leading-none mt-1 truncate" title={selected.current_page}>{selected.current_page || 'Home'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                     <Bot className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Device / Browser</p>
                     <p className="text-[11px] font-bold text-slate-700 leading-none mt-1 uppercase tracking-tighter truncate max-w-[120px]">{selected.device} / {selected.browser?.split(' ')[0]}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                     <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Online For</p>
                     <p className="text-[11px] font-bold text-slate-700 leading-none mt-1 uppercase tracking-tighter">
                        {(() => {
                           const start = new Date(selected.created_at);
                           const now = new Date();
                           const diff = Math.floor((now - start) / 60000);
                           return diff < 1 ? 'Just joined' : `${diff} min`;
                        })()}
                     </p>
                  </div>
               </div>
            </div>

            {/* Survey History Summary */}
            {selected.details && (
              <div className="px-6 py-4 bg-indigo-50/30 border-b border-slate-100 shrink-0">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5"/> Automated Survey History
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(() => {
                    try {
                      const d = typeof selected.details === 'string' ? JSON.parse(selected.details) : selected.details;
                      return Object.entries(d).map(([k, v]) => {
                        if (k === 'is_ticket' || k === 'status' || k === 'subject' || !v) return null;
                        return (
                          <div key={k} className="bg-white p-2 px-3 rounded-xl border border-indigo-100/50 shadow-sm overflow-hidden">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 truncate">{k.replace('_', ' ')}</p>
                            <p className="text-[11px] font-bold text-slate-700 truncate" title={String(v)}>{String(v)}</p>
                          </div>
                        );
                      });
                    } catch { return null; }
                  })()}
                </div>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/40">
              {messages.length === 0 && (
                <div className="text-center text-slate-300 text-sm py-10">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30"/>
                  No messages yet
                </div>
              )}
              {messages.map((msg, i) => {
                const isAgent   = msg.sender_type === 'agent';
                const isBot     = isAgent && (msg.agent_name === 'Bot' || msg.agent_name === 'System');
                const isSystem  = msg.content?.startsWith('✅') || msg.content?.startsWith('🔴') || msg.content?.startsWith('🔄') || msg.content?.startsWith('🟡');
                if (isSystem) return (
                  <div key={i} className="flex justify-center">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full border border-slate-200">{msg.content}</span>
                  </div>
                );
                return (
                  <div key={i} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[72%]">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                        isAgent && !isBot ? 'bg-indigo-600 text-white rounded-br-none'
                        : isBot ? 'bg-slate-200 text-slate-700 rounded-bl-none'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                      }`}>
                        {msg.image && (
                          <div className="mb-2">
                             <img 
                               src={msg.image.startsWith('http') ? msg.image : `${API_BASE_URL}/${msg.image}`} 
                               className="max-w-full rounded-2xl cursor-pointer hover:opacity-90" 
                               onClick={() => window.open(msg.image.startsWith('http') ? msg.image : `${API_BASE_URL}/${msg.image}`, '_blank')} 
                             />
                          </div>
                        )}
                        {msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img src={msg.content} alt="Upload" className="max-w-full rounded-lg cursor-pointer hover:opacity-90" onClick={() => window.open(msg.content)} />
                        ) : msg.content === '[FORM:DATA_REQUEST]' ? (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                            <FileText className="w-4 h-4"/> Form Requested
                          </div>
                        ) : (msg.content !== 'Sent an image' || !msg.image) ? (
                          msg.content
                        ) : null}
                      </div>
                      <p className={`text-[10px] font-bold mt-0.5 ${isAgent ? 'text-indigo-400 text-right mr-1' : 'text-slate-400 ml-1'}`}>
                        {isAgent ? (isBot ? '🤖 Bot' : msg.agent_name||'Agent') : `👤 ${selected.visitor_uid||'Visitor'}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              {tab === 'history' ? (
                <div className="text-center py-2 text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-slate-300"/> This chat has ended — read-only transcript
                </div>
              ) : isWaiting(selected) ? (
                <div className="text-center py-2">
                  <p className="text-slate-400 text-xs font-bold">Claim this chat to start messaging</p>
                  <button onClick={() => claim(selected)} className="mt-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all">
                    Claim Now
                  </button>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-indigo-300 focus-within:bg-white transition-all">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Type a message to visitor..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"/>
                  
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => sendMessage(null, '[FORM:DATA_REQUEST]')} title="Request Information Form" className="p-2 text-slate-400 hover:text-indigo-600 transition-all">
                      <FileText className="w-4 h-4"/>
                    </button>
                    <label className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-all" title="Upload Image">
                      <Image className="w-4 h-4"/>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>

                  <button type="submit" disabled={!input.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40">
                    <Send className="w-4 h-4"/>
                  </button>
                </form>
              )}
            </div>

            {/* Internal Notes */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Shield className="w-3 h-3"/> Internal Team Notes (Private)
                </p>
                {selected.followup_required == 1 && <span className="text-[9px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full">Follow-up Needed</span>}
              </div>
              <textarea 
                defaultValue={selected.internal_notes || ''}
                onBlur={(e) => saveNotes(e.target.value)}
                placeholder="Add private notes for your team (e.g. 'Email client about pricing on Monday')..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 ring-indigo-100 min-h-[60px]"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
              {tab === 'live' ? <Radio className="w-10 h-10 text-indigo-300"/> : <History className="w-10 h-10 text-indigo-300"/>}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{tab === 'live' ? 'Live Visitor Console' : 'Chat History'}</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              {tab === 'live'
                ? waitingCount > 0 ? `${waitingCount} visitor(s) waiting. Click one to respond.` : 'No active visitors right now. Visitors appear here when they click "Talk to Agent".'
                : 'Select a past conversation to view the full transcript.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

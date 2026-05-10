import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MessageSquare, Globe, X, Send,
  UserPlus, PhoneOff, ArrowRightLeft, Users,
  History, Radio, Hash, Clock, CheckCircle, Bell, Shield, Bot, Image, FileText, Loader2, Share2
} from 'lucide-react';

const API    = 'http://localhost/Bee/server/api/leads.php';
const CONV   = 'http://localhost/Bee/server/api/conversations.php';
const AGENTS = 'http://localhost/Bee/server/api/agents.php';

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
  const scrollRef = useRef();
  const audioRef  = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
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
      setMessages(Array.isArray(r.data) ? r.data : []);
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
    if (!selected) return;
    fetchMessages(selected);
    const t = setInterval(() => fetchMessages(selected), 2000);
    return () => clearInterval(t);
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
      const res = await axios.post('http://localhost/Bee/server/api/upload.php', formData);
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
      await axios.post('http://localhost/Bee/server/api/internal_chat.php', { 
        receiverId: 0, // General Group
        content: `[TICKET:${selected.id}]` 
      }, { headers: authH() });
      showToast('📢 Shared to Team Lounge!');
    } catch { showToast('❌ Failed to share.'); }
  };

  /* ─── filtered list ─────────────────────────────────────── */
  const filtered = leads.filter(l =>
    (l.visitor_uid||'').toLowerCase().includes(search.toLowerCase()) ||
    (l.phone||'').toLowerCase().includes(search.toLowerCase()) ||
    (l.domain||'').toLowerCase().includes(search.toLowerCase())
  );

  const waitingCount = leads.filter(isWaiting).length;

  /* ─────────────────────────────────────────────────────────── */
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

      {/* Tab bar */}
      <div className="flex items-center gap-3 mb-4">
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
                    <p className="text-[10px] text-slate-400 truncate font-bold flex items-center gap-1 mt-0.5">
                      <Globe className="w-2.5 h-2.5 shrink-0"/>{lead.domain}
                    </p>
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
                        {msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img src={msg.content} alt="Upload" className="max-w-full rounded-lg cursor-pointer hover:opacity-90" onClick={() => window.open(msg.content)} />
                        ) : msg.content === '[FORM:DATA_REQUEST]' ? (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                            <FileText className="w-4 h-4"/> Form Requested
                          </div>
                        ) : (
                          msg.content
                        )}
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

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Users, MessageSquare, Shield, CheckCircle, Clock, Image, FileText, ExternalLink } from 'lucide-react';

const API = 'http://localhost/Bee/server/api/internal_chat.php';

function getToken()  { return localStorage.getItem('token'); }
function authH()     { return { Authorization: `Bearer ${getToken()}` }; }
function parseUser() {
  try {
    const t = getToken();
    if (!t) return { id:0, name:'Agent' };
    const part = t.includes('.') ? t.split('.')[1] : t;
    return JSON.parse(atob(part));
  } catch { return { id:0, name:'Agent' }; }
}

export default function TeamChat() {
  const [agents,     setAgents]   = useState([]);
  const [selected,   setSelected] = useState(null);
  const [messages,   setMessages] = useState([]);
  const [input,      setInput]    = useState('');
  const [loading,    setLoading]  = useState(true);
  const [search,     setSearch]   = useState('');
  const scrollRef = useRef();
  const user = parseUser();

  const fetchAgents = async () => {
    try {
      const r = await axios.get(`${API}?otherId=list`, { headers: authH() });
      setAgents(Array.isArray(r.data) ? r.data : []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchMessages = async (otherId) => {
    // otherId can be 0 for group chat
    try {
      const r = await axios.get(`${API}?otherId=${otherId}`, { headers: authH() });
      setMessages(Array.isArray(r.data) ? r.data : []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchAgents();
    const t = setInterval(fetchAgents, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selected === null) return;
    fetchMessages(selected.id);
    const t = setInterval(() => fetchMessages(selected.id), 3000);
    return () => clearInterval(t);
  }, [selected?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e, contentOverride = null) => {
    if (e) e.preventDefault();
    const content = contentOverride || input.trim();
    if (!content || !selected) return;
    if (!contentOverride) setInput('');
    const tmp = { content, sender_id: user.id, created_at: new Date().toISOString() };
    setMessages(p => [...p, tmp]);
    try {
      await axios.post(API, { receiverId: selected.id, content }, { headers: authH() });
    } catch { setMessages(p => p.filter(m => m !== tmp)); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost/Bee/server/api/upload.php', formData);
      if (res.data.url) sendMessage(null, res.data.url);
    } catch (err) { alert("Upload failed"); }
  };

  const filtered = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col gap-6" style={{minHeight:'calc(100vh - 11rem)'}}>
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
          <Shield className="w-10 h-10 text-indigo-600" /> Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Lounge</span>
        </h2>
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Private internal communication for agents.</p>
      </div>

      <div className="flex-1 flex bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search teammates..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 ring-indigo-50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="p-8 text-center animate-pulse text-slate-300 font-bold">Loading Team...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-300 font-bold">No teammates found.</div>
            ) : filtered.map(a => (
              <button 
                key={a.id} onClick={() => setSelected(a)}
                className={`w-full p-4 text-left rounded-[2rem] transition-all flex items-center gap-4 group ${selected?.id === a.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600'} ${a.id === 0 ? 'border-2 border-indigo-100 mb-4' : ''}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${selected?.id === a.id ? 'bg-white/20' : a.id === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    {a.id === 0 ? '📢' : a.name.charAt(0)}
                  </div>
                  {a.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                      {a.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-sm truncate">{a.name}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${selected?.id === a.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                      {a.role}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${selected?.id === a.id ? 'opacity-70' : 'text-slate-400'}`}>
                    {a.last_message || 'Start a conversation'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
            <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{selected.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Team Member
                  </p>
                </div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                  <MessageSquare className="w-12 h-12 mb-4" />
                  <p className="font-bold">No internal messages yet</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group`}>
                      {!isMe && selected.id === 0 && (
                        <p className="text-[10px] font-black text-slate-400 mb-1 ml-4 uppercase tracking-widest">{msg.sender_name}</p>
                      )}
                      <div className={`px-5 py-3 rounded-[2rem] text-sm font-medium shadow-sm transition-all ${
                        isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                      }`}>
                        {msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <img src={msg.content} alt="Upload" className="max-w-xs rounded-xl cursor-pointer" onClick={() => window.open(msg.content)} />
                        ) : msg.content.startsWith('[TICKET:') ? (
                          <div className={`p-3 rounded-2xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <span className="font-black text-[10px] uppercase tracking-widest">Shared Ticket</span>
                            </div>
                            <p className="text-xs font-bold mb-2">Issue reference: {msg.content.replace('[TICKET:', '').replace(']', '')}</p>
                            <a href={`/dashboard/leads?id=${msg.content.match(/\d+/)[0]}`} className={`text-[10px] font-black uppercase flex items-center gap-1 hover:underline ${isMe ? 'text-white' : 'text-indigo-600'}`}>
                              View Details <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${isMe ? 'justify-end text-indigo-400' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[2rem] px-6 py-3 focus-within:ring-4 ring-indigo-50 focus-within:bg-white transition-all">
                <input 
                  value={input} onChange={e => setInput(e.target.value)}
                  placeholder={`Message ${selected.name}...`}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                />
                <div className="flex items-center gap-1">
                  <label className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-all shrink-0">
                    <Image className="w-5 h-5"/>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <button type="submit" disabled={!input.trim()} className="bg-indigo-600 text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
            <div className="w-24 h-24 bg-indigo-50 rounded-[3rem] flex items-center justify-center mb-8 shadow-inner">
              <Users className="w-12 h-12 text-indigo-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Team Lounge</h3>
            <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed">
              Select a teammate from the list to start a private conversation. 
              All internal chats are encrypted and restricted to your organization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, User, Shield, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config';

// --- THE NEW ENHANCED VECTOR LOGO ---
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
        <filter id="megaKawaiiFuzzSupport" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneySupport" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeSupport" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushSupport" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneySupport)" filter="url(#megaKawaiiFuzzSupport)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneySupport)" filter="url(#megaKawaiiFuzzSupport)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneySupport)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushSupport)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushSupport)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeSupport)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeSupport)" />
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

export default function SupportChat({ user, onClose, targetTenantId = null }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [convId, setConvId] = useState(null);
  const scrollRef = useRef();

  const fetchMessages = async () => {
    try {
      const url = targetTenantId ? `${API_BASE_URL}/support.php?tenantId=${targetTenantId}` : `${API_BASE_URL}/support.php`;
      const r = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMessages(r.data.messages || []);
      setConvId(r.data.conversation_id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMessages();
    const t = setInterval(fetchMessages, 3000);
    return () => clearInterval(t);
  }, [targetTenantId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !convId) return;
    try {
      await axios.post(`${API_BASE_URL}/support.php`, {
        conversation_id: convId,
        content: text,
        sender_name: user.name
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setText('');
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-[550px] bg-white rounded-[3rem] overflow-hidden shadow-4xl border-2 border-slate-50 selection:bg-amber-100 selection:text-amber-600">
      <div className="p-8 bg-amber-500 text-white flex justify-between items-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl border-2 border-amber-400/20">
             <TopBee size={50} />
          </div>
          <div>
            <h4 className="font-black text-lg uppercase tracking-tighter leading-none">Hive Command</h4>
            <p className="text-[10px] opacity-80 font-black uppercase tracking-[0.3em] mt-1">Sovereign Link</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all relative z-10 border border-white/10">Minimize</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-amber-50 text-amber-200 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Clock className="w-10 h-10" />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">Initializing support tunnel... Standby for agent connection.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_role === (user.is_superadmin ? 'superadmin' : 'tenant');
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm ${
                isMe ? 'bg-amber-500 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border-2 border-slate-50'
              }`}>
                <p className={`text-[9px] font-black mb-1.5 flex items-center gap-1.5 uppercase tracking-widest ${isMe ? 'opacity-80' : 'text-amber-600'}`}>
                   {msg.sender_role === 'superadmin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                   {msg.sender_name}
                </p>
                <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                <p className={`text-[8px] mt-2.5 font-black uppercase tracking-widest ${isMe ? 'opacity-50' : 'text-slate-300'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white border-t-2 border-slate-50 flex gap-3">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message to the hive..."
          className="flex-1 px-6 py-5 bg-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 ring-amber-50 focus:bg-white transition-all border border-transparent focus:border-amber-100 placeholder:uppercase placeholder:text-[10px]"
        />
        <button type="submit" className="p-5 bg-amber-500 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-100 flex items-center justify-center">
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}

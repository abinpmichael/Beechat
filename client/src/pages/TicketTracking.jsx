import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Clock, Shield, CheckCircle, AlertCircle, 
  Send, Paperclip, ChevronRight, Loader2, Globe, Video, Calendar
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// --- ULTIMATE CUTE BEE ---
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
        <filter id="megaKawaiiFuzzTT" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneyTT" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeTT" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushTT" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneyTT)" filter="url(#megaKawaiiFuzzTT)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneyTT)" filter="url(#megaKawaiiFuzzTT)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneyTT)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushTT)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushTT)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeTT)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeTT)" />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
        </g>
        <path d="M36 75Q38 78 40 75Q42 78 44 75" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </motion.g>
    </motion.svg>
  );
};

export default function TicketTracking() {
  const { trackingId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [trackingId]);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tickets.php?action=track&id=${trackingId}`);
      if (res.data.error) throw new Error(res.data.error);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;

    setSending(true);
    try {
      // In a real public tracking scenario, the "user" is the visitor.
      // We'll use the same reply endpoint but the backend handles "user_id is NULL" for visitor.
      await axios.post(`${API_BASE_URL}/tickets.php?action=create_reply_public`, {
        tracking_id: trackingId,
        message: reply
      });
      setReply('');
      fetchTicket();
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-4">Retrieving Ticket History</p>
    </div>
  );

  if (!ticket) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-rose-100">
         <AlertCircle className="w-12 h-12" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Ticket Not Found</h2>
      <p className="text-slate-500 font-bold max-w-sm leading-relaxed">The tracking ID might be incorrect or the ticket has been archived.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-white">
               <TopBee size={40} />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-1">
                 <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">Support Portal</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {trackingId}</span>
               </div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{ticket.subject}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm ${
               ticket.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
             }`}>
               {ticket.status}
             </div>
             <div className="px-5 py-2 bg-white rounded-2xl border border-slate-200 font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(ticket.created_at).toLocaleDateString()}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
               <div className="space-y-8">
                 {ticket.replies.map((reply, i) => (
                   <div key={reply.id} className={`flex gap-4 ${reply.user_id ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-black ${
                        reply.user_id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {reply.agent_name ? reply.agent_name[0] : 'V'}
                      </div>
                      <div className={`flex-1 space-y-1 ${reply.user_id ? '' : 'text-right'}`}>
                         <div className="flex items-center gap-2 mb-1 justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               {reply.agent_name || 'You'}
                            </span>
                            <span className="text-[9px] font-bold text-slate-300">
                               {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                           reply.user_id ? 'bg-slate-50 text-slate-700' : 'bg-amber-500 text-white'
                         }`}>
                           {reply.message}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Reply Input */}
            {ticket.status === 'open' && (
              <form onSubmit={handleReply} className="relative group">
                <textarea 
                  rows="4"
                  placeholder="Type your reply here..."
                  className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] font-bold text-slate-700 outline-none focus:border-amber-500 transition-all shadow-xl group-hover:shadow-2xl"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-3">
                   <button type="button" className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                      <Paperclip className="w-5 h-5" />
                   </button>
                   <button 
                     disabled={sending}
                     type="submit" 
                     className="px-8 py-3 bg-amber-500 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                   >
                     {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Reply</>}
                   </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
             {ticket.video_call_type && ticket.video_call_type !== 'none' && (
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group border border-amber-400">
                   <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />
                   <h3 className="text-lg font-black mb-4 flex items-center gap-3">
                      {ticket.video_call_type === 'instant' ? <Video className="w-6 h-6 animate-pulse" /> : <Calendar className="w-6 h-6" />}
                      {ticket.video_call_type === 'instant' ? 'Instant Video Call' : 'Scheduled Video Call'}
                   </h3>
                   <p className="text-xs font-medium text-amber-50/80 leading-relaxed mb-6">
                      {ticket.video_call_type === 'instant' 
                        ? 'An agent is ready to speak with you! Join the meeting directly via the button below.' 
                        : 'A face-to-face video consultation slot is waiting. Reserve your time using the calendar link.'}
                   </p>
                   <button 
                     onClick={() => setActiveVideoUrl(ticket.video_call_url)}
                     className="w-full py-4 bg-white text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                   >
                      {ticket.video_call_type === 'instant' ? 'Join Video Room 🎥' : 'Book Appointment 📅'}
                   </button>
                </div>
             )}

             <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                   <Shield className="w-5 h-5 text-amber-500" /> Security Info
                </h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitor ID</span>
                      <span className="text-xs font-bold text-slate-700">{ticket.visitor_uid}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Cell</span>
                      <div className="flex items-center gap-1.5 text-emerald-500">
                         <CheckCircle className="w-3.5 h-3.5" />
                         <span className="text-xs font-bold uppercase tracking-tight">Encrypted</span>
                      </div>
                   </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-50">
                   <p className="text-[9px] font-bold text-slate-400 leading-relaxed text-center uppercase tracking-widest">
                     This portal is secured with 256-bit Hive encryption. Do not share your tracking ID.
                   </p>
                </div>
             </div>

             <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                <Globe className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform duration-700" />
                <h3 className="text-lg font-black mb-4 flex items-center gap-3">
                   Need Help?
                </h3>
                <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
                   Our agents are working to resolve your ticket. You'll receive email updates as soon as there's a reply.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                   Back to Website
                </button>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeVideoUrl && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="relative w-full max-w-5xl h-[85vh] bg-slate-900 rounded-[3.5rem] overflow-hidden border-4 border-slate-800 shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-slate-800/80 text-white flex justify-between items-center border-b border-slate-700/50">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                       <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> Live Video Support Room
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">Ticket ID: {trackingId}</p>
                 </div>
                 <button 
                   onClick={() => setActiveVideoUrl(null)} 
                   className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                 >
                   Leave Support
                 </button>
              </div>
              <iframe 
                src={activeVideoUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay" 
                className="flex-1 w-full border-none bg-slate-950"
                title="BeeChat Video Support Room"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

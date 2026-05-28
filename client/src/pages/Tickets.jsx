import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, Send, Clock, CheckCircle2, AlertCircle, 
  User, MessageSquare, Shield, Filter, Search,
  ChevronRight, MoreVertical, Paperclip, Lock,
  Plus, ArrowUpRight, Video, Calendar
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', email: '', message: '', videoCallType: 'none' });
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.email || !newTicket.message) return alert("Please fill all fields");
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/tickets.php`, {
        action: 'create_internal',
        ...newTicket
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.error) throw new Error(res.data.error);
      setIsCreating(false);
      setNewTicket({ subject: '', email: '', message: '', videoCallType: 'none' });
      fetchTickets();
      if (res.data.tracking_id) fetchTicketDetails(res.data.tracking_id);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    (t.tracking_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.visitor_uid || '').toLowerCase().includes(search.toLowerCase())
  );

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tickets.php?action=list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (trackingId) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_BASE_URL}/tickets.php?action=track&id=${trackingId}`, { headers });
      setSelectedTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;

    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/tickets.php?action=reply`, {
        ticket_id: selectedTicket.id,
        message: reply,
        is_private: isPrivate ? 1 : 0
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReply('');
      setIsPrivate(false);
      fetchTicketDetails(selectedTicket.tracking_id);
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedTicket || sending) return;
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/tickets.php?action=update_status`, {
        ticket_id: selectedTicket.id,
        status: status
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.error) throw new Error(res.data.error);
      setSelectedTicket(prev => prev ? { ...prev, status: status } : null);
      fetchTickets();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleInitiateVideo = async (type = 'instant') => {
    if (!selectedTicket || sending) return;
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/tickets.php?action=initiate_video`, {
        ticket_id: selectedTicket.id,
        video_call_type: type
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.error) throw new Error(res.data.error);
      setSelectedTicket(prev => prev ? { ...prev, video_call_type: type, video_call_url: res.data.video_call_url } : null);
      fetchTicketDetails(selectedTicket.tracking_id);
    } catch (err) {
      alert("Failed to initiate video call: " + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8">
      {/* Sidebar List */}
      <div className="w-96 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Support <span className="text-amber-500">Tickets</span></h2>
           <button onClick={() => setIsCreating(true)} className="p-2 bg-amber-500 text-white rounded-xl shadow-lg hover:scale-105 transition-all"><Plus className="w-5 h-5" /></button>
        </div>

        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search tracking ID..." 
             className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-2xl font-bold text-xs outline-none focus:border-amber-500 transition-all shadow-sm"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
           {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border-2 border-slate-50" />) :
            filteredTickets.map(t => (
              <div 
                key={t.id}
                onClick={() => fetchTicketDetails(t.tracking_id)}
                className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
                  selectedTicket?.id === t.id ? 'bg-white border-amber-500 shadow-xl' : 'bg-white border-transparent hover:border-slate-100'
                }`}
              >
                 <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.tracking_id}</span>
                        {t.domain && (
                          <span className="text-[8px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full lowercase truncate max-w-[100px]">
                            {t.domain}
                          </span>
                        )}
                     </div>
                    <div className="flex items-center gap-2">
                       {t.email && <span className="text-[9px] font-bold text-amber-600 lowercase truncate max-w-[120px]">{t.email}</span>}
                       <div className={`w-2 h-2 rounded-full ${t.status === 'open' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                 </div>
                 <h4 className="font-black text-slate-900 text-sm mb-1 truncate">{t.subject}</h4>
                 <p className="text-[10px] font-bold text-slate-400 truncate">{t.last_message || 'No messages yet'}</p>
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all">
                   <ArrowUpRight className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            ))
           }
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-xl shadow-slate-100 border-2 border-slate-50 overflow-hidden flex flex-col">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                     {selectedTicket.visitor_uid[0]}
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedTicket.subject}</h3>
                     <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead: {selectedTicket.visitor_uid}</span>
                        {selectedTicket.email && (
                          <>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[10px] font-bold text-amber-600 lowercase select-all">{selectedTicket.email}</span>
                          </>
                        )}
                        {selectedTicket.domain && (
                          <>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Domain: {selectedTicket.domain}</span>
                          </>
                        )}
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{selectedTicket.status}</span>
                     </div>
                  </div>
               </div>
                <div className="flex items-center gap-3">
                   {selectedTicket.video_call_type && selectedTicket.video_call_type !== 'none' ? (
                      <button 
                        onClick={() => setActiveVideoUrl(selectedTicket.video_call_url)}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
                      >
                         <Video className="w-4 h-4 animate-pulse" /> {selectedTicket.video_call_type === 'instant' ? 'Join Video' : 'View Schedule Link'}
                      </button>
                   ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={sending}
                          onClick={() => handleInitiateVideo('instant')}
                          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                        >
                           <Video className="w-4 h-4 text-emerald-500" /> Instant Call
                        </button>
                        <button 
                          disabled={sending}
                          onClick={() => handleInitiateVideo('scheduled')}
                          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5"
                        >
                           <Calendar className="w-4 h-4 text-amber-500" /> Schedule Call
                        </button>
                      </div>
                   )}
                   <button className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400"><MoreVertical className="w-5 h-5" /></button>
                   <button 
                     disabled={sending}
                     onClick={() => handleUpdateStatus(selectedTicket.status === 'open' ? 'closed' : 'open')}
                     className={`px-6 py-2.5 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all ${
                       selectedTicket.status === 'open' 
                         ? 'bg-slate-900 hover:bg-amber-500' 
                         : 'bg-emerald-500 hover:bg-emerald-600'
                     }`}
                   >
                     {selectedTicket.status === 'open' ? 'Close Ticket' : 'Reopen Ticket'}
                   </button>
                </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
               {selectedTicket.replies.map((r, i) => (
                 <div key={r.id} className={`flex gap-4 ${r.user_id ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black ${
                      r.user_id ? (r.is_private ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white') : 'bg-white text-slate-400 border border-slate-100'
                    }`}>
                      {r.agent_name ? r.agent_name[0] : 'V'}
                    </div>
                    <div className={`max-w-xl space-y-1 ${r.user_id ? 'text-right' : ''}`}>
                       <div className="flex items-center gap-2 mb-1 justify-between px-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                             {r.agent_name || 'Visitor'} {r.is_private ? '• Private Note' : ''}
                          </span>
                       </div>
                       <div className={`p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                         r.user_id 
                           ? (r.is_private ? 'bg-slate-800 text-slate-100' : 'bg-amber-500 text-white') 
                           : 'bg-white text-slate-700 border border-slate-100'
                       }`}>
                         {r.message.split('\n').map((line, idx) => {
                           if (line.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                              return <img key={idx} src={line} className="max-w-full rounded-2xl my-2 shadow-lg border-4 border-white/20 cursor-pointer" onClick={() => window.open(line)} />
                           }
                           if (line.match(/\.(pdf|docx|xlsx|txt|zip|csv)$/i)) {
                              return (
                                <a key={idx} href={line} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-black/5 rounded-2xl my-2 hover:bg-black/10 transition-all border border-black/5 group">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                      <Paperclip className="w-5 h-5 text-slate-400" />
                                   </div>
                                   <div className="text-left">
                                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Attachment</p>
                                      <p className="text-xs font-bold truncate max-w-[200px]">{line.split('/').pop()}</p>
                                   </div>
                                </a>
                              )
                           }
                           return <p key={idx}>{line}</p>
                         })}
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Reply Footer */}
            <div className="p-8 border-t-2 border-slate-50 bg-white">
               <div className="flex items-center gap-4 mb-4">
                  <button 
                    onClick={() => setIsPrivate(false)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isPrivate ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                  >Public Reply</button>
                  <button 
                    onClick={() => setIsPrivate(true)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPrivate ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                  >Internal Note</button>
               </div>
               <form onSubmit={handleReply} className="relative">
                  <textarea 
                    rows="3"
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-sm outline-none focus:border-amber-500 transition-all"
                    placeholder={isPrivate ? "Type a private note for the team..." : "Reply to visitor via email/portal..."}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                     <label className="p-2.5 bg-white text-slate-400 rounded-xl hover:bg-slate-100 transition-all shadow-sm cursor-pointer border border-slate-100">
                        <Paperclip className="w-5 h-5" />
                        <input type="file" className="hidden" onChange={async (e) => {
                           const file = e.target.files[0];
                           if (!file) return;
                           const formData = new FormData();
                           formData.append('file', file);
                           try {
                              setSending(true);
                              const res = await axios.post(`${API_BASE_URL}/upload.php`, formData);
                              if (res.data.url) setReply(p => p + "\n" + res.data.url);
                           } catch (err) { alert("Upload failed"); }
                           finally { setSending(false); }
                        }} />
                     </label>
                     <button 
                       disabled={sending}
                       type="submit" 
                       className={`px-8 py-2.5 text-white font-black rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest ${
                         isPrivate ? 'bg-slate-900' : 'bg-amber-500'
                       }`}
                     >
                       {sending ? 'Processing...' : <><Send className="w-4 h-4" /> {isPrivate ? 'Add Note' : 'Post Reply'}</>}
                     </button>
                  </div>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-8 border-4 border-dashed border-slate-100">
                <Inbox className="w-16 h-16" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">No Ticket Selected</h3>
             <p className="text-slate-400 font-bold max-w-xs mt-2 text-sm uppercase tracking-widest leading-relaxed">Select a conversation from the left to view neural support history.</p>
          </div>
        )}
      </div>
      
      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
              <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create <span className="text-amber-500">Ticket</span></h3>
                <button onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-all font-bold">×</button>
              </div>
              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Subject</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})} placeholder="e.g. Needs immediate support" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Visitor Email</label>
                  <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-amber-500 transition-all" value={newTicket.email} onChange={(e) => setNewTicket({...newTicket, email: e.target.value})} placeholder="customer@example.com" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Initial Message</label>
                  <textarea rows="4" className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-sm outline-none focus:border-amber-500 transition-all" value={newTicket.message} onChange={(e) => setNewTicket({...newTicket, message: e.target.value})} placeholder="Describe the issue..." required />
                  
                  <div className="mt-3">
                     <label className="p-3.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all cursor-pointer shadow-sm border border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest w-fit">
                        <Paperclip className="w-4 h-4 text-amber-500" />
                        <span>{sending ? 'Uploading...' : 'Attach Image/File'}</span>
                        <input type="file" className="hidden" onChange={async (e) => {
                           const file = e.target.files[0];
                           if (!file) return;
                           const formData = new FormData();
                           formData.append('file', file);
                           try {
                              setSending(true);
                              const res = await axios.post(`${API_BASE_URL}/upload.php`, formData);
                              if (res.data.url) {
                                 setNewTicket(prev => ({
                                    ...prev,
                                    message: prev.message + (prev.message ? "\n" : "") + res.data.url
                                 }));
                              }
                           } catch (err) { alert("Upload failed"); }
                           finally { setSending(false); }
                        }} disabled={sending} />
                     </label>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Video Support Option</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-amber-500 text-slate-500 text-xs transition-all cursor-pointer"
                    value={newTicket.videoCallType || 'none'}
                    onChange={(e) => setNewTicket({...newTicket, videoCallType: e.target.value})}
                  >
                    <option value="none">NO VIDEO SUPPORT (EMAIL/CHAT ONLY)</option>
                    <option value="instant">ENABLE INSTANT VIDEO ROOM 🎥</option>
                    <option value="scheduled">ENABLE SCHEDULE MEETING LINK 📅</option>
                  </select>
                </div>
                <button disabled={sending} type="submit" className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl shadow-amber-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                  {sending ? 'Creating...' : <><Plus className="w-4 h-4" /> Create Ticket</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                       <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> Live Video Support Room (Agent)
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">Ticket ID: {selectedTicket?.tracking_id}</p>
                 </div>
                 <button 
                   onClick={() => setActiveVideoUrl(null)} 
                   className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                 >
                   Leave Meeting
                 </button>
              </div>
              <iframe 
                src={activeVideoUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay" 
                className="flex-1 w-full border-none bg-slate-950"
                title="BeeChat Agent Video Support Room"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

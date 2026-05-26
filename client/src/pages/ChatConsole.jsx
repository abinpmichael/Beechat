import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Check,
  CheckCheck,
  Clock,
  MessageSquare,
  Search,
  ChevronRight,
  User,
  Globe,
  Activity,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/conversations.php`;

const CANNED_RESPONSES = [
  { id: 1, label: 'Greeting', text: 'Hello! 🐝 Welcome to our Hive. How can I assist you today?' },
  { id: 2, label: 'Pricing', text: 'Our pricing plans are designed to scale with your colony. You can find full details in our pricing section!' },
  { id: 3, label: 'Wait', text: 'One moment please, I am fetching that information for you. 🍯' },
  { id: 4, label: 'Closing', text: 'Thank you for chatting with us! Have a buzz-tastic day! ✨' },
];

const BUZZ_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'; // Professional notification sound
export default function ChatConsole() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | ended
  const [visitorHistory, setVisitorHistory] = useState([]);
  const scrollRef = useRef();

  const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  // 1. Fetch Conversations List
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}?action=list_all`, { headers: authH() });
      setConversations(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchHistory();
    const t = setInterval(fetchHistory, 10000); // Polling for history list
    return () => clearInterval(t);
  }, []);

  // 2. Fetch messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMsgs = async () => {
      try {
        const res = await axios.get(`${API}?leadId=${selectedChat.id}`, { headers: authH() });
        if (res.data.length > messages.length) {
            // New message arrived
            const lastMsg = res.data[res.data.length - 1];
            if (lastMsg.sender_type === 'visitor') {
                new Audio(BUZZ_SOUND).play().catch(() => {});
            }
        }
        setMessages(res.data);
      } catch (e) { console.error(e); }
    };
    fetchMsgs();
    const t = setInterval(fetchMsgs, 3000); // Polling for current chat
    return () => clearInterval(t);
  }, [selectedChat, messages.length]);

  // 3. Fetch visitor history when selectedChat changes
  useEffect(() => {
    if (!selectedChat?.session_id) return;
    const fetchVisHistory = async () => {
      try {
        const res = await axios.get(`${API}?action=list_visitor_history&sessionId=${selectedChat.session_id}`, { headers: authH() });
        setVisitorHistory(res.data.filter(h => h.id !== selectedChat.id));
      } catch (e) { console.error(e); }
    };
    fetchVisHistory();
  }, [selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    try {
      await axios.post(API, {
        action: 'send',
        leadId: selectedChat.id,
        agentId: user.id,
        agentName: user.name,
        content: input
      }, { headers: authH() });
      setInput('');
      // Optimistic update
      setMessages(p => [...p, { sender_type: 'agent', content: input, created_at: new Date() }]);
    } catch (e) { console.error(e); }
  };

  const handleAction = async (action, extra = {}) => {
    try {
        const res = await axios.post(API, {
            action,
            leadId: selectedChat.id,
            agentId: user.id,
            agentName: user.name,
            ...extra
        }, { headers: authH() });
        
        // Refresh state
        fetchHistory();
        const msgRes = await axios.get(`${API}?leadId=${selectedChat.id}`, { headers: authH() });
        setMessages(msgRes.data);
        
        // Update selected chat status locally
        setSelectedChat(prev => ({ 
            ...prev, 
            chat_status: action === 'end_chat' ? 'ended' : 'active',
            is_live: action === 'end_chat' ? 0 : 1
        }));
    } catch (e) { console.error(e); }
  };

  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (selectedChat) setNotes(selectedChat.internal_notes || '');
  }, [selectedChat]);

  const handleSaveNotes = async () => {
    try {
        await axios.post(API, {
            action: 'update_notes',
            leadId: selectedChat.id,
            notes: notes
        }, { headers: authH() });
        // Update local state
        setConversations(prev => prev.map(c => c.id === selectedChat.id ? {...c, internal_notes: notes} : c));
    } catch (e) { console.error(e); }
  };

  const filtered = conversations.filter(c => {
    const matchesSearch = (c.visitor_uid || '').toLowerCase().includes(search.toLowerCase()) || 
                          (c.phone || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'active' && c.chat_status === 'active') ||
                          (filter === 'ended' && c.chat_status === 'ended');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-[2.5rem] border border-slate-200/50 overflow-hidden shadow-2xl shadow-slate-200/50 selection:bg-amber-100 selection:text-amber-600">
      {/* Sidebar: Chat List */}
      <div className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-8 border-b border-slate-100 bg-white">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-6 uppercase">Conversations</h3>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Visitor..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 ring-amber-50 transition-all focus:bg-white"
            />
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {['all', 'active', 'ended'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filter === f ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No conversations</p>
            </div>
          ) : (
            filtered.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-5 flex gap-4 rounded-[2rem] transition-all relative group ${
                  selectedChat?.id === chat.id 
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-100' 
                    : 'hover:bg-white text-slate-600'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center font-black text-lg ${
                  selectedChat?.id === chat.id ? 'bg-white/20' : 'bg-amber-50 text-amber-600'
                }`}>
                  {chat.visitor_uid?.slice(-2) || '??'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black text-sm truncate">{chat.visitor_uid || 'Unknown'}</h4>
                    <span className={`text-[10px] font-bold opacity-60 uppercase`}>
                      {chat.last_message_at ? format(new Date(chat.last_message_at), 'HH:mm') : ''}
                    </span>
                  </div>
                  <p className={`text-xs truncate font-medium ${selectedChat?.id === chat.id ? 'text-white/80' : 'text-slate-400'}`}>
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
                {chat.chat_status === 'active' && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Header */}
            <header className="h-24 border-b border-slate-50 px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black">
                   {selectedChat.visitor_uid?.slice(-2)}
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">{selectedChat.visitor_uid}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedChat.is_live ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {selectedChat.is_live ? 'Online Now' : `Last active ${format(new Date(selectedChat.last_seen_at || selectedChat.created_at), 'MMM d, HH:mm')}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 {selectedChat.chat_status === 'active' ? (
                    <>
                       <button 
                        onClick={() => handleAction('end_chat')}
                        className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                       >
                         End Chat
                       </button>
                       <button 
                        onClick={() => handleAction('flag_followup')}
                        className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-500 hover:text-white transition-all"
                       >
                         Flag Ticket
                       </button>
                    </>
                 ) : (
                    <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                       Status: <span className="text-red-500">CLOSED</span>
                    </div>
                 )}
                 <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Activity className="w-12 h-12 opacity-10 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">Waiting for data...</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isAgent = msg.sender_type === 'agent';
                  const isSystem = msg.agent_name === 'System' || msg.content.includes('Joined') || msg.content.includes('ended');
                  
                  if (isSystem) {
                    return (
                      <div key={i} className="flex justify-center">
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200/50">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] group`}>
                        <div className={`p-5 rounded-[2rem] shadow-sm relative ${
                          isAgent 
                            ? 'bg-amber-500 text-white rounded-tr-none shadow-amber-100' 
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
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
                          <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-2 px-2 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {format(new Date(msg.created_at || Date.now()), 'HH:mm')}
                          </span>
                          {isAgent && <CheckCheck className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Canned Responses */}
            <div className="px-8 py-3 bg-white border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
              {CANNED_RESPONSES.map(res => (
                <button
                  key={res.id}
                  onClick={() => setInput(res.text)}
                  className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 transition-all"
                >
                  {res.label}
                </button>
              ))}
            </div>

            {/* Reply Area (Only if active) */}
            <div className="p-8 bg-white border-t border-slate-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 p-3 pl-6 rounded-3xl border border-slate-200/50 focus-within:bg-white focus-within:ring-4 ring-amber-50 transition-all">
                <label className="p-2 cursor-pointer hover:bg-slate-200 rounded-xl transition-all">
                   <Paperclip className="w-5 h-5 text-slate-400" />
                   <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file || !selectedChat) return;
                      const formData = new FormData();
                      formData.append('action', 'upload');
                      formData.append('image', file);
                      formData.append('leadId', selectedChat.id);
                      formData.append('sender', 'agent');
                      formData.append('agentId', user.id);
                      formData.append('agentName', user.name);
                      try {
                        const res = await axios.post(`${API_BASE_URL}/conversations.php?action=upload`, formData, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } });
                        if (res.data.url) {
                          setMessages(p => [...p, { sender_type: 'agent', content: 'Sent an image', image: res.data.url, created_at: new Date() }]);
                        }
                      } catch (err) { console.error(err); }
                   }} />
                </label>
                <input
                  type="text"
                  placeholder={selectedChat.chat_status === 'ended' ? "This chat has ended. Read-only view." : "Type your reply here..."}
                  disabled={selectedChat.chat_status === 'ended'}
                  className="flex-1 bg-transparent border-none text-sm font-bold outline-none text-slate-900 disabled:opacity-50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || selectedChat.chat_status === 'ended'}
                  className="bg-amber-500 text-white p-4 rounded-2xl shadow-xl shadow-amber-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 relative">
                <MessageSquare className="w-12 h-12 text-slate-200" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <Search className="w-4 h-4 text-amber-600" />
                </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Chat Archives</h3>
            <p className="max-w-xs text-slate-400 font-medium leading-relaxed">
              Select a conversation from the sidebar to review full transcripts, system events, and visitor activity.
            </p>
          </div>
        )}
      </div>

      {/* Right Panel: Visitor Metadata */}
      {selectedChat && (
        <aside className="w-96 border-l border-slate-50 bg-white flex flex-col overflow-y-auto no-scrollbar">
          <div className="p-10 text-center border-b border-slate-50">
            <div className="w-24 h-24 rounded-[2.5rem] bg-amber-50 flex items-center justify-center text-amber-600 font-black text-3xl mx-auto mb-6 shadow-xl shadow-amber-50 border-4 border-white">
              {selectedChat.visitor_uid?.slice(-2)}
            </div>
            <h4 className="font-black text-xl text-slate-900 mb-1">{selectedChat.visitor_uid}</h4>
            <div className="flex items-center justify-center gap-2">
                <Globe className="w-3 h-3 text-slate-400" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{selectedChat.domain}</p>
            </div>
          </div>

          <div className="p-10 space-y-12">
            <section>
              <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-300 mb-6 flex items-center gap-2">
                <User className="w-3 h-3" /> Identity Details
              </h5>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone / Lead ID</span>
                  <span className="text-sm font-bold text-slate-900">{selectedChat.phone || 'Anonymous'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Source</span>
                  <span className="text-sm font-bold text-slate-900 truncate">Organic / {selectedChat.domain}</span>
                </div>
              </div>
            </section>

            <section>
              <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-300 mb-6 flex items-center gap-2">
                <Paperclip className="w-3 h-3" /> Internal Notes
              </h5>
              <div className="space-y-4">
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write a private note about this lead..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 ring-amber-50 transition-all"
                    rows="4"
                />
                <button 
                    onClick={handleSaveNotes}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg"
                >
                    Persist Note
                </button>
              </div>
            </section>

            <section>
              <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-300 mb-6 flex items-center gap-2">
                <History className="w-3 h-3" /> Previous Conversations
              </h5>
              {visitorHistory.length === 0 ? (
                <p className="text-xs font-bold text-slate-300 italic">No previous history found.</p>
              ) : (
                <div className="space-y-4">
                  {visitorHistory.map((h, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedChat(h)}
                      className="w-full text-left p-4 rounded-2xl border border-slate-50 hover:border-amber-100 hover:bg-amber-50/30 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-amber-600">ID: {h.id}</span>
                        <span className="text-[10px] font-bold text-slate-400">{format(new Date(h.created_at), 'MMM d')}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-amber-700">{h.last_message || 'Closed ticket'}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </aside>
      )}
    </div>
  );
}

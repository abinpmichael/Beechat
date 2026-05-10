import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Phone, User, Mail, ChevronRight, MessageSquare, PhoneOff, Image, FileText, Bot, CheckCircle, Clock, Shield, Radio, Globe, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost/Bee/server/api';
const HEARTBEAT_INTERVAL = 20000; // 20 seconds
const OFFLINE_TIMEOUT    = 60;    // seconds — must match backend

export default function ChatWidget({ apiKey }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [branding, setBranding]     = useState({ 
    name:'Bee Bot', 
    image:'/logo.png', 
    color:'#6366f1', 
    welcome:'Hello! How can we help?', 
    subtitle:'Support Assistant', 
    success:'Thank you! We will be in touch.',
    headerBg: null,
    sound: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    icon: null
  });
  const [steps, setSteps]           = useState([]);
  const [stepId, setStepId]         = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [formData, setFormData]     = useState({ name:'', email:'', phone:'' });
  const [isTyping, setIsTyping]     = useState(false);
  const [isLive, setIsLive]         = useState(false);
  const [chatStatus, setChatStatus] = useState('lead'); // lead | waiting | active | ended
  const [leadId, setLeadId]         = useState(null);
  const [surveyDone, setSurveyDone] = useState(false);

  const [notification, setNotification] = useState(null);
  const [lastSeenMsgId, setLastSeenMsgId] = useState(0);

  const sessionRef  = useRef(null);
  const leadIdRef   = useRef(null);   // ref copy so interval always sees latest
  const scrollRef   = useRef(null);
  const surveyDataRef = useRef({});
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

  // keep ref in sync
  useEffect(() => { leadIdRef.current = leadId; }, [leadId]);
  useEffect(() => {
    if (branding.sound) {
      audioRef.current.src = branding.sound;
    }
  }, [branding.sound]);

  // Notify parent iframe to resize
  const notifyParent = useCallback((type) => {
    try {
      window.parent.postMessage({ source: 'bee-chat-widget', type }, '*');
    } catch { /* standalone mode — no parent */ }
  }, []);

  // Open/close with resize signal
  const openChat  = useCallback(() => { setIsOpen(true);  notifyParent('open');  }, [notifyParent]);
  const closeChat = useCallback(() => { setIsOpen(false); notifyParent('close'); }, [notifyParent]);

  useEffect(() => {
    notifyParent('close');
  }, [notifyParent]);

  /* ── AUTO SCROLL ─────────────────────────────────────── */
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  /* ── INITIALIZE SESSION & RESUME ────────────────────── */
  useEffect(() => {
    // Persistent Device Identifier
    let sid = localStorage.getItem(`bee_device_id`);
    if (!sid) {
      sid = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(`bee_device_id`, sid);
    }
    sessionRef.current = sid;

    // Check for existing lead to resume chat
    fetch(`${API}/leads.php?action=check_session&sessionId=${sid}&apiKey=${encodeURIComponent(apiKey)}`)
      .then(r => r.json())
      .then(res => {
        if (res.id) {
          setLeadId(res.id);
          leadIdRef.current = res.id;
          setIsLive(res.is_live);
          setChatStatus(res.chat_status || 'lead');
          setSurveyDone(true);
          
          // FETCH OLD MESSAGES
          fetch(`${API}/conversations.php?leadId=${res.id}&apiKey=${encodeURIComponent(apiKey)}&sessionId=${sid}`)
            .then(r => r.json())
            .then(rows => {
              if (!Array.isArray(rows)) return;
              const mapped = rows.map(r => ({
                role: r.sender_type === 'agent' ? 'agent' : 'visitor',
                text: r.content,
                id: r.id
              }));
              setMessages(mapped);
              if (mapped.length > 0) {
                const last = mapped[mapped.length - 1];
                if (last.id) setLastSeenMsgId(last.id);
              }
            });
        }
      })
      .catch(() => {});

    // Load branding
    fetch(`${API}/chat.php?action=get_branding&apiKey=${encodeURIComponent(apiKey)}`)
      .then(r => r.json())
      .then(d => {
        if (!d || d.error) return;
        setBranding({
          name:     d.bot_name        || 'Bee Bot',
          image:    d.bot_image       || '/logo.png',
          color:    d.theme_color     || '#6366f1',
          welcome:  d.welcome_message || 'Hello! How can we help?',
          subtitle: d.bot_subtitle    || 'Support Assistant',
          success:  d.success_message || 'Thank you! We will be in touch.',
          headerBg: d.header_bg_gradient || null,
          sound:    d.notification_sound || 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
          icon:     d.widget_icon || null,
          is_open:  d.is_open !== false,
          opening:  d.opening_time || '00:00:00',
          closing:  d.closing_time || '23:59:59',
          form_config: d.form_config ? (typeof d.form_config === 'string' ? JSON.parse(d.form_config) : d.form_config) : [
            { label: "Full Name", name: "name", required: true },
            { label: "Email Address", name: "email", required: true },
            { label: "Phone Number", name: "phone", required: false }
          ]
        });
        
        // Auto-inject offline message if closed
        if (d.is_open === false) {
           setTimeout(() => {
             addMsg('bot', `🕰️ We are currently offline. Our business hours are ${d.opening_time} - ${d.closing_time}. Please leave your details and we will get back to you!`);
           }, 1000);
        }
      })
      .catch(() => {});
  }, [apiKey]);

  /* ── OPEN CHAT → setup initial messages if new ───────── */
  useEffect(() => {
    if (!isOpen) {
      setNotification(null); // Clear notification when opening
      return;
    }
  }, [isOpen]);

  const initChat = useCallback((sid) => {
    fetch(`${API}/chat.php?action=get_branding&apiKey=${encodeURIComponent(apiKey)}`)
      .then(r => r.json())
      .then(d => {
        if (!d) return;
        let parsed = [];
        if (d.survey_config) {
          parsed = typeof d.survey_config === 'string' ? JSON.parse(d.survey_config) : d.survey_config;
        }
        setSteps(parsed);
        const welcome = d.is_open ? (d.welcome_message || 'Hello!') : "👋 We're currently closed, but you can leave a message below and we'll get back to you!";
        const init = [{ role:'bot', text: welcome }];
        if (parsed.length > 0) {
          init.push({ role:'bot', text: parsed[0].question });
          setStepId(parsed[0].id);
        }
        setMessages(init);
        setBranding(prev => ({ ...prev, ...d, headerBg: d.color }));
      });
  }, [apiKey]);

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;
    initChat(sessionRef.current);
  }, [isOpen, initChat]);

  const handleResetChat = () => {
    if (!window.confirm("Start a fresh conversation? Your previous messages will be saved for our team.")) return;
    
    // 1. Clear local state
    setMessages([]);
    setLeadId(null);
    leadIdRef.current = null;
    setChatStatus('lead');
    setIsLive(false);
    setSurveyDone(false);
    setStepId(null);
    setLastSeenMsgId(0);
    setNotification(null);
    
    // 2. Generate NEW session ID
    const newSid = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(`bee_device_id`, newSid);
    sessionRef.current = newSid;

    // 3. Re-init
    initChat(newSid);
  };

  /* ── HEARTBEAT: ping every 20s while widget is open ─────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const ping = () => {
      const sid = sessionRef.current;
      if (!sid || !apiKey) return;
      fetch(`${API}/heartbeat.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, apiKey }),
      }).catch(() => {});
    };
    // First ping after 1s (session may still be initializing)
    const init = setTimeout(ping, 1000);
    const t    = setInterval(ping, HEARTBEAT_INTERVAL);
    return () => { clearTimeout(init); clearInterval(t); };
  }, [isOpen, apiKey]);

  /* ── LIVE CHAT: poll even if closed for notifications ── */
  useEffect(() => {
    if (!isLive) return;
    const tick = setInterval(() => {
      const lid = leadIdRef.current;
      const sid = sessionRef.current;
      if (!lid || !sid) return;
      fetch(`${API}/conversations.php?leadId=${lid}&apiKey=${encodeURIComponent(apiKey)}&sessionId=${sid}`)
        .then(r => r.json())
        .then(rows => {
          if (!Array.isArray(rows)) return;
          
          // Sync Chat Status from first row if possible or from polling
          if (rows.length > 0) {
             // In a real app we'd fetch the lead status too, but we'll infer it from agents being present
             const hasAgent = rows.some(r => r.sender_type === 'agent' && !r.content.includes('ended'));
             const isEnded  = rows.some(r => r.content.includes('ended'));
             if (isEnded) setChatStatus('ended');
             else if (hasAgent) setChatStatus('active');
          }

          const agentMsgs = rows.filter(r => r.sender_type === 'agent');
          
          // Check for notifications
          if (!isOpen && agentMsgs.length > 0) {
            const latest = agentMsgs[agentMsgs.length - 1];
            if (latest.id > lastSeenMsgId) {
              setNotification(latest.content);
              setLastSeenMsgId(latest.id);
              if (branding.sound !== 'off') {
                audioRef.current.play().catch(() => {});
              }
            }
          }

          setMessages(prev => {
            const dbMapped = rows.map(r => ({
              role: r.sender_type === 'agent' ? 'agent' : 'visitor_db',
              text: r.content,
              id: r.id,
            }));
            const prevAgentIds = new Set(prev.filter(m => m.id).map(m => m.id));
            const newAgentMsgs = dbMapped.filter(m => m.role === 'agent' && !prevAgentIds.has(m.id));
            if (newAgentMsgs.length === 0) return prev;
            
            // Update last seen ID for notification tracking
            const maxId = Math.max(...newAgentMsgs.map(m => m.id));
            if (maxId > lastSeenMsgId) setLastSeenMsgId(maxId);
            
            return [...prev, ...newAgentMsgs];
          });
        })
        .catch(() => {});
    }, 2000);
    return () => clearInterval(tick);
  }, [isLive, isOpen, lastSeenMsgId]);

  /* ── HELPERS ─────────────────────────────────────────── */
  const addMsg = useCallback((role, text) => setMessages(p => [...p, { role, text }]), []);

  const submitLead = useCallback((data, live = false) => {
    const phone = data.phone || data.email || 'Visitor';
    const subject = `Inquiry from ${phone}`;

    fetch(`${API}/leads.php`, {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        apiKey, 
        sessionId: sessionRef.current, 
        phone: phone, 
        details: { ...data, is_ticket: 1, subject: subject } 
      }),
    })
    .then(r => r.json())
    .then(res => {
      if (res.id) {
        setLeadId(res.id);
        leadIdRef.current = res.id;
        setChatStatus(live ? 'waiting' : 'lead');
        if (live) {
          addMsg('bot', '🎟️ Ticket raised! An agent will be with you shortly.');
        }
      }
    })
    .catch(console.error);
  }, [apiKey, addMsg]);

  const handleEndChat = async () => {
    if (!leadId) return;
    try {
      await fetch(`${API}/conversations.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end_chat', leadId, agentName: 'Visitor' })
      });
      setChatStatus('ended');
      setIsLive(false);
      addMsg('bot', '🔴 You have ended the chat. This ticket is now marked as resolved.');
    } catch (e) { console.error(e); }
  };

  /* ── STEP ACTION (button click) ──────────────────────── */
  const handleStep = useCallback((label, next) => {
    addMsg('visitor', label);
    surveyDataRef.current[stepId] = label;

    if (next === 'human') {
      if (!branding.is_open) {
        addMsg('bot', "Our agents are currently offline. Please finish the survey and we will email you back as soon as we're online!");
        // Redirect them to the first text step or just let them finish
        return;
      }
      addMsg('bot', 'Connecting you to a live agent… Please hold on.');
      setIsLive(true);
      setSurveyDone(true);
      setStepId(null);
      submitLead({ ...surveyDataRef.current, status:'human_requested' }, true);
      return;
    }
    if (!next || next === 'finish') {
      submitLead({ ...surveyDataRef.current });
      setSurveyDone(true);
      setStepId(null);
      setIsTyping(true);
      setTimeout(() => { addMsg('bot', branding.success); setIsTyping(false); }, 700);
      return;
    }
    const nxt = steps.find(s => s.id === next);
    if (nxt) {
      setStepId(next);
      setIsTyping(true);
      setTimeout(() => { addMsg('bot', nxt.question); setIsTyping(false); }, 700);
    }
  }, [stepId, steps, branding.success, addMsg, submitLead]);

  /* ── FORM SUBMIT ─────────────────────────────────────── */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    
    // Save to surveyDataRef for later submission
    surveyDataRef.current = { ...surveyDataRef.current, ...data };
    
    // Show summary in chat
    const summary = Object.values(data).join(' | ');
    handleStep(summary, step.next);
  };

  /* ── FREE-TYPE SEND ──────────────────────────────────── */
  const handleSend = (e, contentOverride = null) => {
    if (e) e.preventDefault();
    const text = contentOverride || input.trim();
    if (!text) return;
    if (!contentOverride) setInput('');
    addMsg('visitor', text);

    if (isLive && leadIdRef.current) {
      fetch(`${API}/conversations.php`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'send', leadId: leadIdRef.current, sender:'visitor', content: text }),
      }).catch(console.error);
      return;
    }

    // text-type survey step
    const step = steps.find(s => s.id === stepId);
    if (step && step.type === 'text') { handleStep(text, step.next); return; }

    // generic bot fallback
    setIsTyping(true);
    fetch(`${API}/chat.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ apiKey, message: text, sessionId: sessionRef.current, isOffline: !branding.is_open }),
    }).then(r => r.json()).then(d => { 
      setIsTyping(false); 
      if (d.content) addMsg('bot', d.content); 
      if (d.lead_id) setLeadId(d.lead_id); // Sync lead if created on first message
    }).catch(() => setIsTyping(false));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost/Bee/server/api/upload.php', { method:'POST', body: formData });
      const d = await res.json();
      if (d.url) handleSend(null, d.url);
    } catch { /* fail silent */ }
  };

  const submitRaisedForm = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    handleSend(null, `📝 Form Data: ${JSON.stringify(data)}`);
    // Also update lead details
    fetch(`${API}/leads.php`, {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, sessionId: sessionRef.current, details: data })
    });
  };

  /* ── RENDER STEP UI ──────────────────────────────────── */
  const renderStep = () => {
    if (isLive || surveyDone || isTyping || !stepId) return null;
    const step = steps.find(s => s.id === stepId);
    if (!step) return null;

    if (step.type === 'options') return (
      <div className="grid grid-cols-1 gap-2 mt-3">
        {(step.options || []).map((opt, i) => (
          <button key={i} onClick={() => handleStep(opt.label, opt.next)} className="survey-btn group">
            {opt.label} <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        ))}
        <button onClick={() => handleStep('Talk to a Human Agent', 'human')} className="survey-btn" style={{borderColor: branding.color, color: branding.color, background:'rgba(99,102,241,0.05)'}}>
          🎧 Talk to a Human Agent
        </button>
      </div>
    );

    if (step.type === 'form') return (
      <form onSubmit={handleFormSubmit} className="mt-3 p-4 bg-white rounded-3xl border border-slate-100 space-y-3 shadow-sm">
        {(step.fields || [
          { label: "Full Name", name: "name", required: true },
          { label: "Email Address", name: "email", required: true },
          { label: "Phone Number", name: "phone", required: false }
        ]).map((f, i) => (
          <div key={i} className="relative">
            <input 
              name={f.name}
              required={f.required} 
              placeholder={f.label} 
              className="w-full px-4 py-2 bg-slate-50 rounded-xl text-sm outline-none font-bold border border-transparent focus:border-indigo-100 focus:bg-white transition-all" 
            />
          </div>
        ))}
        <button type="submit" className="w-full py-2.5 text-white font-black rounded-xl text-xs uppercase tracking-widest" style={{backgroundColor:branding.color}}>Submit Details</button>
      </form>
    );
    return null;
  };

  /* ── JSX ─────────────────────────────────────────────── */
  return (
    <div className="relative font-sans flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:20 }}
            className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-slate-50/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white"
          >
            {/* Header */}
            <header 
              className="p-6 text-white flex flex-col gap-3" 
              style={{background: branding.headerBg || `linear-gradient(135deg,${branding.color} 0%,${branding.color}cc 100%)`}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg overflow-hidden text-slate-900">
                    <img src={branding.image} className="w-full h-full object-cover" alt="bot"/>
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">{branding.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-75 flex items-center gap-1">
                      {branding.is_open ? (
                        <><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active Now</>
                      ) : (
                        <><div className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Currently Away</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chatStatus !== 'ended' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(window.confirm('End this chat session?')) handleEndChat(); }}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
                    >
                      <PhoneOff className="w-3 h-3" /> End
                    </button>
                  )}
                  <button onClick={closeChat} className="p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6"/></button>
                </div>
              </div>

              {leadId && (
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">Ticket ID: {leadId}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    chatStatus === 'ended' ? 'bg-emerald-400 text-emerald-950' : 
                    chatStatus === 'active' ? 'bg-indigo-400 text-indigo-950' : 'bg-amber-400 text-amber-950'
                  }`}>
                    {chatStatus === 'ended' ? 'Resolved' : chatStatus === 'active' ? 'In Progress' : 'Pending Review'}
                  </span>
                </div>
              )}
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {messages.map((msg, i) => {
                const right = msg.role === 'visitor';
                const isAgent = msg.role === 'agent';
                
                // --- Contrast Check ---
                const isDark = (color) => {
                  if (!color) return true;
                  const c = color.replace('#','');
                  const r = parseInt(c.substring(0,2), 16);
                  const g = parseInt(c.substring(2,4), 16);
                  const b = parseInt(c.substring(4,6), 16);
                  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                  return brightness < 155;
                };
                const bubbleTextColor = right ? (isDark(branding.color) ? 'text-white' : 'text-slate-900') : (isAgent ? 'text-white' : 'text-slate-700');
                // ---------------------

                return (
                  <div key={i} className={`flex ${right ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-3xl text-sm font-medium shadow-sm ${bubbleTextColor} ${
                      right ? '' : isAgent ? 'bg-indigo-600' : 'bg-white border border-slate-100'
                    }`} style={right ? {backgroundColor: branding.color} : {}}>
                      {msg.text.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img src={msg.text} alt="Upload" className="max-w-full rounded-lg cursor-pointer" onClick={() => window.open(msg.text)} />
                      ) : msg.text === '[FORM:DATA_REQUEST]' ? (
                        <form onSubmit={submitRaisedForm} className="space-y-3 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm mt-1">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5"/> Complete this form
                          </p>
                          {(branding.form_config || []).map((field, idx) => (
                            <input 
                              key={idx}
                              name={field.name} 
                              placeholder={field.label} 
                              required={field.required} 
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none focus:ring-2 ring-indigo-50" 
                            />
                          ))}
                          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-black hover:bg-indigo-700 transition-all">Submit Details</button>
                        </form>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-3xl border border-slate-100 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"/>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.15s]"/>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.3s]"/>
                  </div>
                </div>
              )}
              {renderStep()}
              {chatStatus === 'ended' && (
                <div className="flex flex-col items-center gap-3 py-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900">Conversation Resolved</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Need something else?</p>
                  </div>
                  <button 
                    onClick={handleResetChat}
                    className="mt-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-xs hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Start New Conversation
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-50 p-2 pl-2 rounded-2xl border border-slate-100 focus-within:border-indigo-200 focus-within:bg-white transition-all">
                <label className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-all shrink-0">
                  <Image className="w-5 h-5"/>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                <input
                  placeholder={isLive ? 'Type message to agent…' : 'Type your message…'}
                  className="flex-1 bg-transparent border-none text-sm font-medium outline-none text-slate-700"
                  value={input} onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="p-2.5 rounded-xl text-white transition-all hover:scale-105 active:scale-95" style={{backgroundColor:branding.color}}>
                  <Send className="w-5 h-5"/>
                </button>
              </form>
              
              {branding.plan_name !== 'Enterprise' && (
                <div className="py-2 text-center border-t border-slate-50 bg-slate-50/50">
                  <a href="#" className="text-[9px] font-black text-slate-300 hover:text-indigo-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-1">
                    Powered by <span className="text-indigo-300">Bee Chat</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Nudge */}
      <AnimatePresence>
        {notification && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={openChat}
            className="absolute bottom-20 right-0 w-64 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{branding.name}</p>
                <p className="text-xs font-bold text-slate-800 line-clamp-2">{notification}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setNotification(null); }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble */}
      <button
        onClick={() => isOpen ? closeChat() : openChat()}
        className="w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 relative overflow-hidden"
        style={{background: branding.headerBg || `linear-gradient(135deg,${branding.color} 0%,${branding.color}cc 100%)`}}
      >
        {isOpen ? <X className="w-8 h-8"/> : (
          branding.icon ? <img src={branding.icon} className="w-8 h-8 object-contain" alt="icon" /> : <MessageSquare className="w-8 h-8"/>
        )}
        {notification && !isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-white animate-bounce" />}
      </button>

      <style>{`
        .survey-btn{background:white;border:1px solid #f1f5f9;padding:12px 16px;border-radius:16px;font-size:13px;font-weight:700;color:#475569;text-align:left;display:flex;align-items:center;justify-content:space-between;transition:all 0.2s;width:100%;}
        .survey-btn:hover{background:#f8fafc;transform:translateX(3px);}
        .custom-scrollbar::-webkit-scrollbar{width:4px;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:10px;}
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}

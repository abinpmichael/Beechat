import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Phone, User, Mail, ChevronRight, MessageSquare, PhoneOff, Image, FileText, Bot, CheckCircle, Clock, Shield, Radio, Globe, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, SOCKET_URL } from '../config';
import { io } from 'socket.io-client';

const API = API_BASE_URL;
const HEARTBEAT_INTERVAL = 20000;
const OFFLINE_TIMEOUT    = 60;

// --- TOP-VIEW BEE ---
const TopBee = ({ size = 40, animated = true }) => {
  const [isDarting, setIsDarting] = useState(false);
  
  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsDarting(true);
        setTimeout(() => setIsDarting(false), 600);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [animated]);

  return (
    <motion.svg 
      width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { 
        y: isDarting ? [0, -15, 0] : [0, -4, 0],
        x: isDarting ? [0, 8, -5, 0] : [0, 1, -1, 0],
        rotate: isDarting ? [0, 5, -5, 0] : [0, 1, -1, 0],
        filter: ["drop-shadow(0 0 0px rgba(245,158,11,0))", "drop-shadow(0 0 25px rgba(245,158,11,0.6))", "drop-shadow(0 0 0px rgba(245,158,11,0))"]
      } : {}}
      transition={{ duration: isDarting ? 0.6 : 3, repeat: isDarting ? 0 : Infinity, ease: "easeInOut" }}
      style={{ overflow: 'visible' }}
    >
      <circle cx="60" cy="60" r="50" fill="url(#honeyGlowWidgetLive)" opacity="0.25" />
      {animated && [...Array(6)].map((_, i) => (
        <motion.circle key={i} r="0.6" fill="#FDE68A"
          animate={{ scale: [0, 1, 0], opacity: [0, 0.6, 0], x: [60, 60 + (Math.random() - 0.5) * 120], y: [80, 120] }}
          transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}
      <motion.g animate={animated ? { rotate: [-18, 18], scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M55 45C30 10 0 20 10 50C20 80 55 60 55 45Z" fill="url(#wingGradWidgetLive)" fillOpacity="0.45" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />
        <path d="M45 42L25 32M40 45L20 45M35 48L25 55" stroke="white" strokeOpacity="0.1" strokeWidth="0.3" />
      </motion.g>
      <g stroke="#1A1A11" strokeWidth="2.5" strokeLinecap="round">
        <motion.path animate={animated ? { rotate: [-5, 5] } : {}} d="M42 75L35 88L30 95" />
        <motion.path animate={animated ? { rotate: [4, -4] } : {}} d="M58 80L55 95L52 105" />
        <motion.path animate={animated ? { rotate: [-4, 4] } : {}} d="M78 75L85 95L90 102" />
      </g>
      <motion.g animate={animated ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M35 50C35 35 65 35 75 55C75 75 65 85 45 85C25 85 35 65 35 50Z" fill="#2D2D2A" filter="url(#fuzzFilterWidgetLive)" />
        <motion.path animate={animated ? { scaleX: [1, 1.03, 1] } : {}} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} d="M55 55C55 40 85 35 110 55C130 75 110 105 80 105C55 105 55 75 55 55Z" fill="url(#bodyGradWidgetLive)" />
      </motion.g>
      <g opacity="0.9">
        <path d="M70 42Q78 39 86 42L84 102Q76 105 68 102Z" fill="#1A1A11" />
        <path d="M90 47Q97 45 104 49L102 90Q95 95 88 90Z" fill="#1A1A11" />
        <path d="M106 58L114 62" stroke="#1A1A11" strokeWidth="4" strokeLinecap="round" />
      </g>
      <motion.g animate={animated ? { rotate: [-2, 2] } : {}} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx="30" cy="55" r="15" fill="#1A1A11" />
        <g>
          <circle cx="22" cy="54" r="10" fill="#0A0A0A" />
          <circle cx="22" cy="54" r="10" fill="url(#eyeFacetWidgetLive)" fillOpacity="0.2" />
          <circle cx="18" cy="50" r="3" fill="white" fillOpacity="0.7" />
          <circle cx="24" cy="56" r="1.5" fill="#BAE6FD" fillOpacity="0.4" />
        </g>
        <motion.g animate={animated ? { rotate: [-10, 10] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ originX: '30px', originY: '45px' }}>
          <path d="M28 43C25 30 18 25 10 28" stroke="#1A1A11" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M32 43C35 30 42 25 50 28" stroke="#1A1A11" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </motion.g>
      </motion.g>
      <motion.g animate={animated ? { rotate: [18, -18], scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.035, repeat: Infinity }}>
        <path d="M65 50C75 10 120 25 110 65C100 105 65 75 65 50Z" fill="url(#wingGradWidgetLive)" fillOpacity="0.65" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
        <path d="M75 45L100 25M85 55L115 45M90 65L110 60" stroke="white" strokeOpacity="0.15" strokeWidth="0.3" />
      </motion.g>
      <defs>
        <filter id="fuzzFilterWidgetLive" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
        <pattern id="eyeFacetWidgetLive" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
          <path d="M1.5 0L3 0.866V2.598L1.5 3.464L0 2.598V0.866L1.5 0Z" fill="white" />
        </pattern>
        <linearGradient id="bodyGradWidgetLive" x1="55" y1="55" x2="110" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" /><stop offset="0.4" stopColor="#FBBF24" /><stop offset="0.7" stopColor="#D97706" /><stop offset="1" stopColor="#451A03" />
        </linearGradient>
        <radialGradient id="wingGradWidgetLive" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(65 50) rotate(90) scale(50)">
          <stop stopColor="white" /><stop offset="0.5" stopColor="#E0F2FE" stopOpacity="0.6" /><stop offset="1" stopColor="#BAE6FD" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="honeyGlowWidgetLive" cx="60" cy="60" r="50">
          <stop stopColor="#FBBF24" stopOpacity="0.6" /><stop offset="1" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
};

const DynamicForm = ({ formConfig, onSubmit, color, isSubmitted }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fields = (formConfig && formConfig.length > 0) ? formConfig : [
    { id: '1', name: 'name', label: 'Name', type: 'text', required: true },
    { id: '2', name: 'email', label: 'Email', type: 'email', required: true },
    { id: '3', name: 'phone', label: 'Phone', type: 'tel', required: false }
  ];

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 text-xs font-bold w-full mt-2">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span>Details submitted successfully!</span>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        setError(`${field.label} is required.`);
        return;
      }
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-5 bg-white border border-slate-100 rounded-3xl shadow-md mt-2 w-full text-slate-800 pointer-events-auto">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Please provide your details</div>
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
            {field.label} {field.required && <span className="text-rose-500">*</span>}
          </label>
          <input
            type={field.type || 'text'}
            required={!!field.required}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:border-amber-500 transition-all text-slate-800"
            placeholder={field.label.toUpperCase()}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        </div>
      ))}
      {error && <div className="text-[10px] font-bold text-rose-500">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-amber-500 active:scale-[0.98] flex items-center justify-center gap-2"
        style={{ backgroundColor: color }}
      >
        {loading ? 'Submitting...' : 'Submit Details'}
      </button>
    </form>
  );
};

export default function ChatWidget({ apiKey }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [branding, setBranding]     = useState({ 
    tenant_id: null,
    country: 'United States',
    name:'Bee Bot', 
    image: null, 
    color:'#f59e0b', 
    welcome:'Hello! How can we help?', 
    subtitle:'Support Assistant', 
    success:'Thank you! We will be in touch.',
    headerBg: null,
    sound: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    icon: null,
    form_config: []
  });
  const [idleTimer, setIdleTimer] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isUploading, setIsUploading] = useState(false);
  const [steps, setSteps]           = useState([]);
  const [stepId, setStepId]         = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [isLive, setIsLive]         = useState(false);
  const [chatStatus, setChatStatus] = useState('lead');
  const [leadId, setLeadId]         = useState(null);
  const [surveyDone, setSurveyDone] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lastSeenMsgId, setLastSeenMsgId] = useState(0);
  const [ticketFormVisible, setTicketFormVisible] = useState(false);
  const [ticketData, setTicketData] = useState({ subject: '', message: '', email: '', phone: '', videoCallType: 'none' });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const [assignedAgent, setAssignedAgent] = useState(() => {
    try {
      const stored = localStorage.getItem(`bee_assigned_agent_${apiKey}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [submittedForms, setSubmittedForms] = useState({});


  const sessionRef  = useRef(null);
  const leadIdRef   = useRef(null);
  const scrollRef   = useRef(null);
  const surveyDataRef = useRef({});
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));
  const widgetLoadTime = useRef(Date.now());
  const socketRef = useRef(null);

  useEffect(() => { leadIdRef.current = leadId; }, [leadId]);
  useEffect(() => {
    if (branding.sound) audioRef.current.src = branding.sound;
  }, [branding.sound]);

  // --- IDLE TIMER LOGIC ---
  useEffect(() => {
    if (!isOpen || !branding.is_open) return;
    const interval = setInterval(() => {
      const diff = (Date.now() - lastActivity) / 1000;
      if (diff >= 30 && !surveyDone) {
        setMessages(prev => {
           if (prev.some(m => m.isIdle)) return prev;
           return [...prev, { role: 'bot', text: "Need a little inspiration? Take a look at our recent projects: [View Portfolio]", isIdle: true }];
        });
        setLastActivity(Date.now()); // Reset to avoid spam
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, lastActivity, surveyDone, branding.is_open]);

  const recordActivity = () => setLastActivity(Date.now());

  const notifyParent = useCallback((type) => {
    try { window.parent.postMessage({ source: 'bee-chat-widget', type }, '*'); } catch { }
  }, []);

  const openChat  = useCallback(() => { setIsOpen(true);  notifyParent('open'); recordActivity(); }, [notifyParent]);
  const closeChat = useCallback(() => { setIsOpen(false); notifyParent('close'); }, [notifyParent]);

  useEffect(() => { notifyParent('close'); }, [notifyParent]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    let sid = localStorage.getItem(`bee_device_id`);
    if (!sid) {
      sid = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(`bee_device_id`, sid);
    }
    sessionRef.current = sid;

    const sessionPromise = fetch(`${API}/leads.php?action=check_session&sessionId=${sid}&apiKey=${encodeURIComponent(apiKey)}`)
      .then(r => r.json());

    const brandingPromise = fetch(`${API}/chat.php?action=get_branding&apiKey=${encodeURIComponent(apiKey)}`)
      .then(r => r.json());

    Promise.all([sessionPromise, brandingPromise])
      .then(([res, d]) => {
        if (d && !d.error) {
          let forms = [];
          try {
            forms = d.form_config ? (typeof d.form_config === 'string' ? JSON.parse(d.form_config) : d.form_config) : [];
          } catch (e) { forms = []; }
          setBranding({
            tenant_id: d.tenant_id,
            country:  d.country || 'United States',
            name:     d.bot_name        || 'Bee Bot',
            image:    d.bot_image       || null,
            color:    d.theme_color     || '#f59e0b',
            welcome:  d.welcome_message || 'Hello! How can we help?',
            subtitle: d.bot_subtitle    || 'Support Assistant',
            success:  d.success_message || 'Thank you! We will be in touch.',
            headerBg: d.header_bg_gradient || null,
            sound:    d.notification_sound || 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
            icon:     d.widget_icon || null,
            is_open:  d.is_open !== false,
            enable_live_chat: d.enable_live_chat,
            enable_ai_bot: d.enable_ai_bot,
            form_config: Array.isArray(forms) ? forms : []
          });
        }

        if (res.id) {
          setLeadId(res.id);
          leadIdRef.current = res.id;
          setIsLive(res.is_live);
          setChatStatus(res.chat_status || 'lead');

          const priority = d ? parseInt(d.survey_priority ?? 1) : 1;
          const surveyCompletedLocally = localStorage.getItem(`bee_survey_completed_${apiKey}_${sid}`) === 'true';
          const hasAgent = !!(res.assigned_to && res.agent_name);

          if (res.assigned_to && res.agent_name) {
            const agent = { id: res.assigned_to, name: res.agent_name };
            setAssignedAgent(agent);
            localStorage.setItem(`bee_assigned_agent_${apiKey}`, JSON.stringify(agent));
          } else {
            setAssignedAgent(null);
            localStorage.removeItem(`bee_assigned_agent_${apiKey}`);
          }

          if (priority === 1 && !surveyCompletedLocally && !hasAgent) {
            // Check conversation history first
            fetch(`${API}/conversations.php?leadId=${res.id}&apiKey=${encodeURIComponent(apiKey)}&sessionId=${sid}`)
              .then(r => r.json())
              .then(rows => {
                const hasConversations = Array.isArray(rows) && rows.length > 0;
                if (hasConversations) {
                  setSurveyDone(true);
                  const mapped = rows.map(r => ({ role: r.sender_type === 'agent' ? 'agent' : 'visitor', text: r.content, id: r.id, image: r.image }));
                  setMessages(mapped);
                  if (mapped.length > 0) setLastSeenMsgId(mapped[mapped.length-1].id);
                } else {
                  // No conversations and survey not completed: initialize survey
                  setSurveyDone(false);
                  let parsed = [];
                  if (d && d.survey_config) parsed = typeof d.survey_config === 'string' ? JSON.parse(d.survey_config) : d.survey_config;
                  setSteps(parsed);
                  const welcome = d.is_open ? (d.welcome_message || 'Hello!') : "👋 We're currently closed, but you can leave a message below!";
                  const init = [{ role:'bot', text: welcome }];
                  if (parsed.length > 0) {
                    init.push({ role:'bot', text: parsed[0].question, options: parsed[0].type === 'options' ? parsed[0].options : null });
                    setStepId(parsed[0].id);
                  }
                  setMessages(init);
                }
              })
              .catch(() => {
                setSurveyDone(true);
              });
          } else {
            setSurveyDone(true);
            fetch(`${API}/conversations.php?leadId=${res.id}&apiKey=${encodeURIComponent(apiKey)}&sessionId=${sid}`)
              .then(r => r.json())
              .then(rows => {
                if (!Array.isArray(rows)) return;
                const mapped = rows.map(r => ({ role: r.sender_type === 'agent' ? 'agent' : 'visitor', text: r.content, id: r.id, image: r.image }));
                setMessages(mapped);
                if (mapped.length > 0) setLastSeenMsgId(mapped[mapped.length-1].id);
              });
          }
        } else {
          setAssignedAgent(null);
          localStorage.removeItem(`bee_assigned_agent_${apiKey}`);
        }
      })
      .catch(err => {
        console.error("Initialization error:", err);
      });
  }, [apiKey]);

  const initChat = useCallback((sid) => {
    fetch(`${API}/chat.php?action=get_branding&apiKey=${encodeURIComponent(apiKey)}`)
      .then(r => r.json())
      .then(d => {
        if (!d) return;
        let parsed = [];
        if (d.survey_config) parsed = typeof d.survey_config === 'string' ? JSON.parse(d.survey_config) : d.survey_config;
        setSteps(parsed);
        const welcome = d.is_open ? (d.welcome_message || 'Hello!') : "👋 We're currently closed, but you can leave a message below!";
        const init = [{ role:'bot', text: welcome }];
        
        const priority = parseInt(d.survey_priority ?? 1);
        if (priority === 1 && parsed.length > 0) { 
           init.push({ role:'bot', text: parsed[0].question, options: parsed[0].type === 'options' ? parsed[0].options : null }); 
           setStepId(parsed[0].id); 
        } else {
           setSurveyDone(true);
           setChatStatus('ai');
           init.push({ role:'bot', text: "How can I help you today?" });
        }
        setMessages(init);
        let forms = [];
        try {
          forms = d.form_config ? (typeof d.form_config === 'string' ? JSON.parse(d.form_config) : d.form_config) : [];
        } catch (e) { forms = []; }
        setBranding(prev => ({ 
          ...prev, 
          ...d,
          form_config: Array.isArray(forms) ? forms : []
        }));
      });
  }, [apiKey]);

  useEffect(() => {
    if (isOpen && messages.length === 0) initChat(sessionRef.current);
  }, [isOpen, initChat, messages]);

  const handleResetChat = () => {
    if (!window.confirm("Start fresh?")) return;
    setMessages([]); setLeadId(null); leadIdRef.current = null; setChatStatus('lead'); setIsLive(false); setSurveyDone(false); setStepId(null); setLastSeenMsgId(0); setNotification(null);
    setAssignedAgent(null);
    localStorage.removeItem(`bee_assigned_agent_${apiKey}`);
    localStorage.removeItem(`bee_survey_completed_${apiKey}_${sessionRef.current}`);
    const newSid = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(`bee_device_id`, newSid); sessionRef.current = newSid; initChat(newSid);
  };

  // HTTP Heartbeat Backup
  useEffect(() => {
    if (!isOpen) return;
    const ping = () => {
      const sid = sessionRef.current;
      if (sid && apiKey) {
        const browser = navigator.userAgent;
        const device = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
        const page = window.location.href;
        fetch(`${API}/heartbeat.php`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ sessionId: sid, apiKey, browser, device, page }) 
        });
      }
    };
    const t = setInterval(ping, HEARTBEAT_INTERVAL); return () => clearInterval(t);
  }, [isOpen, apiKey]);

  // Socket.IO Real-time Messaging and Activity Reporting (Colony Pulse Map)
  useEffect(() => {
    const sid = sessionRef.current;
    if (!sid || !branding.tenant_id) return;

    // Connect to WebSockets
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsSocketConnected(false);
    });

    socket.on('connect_error', () => {
      console.log('Socket.IO connection error');
      setIsSocketConnected(false);
    });

    // Join visitor's room to receive real-time messages from agents
    socket.emit('join_visitor', sid);

    socket.on('message', (msg) => {
      if (msg.sender_type === 'agent') {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;

          // Play message received sound
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});

          if (msg.content.includes('ended')) {
            setChatStatus('ended');
          } else {
            setChatStatus('active');
          }

          if (!isOpen) {
            setNotification(msg.content);
          }

          return [...prev, { role: 'agent', text: msg.content, id: msg.id, image: msg.image }];
        });
      }
    });

    socket.on('chat_assigned', (data) => {
      setChatStatus('active');
      if (data.agentId && data.agentName) {
        const agent = { id: data.agentId, name: data.agentName };
        setAssignedAgent(agent);
        localStorage.setItem(`bee_assigned_agent_${apiKey}`, JSON.stringify(agent));
      }
      setMessages(prev => {
        if (prev.some(m => m.text && m.text.includes('has joined the chat'))) return prev;
        return [
          ...prev,
          { role: 'agent', text: `✅ Agent ${data.agentName} has joined the chat.` }
        ];
      });
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    });

    socket.on('chat_ended', (data) => {
      setChatStatus('ended');
      setAssignedAgent(null);
      localStorage.removeItem(`bee_assigned_agent_${apiKey}`);
      setMessages(prev => {
        if (prev.some(m => m.text && m.text.includes('ended by'))) return prev;
        return [
          ...prev,
          { role: 'agent', text: `🔴 The chat has been ended by ${data.agentName}.` }
        ];
      });
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    });

    socket.on('ticket_reply', (data) => {
      // Play sound for ticket replies too
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      
      setMessages(prev => [
        ...prev,
        { role: 'agent', text: `📧 Reply received for Ticket #${data.trackingId}: "${data.message}"` }
      ]);
    });

    // Report real-time activity metrics to Colony Pulse map every 5s
    const emitActivity = () => {
      const browser = /Chrome/i.test(navigator.userAgent) ? 'Chrome' : /Firefox/i.test(navigator.userAgent) ? 'Firefox' : /Safari/i.test(navigator.userAgent) ? 'Safari' : 'Edge';
      const device = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
      const page = window.location.pathname || '/';

      socket.emit('visitor_activity', {
        tenantId: branding.tenant_id,
        sessionId: sid,
        visitorUid: `Visitor (${sid.slice(-4)})`,
        country: branding.country || 'United States',
        browser,
        device,
        page,
        sessionDuration: Math.floor((Date.now() - widgetLoadTime.current) / 1000),
        ip: '127.0.0.1'
      });
    };

    emitActivity();
    const interval = setInterval(emitActivity, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
      setIsSocketConnected(false);
    };
  }, [branding.tenant_id, branding.country, isOpen]);

  // Fallback Polling for messages and session status updates
  useEffect(() => {
    // Only poll if the chat is open and we have a lead ID
    if (!isOpen || !leadId) return;

    const pollMessagesAndSession = () => {
      const sid = sessionRef.current;
      if (!sid || !leadId) return;

      // 1. Poll for messages
      fetch(`${API}/conversations.php?leadId=${leadId}&apiKey=${encodeURIComponent(apiKey)}&sessionId=${sid}`)
        .then(r => r.json())
        .then(rows => {
          if (!Array.isArray(rows)) return;
          
          setMessages(prev => {
            // Filter rows to only get agent messages that are not already in prev
            const newAgentMsgs = rows.filter(row => {
              return row.sender_type === 'agent' && !prev.some(m => m.id === row.id || (m.text === row.content && !m.id));
            });

            if (newAgentMsgs.length === 0) return prev;

            const mappedNew = newAgentMsgs.map(r => ({
              role: 'agent',
              text: r.content,
              id: r.id,
              image: r.image
            }));

            // Play sound and trigger notification if new agent message received
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
            
            if (!isOpen) {
              const lastNew = mappedNew[mappedNew.length - 1];
              setNotification(lastNew.text);
            }

            return [...prev, ...mappedNew];
          });
        })
        .catch(err => console.error("Error polling messages:", err));

      // 2. Poll for session status
      fetch(`${API}/leads.php?action=check_session&sessionId=${sid}&apiKey=${encodeURIComponent(apiKey)}`)
        .then(r => r.json())
        .then(res => {
          if (res.id) {
            setIsLive(res.is_live);
            
            // Check if chat status changed to ended
            setChatStatus(prevStatus => {
              if (prevStatus !== 'ended' && res.chat_status === 'ended') {
                setMessages(prevMsgs => {
                  if (prevMsgs.some(m => m.text && m.text.includes('ended by'))) return prevMsgs;
                  return [
                    ...prevMsgs,
                    { role: 'agent', text: `🔴 The chat has been ended by ${res.agent_name || 'Agent'}.` }
                  ];
                });
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
              return res.chat_status || 'lead';
            });

            // Check if agent assigned
            setAssignedAgent(prevAgent => {
              if (res.assigned_to && res.agent_name) {
                const newAgent = { id: res.assigned_to, name: res.agent_name };
                if (!prevAgent || prevAgent.id !== res.assigned_to) {
                  setMessages(prevMsgs => {
                    if (prevMsgs.some(m => m.text && m.text.includes('has joined the chat'))) return prevMsgs;
                    return [
                      ...prevMsgs,
                      { role: 'agent', text: `✅ Agent ${res.agent_name} has joined the chat.` }
                    ];
                  });
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().catch(() => {});
                  localStorage.setItem(`bee_assigned_agent_${apiKey}`, JSON.stringify(newAgent));
                  return newAgent;
                }
              } else if (!res.assigned_to && prevAgent) {
                localStorage.removeItem(`bee_assigned_agent_${apiKey}`);
                return null;
              }
              return prevAgent;
            });
          }
        })
        .catch(err => console.error("Error polling session status:", err));
    };

    pollMessagesAndSession();
    const interval = setInterval(pollMessagesAndSession, 4000);
    return () => clearInterval(interval);
  }, [isOpen, leadId, apiKey]);

  const addMsg = useCallback((role, text, image = null) => {
    setMessages(p => [...p, { role, text, image }]);
    if (role !== 'visitor') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);
  
  const handleImageUpload = async (e) => {
     const file = e.target.files[0];
     if (!file) return;
     setIsUploading(true);
     const formData = new FormData();
     formData.append('image', file);
     formData.append('apiKey', apiKey);
     formData.append('leadId', leadIdRef.current || '');
     formData.append('sessionId', sessionRef.current);
     formData.append('sender', 'visitor');

     try {
        const res = await fetch(`${API}/conversations.php?action=upload`, { method: 'POST', body: formData }).then(r => r.json());
        if (res.url) {
           addMsg('visitor', 'Sent an image', res.url);
           recordActivity();
        }
     } catch (err) { } finally { setIsUploading(false); }
  };

  const submitLead = useCallback((data, live = false) => {
    fetch(`${API}/leads.php`, { method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey, sessionId: sessionRef.current, phone: data.phone||'Visitor', details: data }) })
    .then(r => r.json()).then(res => { if (res.id) { setLeadId(res.id); leadIdRef.current = res.id; setChatStatus(live ? 'waiting' : 'lead'); if (live) addMsg('bot', '🎟️ Ticket raised! Connection pending.'); } });
  }, [apiKey, addMsg]);

  const handleSend = (e, contentOverride = null) => {
    if (e) e.preventDefault(); const text = contentOverride || input.trim(); if (!text) return; if (!contentOverride) setInput(''); 
    addMsg('visitor', text);
    recordActivity();
    if (isLive && leadIdRef.current) { fetch(`${API}/conversations.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'send', leadId: leadIdRef.current, sender:'visitor', content: text }) }); return; }
    const step = steps.find(s => s.id == stepId); if (step && step.type === 'text') { handleStep(text, step.next); return; }
    setIsTyping(true);
    fetch(`${API}/chat.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ apiKey, message: text, sessionId: sessionRef.current, isOffline: !branding.is_open }) })
    .then(r => r.json()).then(d => { setIsTyping(false); if (d.content) addMsg('bot', d.content); if (d.lead_id) setLeadId(d.lead_id); });
  };

  const handleStep = useCallback((label, next) => {
    addMsg('visitor', label); surveyDataRef.current[stepId] = label;
    recordActivity();
    if (next === 'human') { 
       setIsLive(true); 
       setSurveyDone(true); 
       localStorage.setItem(`bee_survey_completed_${apiKey}_${sessionRef.current}`, 'true');
       setStepId(null); 
       submitLead({ ...surveyDataRef.current, status:'human_requested' }, true); 
       return; 
    }
    if (!next || next === 'finish') { 
       submitLead({ ...surveyDataRef.current }); 
       setSurveyDone(true); 
       localStorage.setItem(`bee_survey_completed_${apiKey}_${sessionRef.current}`, 'true');
       setStepId(null); 
       setIsTyping(true); 
       setTimeout(() => { addMsg('bot', branding.success); setIsTyping(false); }, 700); 
       return; 
    }
    const nxt = steps.find(s => s.id == next); 
    if (nxt) { 
       setStepId(next); 
       setIsTyping(true); 
       setTimeout(() => { 
          addMsg('bot', nxt.question, null); 
          if (nxt.type === 'options') {
             setMessages(prev => {
                const last = prev[prev.length-1];
                if (last && last.role === 'bot') last.options = nxt.options;
                return [...prev];
             });
          }
          setIsTyping(false); 
       }, 700); 
    }
  }, [stepId, steps, branding.success, addMsg, submitLead]);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketData.message || !ticketData.email) return;
    setTicketLoading(true);
    try {
      const res = await fetch(`${API}/tickets.php?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          sessionId: sessionRef.current,
          subject: ticketData.subject || 'Offline Support Request',
          message: ticketData.message,
          email: ticketData.email,
          phone: ticketData.phone,
          videoCallType: ticketData.videoCallType || 'none'
        })
      }).then(r => r.json());

      if (res.success) {
        let successMsg = `🎟️ Ticket Created! Your tracking ID is: ${res.tracking_id}. Check your email for the link.`;
        if (ticketData.videoCallType === 'instant') {
          successMsg += `\n🎥 Instant meeting generated: https://meet.jit.si/BeeChat_Ticket_${res.tracking_id}`;
        } else if (ticketData.videoCallType === 'scheduled') {
          successMsg += `\n📅 Video meeting scheduled: https://cal.com/beechat-demo/15min`;
        }
        addMsg('bot', successMsg);
        setTicketFormVisible(false);
        setTicketData({ subject: '', message: '', email: '', phone: '', videoCallType: 'none' });
      }
    } catch (err) {
      addMsg('bot', '❌ Failed to create ticket. Please try again later.');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleFormSubmit = async (formData, msgIdx, msgId) => {
    const phoneValue = formData.phone || formData.tel || '';
    const res = await fetch(`${API}/leads.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        sessionId: sessionRef.current,
        phone: phoneValue || 'Visitor',
        details: formData
      })
    }).then(r => r.json());

    if (res.id) {
      setLeadId(res.id);
      leadIdRef.current = res.id;
      const storageKey = msgId ? `bee_form_submitted_${res.id}_${msgId}` : `bee_form_submitted_${res.id}_idx_${msgIdx}`;
      localStorage.setItem(storageKey, 'true');
      setSubmittedForms(prev => ({
        ...prev,
        [storageKey]: true
      }));
    }
  };

  const isFormSubmitted = (msgId, msgIdx) => {
    if (!leadId) return false;
    const storageKey = msgId ? `bee_form_submitted_${leadId}_${msgId}` : `bee_form_submitted_${leadId}_idx_${msgIdx}`;
    return submittedForms[storageKey] || localStorage.getItem(storageKey) === 'true';
  };

  const currentStep = steps.find(s => s.id === stepId);
  const isInputDisabled = !surveyDone && (!currentStep || currentStep.type !== 'text');

  return (
    <div className="relative font-sans flex flex-col items-end selection:bg-amber-100 selection:text-amber-600 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:20 }}
            className="mb-4 w-[400px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-8rem)] bg-white rounded-[3rem] shadow-4xl overflow-hidden flex flex-col border border-slate-100 pointer-events-auto"
          >
            <header className="p-8 text-white flex flex-col gap-4" style={{background: branding.headerBg || branding.color}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-2xl w-14 h-14 flex items-center justify-center shadow-xl relative overflow-hidden group">
                     {branding.image ? <img src={branding.image} className="w-full h-full object-contain relative z-10" alt="bot"/> : <TopBee size={40} />}
                  </div>
                  <div>
                    <h3 className="font-black text-xl leading-tight uppercase tracking-tighter">
                      {assignedAgent ? assignedAgent.name : branding.name}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-1.5 mt-1">
                      {assignedAgent ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm" />
                          Speaking with {assignedAgent.name}
                        </>
                      ) : branding.is_open ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm" />
                          Live Connection
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                          Away Mode
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={closeChat} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-7 h-7"/></button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/20">
              {messages.map((msg, i) => {
                const right = msg.role === 'visitor';
                const hasForm = !right && msg.text && msg.text.includes('[FORM:DATA_REQUEST]');
                const cleanText = hasForm ? msg.text.replace('[FORM:DATA_REQUEST]', '').trim() : (msg.text || '');
                const isOptions = msg.options && msg.options.length > 0;
                return (
                  <div key={i} className={`flex flex-col ${right ? 'items-end' : 'items-start'} w-full`}>
                    {(msg.image || cleanText) && (
                      <div className={`max-w-[85%] px-5 py-4 rounded-[2rem] text-sm font-bold shadow-sm ${right ? 'text-white' : 'bg-white border-2 border-slate-50 text-slate-800'}`} style={right ? {backgroundColor: branding.color} : {}}>
                        {msg.image ? <img src={msg.image} className="w-full rounded-xl mb-2" alt="upload" /> : cleanText}
                      </div>
                    )}
                    {hasForm && (
                      <div className="w-[85%]">
                        <DynamicForm 
                          formConfig={branding.form_config} 
                          onSubmit={(fd) => handleFormSubmit(fd, i, msg.id)} 
                          color={branding.color} 
                          isSubmitted={isFormSubmitted(msg.id, i)} 
                        />
                      </div>
                    )}
                    {isOptions && (
                      <div className="flex flex-wrap gap-2 mt-4 ml-2">
                        {msg.options.map((opt, idx) => (
                           <button key={idx} onClick={() => handleStep(opt.label, opt.next)} 
                              className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm"
                           >
                              {opt.label}
                           </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {isTyping && <div className="flex justify-start"><div className="bg-white px-5 py-4 rounded-[2rem] border-2 border-slate-50 flex gap-1.5 items-center"><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"/><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.1s]"/><div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"/></div></div>}
              {chatStatus === 'ended' && (
                <div className="flex flex-col items-center gap-4 py-10">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-sm"><CheckCircle className="w-8 h-8" /></div>
                   <div className="text-center"><p className="text-lg font-black text-slate-900 uppercase tracking-tighter">Solved</p><button onClick={handleResetChat} className="mt-4 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all">New Hive Session</button></div>
                </div>
              )}

              {ticketFormVisible ? (
                 <motion.form initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} onSubmit={handleTicketSubmit} className="space-y-4 p-6 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-xl">
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter text-sm flex items-center gap-2">
                       <Plus className="w-4 h-4 text-amber-500" /> Create Support Ticket
                    </h4>
                    <input required type="email" placeholder="YOUR EMAIL" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" value={ticketData.email} onChange={e => setTicketData({...ticketData, email: e.target.value})} />
                    <textarea required placeholder="HOW CAN WE HELP?" rows="3" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none" value={ticketData.message} onChange={e => setTicketData({...ticketData, message: e.target.value})} />
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Support Option</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-500 outline-none cursor-pointer"
                        value={ticketData.videoCallType || 'none'}
                        onChange={e => setTicketData({...ticketData, videoCallType: e.target.value})}
                      >
                        <option value="none">NO VIDEO CALL (CHAT ONLY)</option>
                        <option value="instant">REQUEST INSTANT VIDEO CALL 🎥</option>
                        <option value="scheduled">SCHEDULE VIDEO MEETING 📅</option>
                      </select>
                    </div>

                    <button disabled={ticketLoading} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-500 transition-all">
                       {ticketLoading ? 'Sending...' : 'Raise Ticket'}
                    </button>
                    <button type="button" onClick={() => setTicketFormVisible(false)} className="w-full text-center text-slate-400 font-black text-[9px] uppercase tracking-widest">Back to Chat</button>
                 </motion.form>
              ) : !branding.is_open && (
                <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[2.5rem] text-center">
                   <p className="text-xs font-bold text-amber-900/60 leading-relaxed mb-4">
                     We are currently out of the hive. Leave a message or create a ticket for faster response.
                   </p>
                   <button onClick={() => setTicketFormVisible(true)} className="px-6 py-3 bg-white text-amber-600 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm border border-amber-100">Open Ticket</button>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t-2 border-slate-50">
              <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border-2 border-transparent focus-within:border-amber-100 focus-within:bg-white transition-all">
                <label className={`p-2 cursor-pointer hover:bg-slate-200 rounded-xl transition-all relative ${!surveyDone ? 'opacity-50 pointer-events-none' : ''}`}>
                   <Image className={`w-6 h-6 ${isUploading ? 'animate-pulse text-amber-500' : 'text-slate-400'}`} />
                   <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading || !surveyDone} />
                </label>
                <input 
                  disabled={isInputDisabled}
                  placeholder={isInputDisabled ? "SELECT AN OPTION ABOVE" : "Enter message to hive..."} 
                  className="flex-1 bg-transparent border-none text-sm font-bold outline-none text-slate-700 placeholder:uppercase placeholder:text-[10px] disabled:opacity-50" 
                  value={input} 
                  onChange={e => { setInput(e.target.value); recordActivity(); }} 
                />
                <button 
                  disabled={isInputDisabled}
                  type="submit" 
                  className="p-3.5 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100" 
                  style={{backgroundColor:branding.color}}
                >
                  <Send className="w-6 h-6"/>
                </button>
              </form>
            </div>

            <div className="py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1 pointer-events-auto">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Powered by</span>
              <a 
                href="https://www.beechat.online/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[9px] font-black text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-widest flex items-center gap-0.5"
              >
                Bee Chat <span className="text-amber-500">🐝</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => isOpen ? closeChat() : openChat()} className="w-20 h-20 rounded-full shadow-4xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 relative overflow-hidden pointer-events-auto" style={{background: branding.headerBg || branding.color}}>
        {isOpen ? <X className="w-10 h-10"/> : <MessageSquare className="w-10 h-10"/>}
        {notification && !isOpen && <span className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full border-4 border-white animate-bounce" />}
      </button>

      <style>{`
        html, body { background: transparent !important; margin: 0; padding: 0; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar{width:4px;}
        .custom-scrollbar::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:10px;}
      `}</style>
    </div>
  );
}

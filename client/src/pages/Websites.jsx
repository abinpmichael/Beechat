import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Plus, Copy, Check, Trash2, ExternalLink, Loader2, Brain, BrainCircuit, 
  Palette, Crown, Lock, Shield, MessageSquare, Zap, Eye, Save, CreditCard, 
  Users, BookOpen, X, History, FileText, ChevronRight, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

// --- THE NEW ENHANCED VECTOR LOGO ---
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
        <filter id="megaKawaiiFuzzWeb" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneyWeb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeWeb" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushWeb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneyWeb)" filter="url(#megaKawaiiFuzzWeb)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneyWeb)" filter="url(#megaKawaiiFuzzWeb)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneyWeb)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushWeb)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushWeb)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeWeb)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeWeb)" />
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

export default function Websites() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingSite, setEditingSite] = useState(null);
  const [editData, setEditData] = useState({ 
    bot_name: '', bot_image: '', theme_color: '#f59e0b', 
    welcome_message: '', bot_subtitle: '', success_message: '', 
    survey_config: [], 
    header_bg_gradient: '', notification_sound: '', widget_icon: '',
    form_config: [] 
  });
  const [activeTab, setActiveTab] = useState('branding');
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [newKItem, setNewKItem] = useState({ title: '', content: '' });
  const [isParsing, setIsParsing] = useState(false);

  const API_URL = `${API_BASE_URL}/websites.php`;
  const KNOWLEDGE_API = `${API_BASE_URL}/knowledge.php`;

  const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, { headers: authH() });
      setWebsites(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchWebsites(); }, []);

  const fetchKnowledge = async (websiteId) => {
    if (!websiteId) return;
    try {
      const res = await axios.get(`${KNOWLEDGE_API}?website_id=${websiteId}`, { headers: authH() });
      setKnowledgeItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    if (!editingSite) return;
    try {
      await axios.post(KNOWLEDGE_API, {
        action: 'add',
        website_id: editingSite.id,
        ...newKItem
      }, { headers: authH() });
      setNewKItem({ title: '', content: '' });
      fetchKnowledge(editingSite.id);
    } catch (err) { alert("Error adding knowledge"); }
  };

  const handleDeleteKnowledge = async (id) => {
    if (!editingSite) return;
    try {
      await axios.post(KNOWLEDGE_API, {
        action: 'delete',
        id: id
      }, { headers: authH() });
      fetchKnowledge(editingSite.id);
    } catch (err) { alert("Error deleting item"); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check for libraries (mammoth and pdfjsLib are expected to be on window via script tags in index.html)
    if (!window.mammoth || !window.pdfjsLib) {
      alert("Document processing libraries are still loading. Please try again in a few seconds.");
      return;
    }
    
    const extension = file.name.split('.').pop().toLowerCase();
    setIsParsing(true);
    try {
      if (extension === 'txt') {
        const text = await file.text();
        setNewKItem({ title: file.name.replace('.txt', ''), content: text });
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        setNewKItem({ title: file.name.replace('.docx', ''), content: result.value });
      } else if (extension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        setNewKItem({ title: file.name.replace('.pdf', ''), content: fullText.trim() });
      }
    } catch (err) { 
        alert(`Error parsing document: ${err.message}`); 
    } finally { 
        setIsParsing(false); 
        e.target.value = ''; 
    }
  };

  const handleToggleAI = async (siteId, currentStatus) => {
    if (user?.plan?.ai_enabled === 0 && user?.is_superadmin !== 1) {
      alert(`🚫 AI features are not included in your current plan (${user?.plan?.name}). Please upgrade to unlock.`);
      return;
    }
    try {
      await axios.post(`${API_URL}?action=toggle_ai`, { id: siteId, enabled: !currentStatus }, { headers: authH() });
      fetchWebsites();
    } catch (err) { }
  };

  const handleUpdateBranding = async (e) => {
    e.preventDefault();
    if (!editingSite) return;
    try {
      await axios.post(`${API_URL}?action=update_branding`, { id: editingSite.id, ...editData }, { headers: authH() });
      setEditingSite(null); 
      fetchWebsites();
    } catch (err) { }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    const maxSites = user?.plan?.max_websites || 1;
    if (websites.length >= maxSites && user?.is_superadmin !== 1) {
       alert(`🚫 Your current plan (${user?.plan?.name}) is limited to ${maxSites} website.`);
       return;
    }
    setIsAdding(true);
    try {
      await axios.post(API_URL, { domain: newDomain }, { headers: authH() });
      setNewDomain(''); 
      fetchWebsites();
    } catch (err) { } finally { setIsAdding(false); }
  };

  const handleDeleteWebsite = async (id) => {
    if (!window.confirm("Are you sure? This will delete the website and ALL associated chat history!")) return;
    try {
      await axios.post(`${API_URL}?action=delete`, { id }, { headers: authH() });
      fetchWebsites();
    } catch (err) { }
  };

  const copyToClipboard = (text, id) => {
    const embedCode = `<script src="${window.location.origin}/widget.js" data-api-key="${text}" async></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12 selection:bg-amber-100 selection:text-amber-600">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Connect <span className="text-amber-500">Hive</span> Domains</h2>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px] mt-1.5">Manage your digital estates and neural keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="glass p-10 rounded-[3.5rem] sticky top-8 bg-white border-2 border-slate-50 shadow-xl shadow-amber-500/5">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-amber-100/50">
              <Plus className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Add New Hive</h3>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-10 leading-relaxed">Enter your domain to initialize a neural chat connection.</p>
            
            <form onSubmit={handleAddWebsite} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain Terminal</label>
                <input type="text" required placeholder="example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 ring-amber-50 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:uppercase placeholder:text-[10px]"
                />
              </div>
              <button type="submit" disabled={isAdding}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-200 hover:bg-amber-500 transition-all flex items-center justify-center gap-4 disabled:opacity-70 uppercase tracking-widest text-sm"
              >
                {isAdding ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initialize Integration"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="w-12 h-12 text-amber-500 animate-spin" /></div>
          ) : websites.length === 0 ? (
            <div className="glass p-20 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
              <Globe className="w-20 h-20 text-slate-100 mx-auto mb-6 opacity-30" />
              <p className="text-slate-300 font-black uppercase tracking-widest">No active hive domains detected.</p>
            </div>
          ) : (
            websites.map((site) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={site.id} 
                className="glass p-10 rounded-[3.5rem] group hover:shadow-4xl transition-all border-2 border-slate-50 bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100 group-hover:scale-110 transition-transform">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                        {site.domain}
                        <ExternalLink className="w-5 h-5 text-slate-300" />
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-6 h-6 rounded-lg overflow-hidden border-2 border-slate-50 shadow-sm bg-white flex items-center justify-center">
                          {site.bot_image ? <img src={site.bot_image} className="w-full h-full object-cover" /> : <TopBee size={16} />}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{site.bot_name || 'Bee Bot'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group/tip">
                      <button onClick={() => { 
                        setEditingSite(site); 
                        let survey = [];
                        try {
                          survey = typeof site.survey_config === 'string' && site.survey_config.trim() ? JSON.parse(site.survey_config) : (site.survey_config || []);
                        } catch (e) { survey = []; }
                        
                        let forms = [];
                        try {
                          forms = typeof site.form_config === 'string' && site.form_config.trim() ? JSON.parse(site.form_config) : (site.form_config || []);
                        } catch (e) { forms = []; }

                        setEditData({ ...site, theme_color: site.theme_color||'#f59e0b', survey_config: Array.isArray(survey) ? survey : [], form_config: Array.isArray(forms) ? forms : [] }); 
                        setActiveTab('branding'); 
                        fetchKnowledge(site.id); 
                      }}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-slate-100"
                      >
                        Management
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all translate-y-2 group-hover/tip:translate-y-0 z-50 shadow-2xl border border-white/10 text-center">
                        Manage AI Bot, Survey Flow, Knowledge Base,<br /> Documents, Automation, and Widget Settings
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                      </div>
                    </div>
                    <button onClick={() => handleToggleAI(site.id, site.ai_enabled)}
                      className={`p-3 rounded-xl transition-all flex items-center gap-2 border-2 ${site.ai_enabled ? 'bg-amber-500 text-white border-amber-400 shadow-xl shadow-amber-100' : 'bg-white text-slate-400 border-slate-50'}`}
                    >
                      {site.ai_enabled ? <BrainCircuit className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                    </button>
                    <button onClick={() => copyToClipboard(site.api_key, site.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${copiedId === site.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-100'}`}
                    >
                      {copiedId === site.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedId === site.id ? "Copied" : "Embed"}
                    </button>
                    <button onClick={() => handleDeleteWebsite(site.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-slate-950 rounded-2xl border-4 border-slate-900 relative overflow-hidden group/code">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Neural Ingestion Snippet</p>
                  <code className="text-[11px] text-amber-500 font-mono break-all leading-relaxed font-bold">
                    {`<script src="${window.location.origin}/widget.js" data-api-key="${site.api_key}" async></script>`}
                  </code>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {editingSite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingSite(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 font-black border border-amber-100">
                         <TopBee size={40} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{editingSite.domain} <span className="text-amber-500">Config</span></h3>
                         <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Fine-tune your hive's personality and intelligence.</p>
                      </div>
                   </div>
                   <button onClick={() => setEditingSite(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                   {/* Sidebar Nav */}
                   <div className="w-64 border-r border-slate-50 p-8 space-y-4">
                      {[
                        { id: 'branding', label: 'Aesthetics', icon: Palette },
                        { id: 'ai', label: 'Neural Training', icon: BrainCircuit },
                        { id: 'survey', label: 'Survey Flow', icon: FileText },
                        { id: 'behavior', label: 'Bot Persona', icon: MessageSquare }
                      ].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-amber-500 text-white shadow-xl shadow-amber-100' : 'text-slate-400 hover:text-amber-600'}`}>
                           <t.icon className="w-5 h-5" /> {t.label}
                        </button>
                      ))}
                   </div>

                   {/* Content */}
                   <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                      {activeTab === 'branding' && (
                        <form onSubmit={handleUpdateBranding} className="space-y-10">
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Identity</label>
                                 <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editData.bot_name} onChange={(e) => setEditData({...editData, bot_name: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Hue</label>
                                 <input type="color" className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer" value={editData.theme_color} onChange={(e) => setEditData({...editData, theme_color: e.target.value})} />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Avatar Terminal (URL)</label>
                              <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editData.bot_image} onChange={(e) => setEditData({...editData, bot_image: e.target.value})} />
                           </div>
                           <button type="submit" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-amber-500 transition-all uppercase text-xs tracking-widest flex items-center gap-3">
                              <Save className="w-5 h-5" /> Commit Branding
                           </button>
                        </form>
                      )}

                      {activeTab === 'ai' && (
                        <div className="space-y-10">
                           <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit className="w-24 h-24" /></div>
                              <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">Neural Injection</h4>
                              <p className="text-slate-400 text-sm font-medium max-w-md">Feed the hive with your knowledge. Upload documents or paste text to train your custom AI agent.</p>
                              <div className="mt-8 flex items-center gap-4">
                                 <label className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-all flex items-center gap-3">
                                    <BookOpen className="w-5 h-5" /> {isParsing ? "Digesting..." : "Digest Document"}
                                    <input type="file" className="hidden" accept=".txt,.pdf,.docx" onChange={handleFileUpload} />
                                 </label>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Memory Cells</h4>
                                 <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">{knowledgeItems.length} Total Items</span>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                 {knowledgeItems.length === 0 ? (
                                    <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Neural tissue is empty. Please inject data.</p>
                                    </div>
                                 ) : knowledgeItems.map(item => (
                                    <div key={item.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                                       <div className="flex items-center gap-5">
                                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-50"><Brain className="w-5 h-5" /></div>
                                          <div>
                                             <h5 className="font-black text-slate-900 text-sm">{item.title}</h5>
                                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Digested {new Date(item.created_at).toLocaleDateString()}</p>
                                          </div>
                                       </div>
                                       <button onClick={() => handleDeleteKnowledge(item.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}

                       {activeTab === 'survey' && (
                         <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                               <div>
                                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Advanced Neural Flow</h4>
                                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Configure automated branching logic and multi-choice options.</p>
                               </div>
                               <button onClick={() => {
                                 const config = Array.isArray(editData.survey_config) ? editData.survey_config : [];
                                 const newStep = { id: Date.now().toString(), question: 'New Question?', type: 'text', options: [], next: 'finish' };
                                 setEditData({...editData, survey_config: [...config, newStep]});
                               }} className="px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-100">
                                  <Plus className="w-4 h-4" /> Add Step
                               </button>
                            </div>

                            <div className="space-y-6">
                               {(!Array.isArray(editData.survey_config) || editData.survey_config.length === 0) ? (
                                 <div className="p-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No survey steps defined. Chat will start directly.</p>
                                 </div>
                               ) : editData.survey_config.map((step, idx) => (
                                 <div key={step.id} className="p-10 bg-white border-2 border-slate-50 rounded-[3.5rem] shadow-xl shadow-slate-100/50 space-y-8 relative group">
                                    <div className="absolute -left-3 top-10 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg">
                                       {idx + 1}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                       <div className="space-y-3">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                                          <textarea rows="2" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 ring-amber-50 outline-none transition-all" value={step.question} onChange={(e) => {
                                            const updated = [...editData.survey_config];
                                            updated[idx].question = e.target.value;
                                            setEditData({...editData, survey_config: updated});
                                          }} />
                                       </div>
                                       <div className="space-y-3">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Input Type</label>
                                          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                                             <button onClick={() => {
                                                const updated = [...editData.survey_config];
                                                updated[idx].type = 'text';
                                                setEditData({...editData, survey_config: updated});
                                             }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step.type === 'text' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}`}>Free Text</button>
                                             <button onClick={() => {
                                                const updated = [...editData.survey_config];
                                                updated[idx].type = 'options';
                                                if (!updated[idx].options) updated[idx].options = [];
                                                setEditData({...editData, survey_config: updated});
                                             }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${step.type === 'options' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}`}>Multiple Choice</button>
                                          </div>
                                       </div>
                                    </div>

                                    {step.type === 'options' && (
                                       <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                          <div className="flex items-center justify-between mb-4">
                                             <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Branching Options</h5>
                                             <button onClick={() => {
                                                const updated = [...editData.survey_config];
                                                updated[idx].options = [...(updated[idx].options || []), { label: 'New Option', next: 'finish' }];
                                                setEditData({...editData, survey_config: updated});
                                             }} className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-amber-700">
                                                <Plus className="w-3 h-3" /> Add Choice
                                             </button>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {(step.options || []).map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 group/opt">
                                                   <input className="flex-1 text-xs font-bold bg-transparent outline-none border-none" value={opt.label} onChange={(e) => {
                                                      const updated = [...editData.survey_config];
                                                      updated[idx].options[oIdx].label = e.target.value;
                                                      setEditData({...editData, survey_config: updated});
                                                   }} />
                                                   <select className="text-[9px] font-black bg-slate-50 border-none rounded-lg p-2 outline-none" value={opt.next} onChange={(e) => {
                                                      const updated = [...editData.survey_config];
                                                      updated[idx].options[oIdx].next = e.target.value;
                                                      setEditData({...editData, survey_config: updated});
                                                   }}>
                                                      <option value="finish">Finish</option>
                                                      <option value="human">Transfer</option>
                                                      {editData.survey_config.map((s, i) => s.id !== step.id && <option key={s.id} value={s.id}>Step {i + 1}</option>)}
                                                   </select>
                                                   <button onClick={() => {
                                                      const updated = [...editData.survey_config];
                                                      updated[idx].options = updated[idx].options.filter((_, i) => i !== oIdx);
                                                      setEditData({...editData, survey_config: updated});
                                                   }} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {step.type !== 'options' && (
                                       <div className="space-y-2">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Next Destination</label>
                                          <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" value={step.next} onChange={(e) => {
                                            const updated = [...editData.survey_config];
                                            updated[idx].next = e.target.value;
                                            setEditData({...editData, survey_config: updated});
                                          }}>
                                             <option value="finish">Finish & Save</option>
                                             <option value="human">Transfer to Agent</option>
                                             {editData.survey_config.map((s, i) => s.id !== step.id && <option key={s.id} value={s.id}>Step {i + 1}</option>)}
                                          </select>
                                       </div>
                                    )}

                                    <button onClick={() => {
                                      const updated = editData.survey_config.filter((_, i) => i !== idx);
                                      setEditData({...editData, survey_config: updated});
                                    }} className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                                       <Trash2 className="w-5 h-5" />
                                    </button>
                                 </div>
                               ))}
                            </div>

                            {Array.isArray(editData.survey_config) && editData.survey_config.length > 0 && (
                               <button onClick={handleUpdateBranding} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black shadow-2xl shadow-slate-200 hover:bg-amber-500 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-4">
                                  <Save className="w-6 h-6" /> Save Neural Configuration
                               </button>
                            )}
                         </div>
                       )}

                      {activeTab === 'behavior' && (
                         <div className="space-y-10">
                            <div className="p-10 bg-amber-50 rounded-[3rem] border border-amber-100">
                               <h4 className="text-xl font-black text-amber-900 uppercase tracking-tighter mb-2">Bot Persona Settings</h4>
                               <p className="text-amber-700/60 text-xs font-medium mb-8">Define how your AI interacts with visitors. These settings influence tone and engagement.</p>
                               
                               <div className="space-y-6">
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1">Welcome Message</label>
                                     <textarea className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl font-bold text-amber-900" rows="3" value={editData.welcome_message} onChange={e => setEditData({...editData, welcome_message: e.target.value})} />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1">Bot Subtitle</label>
                                     <input className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl font-bold text-amber-900" value={editData.bot_subtitle} onChange={e => setEditData({...editData, bot_subtitle: e.target.value})} />
                                  </div>

                                  <div className="p-6 bg-white/50 rounded-2xl border border-amber-200/50">
                                     <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1 block mb-3">Flow Priority</label>
                                     <div className="flex gap-4">
                                        <button type="button" onClick={() => setEditData({...editData, survey_priority: 1})} className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${editData.survey_priority == 1 ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-100 bg-white opacity-60'}`}>
                                           <p className="text-[10px] font-black uppercase tracking-tighter">Survey First</p>
                                           <p className="text-[8px] font-bold text-slate-400 mt-1">Lead collection starts immediately when visitor opens chat.</p>
                                        </button>
                                        <button type="button" onClick={() => setEditData({...editData, survey_priority: 0})} className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${editData.survey_priority == 0 ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-100 bg-white opacity-60'}`}>
                                           <p className="text-[10px] font-black uppercase tracking-tighter">AI Bot First</p>
                                           <p className="text-[8px] font-bold text-slate-400 mt-1">Interactive AI starts immediately. Survey triggers only if needed.</p>
                                        </button>
                                     </div>
                                  </div>
                               </div>
                               <button onClick={handleUpdateBranding} className="mt-8 w-full bg-amber-500 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                                  <Save className="w-5 h-5" /> Save Persona
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {isAdding && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" />
               <div className="relative text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-32 h-32 border-8 border-amber-500/20 border-t-amber-500 rounded-full mx-auto" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <TopBee size={60} />
                  </div>
                  <h3 className="text-white font-black text-2xl mt-10 uppercase tracking-tighter">Syncing Hive...</h3>
                  <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.5em] mt-3 animate-pulse">Initializing Domain Key</p>
               </div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

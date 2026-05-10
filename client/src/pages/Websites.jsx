import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Globe, Plus, Copy, Check, Trash2, ExternalLink, Loader2, Brain, BrainCircuit, Palette, Crown, Lock, Shield, MessageSquare, Zap, Eye, Save, CreditCard, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Websites() {
  const { user } = useAuth();
  const [showSync, setShowSync] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [newKItem, setNewKItem] = useState({ title: '', content: '' });

  const fetchKnowledge = async (websiteId) => {
    try {
      const res = await axios.get(`http://localhost/Bee/server/api/knowledge.php?website_id=${websiteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setKnowledgeItems(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost/Bee/server/api/knowledge.php', {
        action: 'add',
        website_id: editData.id,
        ...newKItem
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setNewKItem({ title: '', content: '' });
      fetchKnowledge(editData.id);
    } catch (err) { alert("Error adding knowledge"); }
  };

  const handleDeleteKnowledge = async (id) => {
    try {
      await axios.post('http://localhost/Bee/server/api/knowledge.php', {
        action: 'delete',
        id: id
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchKnowledge(editData.id);
    } catch (err) { alert("Error deleting item"); }
  };
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingSite, setEditingSite] = useState(null);
  const [editData, setEditData] = useState({ 
    bot_name: '', bot_image: '', theme_color: '#6366f1', 
    welcome_message: '', bot_subtitle: '', success_message: '', 
    survey_config: [], 
    header_bg_gradient: '', notification_sound: '', widget_icon: '',
    form_config: [] 
  });
  const [activeTab, setActiveTab] = useState('branding'); // branding, survey, design, or forms

  const API_URL = 'http://localhost/Bee/server/api/websites.php';

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWebsites(res.data);
    } catch (err) {
      console.error("Error fetching websites", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAI = async (siteId, currentStatus) => {
    if (user?.plan?.ai_enabled === 0 && user?.is_superadmin !== 1) {
      alert(`🚫 AI features are not included in your current plan (${user?.plan?.name}). Please upgrade to unlock.`);
      return;
    }
    try {
      await axios.post(`${API_URL}?action=toggle_ai`, { id: siteId, enabled: !currentStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchWebsites();
    } catch (err) {
      alert("Error toggling AI");
    }
  };

  const handleUpdateBranding = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}?action=update_branding`, { 
        id: editingSite.id, 
        bot_name: editData.bot_name, 
        bot_image: editData.bot_image,
        theme_color: editData.theme_color,
        welcome_message: editData.welcome_message,
        bot_subtitle: editData.bot_subtitle,
        success_message: editData.success_message,
        survey_config: editData.survey_config,
        header_bg_gradient: editData.header_bg_gradient,
        notification_sound: editData.notification_sound,
        widget_icon: editData.widget_icon,
        form_config: editData.form_config
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingSite(null);
      fetchWebsites();
    } catch (err) {
      alert("Error updating branding");
    }
  };
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (websites.length >= (user?.plan?.max_websites || 1)) {
       alert(`🚫 Your current plan (${user?.plan?.name}) is limited to ${user?.plan?.max_websites} website. Please upgrade to add more.`);
       return;
    }
    setIsAdding(true);
    try {
      await axios.post(API_URL, { domain: newDomain }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewDomain('');
      fetchWebsites();
    } catch (err) {
      alert("Error adding website");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWebsite = async (id) => {
    if (!window.confirm("Are you sure you want to delete this website? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}?id=${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchWebsites();
    } catch (err) {
      alert("Error deleting website");
    }
  };

  const copyToClipboard = (text, id) => {
    const embedCode = `<script src="http://localhost:5173/widget.js" data-api-key="${text}" async></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Connect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Websites</span></h2>
          <p className="text-slate-500 font-medium mt-1">Manage your connected domains and integration keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Website */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-[2.5rem] sticky top-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Add New Site</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Enter your website domain to generate a unique chat widget.</p>
            
            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain URL</label>
                <input
                  type="text"
                  required
                  placeholder="example.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-medium"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="w-full premium-gradient text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Integration"}
              </button>
            </form>
          </div>
        </div>

        {/* Website List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : websites.length === 0 ? (
            <div className="glass p-12 rounded-[3rem] text-center">
              <Globe className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No websites connected yet.</p>
            </div>
          ) : (
            websites.map((site) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={site.id} 
                className="glass p-8 rounded-[2.5rem] group hover:shadow-2xl hover:shadow-indigo-100/50 transition-all border border-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner border border-white">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        {site.domain}
                        <ExternalLink className="w-4 h-4 text-slate-300" />
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                          <img src={site.bot_image || '/logo.png'} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{site.bot_name || 'Bee Bot'}</p>
                      </div>
                    </div>
                  </div>
                      <button 
                        onClick={() => {
                          let rawConfig = site.survey_config;
                          let parsedArray = [];
                          
                          try {
                            const parsed = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
                            if (Array.isArray(parsed)) {
                              parsedArray = parsed;
                            } else if (parsed && typeof parsed === 'object') {
                              // Convert old object format (q1, q2...) to new array format
                              parsedArray = Object.entries(parsed).map(([key, val]) => ({
                                id: key,
                                type: 'text',
                                question: val,
                                options: []
                              }));
                            }
                          } catch (e) {
                            parsedArray = [];
                          }

                          setEditingSite(site);
                          setEditData({ 
                            bot_name: site.bot_name || '', 
                            bot_image: site.bot_image || '',
                            theme_color: site.theme_color || '#6366f1',
                            welcome_message: site.welcome_message || 'Hello! How can we help you today?',
                            bot_subtitle: site.bot_subtitle || 'Support Assistant',
                            success_message: site.success_message || 'Thank you! We will be in touch soon.',
                            survey_config: parsedArray.length > 0 ? parsedArray : [
                              { id: "start", type: "options", question: "How can we help you?", options: [{ label: "🎨 Design Service", next: "design" }, { label: "💬 General Inquiry", next: "contact" }] },
                              { id: "design", type: "options", question: "What kind of space?", options: [{ label: "🏠 Home", next: "contact" }, { label: "🏢 Office", next: "contact" }] },
                              { id: "contact", type: "form", question: "Please leave your contact info", next: "finish" }
                            ],
                            header_bg_gradient: site.header_bg_gradient || '',
                            notification_sound: site.notification_sound || '',
                            widget_icon: site.widget_icon || '',
                            form_config: (() => {
                              try {
                                const parsed = typeof site.form_config === 'string' ? JSON.parse(site.form_config) : site.form_config;
                                return Array.isArray(parsed) ? parsed : [
                                  { label: "Full Name", name: "name", required: true },
                                  { label: "Email Address", name: "email", required: true },
                                  { label: "Phone Number", name: "phone", required: false }
                                ];
                              } catch {
                                return [
                                  { label: "Full Name", name: "name", required: true },
                                  { label: "Email Address", name: "email", required: true },
                                  { label: "Phone Number", name: "phone", required: false }
                                ];
                              }
                            })()
                          });
                          setActiveTab('branding');
                        }}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-lg shadow-indigo-100"
                      >
                        Customize & Embed
                      </button>
                      <button 
                        onClick={() => handleToggleAI(site.id, site.ai_enabled)}
                        className={`p-3 rounded-2xl transition-all flex items-center gap-2 border ${
                          site.ai_enabled 
                            ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-100' 
                            : 'bg-white text-slate-400 border-slate-100 hover:text-purple-500'
                        }`}
                        title={site.ai_enabled ? "AI Bot Active" : "Enable AI Bot"}
                      >
                        {site.ai_enabled ? <BrainCircuit className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{site.ai_enabled ? 'Active' : 'AI Bot'}</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (user?.plan?.ai_enabled === 1 || user?.is_superadmin === 1) {
                            setEditingSite(site);
                            fetchKnowledge(site.id);
                            setShowSync(true);
                          } else {
                            alert(`🚫 AI Knowledge Training is a premium feature. Please upgrade your plan to unlock AI automation.`);
                          }
                        }}
                        className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border border-indigo-100"
                      >
                        <BrainCircuit className="w-4 h-4" /> Sync & Train AI
                      </button>
                      <button 
                        onClick={() => copyToClipboard(site.api_key, site.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${
                        copiedId === site.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {copiedId === site.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedId === site.id ? "Copied!" : "Copy Embed Code"}
                    </button>
                    <button 
                      onClick={() => handleDeleteWebsite(site.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="mt-6 p-4 bg-slate-900/5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Integration Snippet</p>
                  <code className="text-[11px] text-indigo-600 font-mono break-all leading-relaxed">
                    {`<script src="http://localhost:5173/widget.js" data-api-key="${site.api_key}" async></script>`}
                  </code>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Knowledge Base / AI Training Modal */}
      {showSync && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setShowSync(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col h-[80vh]"
          >
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-indigo-600" /> AI Knowledge Base
                </h3>
                <p className="text-slate-500 font-medium mt-1">Train your AI with custom data and help articles.</p>
              </div>
              <button onClick={() => setShowSync(false)} className="p-3 bg-white rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Add New Item */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-black text-slate-900 mb-4">Add Training Data</h4>
                  <form onSubmit={handleAddKnowledge} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Title</label>
                      <input 
                        type="text" required placeholder="e.g. Refund Policy"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                        value={newKItem.title}
                        onChange={(e) => setNewKItem({...newKItem, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content / Snippet</label>
                      <textarea 
                        required rows="6" placeholder="Paste the help article or product details here..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                        value={newKItem.content}
                        onChange={(e) => setNewKItem({...newKItem, content: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full py-4 premium-gradient text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" /> Add to Knowledge Base
                    </button>
                  </form>
                </div>
              </div>

              {/* List Items */}
              <div className="space-y-6">
                <h4 className="text-lg font-black text-slate-900">Training Library</h4>
                {knowledgeItems.length === 0 ? (
                  <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                    <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-bold text-sm">No training data yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeItems.map((item) => (
                      <div key={item.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group relative">
                        <button 
                          onClick={() => handleDeleteKnowledge(item.id)}
                          className="absolute top-4 right-4 p-2 bg-white text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h5 className="font-black text-slate-900 pr-10">{item.title}</h5>
                        <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-3 leading-relaxed">{item.content}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Training Data</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Branding Editor Modal */}
      {editingSite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            onClick={() => setEditingSite(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white"
          >
            <div className="premium-gradient p-10 text-white relative">
              <h3 className="text-3xl font-black tracking-tight">Customize Widget</h3>
              <div className="flex gap-4 mt-6">
                {[
                  { id: 'branding', name: 'Bot Appearance', icon: Globe },
                  { id: 'survey', name: 'Auto-Survey', icon: Brain },
                  { id: 'forms', name: 'Raised Forms', icon: Check },
                  { id: 'design', name: 'Visual Design', icon: Palette },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    <tab.icon className="w-3.5 h-3.5" /> {tab.name}
                  </button>
                ))}</div>
            </div>
            
            <form onSubmit={handleUpdateBranding} className="flex flex-col h-full max-h-[70vh]">
              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {activeTab === 'branding' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Support Bee"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-bold"
                      value={editData.bot_name}
                      onChange={(e) => setEditData({ ...editData, bot_name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Avatar URL</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-inner bg-slate-50 flex-shrink-0">
                        <img src={editData.bot_image || '/logo.png'} className="w-full h-full object-cover" />
                      </div>
                      <input
                        type="text"
                        placeholder="https://example.com/avatar.png"
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-bold"
                        value={editData.bot_image}
                        onChange={(e) => setEditData({ ...editData, bot_image: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Welcome Message</label>
                    <textarea
                      placeholder="e.g. Hello! How can we help you today?"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none transition-all font-bold min-h-[100px]"
                      value={editData.welcome_message}
                      onChange={(e) => setEditData({ ...editData, welcome_message: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Support Expert"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                        value={editData.bot_subtitle}
                        onChange={(e) => setEditData({ ...editData, bot_subtitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Success Msg</label>
                      <input
                        type="text"
                        placeholder="e.g. Thank you!"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                        value={editData.success_message}
                        onChange={(e) => setEditData({ ...editData, success_message: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'survey' ? (
                <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {editData.survey_config.map((step, index) => (
                    <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full">Step ID: {step.id || `step_${index}`}</span>
                        <div className="flex gap-2">
                          <select 
                            className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg px-2 py-1"
                            value={step.type || 'options'}
                            onChange={(e) => {
                              const newConfig = [...editData.survey_config];
                              newConfig[index].type = e.target.value;
                              setEditData({ ...editData, survey_config: newConfig });
                            }}
                          >
                            <option value="options">Buttons</option>
                            <option value="form">Contact Form</option>
                            <option value="text">Text Input</option>
                          </select>
                          <button 
                            type="button"
                            onClick={() => {
                              const newConfig = [...editData.survey_config];
                              newConfig.splice(index, 1);
                              setEditData({ ...editData, survey_config: newConfig });
                            }}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bot Question</label>
                        <input
                          type="text"
                          required
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none"
                          value={step.question}
                          onChange={(e) => {
                            const newConfig = [...editData.survey_config];
                            newConfig[index].question = e.target.value;
                            setEditData({ ...editData, survey_config: newConfig });
                          }}
                        />
                      </div>

                      {step.type === 'form' && (
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Form Fields & Next Path</p>
                          {(step.fields || [
                            { label: "Full Name", name: "name", required: true },
                            { label: "Email Address", name: "email", required: true },
                            { label: "Phone Number", name: "phone", required: false }
                          ]).map((f, fIdx) => (
                            <div key={fIdx} className="flex gap-2">
                              <input 
                                placeholder="Field Label"
                                className="flex-[2] px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                value={f.label}
                                onChange={(e) => {
                                  const newConfig = [...editData.survey_config];
                                  if (!newConfig[index].fields) newConfig[index].fields = [
                                    { label: "Full Name", name: "name", required: true },
                                    { label: "Email Address", name: "email", required: true },
                                    { label: "Phone Number", name: "phone", required: false }
                                  ];
                                  newConfig[index].fields[fIdx].label = e.target.value;
                                  newConfig[index].fields[fIdx].name = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                  setEditData({ ...editData, survey_config: newConfig });
                                }}
                              />
                              <button type="button" onClick={() => {
                                const newConfig = [...editData.survey_config];
                                newConfig[index].fields.splice(fIdx, 1);
                                setEditData({ ...editData, survey_config: newConfig });
                              }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center justify-between gap-4">
                            <button 
                              type="button"
                              onClick={() => {
                                const newConfig = [...editData.survey_config];
                                if (!newConfig[index].fields) newConfig[index].fields = [];
                                newConfig[index].fields.push({ label: "New Field", name: "new_field", required: false });
                                setEditData({ ...editData, survey_config: newConfig });
                              }}
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              + Add Field
                            </button>
                            <div className="flex items-center gap-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase">Next Step:</label>
                               <input 
                                placeholder="Next ID"
                                className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono"
                                value={step.next || ''}
                                onChange={(e) => {
                                  const newConfig = [...editData.survey_config];
                                  newConfig[index].next = e.target.value;
                                  setEditData({ ...editData, survey_config: newConfig });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {step.type === 'options' && (
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Button Options & Paths</p>
                          {(step.options || []).map((opt, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <input 
                                placeholder="Button Label"
                                className="flex-[2] px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                value={opt.label}
                                onChange={(e) => {
                                  const newConfig = [...editData.survey_config];
                                  newConfig[index].options[optIndex].label = e.target.value;
                                  setEditData({ ...editData, survey_config: newConfig });
                                }}
                              />
                              <input 
                                placeholder="Next Step ID"
                                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono"
                                value={opt.next}
                                onChange={(e) => {
                                  const newConfig = [...editData.survey_config];
                                  newConfig[index].options[optIndex].next = e.target.value;
                                  setEditData({ ...editData, survey_config: newConfig });
                                }}
                              />
                            </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => {
                              const newConfig = [...editData.survey_config];
                              if (!newConfig[index].options) newConfig[index].options = [];
                              newConfig[index].options.push({ label: "", next: "" });
                              setEditData({ ...editData, survey_config: newConfig });
                            }}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button"
                    onClick={() => setEditData({ ...editData, survey_config: [...editData.survey_config, { id: "step_"+Date.now(), type: "text", question: "Your Question?", options: [] }] })}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    + Add New Survey Step
                  </button>
                </div>
              ) : activeTab === 'forms' ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <h5 className="font-black text-indigo-900 text-sm mb-1">Raised Form Customization</h5>
                    <p className="text-xs text-indigo-600/70 font-medium">Define fields for the manual form agents send during chats.</p>
                  </div>
                  
                  {editData.form_config.map((field, index) => (
                    <div key={index} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative group">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field Label</label>
                          <input
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-4 ring-indigo-50 transition-all"
                            value={field.label}
                            onChange={(e) => {
                              const newF = [...editData.form_config];
                              newF[index].label = e.target.value;
                              newF[index].name = e.target.value.toLowerCase().replace(/\s+/g, '_');
                              setEditData({ ...editData, form_config: newF });
                            }}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Required?</label>
                            <select 
                              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none"
                              value={field.required ? 'yes' : 'no'}
                              onChange={(e) => {
                                const newF = [...editData.form_config];
                                newF[index].required = e.target.value === 'yes';
                                setEditData({ ...editData, form_config: newF });
                              }}
                            >
                              <option value="yes">Mandatory</option>
                              <option value="no">Optional</option>
                            </select>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const newF = editData.form_config.filter((_, i) => i !== index);
                              setEditData({ ...editData, form_config: newF });
                            }}
                            className="p-3.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={() => setEditData({ ...editData, form_config: [...editData.form_config, { label: "New Field", name: "new_field", required: false }] })}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black hover:border-indigo-300 hover:text-indigo-600 transition-all"
                  >
                    + Add New Form Field
                  </button>
                </div>
              ) : activeTab === 'design' ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Theme Color</label>
                    <div className="flex gap-4 items-center">
                      <input
                        type="color"
                        className="w-20 h-20 rounded-2xl border-none outline-none cursor-pointer bg-transparent"
                        value={editData.theme_color}
                        onChange={(e) => setEditData({ ...editData, theme_color: e.target.value })}
                      />
                      <div className="flex-1 relative group">
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-bold focus:ring-4 focus:ring-indigo-50 transition-all"
                          value={editData.theme_color}
                          onChange={(e) => setEditData({ ...editData, theme_color: e.target.value })}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full shadow-lg border-2 border-white" style={{ backgroundColor: editData.theme_color }} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Header Background Style</label>
                    
                    {user?.plan?.name === 'Free Tier' ? (
                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex flex-col items-center text-center gap-3">
                          <Zap className="w-8 h-8 text-amber-500" />
                          <div>
                            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Premium Customization</p>
                            <p className="text-[10px] text-amber-600 font-bold mt-1">Upgrade your plan to unlock premium gradients and custom branding.</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => window.location.href = '/dashboard/settings?tab=billing'}
                            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-amber-100 hover:scale-105 transition-all"
                          >
                            Upgrade Now
                          </button>
                        </div>
                    ) : (
                      <>
                        {/* Gradient Presets */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { name: 'Indigo Dream', css: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
                            { name: 'Midnight',     css: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
                            { name: 'Ocean Breeze', css: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)' },
                            { name: 'Sunset Glow',  css: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)' },
                            { name: 'Forest Green', css: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                            { name: 'Minimalist',   css: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' },
                          ].map((p, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setEditData({ ...editData, header_bg_gradient: p.css })}
                              className={`h-12 rounded-xl border-2 transition-all overflow-hidden relative group ${editData.header_bg_gradient === p.css ? 'border-indigo-500 shadow-lg scale-105' : 'border-slate-100'}`}
                              style={{ background: p.css }}
                              title={p.name}
                            >
                              <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity`}>
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="pt-2">
                          <p className="text-[9px] font-black text-slate-300 uppercase mb-2">Custom CSS Gradient (Advanced)</p>
                          <input
                            type="text"
                            placeholder="e.g. linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[10px] font-bold outline-none focus:bg-white"
                            value={editData.header_bg_gradient}
                            onChange={(e) => setEditData({ ...editData, header_bg_gradient: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notification Sound</label>
                      {[
                        { name: 'Standard Pop', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
                        { name: 'Crystal Ping', url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' },
                        { name: 'Subtle Ding',  url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
                      ].map((s, i) => (
                        <div key={i} className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setEditData({ ...editData, notification_sound: s.url })}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${editData.notification_sound === s.url ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                          >
                            {s.name}
                          </button>
                          <button 
                            type="button"
                            onClick={() => new Audio(s.url).play()}
                            className="p-3 bg-slate-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-slate-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => setEditData({ ...editData, notification_sound: 'off' })}
                        className={`px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${editData.notification_sound === 'off' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400'}`}
                      >
                        Mute All
                      </button>
                    </div>
                    {editData.notification_sound !== 'off' && (
                      <div className="pt-2">
                        <p className="text-[9px] font-black text-slate-300 uppercase mb-2">Custom Sound URL (Advanced)</p>
                        <input
                          type="text"
                          placeholder="https://example.com/sound.mp3"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[10px] font-bold outline-none focus:bg-white"
                          value={editData.notification_sound === 'off' ? '' : editData.notification_sound}
                          onChange={(e) => setEditData({ ...editData, notification_sound: e.target.value })}
                        />
                      </div>
                    )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Bubble Icon URL (SVG/PNG)</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner" style={{ background: editData.header_bg_gradient || editData.theme_color }}>
                        {editData.widget_icon ? <img src={editData.widget_icon} className="w-8 h-8 object-contain" /> : <MessageSquare className="w-8 h-8 text-white" />}
                      </div>
                      <input
                        type="text"
                        placeholder="https://example.com/icon.svg"
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-bold text-xs focus:ring-4 focus:ring-indigo-50 transition-all"
                        value={editData.widget_icon}
                        onChange={(e) => setEditData({ ...editData, widget_icon: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              </div>

              <div className="p-10 pt-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] premium-gradient text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

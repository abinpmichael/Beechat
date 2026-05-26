import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, Crown, Calendar, Shield, Search, AlertTriangle, CheckCircle, 
  ChevronRight, Loader2, Filter, Globe, Trash2, Database, TrendingUp, 
  CreditCard, Save, Plus, LayoutDashboard, MessageSquare, ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import SupportChat from '../components/SupportChat';
import { useAuth } from '../contexts/AuthContext';
import TestingDashboard from './TestingDashboard';
import VideoAdSimulator from './VideoAdSimulator';

// --- ENHANCED TOP-VIEW BEE ---
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
        <filter id="megaKawaiiFuzzSA" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id="megaHoneySA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="kawaiiEyeSA" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="deepBlushSA" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill="url(#megaHoneySA)" filter="url(#megaKawaiiFuzzSA)" />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill="url(#megaHoneySA)" filter="url(#megaKawaiiFuzzSA)" />
        <circle cx="40" cy="60" r="32" fill="url(#megaHoneySA)" fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill="url(#deepBlushSA)" />
        <circle cx="65" cy="70" r="10" fill="url(#deepBlushSA)" />
        <g>
          <circle cx="22" cy="55" r="16" fill="url(#kawaiiEyeSA)" />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill="url(#kawaiiEyeSA)" />
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

export default function SuperAdmin() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [allKnowledge, setAllKnowledge] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ 
    stripe_publishable_key: '', 
    stripe_secret_key: '', 
    stripe_webhook_secret: '', 
    platform_name: 'Bee Chat', 
    platform_currency: 'USD',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    seo_canonical_url: 'https://www.beechat.online/',
    seo_author: 'Bee Chat Team',
    seo_robots: 'index, follow',
    og_title: '',
    og_description: '',
    og_image: '/og-image.png',
    twitter_handle: '@BeeChatAI',
    aeo_llm_summary: '',
    aeo_product_features: '',
    aeo_faq_json: '',
    geo_region: 'US-CA',
    geo_placename: 'San Francisco, California',
    geo_position: '37.7749;-122.4194',
    geo_target_country: 'Global',
    gtm_id: '',
    enable_registration: 1,
    enable_ai_bot: 1,
    enable_live_chat: 1,
    enable_ticketing: 1,
    enable_billing: 1,
    landing_page_active: 1,
    support_email: '',
    support_phone: '',
    support_whatsapp: '',
    help_center_url: '',
    tutorial_video_url: '',
    openai_api_key: '',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_from_email: '',
    smtp_from_name: ''
  });
  const [revenue, setRevenue] = useState({ total_revenue: 0, monthly_stats: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenants');
  const [expandedTenantId, setExpandedTenantId] = useState(null);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateEditData, setTemplateEditData] = useState({ subject: '', body: '' });
  const [supportConvs, setSupportConvs] = useState([]);
  const [activeSupportTenant, setActiveSupportTenant] = useState(null);
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editData, setEditData] = useState({ plan_id: 1, expires_at: '', is_active: 1 });
  const [planEditData, setPlanEditData] = useState({ name: '', price: '', max_websites: 1, max_agents: 1, ai_enabled: false, features: [] });
  const [newKItem, setNewKItem] = useState({ title: '', content: '' });
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postEditData, setPostEditData] = useState({ title: '', slug: '', summary: '', content: '', image_url: '', status: 'draft', author: 'Bee Chat Team', seo_title: '', seo_description: '', published_at: '' });

  const API_URL = `${API_BASE_URL}/superadmin.php`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [tRes, pRes, sRes, kRes, rRes, eRes, bRes] = await Promise.all([
        axios.get(`${API_URL}?action=list_tenants`, { headers }),
        axios.get(`${API_URL}?action=get_plans`, { headers }),
        axios.get(`${API_URL}?action=get_platform_settings`, { headers }),
        axios.get(`${API_URL}?action=list_all_knowledge`, { headers }),
        axios.get(`${API_URL}?action=get_revenue_stats`, { headers }),
        axios.get(`${API_URL}?action=list_email_templates`, { headers }),
        axios.get(`${API_BASE_URL}/blog.php?action=list_all`, { headers }).catch(err => ({ data: [] }))
      ]);
      setTenants(Array.isArray(tRes.data) ? tRes.data : []);
      setPlans((Array.isArray(pRes.data) ? pRes.data : []).map(p => {
        let feats = [];
        try { feats = typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []); } catch(e) {}
        return {...p, features: feats};
      }));
      setPlatformSettings(prev => ({ 
        ...prev, 
        ...(sRes.data || {}),
        enable_registration: parseInt(sRes.data?.enable_registration ?? 1),
        enable_ai_bot: parseInt(sRes.data?.enable_ai_bot ?? 1),
        enable_live_chat: parseInt(sRes.data?.enable_live_chat ?? 1),
        enable_ticketing: parseInt(sRes.data?.enable_ticketing ?? 1),
        enable_billing: parseInt(sRes.data?.enable_billing ?? 1),
        landing_page_active: parseInt(sRes.data?.landing_page_active ?? 1)
      }));
      setAllKnowledge(Array.isArray(kRes.data) ? kRes.data : []);
      setRevenue({
        total_revenue: rRes.data?.total_revenue || 0,
        monthly_stats: Array.isArray(rRes.data?.monthly_stats) ? rRes.data.monthly_stats : []
      });
      setEmailTemplates(Array.isArray(eRes.data) ? eRes.data : []);
      setBlogPosts(Array.isArray(bRes.data) ? bRes.data : []);
      
      const supRes = await axios.get(`${API_BASE_URL}/support.php?action=list_conversations`, { headers });
      setSupportConvs(supRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(API_URL, {
        action: 'update_email_template',
        ...templateEditData
      }, { headers });
      setSelectedTemplate(null);
      fetchData();
      alert("Template updated successfully!");
    } catch (err) {
      alert("Error updating template");
    }
  };

  const handleSavePlatformSettings = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(API_URL, { 
        action: 'update_platform_settings',
        settings: platformSettings 
      }, { headers });
      alert('Global settings saved successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving platform settings');
    }
  };

  const handleDeleteKnowledge = async (id) => {
    if (!window.confirm("Are you sure you want to delete this global training item?")) return;
    try {
      await axios.post(API_URL, {
        action: 'delete_knowledge',
        id: id
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchData();
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {
        action: 'update_plan',
        tenant_id: selectedTenant.id,
        ...editData
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSelectedTenant(null);
      fetchData();
    } catch (err) {
      alert("Error updating tenant");
    }
  };

  const handlePlanUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {
        action: 'update_plan_details',
        ...planEditData
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSelectedPlan(null);
      fetchData();
      alert("Plan updated successfully!");
    } catch (err) {
      alert("Error updating plan");
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(API_URL, {
        action: 'create_plan',
        ...planEditData
      }, { headers });
      setIsCreatingPlan(false);
      setPlanEditData({ name: '', price: '', max_websites: 1, max_agents: 1, ai_enabled: false, features: [] });
      fetchData();
      alert("New plan created successfully!");
    } catch (err) {
      alert("Error creating plan");
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(`${API_BASE_URL}/blog.php`, {
        action: 'create',
        ...postEditData
      }, { headers });
      setIsCreatingPost(false);
      setPostEditData({ title: '', slug: '', summary: '', content: '', image_url: '', status: 'draft', author: 'Bee Chat Team', seo_title: '', seo_description: '', published_at: '' });
      fetchData();
      alert("Blog post created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating blog post");
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(`${API_BASE_URL}/blog.php`, {
        action: 'update',
        ...postEditData
      }, { headers });
      setSelectedPost(null);
      fetchData();
      alert("Blog post updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating blog post");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(`${API_BASE_URL}/blog.php`, {
        action: 'delete',
        id
      }, { headers });
      fetchData();
      alert("Blog post deleted successfully!");
    } catch (err) {
      alert("Error deleting blog post");
    }
  };

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 pb-20 selection:bg-amber-100 selection:text-amber-600">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50">
             <TopBee size={40} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => window.location.href = '/dashboard'} className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
                ← Back to User Dashboard
              </button>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Super Admin <span className="text-amber-500">Hive</span></h2>
            <p className="text-slate-500 font-medium mt-1 text-sm">Manage all tenants and subscription plans system-wide.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" placeholder="Search companies..."
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-80 font-bold outline-none focus:ring-4 focus:ring-amber-50 transition-all shadow-sm"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] border border-white shadow-xl">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Globe className="w-6 h-6" /></div>
          <h3 className="text-3xl font-black text-slate-900">{tenants.length}</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Total Tenants</p>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white shadow-xl">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Crown className="w-6 h-6" /></div>
          <h3 className="text-3xl font-black text-slate-900">{tenants.filter(t => t.plan_name !== 'Free Tier').length}</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Premium Accounts</p>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-white shadow-xl">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6" /></div>
          <h3 className="text-3xl font-black text-slate-900">{tenants.filter(t => !t.is_active).length}</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Suspended</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-[2rem] w-fit">
        {[
          { id: 'tenants', name: 'Manage Tenants' },
          { id: 'plans', name: 'Subscription Plans' },
          { id: 'blog', name: 'Blog Hub' },
          { id: 'ai', name: 'AI Training Oversight' },
          { id: 'revenue', name: 'Financial Insights' },
          { id: 'settings', name: 'Gateway & Settings' },
          { id: 'emails', name: 'Email Center' },
          { id: 'testing', name: 'Automated Testing' },
          { id: 'support', name: 'Support Chats' },
          { id: 'video-ad', name: 'Video Ad Builder 🎬' }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-amber-600'} ${tab.id === 'support' ? 'flex items-center gap-2' : ''}`}
          >
            {tab.name}
            {tab.id === 'support' && supportConvs.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{supportConvs.length}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tenants' && (
        <div className="glass rounded-[3rem] border border-white shadow-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Plan</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tenant) => (
                <React.Fragment key={tenant.id}>
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className={`hover:bg-slate-50/50 transition-all group ${expandedTenantId === tenant.id ? 'bg-slate-50/50' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">{tenant.name[0]}</div>
                        <div>
                          <h4 className="font-black text-slate-900">{tenant.name}</h4>
                          <p className="text-xs text-slate-400 font-medium">/{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${tenant.plan_name === 'Enterprise' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-100 text-slate-500'}`}>{tenant.plan_name}</span>
                      {tenant.expires_at && <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires: {new Date(tenant.expires_at).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${tenant.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-sm font-black text-slate-700">{tenant.is_active ? 'Active' : 'Suspended'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setExpandedTenantId(expandedTenantId === tenant.id ? null : tenant.id)}
                          className={`p-3 rounded-2xl transition-all shadow-sm ${expandedTenantId === tenant.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          title="View Tenant Details"
                        >
                          <ChevronDown className={`w-5 h-5 transition-transform ${expandedTenantId === tenant.id ? 'rotate-180' : ''}`} />
                        </button>
                        <button 
                          onClick={() => { setSelectedTenant(tenant); setEditData({ plan_id: tenant.plan_id || 1, expires_at: tenant.expires_at ? tenant.expires_at.split(' ')[0] : '', is_active: tenant.is_active }); }} 
                          className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          title="Override Subscription Access"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  {expandedTenantId === tenant.id && (
                    <tr className="bg-slate-50/20">
                      <td colSpan={4} className="px-8 py-6">
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white rounded-3xl border border-slate-100 shadow-lg text-left"
                        >
                          {/* Owner Profile */}
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Owner Profile</h5>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Name</p>
                              <p className="text-sm font-black text-slate-800">{tenant.owner_name || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Email Address</p>
                              <p className="text-sm font-bold text-slate-700 break-all select-all">{tenant.owner_email || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Usage Metrics */}
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Usage Metrics</h5>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Websites</p>
                                <p className="text-2xl font-black text-slate-800 mt-1">{tenant.site_count || 0}</p>
                              </div>
                              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Team Members</p>
                                <p className="text-2xl font-black text-slate-800 mt-1">{tenant.user_count || 0}</p>
                              </div>
                            </div>
                          </div>

                          {/* Subscription / Tech parameters */}
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Subscription & Details</h5>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between font-bold text-slate-500">
                                <span>Tenant ID:</span>
                                <span className="text-slate-850 font-black">#{tenant.id}</span>
                              </div>
                              <div className="flex justify-between font-bold text-slate-500">
                                <span>Created At:</span>
                                <span className="text-slate-800">{new Date(tenant.created_at).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-bold text-slate-500">
                                <span>Slug Path:</span>
                                <span className="text-amber-600 font-black">/{tenant.slug}</span>
                              </div>
                              {tenant.stripe_customer_id && (
                                <div className="flex justify-between font-bold text-slate-500">
                                  <span>Stripe ID:</span>
                                  <span className="text-slate-800 font-mono select-all text-[11px]">{tenant.stripe_customer_id}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Platform-Wide AI Training</h3>
            <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black">{allKnowledge.length} Total Items</span>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white shadow-xl bg-slate-950 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10"><Database className="w-32 h-32" /></div>
             <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">Inject Global Hive Memory</h4>
             <p className="text-slate-400 text-xs font-medium mb-8 max-w-md">Items added here will be available to EVERY AI bot on the platform, regardless of tenant. Use this for general platform help or global FAQs.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Knowledge Title</label>
                   <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white" placeholder="e.g. How to use Bee Chat" value={newKItem.title} onChange={e => setNewKItem({...newKItem, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Content / Instruction</label>
                   <textarea className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white" rows="1" placeholder="Detailed answer or behavior instructions..." value={newKItem.content} onChange={e => setNewKItem({...newKItem, content: e.target.value})} />
                </div>
             </div>
             <button onClick={async () => {
                if (!newKItem.title || !newKItem.content) return alert("Please fill both title and content");
                try {
                   await axios.post(API_URL, { action: 'add_global_knowledge', ...newKItem }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                   setNewKItem({ title: '', content: '' });
                   fetchData();
                   alert("Global knowledge injected successfully!");
                } catch (err) { alert("Error injecting knowledge"); }
             }} className="mt-8 px-10 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Inject Memory Cell</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allKnowledge.map((item) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="glass p-8 rounded-[2.5rem] border border-white shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.tenant_name}</div>
                  <div className="px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.domain}</div>
                </div>
                <h4 className="font-black text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{item.content}</p>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                  <button onClick={() => handleDeleteKnowledge(item.id)} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-amber-500 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl shadow-amber-100 relative overflow-hidden group">
                <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Total Revenue</p>
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter">${Number(revenue.total_revenue).toLocaleString()}</h3>
              </div>
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Average Monthly</p>
                 <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">${revenue.monthly_stats.length > 0 ? (Number(revenue.total_revenue) / revenue.monthly_stats.length).toFixed(0) : 0}</h3>
              </div>
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Active Tenants</p>
                 <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{tenants.filter(t => t.is_active).length}</h3>
              </div>
           </div>
           <div className="glass p-8 md:p-12 rounded-[3rem]">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6 md:mb-8 text-center">Monthly Breakdown</h3>
              <div className="space-y-4">
                 {revenue.monthly_stats.map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center border border-slate-100 group-hover:border-amber-100 transition-colors">
                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(0, stat.month - 1).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-xl font-black text-slate-900 leading-none mt-1">{stat.year}</span>
                         </div>
                         <p className="text-lg font-black text-slate-900">Total Monthly Settlements</p>
                      </div>
                      <p className="text-3xl font-black text-amber-500 tracking-tighter">${Number(stat.total).toLocaleString()}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-end">
            <button onClick={() => { setPlanEditData({ name: '', price: '', max_websites: 1, max_agents: 1, ai_enabled: false, features: [] }); setIsCreatingPlan(true); }} className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-amber-100 hover:scale-105 transition-all flex items-center gap-3">
              <Plus className="w-5 h-5" /> Add New Tier
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={p.id} className="glass p-10 rounded-[3rem] border-2 border-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <button onClick={() => { setSelectedPlan(p); setPlanEditData({...p}); }} className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-all"><Shield className="w-5 h-5" /></button>
                </div>
                <h4 className="text-xl font-black text-slate-900">{p.name}</h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">${p.price}</span>
                  <span className="text-slate-400 font-bold text-sm">/mo</span>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600"><span>Websites</span><span className="text-amber-500">{p.max_websites}</span></div>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600"><span>Support Agents</span><span className="text-amber-500">{p.max_agents}</span></div>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600"><span>AI Auto-Reply</span><span className={p.ai_enabled ? 'text-emerald-500' : 'text-slate-300'}>{p.ai_enabled ? 'ON' : 'OFF'}</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl space-y-8">
          <div className="glass p-10 rounded-[3rem] border border-white shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Shield className="w-6 h-6 text-amber-500" /> Payment & Demo Mode
              </h3>
              <div 
                onClick={() => setPlatformSettings({...platformSettings, is_testing_mode: platformSettings.is_testing_mode ? 0 : 1})}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all border-2 ${platformSettings.is_testing_mode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}
              >
                <div className={`w-3 h-3 rounded-full ${platformSettings.is_testing_mode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {platformSettings.is_testing_mode ? 'Testing Mode (Simulated)' : 'Live Mode (Stripe Active)'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              When <strong>Testing Mode</strong> is enabled, all payments are simulated and no real money is charged. Disable this only when you are ready to use your real Stripe API keys.
            </p>
            
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><CreditCard className="w-6 h-6 text-amber-500" /> Stripe Integration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Publishable Key</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" value={platformSettings.stripe_publishable_key} onChange={(e) => setPlatformSettings({...platformSettings, stripe_publishable_key: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                <input type="password" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" value={platformSettings.stripe_secret_key} onChange={(e) => setPlatformSettings({...platformSettings, stripe_secret_key: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Webhook Secret</label>
                <input type="password" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" value={platformSettings.stripe_webhook_secret} onChange={(e) => setPlatformSettings({...platformSettings, stripe_webhook_secret: e.target.value})} />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-10 mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-amber-500" /> Google Authentication
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Client ID</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" 
                value={platformSettings.google_client_id || ''} 
                onChange={(e) => setPlatformSettings({...platformSettings, google_client_id: e.target.value})}
                placeholder="000000000000-xxxx.apps.googleusercontent.com"
              />
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-10 mb-6 flex items-center gap-3">
              <Globe className="w-6 h-6 text-amber-500" /> OpenAI GPT Integration
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OpenAI API Key</label>
              <input 
                type="password" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" 
                value={platformSettings.openai_api_key || ''} 
                onChange={(e) => setPlatformSettings({...platformSettings, openai_api_key: e.target.value})}
                placeholder="sk-..."
              />
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-10 mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-amber-500" /> SMTP Email Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.smtp_host || ''} onChange={(e) => setPlatformSettings({...platformSettings, smtp_host: e.target.value})} placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Port</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.smtp_port || ''} onChange={(e) => setPlatformSettings({...platformSettings, smtp_port: e.target.value})} placeholder="587" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP User</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.smtp_user || ''} onChange={(e) => setPlatformSettings({...platformSettings, smtp_user: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Password</label>
                <input type="password" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.smtp_pass || ''} onChange={(e) => setPlatformSettings({...platformSettings, smtp_pass: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Email</label>
                <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.smtp_from_email || ''} onChange={(e) => setPlatformSettings({...platformSettings, smtp_from_email: e.target.value})} placeholder="noreply@domain.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Name</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.smtp_from_name || ''} onChange={(e) => setPlatformSettings({...platformSettings, smtp_from_name: e.target.value})} placeholder="Bee Chat" />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-10 mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-amber-500" /> Platform Contact & Support
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
              These details are shown on the landing page, help center, and customer dashboards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.support_email} onChange={(e) => setPlatformSettings({...platformSettings, support_email: e.target.value})} placeholder="support@beechat.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Phone</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.support_phone} onChange={(e) => setPlatformSettings({...platformSettings, support_phone: e.target.value})} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Chat Link</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.support_whatsapp} onChange={(e) => setPlatformSettings({...platformSettings, support_whatsapp: e.target.value})} placeholder="https://wa.me/..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Help Center URL</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.help_center_url || ''} onChange={(e) => setPlatformSettings({...platformSettings, help_center_url: e.target.value})} placeholder="https://help.beechat.com" />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Tutorial MP4 / Video URL</label>
                <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-mono text-xs" value={platformSettings.tutorial_video_url || ''} onChange={(e) => setPlatformSettings({...platformSettings, tutorial_video_url: e.target.value})} placeholder="https://www.w3schools.com/html/mov_bbb.mp4" />
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Database className="w-6 h-6 text-amber-500" /> System Feature Controls
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              Enable or disable core system functions globally. These settings affect all tenants and visitors.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'enable_registration', label: 'User Registration', desc: 'Allow new companies to sign up' },
                { key: 'enable_ai_bot', label: 'AI Support Bot', desc: 'Enable automated AI responses' },
                { key: 'enable_live_chat', label: 'Live Agent Chat', desc: 'Allow real-time human support' },
                { key: 'enable_ticketing', label: 'Ticket System', desc: 'Enable offline support tickets' },
                { key: 'enable_billing', label: 'Subscription Billing', desc: 'Enable Stripe checkout & plans' },
                { key: 'landing_page_active', label: 'Marketing Home Page', desc: 'Show landing page instead of login' },
              ].map(feature => (
                <div key={feature.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <h4 className="font-black text-slate-900">{feature.label}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{feature.desc}</p>
                  </div>
                  <div 
                    onClick={() => setPlatformSettings({...platformSettings, [feature.key]: platformSettings[feature.key] ? 0 : 1})} 
                    className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${platformSettings[feature.key] ? 'bg-amber-500' : 'bg-slate-200'}`}
                  >
                    <motion.div animate={{ x: platformSettings[feature.key] ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white shadow-xl space-y-8">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Globe className="w-6 h-6 text-amber-500" /> Search & Social Optimization (SEO / AEO / GEO)
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Configure search metadata, AI answer engine overviews (`/llms.txt`), and local geotargeting tags dynamically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SEO Title</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.seo_title || ''} onChange={(e) => setPlatformSettings({...platformSettings, seo_title: e.target.value})} placeholder="Bee Chat | AI-Powered Support" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Canonical URL</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.seo_canonical_url || ''} onChange={(e) => setPlatformSettings({...platformSettings, seo_canonical_url: e.target.value})} placeholder="https://www.beechat.online/" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SEO Description</label>
                <textarea rows="2" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.seo_description || ''} onChange={(e) => setPlatformSettings({...platformSettings, seo_description: e.target.value})} placeholder="Description for Google search..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SEO Keywords</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.seo_keywords || ''} onChange={(e) => setPlatformSettings({...platformSettings, seo_keywords: e.target.value})} placeholder="AI Chat, Live Support, Customer Engagement" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Robots Directive</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.seo_robots || ''} onChange={(e) => setPlatformSettings({...platformSettings, seo_robots: e.target.value})} placeholder="index, follow" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GTM Container ID</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.gtm_id || ''} onChange={(e) => setPlatformSettings({...platformSettings, gtm_id: e.target.value})} placeholder="GTM-XXXXXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Analytics Measurement ID (gtag.js)</label>
                <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.google_analytics_id || ''} onChange={(e) => setPlatformSettings({...platformSettings, google_analytics_id: e.target.value})} placeholder="G-XXXXXXXXXX" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">📱 Social Media / Open Graph</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OG Title</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.og_title || ''} onChange={(e) => setPlatformSettings({...platformSettings, og_title: e.target.value})} placeholder="Social share title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Twitter Handle</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.twitter_handle || ''} onChange={(e) => setPlatformSettings({...platformSettings, twitter_handle: e.target.value})} placeholder="@BeeChatAI" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OG Description</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.og_description || ''} onChange={(e) => setPlatformSettings({...platformSettings, og_description: e.target.value})} placeholder="Social share description..." />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">🤖 Answer Engine Optimization (AEO - For ChatGPT, Gemini, Claude)</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Prompt Summary (`/llms.txt` or `/ai.txt`)</label>
                  <textarea rows="3" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" value={platformSettings.aeo_llm_summary || ''} onChange={(e) => setPlatformSettings({...platformSettings, aeo_llm_summary: e.target.value})} placeholder="# Bee Chat AI Overview..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structured Key Features (JSON List)</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" value={platformSettings.aeo_product_features || ''} onChange={(e) => setPlatformSettings({...platformSettings, aeo_product_features: e.target.value})} placeholder='["Feature 1", "Feature 2"]' />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structured FAQ JSON (For Google AI Overviews & Answer Boxes)</label>
                  <textarea rows="3" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" value={platformSettings.aeo_faq_json || ''} onChange={(e) => setPlatformSettings({...platformSettings, aeo_faq_json: e.target.value})} placeholder='[{"q":"What is Bee Chat?","a":"Answer..."}]' />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">📍 Generative Engine & Geotargeting (GEO)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region Code</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.geo_region || ''} onChange={(e) => setPlatformSettings({...platformSettings, geo_region: e.target.value})} placeholder="US-CA" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Place Name</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.geo_placename || ''} onChange={(e) => setPlatformSettings({...platformSettings, geo_placename: e.target.value})} placeholder="San Francisco, California" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lat;Long (ICBM)</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={platformSettings.geo_position || ''} onChange={(e) => setPlatformSettings({...platformSettings, geo_position: e.target.value})} placeholder="37.7749;-122.4194" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSavePlatformSettings} className="bg-amber-500 text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-amber-100 flex items-center gap-3"><Save className="w-5 h-5" /> Save Global Settings</button>
          </div>
        </div>
      )}
      
      {activeTab === 'emails' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">System Email Templates</h3>
            <p className="text-sm text-slate-500 font-medium">Use <code>{`{{placeholder}}`}</code> to inject dynamic data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {emailTemplates.map(tpl => (
              <motion.div key={tpl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-8 rounded-[2.5rem] border border-white shadow-xl group">
                <div className="flex items-center justify-between mb-6">
                  <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{tpl.name}</div>
                  <button onClick={() => { setSelectedTemplate(tpl); setTemplateEditData({...tpl}); }} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-500 transition-all shadow-lg opacity-0 group-hover:opacity-100"><Shield className="w-4 h-4" /></button>
                </div>
                <h4 className="font-black text-slate-900 text-lg mb-2">{tpl.subject}</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto">
                   <div className="text-xs text-slate-500 font-medium whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: tpl.body }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <TestingDashboard />
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Blog Hub</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Publish news, insights, and marketing articles for visitors.</p>
            </div>
            <button 
              onClick={() => { 
                setPostEditData({ title: '', slug: '', summary: '', content: '', image_url: '', status: 'draft', author: 'Bee Chat Team', seo_title: '', seo_description: '', published_at: '' }); 
                setIsCreatingPost(true); 
              }} 
              className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-amber-100 hover:scale-105 transition-all flex items-center gap-3 w-fit"
            >
              <Plus className="w-5 h-5" /> Write Blog Post
            </button>
          </div>

          <div className="glass rounded-[3rem] border border-white shadow-2xl overflow-hidden">
            {blogPosts.length === 0 ? (
              <div className="p-20 text-center">
                <TopBee size={60} animated={false} className="mx-auto opacity-30 mb-6" />
                <p className="text-slate-400 font-black text-lg italic">No blog posts found. Write the first one!</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Article</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blogPosts.map((post) => {
                    const isScheduled = post.status === 'published' && post.published_at && new Date(post.published_at) > new Date();
                    return (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={post.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            {post.image_url ? (
                              <img src={post.image_url} alt="" className="w-16 h-10 object-cover rounded-xl border border-slate-100 shrink-0" />
                            ) : (
                              <div className="w-16 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-400 font-black">B</div>
                            )}
                            <div>
                              <h4 className="font-black text-slate-900 line-clamp-1 max-w-[280px]">{post.title}</h4>
                              <p className="text-xs text-slate-400 font-medium">/{post.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-700">{post.author}</td>
                        <td className="px-8 py-6">
                          {isScheduled ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-blue-100 text-blue-700">
                              Scheduled
                            </span>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {post.status}
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-500">
                          <div className="flex flex-col gap-0.5">
                            <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                            {post.published_at && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(post.published_at) > new Date() ? 'Scheduled: ' : 'Published: '}
                                {new Date(post.published_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button 
                            onClick={() => { 
                              setSelectedPost(post); 
                              setPostEditData({ 
                                ...post, 
                                published_at: post.published_at ? post.published_at.replace(' ', 'T').substring(0, 16) : '' 
                              }); 
                            }} 
                            className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)} 
                            className="p-3 bg-slate-100 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Open <span className="text-amber-600">Tickets</span></h3>
              {supportConvs.length === 0 ? (
                <div className="p-10 bg-white rounded-[2.5rem] text-center border border-slate-100">
                  <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm italic">No active support requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {supportConvs.map(conv => (
                    <button 
                      key={conv.id} 
                      onClick={() => setActiveSupportTenant(conv.tenant_id)}
                      className={`w-full p-6 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${
                        activeSupportTenant === conv.tenant_id ? 'bg-amber-600 border-amber-600 text-white shadow-xl shadow-amber-100' : 'bg-white border-slate-100 text-slate-600 hover:border-amber-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                        activeSupportTenant === conv.tenant_id ? 'bg-white/20' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {conv.company_name?.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-sm truncate">{conv.company_name}</p>
                        <p className={`text-[10px] font-bold truncate opacity-60`}>
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${activeSupportTenant === conv.tenant_id ? 'opacity-100' : 'opacity-20'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {activeSupportTenant ? (
                <SupportChat 
                  user={user} 
                  targetTenantId={activeSupportTenant} 
                  onClose={() => setActiveSupportTenant(null)} 
                />
              ) : (
                <div className="h-full min-h-[500px] glass rounded-[3.5rem] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Select a Conversation</h4>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">Choose a tenant from the list to start a real-time support session and assist them with their platform needs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'video-ad' && (
        <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 shadow-xl">
          <VideoAdSimulator embedded={true} />
        </div>
      )}

      {/* Modals */}
      {selectedTenant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedTenant(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-white">
            <h3 className="text-3xl font-black text-slate-900 mb-8 text-center">Override Access</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editData.plan_id} onChange={(e) => setEditData({...editData, plan_id: e.target.value})}>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price}/mo)</option>)}
              </select>
              <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={editData.expires_at} onChange={(e) => setEditData({...editData, expires_at: e.target.value})} />
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="font-black">Account Active</span>
                <div onClick={() => setEditData({...editData, is_active: editData.is_active ? 0 : 1})} className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${editData.is_active ? 'bg-amber-500' : 'bg-slate-200'}`}><motion.div animate={{ x: editData.is_active ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" /></div>
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-xl">Save Changes</button>
            </form>
          </motion.div>
        </div>
      )}

      {(selectedPlan || isCreatingPlan) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setSelectedPlan(null); setIsCreatingPlan(false); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl border border-white">
            <h3 className="text-3xl font-black text-slate-900 mb-8 text-center">{isCreatingPlan ? 'Create New Plan' : 'Edit Plan'}</h3>
            <form onSubmit={isCreatingPlan ? handleCreatePlan : handlePlanUpdate} className="space-y-6">
              <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Plan Name" value={planEditData.name} onChange={(e) => setPlanEditData({...planEditData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Price" value={planEditData.price} onChange={(e) => setPlanEditData({...planEditData, price: e.target.value})} />
                <input type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Websites" value={planEditData.max_websites} onChange={(e) => setPlanEditData({...planEditData, max_websites: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Agents" value={planEditData.max_agents} onChange={(e) => setPlanEditData({...planEditData, max_agents: e.target.value})} />
                <div onClick={() => setPlanEditData({...planEditData, ai_enabled: !planEditData.ai_enabled})} className={`w-full px-6 py-4 rounded-2xl font-black text-center cursor-pointer transition-all ${planEditData.ai_enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>{planEditData.ai_enabled ? 'AI ENABLED' : 'AI DISABLED'}</div>
              </div>
              <textarea rows="3" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Features (one per line)" value={planEditData.features.join('\n')} onChange={(e) => setPlanEditData({...planEditData, features: e.target.value.split('\n')})} />
              <button type="submit" className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-xl">{isCreatingPlan ? 'Create Plan' : 'Save Changes'}</button>
            </form>
          </motion.div>
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedTemplate(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl border border-white">
            <h3 className="text-3xl font-black text-slate-900 mb-8 text-center uppercase tracking-tight">Edit Template: <span className="text-amber-500">{selectedTemplate.name}</span></h3>
            <form onSubmit={handleUpdateTemplate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Subject</label>
                <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={templateEditData.subject} onChange={(e) => setTemplateEditData({...templateEditData, subject: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HTML Body Content</label>
                <textarea rows="10" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs leading-relaxed" value={templateEditData.body} onChange={(e) => setTemplateEditData({...templateEditData, body: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-100 hover:bg-slate-900 transition-all uppercase tracking-widest">Save Template Changes</button>
            </form>
          </motion.div>
        </div>
      )}

      {(selectedPost || isCreatingPost) && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { setSelectedPost(null); setIsCreatingPost(false); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-3xl bg-white rounded-[3rem] p-10 shadow-2xl border border-white my-8 z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="text-3xl font-black text-slate-900 mb-6 text-center">{isCreatingPost ? 'Write Blog Post' : 'Edit Blog Post'}</h3>
            <form onSubmit={isCreatingPost ? handleCreatePost : handleUpdatePost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" required 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" 
                    placeholder="e.g. Scaling customer interactions" 
                    value={postEditData.title} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setPostEditData({
                        ...postEditData,
                        title: val,
                        slug: isCreatingPost ? generateSlug(val) : postEditData.slug
                      });
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug (URL Name)</label>
                  <input 
                    type="text" required 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-mono text-xs" 
                    placeholder="e.g. scaling-customer-interactions" 
                    value={postEditData.slug} 
                    onChange={(e) => setPostEditData({...postEditData, slug: generateSlug(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author</label>
                  <input 
                    type="text" required 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" 
                    value={postEditData.author} 
                    onChange={(e) => setPostEditData({...postEditData, author: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold font-mono text-xs" 
                    placeholder="https://unsplash.com/..." 
                    value={postEditData.image_url || ''} 
                    onChange={(e) => setPostEditData({...postEditData, image_url: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" 
                    value={postEditData.status} 
                    onChange={(e) => setPostEditData({...postEditData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Published At / Schedule</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" 
                    value={postEditData.published_at || ''} 
                    onChange={(e) => setPostEditData({...postEditData, published_at: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary (Short Excerpt)</label>
                <textarea 
                  rows="2" required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm leading-relaxed" 
                  placeholder="Summarize the post in 2-3 sentences..." 
                  value={postEditData.summary} 
                  onChange={(e) => setPostEditData({...postEditData, summary: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SEO Meta Title (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" 
                    placeholder="Search engine title..." 
                    value={postEditData.seo_title || ''} 
                    onChange={(e) => setPostEditData({...postEditData, seo_title: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SEO Meta Description (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" 
                    placeholder="Search engine description..." 
                    value={postEditData.seo_description || ''} 
                    onChange={(e) => setPostEditData({...postEditData, seo_description: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content (HTML / Markdown style)</label>
                <textarea 
                  rows="8" required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs leading-relaxed" 
                  placeholder="<h1>Heading</h1><p>Start writing article here...</p>" 
                  value={postEditData.content} 
                  onChange={(e) => setPostEditData({...postEditData, content: e.target.value})} 
                />
              </div>

              <button type="submit" className="w-full bg-amber-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-100 hover:bg-slate-900 transition-all uppercase tracking-widest">
                {isCreatingPost ? 'Publish Article' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Bell, Shield, Palette, Bot, Save, Loader2, Check, Lock, Eye, EyeOff, UserCircle, Zap, Users, CreditCard, Activity, ChevronRight, Crown } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost/Bee/server/api/settings.php';
const PASS_URL = 'http://localhost/Bee/server/api/change_password.php';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    handover_enabled: 1,
    visitor_tracking: 0,
    default_language: 'en',
    opening_time: '09:00',
    closing_time: '18:00',
    chat_visibility: 'shared',
    ai_auto_reply: 0,
    notifications_enabled: 1,
    default_theme_color: '#6366f1',
    default_bot_name: 'Bee Bot'
  });

  // Password state
  const [passState, setPassState] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });
  const [plans, setPlans] = useState([]);
  const [upgradeLoading, setUpgradeLoading] = useState(null);

  const fetchPlans = async () => {
    try {
      const r = await axios.get('http://localhost/Bee/server/api/super_plans.php');
      setPlans(r.data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchSettings();
    fetchPlans();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.data) {
        setConfig({
          ...res.data,
          handover_enabled: Number(res.data.handover_enabled),
          visitor_tracking: Number(res.data.visitor_tracking),
          default_language: res.data.default_language || 'en',
          opening_time: res.data.opening_time?.substring(0, 5) || '09:00',
          closing_time: res.data.closing_time?.substring(0, 5) || '18:00'
        });
      }
    } catch (err) {
      console.error("Error fetching settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(API_URL, config, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passState.new !== passState.confirm) {
      setPassMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPassLoading(true);
    setPassMessage({ type: '', text: '' });
    try {
      await axios.post(PASS_URL, { 
        current_password: passState.current, 
        new_password: passState.new 
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassState({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPassMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setUpgradeLoading(planId);
    try {
      const res = await axios.post('http://localhost/Bee/server/api/billing.php', {
        action: 'checkout',
        planId: planId
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data.message || "Successfully upgraded your plan!");
        await refreshUser(); // Update global user state
        await fetchSettings(); // Update local settings view
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upgrade plan. Please contact support.");
    } finally {
      setUpgradeLoading(null);
    }
  };

  const renderBilling = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Subscription Plan</h3>
          <p className="text-slate-500 font-medium mt-1">Manage your usage limits and premium features.</p>
        </div>
        {user?.is_superadmin === 1 && (
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-indigo-100">
            <Shield className="w-6 h-6" /> PLATFORM OWNER (UNLIMITED)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 1, name: 'Free Tier', price: '0', websites: 1, agents: 2, ai: false },
          { id: 2, name: 'Growth Plan', price: '29', websites: 5, agents: 10, ai: true, popular: true },
          { id: 3, name: 'Enterprise', price: '99', websites: 'Unlimited', agents: 'Unlimited', ai: true }
        ].map((p) => {
          const isCurrent = user?.plan?.name?.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]);
          return (
            <div key={p.id} className={`glass p-10 rounded-[3rem] border-2 transition-all relative ${p.popular ? 'border-indigo-500 shadow-2xl scale-105 z-10' : 'border-white shadow-xl'}`}>
              {p.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</span>}
              
              <h4 className="text-xl font-black text-slate-900">{p.name}</h4>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">${p.price}</span>
                <span className="text-slate-400 font-bold text-sm">/month</span>
              </div>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Check className="w-5 h-5 text-emerald-500" /> {p.websites} {p.websites === 1 ? 'Website' : 'Websites'}
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Check className="w-5 h-5 text-emerald-500" /> {p.agents} Support Agents
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  {p.ai ? <Check className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 border-2 border-slate-200 rounded-full" />}
                  AI Auto-Reply {p.ai ? 'Enabled' : 'Disabled'}
                </li>
              </ul>

              <button 
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrent || upgradeLoading || user?.is_superadmin === 1}
                className={`w-full mt-10 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  isCurrent ? 'bg-emerald-50 text-emerald-600 cursor-default' : 
                  user?.is_superadmin === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                  'premium-gradient text-white shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95'
                }`}
              >
                {upgradeLoading === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                 isCurrent ? 'Active Plan' : 
                 user?.is_superadmin === 1 ? 'Infinite Access' : 'Upgrade Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Settings</span></h2>
          <p className="text-slate-500 font-medium mt-1">Configure your global platform behavior and agent preferences.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-80 space-y-3 shrink-0 sticky top-24">
          {[
            { id: 'general', name: 'General Preferences', icon: Globe },
            { id: 'privacy', name: 'Privacy & Visibility', icon: Eye },
            { id: 'security', name: 'Account Security', icon: Lock },
            { id: 'billing', name: 'Billing & Subscription', icon: CreditCard },
            { id: 'branding', name: 'Platform Branding', icon: Palette },
            { id: 'ai', name: 'AI & Automation', icon: Bot },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all border-2 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border-indigo-600' : 'bg-white text-slate-500 hover:bg-slate-50 border-transparent shadow-sm'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-indigo-500'}`} />
              <span className="text-sm">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="glass p-10 rounded-[3rem] border border-white shadow-xl shadow-indigo-100/20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-indigo-600" /> General Preferences
                </h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800">Multi-Agent Handover</h4>
                      <p className="text-sm text-slate-500 font-medium">Allow agents to transfer chats between each other.</p>
                    </div>
                    <div 
                      onClick={() => setConfig({...config, handover_enabled: config.handover_enabled ? 0 : 1})}
                      className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${config.handover_enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <motion.div animate={{ x: config.handover_enabled ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800">Visitor Tracking</h4>
                      <p className="text-sm text-slate-500 font-medium">Record visitor location and IP for better support.</p>
                    </div>
                    <div 
                      onClick={() => setConfig({...config, visitor_tracking: config.visitor_tracking ? 0 : 1})}
                      className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${config.visitor_tracking ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <motion.div animate={{ x: config.visitor_tracking ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Language</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" value={config.default_language} onChange={(e) => setConfig({...config, default_language: e.target.value})}>
                      <option value="en">English (US)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Timezone</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
                      value={config.timezone || 'UTC'} 
                      onChange={(e) => setConfig({...config, timezone: e.target.value})}
                    >
                      <option value="UTC">UTC (Universal Time)</option>
                      <option value="America/New_York">Eastern Time (US/Canada)</option>
                      <option value="America/Chicago">Central Time (US/Canada)</option>
                      <option value="America/Denver">Mountain Time (US/Canada)</option>
                      <option value="America/Los_Angeles">Pacific Time (US/Canada)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 font-medium ml-1">Select your local timezone to sync business hours correctly.</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operating Hours</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Opens at</p>
                        <input type="time" className="w-full bg-transparent border-none font-black text-slate-700 p-0 focus:ring-0" value={config.opening_time} onChange={(e) => setConfig({...config, opening_time: e.target.value})} />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Closes at</p>
                        <input type="time" className="w-full bg-transparent border-none font-black text-slate-700 p-0 focus:ring-0" value={config.closing_time} onChange={(e) => setConfig({...config, closing_time: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <h4 className="font-black text-slate-800">Sound Notifications</h4>
                      <p className="text-sm text-slate-500 font-medium">Play a sound when a new message arrives.</p>
                    </div>
                    <div 
                      onClick={() => setConfig({...config, notifications_enabled: config.notifications_enabled ? 0 : 1})}
                      className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${config.notifications_enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <motion.div animate={{ x: config.notifications_enabled ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <button onClick={handleSave} disabled={saving} className="premium-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-70">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="glass p-10 rounded-[3rem] border border-white shadow-xl shadow-indigo-100/20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-indigo-600" /> Privacy & Visibility
                </h3>
                <div className="space-y-8">
                  <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                    <h4 className="font-black text-indigo-900 mb-2">Chat Visibility Mode</h4>
                    <p className="text-sm text-indigo-600/70 font-medium mb-6 leading-relaxed">
                      Control how your agents access chat sessions. <strong>Shared mode</strong> allows all team members to see and jump into any live chat. <strong>Private mode</strong> restricts visibility to only assigned agents.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setConfig({...config, chat_visibility: 'shared'})}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${config.chat_visibility === 'shared' ? 'bg-white border-indigo-600 shadow-md' : 'bg-transparent border-slate-200 opacity-60'}`}
                      >
                        <Users className={`w-8 h-8 mb-3 ${config.chat_visibility === 'shared' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <h5 className="font-black text-slate-900">Shared Mode</h5>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Collaborative access</p>
                      </button>
                      <button 
                        onClick={() => setConfig({...config, chat_visibility: 'private'})}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${config.chat_visibility === 'private' ? 'bg-white border-indigo-600 shadow-md' : 'bg-transparent border-slate-200 opacity-60'}`}
                      >
                        <Lock className={`w-8 h-8 mb-3 ${config.chat_visibility === 'private' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <h5 className="font-black text-slate-900">Private Mode</h5>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Strict privacy</p>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" /> Internal Team Notes
                    </h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Notes left by agents in the chat panel are <strong>always private</strong> and invisible to visitors. 
                      In Shared Mode, all agents can read these notes. In Private Mode, only the assigned agent and admins see them.
                    </p>
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <button onClick={handleSave} disabled={saving} className="premium-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Visibility Settings
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="glass p-10 rounded-[3rem] border border-white shadow-xl shadow-indigo-100/20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-indigo-600" /> Account Security
                </h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input 
                      type="password" required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                      value={passState.current}
                      onChange={(e) => setPassState({...passState, current: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                      value={passState.new}
                      onChange={(e) => setPassState({...passState, new: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password" required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                      value={passState.confirm}
                      onChange={(e) => setPassState({...passState, confirm: e.target.value})}
                    />
                  </div>

                  {passMessage.text && (
                    <motion.div initial={{ opacity:0, x:-5 }} animate={{ opacity:1, x:0 }} className={`p-4 rounded-2xl text-xs font-black uppercase tracking-wider ${passMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {passMessage.text}
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={passLoading}
                    className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {passLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                    Update Password
                  </button>
                </form>
              </motion.div>
            )}



            {activeTab === 'branding' && (
              <motion.div key="branding" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="glass p-10 rounded-[3rem] border border-white shadow-xl shadow-indigo-100/20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Palette className="w-6 h-6 text-indigo-600" /> Platform Branding
                </h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Bot Name</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                      value={config.default_bot_name}
                      onChange={(e) => setConfig({...config, default_bot_name: e.target.value})}
                      placeholder="e.g. Bee Support"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Theme Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        className="w-16 h-16 rounded-2xl cursor-pointer border-none p-0 bg-transparent"
                        value={config.default_theme_color}
                        onChange={(e) => setConfig({...config, default_theme_color: e.target.value})}
                      />
                      <input 
                        type="text" 
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                        value={config.default_theme_color}
                        onChange={(e) => setConfig({...config, default_theme_color: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                      Note: These are global defaults. You can still customize each website individually in the 'My Websites' section.
                    </p>
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <button onClick={handleSave} className="premium-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3">
                    <Save className="w-5 h-5" /> Save Brand Defaults
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="glass p-10 rounded-[3rem] border border-white shadow-xl shadow-indigo-100/20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <Bot className="w-6 h-6 text-indigo-600" /> AI & Automation
                </h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800">Global AI Assistance</h4>
                      <p className="text-sm text-slate-500 font-medium">Enable AI-powered suggested replies for your team.</p>
                    </div>
                    <div 
                      onClick={() => setConfig({...config, ai_auto_reply: config.ai_auto_reply ? 0 : 1})}
                      className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${config.ai_auto_reply ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <motion.div animate={{ x: config.ai_auto_reply ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
                    </div>
                  </div>

                  <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-black text-indigo-900">Smart Knowledge Base</h4>
                    </div>
                    <p className="text-sm text-indigo-700/70 font-medium mb-6 leading-relaxed">
                      Your AI is currently learning from your past conversations and website content. 
                      Enabling global assistance will allow the bot to suggest answers to your agents during live chats.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/dashboard/websites'}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                    >
                      Sync Knowledge Base
                    </button>
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <button onClick={handleSave} className="premium-gradient text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3">
                    <Save className="w-5 h-5" /> Save AI Preferences
                  </button>
                </div>
              </motion.div>
            )}
            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                {renderBilling()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

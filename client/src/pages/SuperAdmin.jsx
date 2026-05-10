import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, Crown, Calendar, Shield, Search, AlertTriangle, CheckCircle, 
  ChevronRight, Loader2, Filter, Globe, Trash2, Database, TrendingUp, 
  CreditCard, Save, Plus 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function SuperAdmin() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [allKnowledge, setAllKnowledge] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ stripe_publishable_key: '', stripe_secret_key: '', stripe_webhook_secret: '', platform_name: 'Bee Chat', platform_currency: 'USD' });
  const [revenue, setRevenue] = useState({ total_revenue: 0, monthly_stats: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenants');
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editData, setEditData] = useState({ plan_id: 1, expires_at: '', is_active: 1 });
  const [planEditData, setPlanEditData] = useState({ name: '', price: '', max_websites: 1, max_agents: 1, ai_enabled: false, features: [] });

  const API_URL = `${API_BASE_URL}/superadmin.php`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [tRes, pRes, sRes, kRes, rRes] = await Promise.all([
        axios.get(`${API_URL}?action=list_tenants`, { headers }),
        axios.get(`${API_URL}?action=get_plans`, { headers }),
        axios.get(`${API_URL}?action=get_platform_settings`, { headers }),
        axios.get(`${API_URL}?action=list_all_knowledge`, { headers }),
        axios.get(`${API_URL}?action=get_revenue_stats`, { headers })
      ]);
      setTenants(tRes.data);
      setPlans(pRes.data.map(p => ({...p, features: JSON.parse(p.features || '[]')})));
      setPlatformSettings(sRes.data);
      setAllKnowledge(kRes.data);
      setRevenue(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlatformSettings = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post(`${API_URL}?action=update_platform_settings`, { settings: platformSettings }, { headers });
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

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => window.location.href = '/dashboard'} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
              ← Back to User Dashboard
            </button>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Super Admin</h2>
          <p className="text-slate-500 font-medium mt-1">Manage all tenants and subscription plans system-wide.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" placeholder="Search companies..."
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-full md:w-80 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] border border-white shadow-xl">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Globe className="w-6 h-6" /></div>
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
          { id: 'ai', name: 'AI Training Oversight' },
          { id: 'revenue', name: 'Financial Insights' },
          { id: 'settings', name: 'Gateway & Settings' }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-indigo-600'}`}
          >
            {tab.name}
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
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={tenant.id} className="hover:bg-slate-50/50 transition-all group">
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
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${tenant.plan_name === 'Enterprise' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-500'}`}>{tenant.plan_name}</span>
                    {tenant.expires_at && <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires: {new Date(tenant.expires_at).toLocaleDateString()}</p>}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${tenant.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-sm font-black text-slate-700">{tenant.is_active ? 'Active' : 'Suspended'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => { setSelectedTenant(tenant); setEditData({ plan_id: tenant.plan_id || 1, expires_at: tenant.expires_at ? tenant.expires_at.split(' ')[0] : '', is_active: tenant.is_active }); }} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <Shield className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Platform-Wide AI Training</h3>
            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black">{allKnowledge.length} Total Items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allKnowledge.map((item) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="glass p-8 rounded-[2.5rem] border border-white shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.tenant_name}</div>
                  <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.domain}</div>
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
             <div className="premium-gradient p-10 rounded-[3.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
               <TrendingUp className="absolute -bottom-4 -right-4 w-40 h-40 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Total Revenue</p>
               <h3 className="text-6xl font-black tracking-tighter">${Number(revenue.total_revenue).toLocaleString()}</h3>
             </div>
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Average Monthly</p>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">${revenue.monthly_stats.length > 0 ? (Number(revenue.total_revenue) / revenue.monthly_stats.length).toFixed(0) : 0}</h3>
             </div>
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Active Tenants</p>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{tenants.filter(t => t.is_active).length}</h3>
             </div>
           </div>
           <div className="glass p-12 rounded-[4rem]">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-8 text-center">Monthly Breakdown</h3>
              <div className="space-y-4">
                 {revenue.monthly_stats.map((stat, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors">
                            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(0, stat.month - 1).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-xl font-black text-slate-900 leading-none mt-1">{stat.year}</span>
                         </div>
                         <p className="text-lg font-black text-slate-900">Total Monthly Settlements</p>
                      </div>
                      <p className="text-3xl font-black text-indigo-600 tracking-tighter">${Number(stat.total).toLocaleString()}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-end">
            <button onClick={() => { setPlanEditData({ name: '', price: '', max_websites: 1, max_agents: 1, ai_enabled: false, features: [] }); setIsCreatingPlan(true); }} className="premium-gradient text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-3">
              <Plus className="w-5 h-5" /> Add New Tier
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={p.id} className="glass p-10 rounded-[3rem] border-2 border-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <button onClick={() => { setSelectedPlan(p); setPlanEditData({...p}); }} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all"><Shield className="w-5 h-5" /></button>
                </div>
                <h4 className="text-xl font-black text-slate-900">{p.name}</h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">${p.price}</span>
                  <span className="text-slate-400 font-bold text-sm">/mo</span>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600"><span>Websites</span><span className="text-indigo-600">{p.max_websites}</span></div>
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600"><span>Support Agents</span><span className="text-indigo-600">{p.max_agents}</span></div>
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
                <Shield className="w-6 h-6 text-indigo-600" /> Payment & Demo Mode
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
            
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><CreditCard className="w-6 h-6 text-indigo-600" /> Stripe Integration</h3>
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
              <Users className="w-6 h-6 text-indigo-600" /> Google Authentication
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Google Client ID</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" 
                value={platformSettings.google_client_id} 
                onChange={(e) => setPlatformSettings({...platformSettings, google_client_id: e.target.value})}
                placeholder="000000000000-xxxx.apps.googleusercontent.com"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSavePlatformSettings} className="premium-gradient text-white px-12 py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center gap-3"><Save className="w-5 h-5" /> Save Global Settings</button>
          </div>
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
                <div onClick={() => setEditData({...editData, is_active: editData.is_active ? 0 : 1})} className={`w-14 h-8 rounded-full relative p-1 cursor-pointer transition-all ${editData.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}><motion.div animate={{ x: editData.is_active ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" /></div>
              </div>
              <button type="submit" className="w-full premium-gradient text-white font-black py-4 rounded-2xl shadow-xl">Save Changes</button>
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
              <button type="submit" className="w-full premium-gradient text-white font-black py-4 rounded-2xl shadow-xl">{isCreatingPlan ? 'Create Plan' : 'Save Changes'}</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

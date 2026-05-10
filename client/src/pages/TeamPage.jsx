import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Trash2, ShieldCheck, Shield,
  X, Copy, Check, Mail, User, Lock, ChevronDown, Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TEAM_URL = 'http://localhost/Bee/server/api/team.php';
const authH    = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function TeamPage() {
  const { user } = useAuth();
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form,       setForm]       = useState({ name:'', email:'', role:'agent', password:'' });
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [tempPass,   setTempPass]   = useState(null);  // shown after invite
  const [copied,     setCopied]     = useState(false);
  
  const isAdmin = user?.role === 'admin';

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMembers = async () => {
    try {
      const r = await axios.get(TEAM_URL, { headers: authH() });
      setMembers(Array.isArray(r.data) ? r.data : []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    if (members.length >= (user?.plan?.max_agents || 2)) {
      return showToast(`🚫 Your current plan (${user?.plan?.name}) is limited to ${user?.plan?.max_agents} agents. Please upgrade.`, 'error');
    }
    if (!form.name || !form.email) return showToast('Name and email are required.', 'error');
    setSubmitting(true);
    try {
      const r = await axios.post(TEAM_URL,
        { action:'invite', ...form },
        { headers: authH() }
      );
      setTempPass(r.data.temp_password);
      setForm({ name:'', email:'', role:'agent', password:'' });
      setShowInvite(false);
      fetchMembers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Invite failed.', 'error');
    } finally { setSubmitting(false); }
  };

  const changeRole = async (member, newRole) => {
    try {
      await axios.put(TEAM_URL, { id: member.id, role: newRole }, { headers: authH() });
      setMembers(p => p.map(m => m.id === member.id ? { ...m, role: newRole } : m));
      showToast(`${member.name}'s role updated to ${newRole}.`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Role update failed.', 'error');
    }
  };

  const remove = async (member) => {
    if (!window.confirm(`Remove ${member.name} from the team? They will lose access immediately.`)) return;
    try {
      await axios.delete(TEAM_URL, { data: { id: member.id }, headers: authH() });
      setMembers(p => p.filter(m => m.id !== member.id));
      showToast(`${member.name} has been removed.`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Remove failed.', 'error');
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const roleColor = (role) => role === 'admin'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-indigo-50 text-indigo-700 border-indigo-200';

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y:-60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-60, opacity:0 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold border whitespace-nowrap ${
              toast.type === 'error' ? 'bg-red-600 text-white border-red-700' : 'bg-indigo-600 text-white border-indigo-700'
            }`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Temp password modal */}
      <AnimatePresence>
        {tempPass && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setTempPass(null)}/>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="relative bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8"/>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Agent Invited!</h3>
              <p className="text-slate-500 text-sm mb-6">Share this temporary password with the new team member. They should change it after first login.</p>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mb-6">
                <Lock className="w-5 h-5 text-slate-400 shrink-0"/>
                <code className="flex-1 font-mono text-slate-900 text-sm font-bold tracking-widest">{tempPass}</code>
                <button onClick={() => copy(tempPass)}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                  {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                </button>
              </div>
              <button onClick={() => setTempPass(null)}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all">
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Management</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1">{members.length} member{members.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowInvite(true)}
            className="premium-gradient text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-all flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> Invite Agent
          </button>
        )}
      </div>

      {/* Invite form */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            className="glass rounded-[2.5rem] p-8 border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500"/> Invite New Agent
              </h3>
              <button onClick={() => setShowInvite(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <form onSubmit={invite} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                  placeholder="Full Name"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-indigo-200 focus:border-indigo-300 transition-all"/>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-indigo-200 focus:border-indigo-300 transition-all"/>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input value={form.password} onChange={e => setForm({...form, password:e.target.value})}
                  placeholder="Temp Password (leave blank to auto-generate)"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-indigo-200 focus:border-indigo-300 transition-all"/>
              </div>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <select value={form.role} onChange={e => setForm({...form, role:e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 ring-indigo-200 appearance-none cursor-pointer">
                  <option value="agent">Agent — Can handle chats</option>
                  <option value="admin">Admin — Full access</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="px-6 py-3 rounded-2xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-3 rounded-2xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2">
                  {submitting ? 'Inviting...' : <><UserPlus className="w-4 h-4"/> Invite Agent</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members table */}
      <div className="glass rounded-[3rem] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="space-y-4">{Array(3).fill(0).map((_,i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"/>)}</div>
          </div>
        ) : members.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
            <p className="font-black text-slate-900 text-xl mb-2">No team members yet</p>
            <p className="text-slate-400 text-sm">Invite your first agent to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map((member) => {
                const isMe = member.id == user?.id;
                return (
                  <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors group ${isMe ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${member.role==='admin' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {member.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {member.role === 'admin' && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                              <Crown className="w-2.5 h-2.5 text-white"/>
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                            {member.name}
                            {isMe && <span className="text-[9px] bg-indigo-100 text-indigo-600 font-black px-2 py-0.5 rounded-full border border-indigo-200">YOU</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{member.email}</td>
                    <td className="px-8 py-5">
                      {isAdmin && !isMe ? (
                        <div className="relative inline-block">
                          <select value={member.role}
                            onChange={e => changeRole(member, e.target.value)}
                            className={`appearance-none pl-3 pr-7 py-1.5 text-[10px] font-black uppercase rounded-full border cursor-pointer outline-none ${roleColor(member.role)}`}>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50"/>
                        </div>
                      ) : (
                        <span className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-full border inline-flex items-center gap-1 ${roleColor(member.role)}`}>
                          {member.role === 'admin' ? <><ShieldCheck className="w-3 h-3"/> Admin</> : <><Shield className="w-3 h-3"/> Agent</>}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-400 font-bold">
                      {new Date(member.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-right">
                        {!isMe && (
                          <button onClick={() => remove(member)}
                            className="opacity-0 group-hover:opacity-100 p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info box */}
      <div className="glass rounded-[2rem] p-6 flex items-start gap-4 border border-indigo-100/50">
        <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-indigo-600"/>
        </div>
        <div>
          <p className="font-black text-slate-900 text-sm mb-1">Role Permissions</p>
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            <strong className="text-amber-600">Admin</strong> — Full access: manage websites, team, settings, and all chats.<br/>
            <strong className="text-indigo-600">Agent</strong> — Can view and handle live chats assigned to them. No access to settings or team management.
          </p>
        </div>
      </div>
    </div>
  );
}

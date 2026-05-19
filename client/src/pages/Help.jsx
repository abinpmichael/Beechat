import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Shield, Users, Brain, Globe, MessageSquare, HelpCircle, ChevronRight, Zap, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SupportChat from '../components/SupportChat';
import { API_BASE_URL } from '../config';

export default function Help() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [showSupport, setShowSupport] = useState(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({});

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/settings.php`)
      .then(r => r.json())
      .then(d => setPlatformSettings(d))
      .catch(e => console.error(e));
  }, []);

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: Zap, color: 'bg-amber-500' },
    { id: 'ai-training', name: 'AI Training', icon: Brain, color: 'bg-purple-500' },
    { id: 'websites', name: 'Websites & Widget', icon: Globe, color: 'bg-indigo-500' },
    { id: 'leads-chats', name: 'Leads & Chats', icon: MessageSquare, color: 'bg-emerald-500' },
    { id: 'super-admin', name: 'Super Admin', icon: Shield, color: 'bg-rose-500' },
  ];

  const content = {
    'getting-started': {
      title: 'Welcome to Bee Chat Pro',
      subtitle: 'The ultimate guide to launching your AI-powered support hive.',
      steps: [
        { title: 'Connect your first site', description: 'Go to the Websites tab and enter your domain name.' },
        { title: 'Copy the code', description: 'Copy the unique JavaScript snippet provided for your site.' },
        { title: 'Paste into HTML', description: 'Paste the code into your website\'s <head> or <body> tag.' },
        { title: 'Train your AI', description: 'Upload a PDF or paste some text to start automating replies.' },
      ]
    },
    'ai-training': {
      title: 'Training your AI Brain',
      subtitle: 'Teach your bot how to handle customers like a pro.',
      details: [
        { title: 'Document Upload', content: 'Upload PDF, Word (.docx), or TXT files. Our engine extracts the text and uses it for automated replies.' },
        { title: 'Manual Knowledge', content: 'Add specific Q&A pairs for things like business hours, pricing, or support policies.' },
        { title: 'Keyword Matching', content: 'The AI uses intelligent keyword retrieval to find the best answer from your training data.' }
      ]
    },
    'websites': {
      title: 'Website Customization',
      subtitle: 'Make the widget look and feel like part of your brand.',
      features: [
        'Custom Colors: Match the theme color to your brand identity.',
        'Bot Identity: Change the bot name and upload a custom avatar.',
        'Widget Icon: Choose from a library of icons or upload your own.',
        'Survey Config: Set up pre-chat surveys to capture lead info.'
      ]
    },
    'leads-chats': {
      title: 'Managing Conversations',
      subtitle: 'Turn visitors into happy customers.',
      tips: [
        { title: 'Live Claiming', text: 'Agents can "Claim" a chat at any time to take over from the AI.' },
        { title: 'Internal Notes', text: 'Keep track of customer needs with private internal notes.' },
        { title: 'Lead Sync', text: 'All visitor data is saved automatically even if they leave before an agent joins.' }
      ]
    },
    'super-admin': {
      title: 'Super Admin Oversight',
      subtitle: 'Managing the entire platform ecosystem.',
      sections: [
        'Plan Management: Configure limits and AI toggles for different tiers.',
        'Global SEO: Set the platform meta tags for better search visibility.',
        'GTM Integration: Add Google Tag Manager globally across all tenant dashboards.',
        'Financials: Monitor platform revenue and tenant subscriptions.'
      ]
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                <HelpCircle className="w-8 h-8" />
            </div>
            Help & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Documentation</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">Everything you need to know about using Bee Chat Pro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all border-2 ${
                activeCategory === cat.id 
                ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-50 text-indigo-600' 
                : 'bg-slate-50/50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
              }`}
            >
              <div className={`p-2.5 rounded-xl text-white ${cat.color} ${activeCategory === cat.id ? 'scale-110' : ''} transition-transform`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="font-black text-xs uppercase tracking-widest">{cat.name}</span>
              {activeCategory === cat.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
          
          <div className="mt-10 p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h4 className="font-black text-lg mb-2 relative z-10">Need more help?</h4>
            <p className="text-indigo-100 text-xs font-medium mb-6 relative z-10">Our support team is available 24/7 to assist you.</p>
            <button 
              onClick={() => setShowSupport(true)}
              className="w-full py-3 bg-white text-indigo-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
            >
                Contact Support
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass p-12 rounded-[3.5rem] min-h-[600px] border border-white"
            >
              <div className="mb-12">
                <h3 className="text-3xl font-black text-slate-900 mb-2">{content[activeCategory].title}</h3>
                <p className="text-slate-500 font-medium text-lg">{content[activeCategory].subtitle}</p>
              </div>

              {activeCategory === 'getting-started' && (
                <div className="space-y-6">
                  {content['getting-started'].steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        {i + 1}
                      </div>
                      <div className="pt-1 border-b border-slate-100 pb-6 flex-1">
                        <h4 className="font-black text-slate-900 mb-1">{step.title}</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-6">
                     <button 
                       onClick={() => setShowVideo(true)}
                       className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-indigo-200 transition-all hover:scale-105"
                     >
                        <Play className="w-5 h-5 fill-current" /> Watch Video Tutorial
                     </button>
                  </div>
                </div>
              )}

              {activeCategory === 'ai-training' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {content['ai-training'].details.map((item, i) => (
                     <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                           {i === 0 ? <Zap className="w-6 h-6" /> : i === 1 ? <Book className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        </div>
                        <h4 className="font-black text-slate-900 mb-3">{item.title}</h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.content}</p>
                     </div>
                   ))}
                </div>
              )}

              {activeCategory === 'websites' && (
                <div className="space-y-4">
                   {content['websites'].features.map((f, i) => (
                     <div key={i} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-slate-700 text-sm">{f}</span>
                     </div>
                   ))}
                </div>
              )}

              {/* ... other categories follow similar pattern ... */}
              {activeCategory === 'leads-chats' && (
                <div className="space-y-6">
                   {content['leads-chats'].tips.map((tip, i) => (
                     <div key={i} className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem]">
                        <h4 className="font-black text-indigo-900 mb-2 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-indigo-600" /> {tip.title}
                        </h4>
                        <p className="text-indigo-700/70 text-xs font-bold ml-4">{tip.text}</p>
                     </div>
                   ))}
                </div>
              )}

              {activeCategory === 'super-admin' && (
                <div className="grid grid-cols-1 gap-4">
                   {content['super-admin'].sections.map((s, i) => (
                     <div key={i} className="p-6 bg-rose-50/30 border border-rose-100 rounded-2xl flex items-center justify-between group">
                        <span className="font-black text-rose-900/70 text-sm uppercase tracking-tight">{s}</span>
                        <Shield className="w-5 h-5 text-rose-200 group-hover:text-rose-500 transition-colors" />
                     </div>
                   ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Support Options Modal */}
      <AnimatePresence>
        {showSupport && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSupport(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Contact <span className="text-indigo-600">Support</span></h3>
                  <p className="text-slate-500 font-medium text-xs mt-1">How would you like to reach us?</p>
                </div>
                <button onClick={() => setShowSupport(false)} className="p-3 bg-white rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
                  <ChevronRight className="w-5 h-5 text-slate-400 rotate-90" />
                </button>
              </div>

              <div className="p-10 space-y-4">
                <a 
                  href={`mailto:${platformSettings.support_email || 'support@beechat.pro'}?subject=Support Request from Dashboard`}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-6 hover:bg-indigo-600 hover:text-white group transition-all"
                >
                  <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Email Support</h4>
                    <p className="text-xs font-medium opacity-60">{platformSettings.support_email || 'support@beechat.pro'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto opacity-20 group-hover:opacity-100" />
                </a>

                <button 
                  onClick={() => { setShowSupport(false); setIsSupportChatOpen(true); }}
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-6 hover:bg-emerald-600 hover:text-white group transition-all"
                >
                  <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Live Chat</h4>
                    <p className="text-xs font-medium opacity-60">Connect with a human agent now</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-auto opacity-20 group-hover:opacity-100" />
                </button>

                {platformSettings.support_whatsapp && (
                  <a 
                    href={platformSettings.support_whatsapp} target="_blank" rel="noreferrer"
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-6 hover:bg-green-600 hover:text-white group transition-all"
                  >
                    <div className="w-14 h-14 bg-white text-green-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">WhatsApp / Chat</h4>
                      <p className="text-xs font-medium opacity-60">Quick support on mobile</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto opacity-20 group-hover:opacity-100" />
                  </a>
                )}

                {platformSettings.support_phone && (
                  <a 
                    href={`tel:${platformSettings.support_phone}`}
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-6 hover:bg-slate-900 hover:text-white group transition-all"
                  >
                    <div className="w-14 h-14 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Call Support</h4>
                      <p className="text-xs font-medium opacity-60">{platformSettings.support_phone}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto opacity-20 group-hover:opacity-100" />
                  </a>
                )}
              </div>

              <div className="p-8 bg-slate-50/50 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Priority support is available for Enterprise members
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Tutorial Modal */}
      <AnimatePresence>
        {showVideo && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowVideo(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white/10"
            >
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-8 right-8 z-20 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all border border-white/10"
              >
                <ChevronRight className="w-6 h-6 rotate-90" />
              </button>
              
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                <video 
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  src={platformSettings.tutorial_video_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Chat Modal */}
      <AnimatePresence>
        {isSupportChatOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSupportChatOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-xl"
            >
              <SupportChat user={user} onClose={() => setIsSupportChatOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

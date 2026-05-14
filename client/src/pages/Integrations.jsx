import { motion } from 'framer-motion';
import { 
  Code, ShoppingBag, Database, MessageCircle, Link, Smartphone, 
  Layers, Zap, Globe, Blocks, Settings, Lock 
} from 'lucide-react';

export default function Integrations() {
  const categories = [
    {
      title: "Website Platforms",
      icon: <Globe className="w-8 h-8 text-amber-500" />,
      items: ["WordPress", "Shopify", "WooCommerce", "Magento", "Laravel", "CodeIgniter", "React Apps", "Next.js Apps", "PHP Websites", "Static HTML Websites"]
    },
    {
      title: "CRM Integrations",
      icon: <Database className="w-8 h-8 text-rose-500" />,
      items: ["HubSpot", "Zoho CRM", "Salesforce", "Freshdesk"]
    },
    {
      title: "Messaging Integrations",
      icon: <MessageCircle className="w-8 h-8 text-emerald-500" />,
      items: ["WhatsApp", "Facebook Messenger", "Telegram", "Instagram Messaging"]
    },
    {
      title: "API Integrations",
      icon: <Code className="w-8 h-8 text-blue-500" />,
      items: ["REST API", "Webhooks", "Socket API", "OAuth Authentication"]
    },
    {
      title: "Mobile App Support",
      icon: <Smartphone className="w-8 h-8 text-purple-500" />,
      items: ["Android SDK", "iOS SDK", "Flutter Integration", "React Native Integration"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30 overflow-hidden relative pb-32">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[20%] w-[100%] h-[150%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(245,158,11,0.05)_0deg,rgba(0,0,0,0)_180deg,rgba(245,158,11,0.05)_360deg)] opacity-70"
        />
      </div>

      {/* Navigation - simplified for this page */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] transition-all">
            <span className="text-slate-900 font-black text-xl">B</span>
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-white">
            Bee<span className="text-amber-500">Chat</span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm font-bold text-slate-300 hover:text-white uppercase tracking-wider hidden md:block">Login</a>
          <a href="/register" className="px-5 py-2.5 bg-white text-slate-900 text-sm font-black uppercase tracking-wider rounded-xl hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105">
            Start Free
          </a>
        </div>
      </nav>

      {/* Header */}
      <div className="relative pt-40 px-6 max-w-7xl mx-auto text-center z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block mb-6">
          <span className="px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Link className="w-4 h-4" /> Seamless Connectivity
          </span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
          className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[1.1]">
          Integrate With <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Everything.
          </span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium">
          Connect Bee Chat to your favorite tools, platforms, and CRMs in one click. We become the central nervous system for your customer communications.
        </motion.p>
      </div>

      {/* Categories Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
            className="group p-[1px] rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent hover:from-amber-500/50 transition-all duration-500 h-full">
            <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2rem] h-full flex flex-col relative overflow-hidden">
              {/* Category Icon & Title */}
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">{category.title}</h3>
              </div>
              
              {/* Items List */}
              <div className="flex flex-wrap gap-3 mt-auto">
                {category.items.map((item, itemIdx) => (
                  <span key={itemIdx} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-colors cursor-default">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Developer CTA Block */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          className="group p-[1px] rounded-[2rem] bg-gradient-to-br from-amber-400 to-amber-600 transition-all duration-500 h-full md:col-span-2 lg:col-span-1 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.4)]">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2rem] h-full flex flex-col items-center text-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.1),transparent_50%)]" />
            
            <Blocks className="w-16 h-16 text-amber-500 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
            <h3 className="text-2xl font-black tracking-tight text-white mb-4">Build Your Own</h3>
            <p className="text-slate-400 font-medium mb-8">Use our robust REST API, Webhooks, and SDKs to build custom workflows and deep integrations.</p>
            <a href="/register" className="w-full py-4 rounded-xl bg-amber-500 text-slate-900 font-black uppercase tracking-wider hover:bg-amber-400 transition-colors">
              Get API Keys
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Footer Banner */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto px-6 mt-32 text-center relative z-10">
         <div className="p-12 rounded-[3rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6 text-white">Ready to connect?</h2>
           <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">Start with our <span className="text-amber-500 font-bold">Free Forever</span> starter plan and connect Bee Chat to your ecosystem today.</p>
           <a href="/register" className="px-8 py-4 bg-white text-slate-900 text-sm font-black uppercase tracking-wider rounded-2xl hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-2xl">
             Launch Your Live Chat <Zap className="w-4 h-4" />
           </a>
         </div>
      </motion.div>
    </div>
  );
}

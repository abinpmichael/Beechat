import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, ShoppingBag, Database, MessageCircle, Link, Smartphone, 
  Layers, Zap, Globe, Blocks, Settings, Lock 
} from 'lucide-react';

const TopBee = ({ size = 40, animated = true, idPrefix: customPrefix = "bee_int", className = "" }) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const reactId = React.useId().replace(/[-:.]/g, '');
  const idPrefix = `${customPrefix}_${reactId}`;
  
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
      width={size} 
      height={size} 
      className={`w-full h-full max-w-full max-h-full aspect-square ${className}`}
      viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      animate={animated ? { 
        y: isWiggling ? [0, -12, 0] : [0, -4, 0],
        rotate: isWiggling ? [0, 10, -10, 7, 0] : [0, 3, -3, 0],
        scale: isWiggling ? [1, 1.1, 1] : [1, 1.02, 1],
        filter: ["drop-shadow(0 0 0px rgba(251,191,36,0))", "drop-shadow(0 0 30px rgba(251,191,36,0.6))", "drop-shadow(0 0 0px rgba(251,191,36,0))"]
      } : {}}
      transition={{ duration: isWiggling ? 0.5 : 3.5, repeat: isWiggling ? 0 : Infinity, ease: "easeInOut" }}
      style={{ 
        width: typeof size === 'number' ? `${size}px` : '100%', 
        height: typeof size === 'number' ? `${size}px` : '100%', 
        maxWidth: typeof size === 'number' ? `${size}px` : '100%',
        maxHeight: typeof size === 'number' ? `${size}px` : '100%',
        overflow: 'visible', 
        display: 'block', 
        flexShrink: 0 
      }}
    >
      <defs>
        <filter id={`fuzz${idPrefix}`} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
        </filter>
        <linearGradient id={`honey${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="40%" stopColor="#FEF3C7" /><stop offset="80%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id={`eye${idPrefix}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4B5563" /><stop offset="60%" stopColor="#111827" /><stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id={`blush${idPrefix}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.8" /><stop offset="100%" stopColor="#FF85A2" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g animate={animated ? { rotate: [0, 45, 0], opacity: [0.4, 0.7, 0.4] } : {}} transition={{ duration: 0.04, repeat: Infinity }}>
        <path d="M40 40C20 10 0 20 0 40C0 60 20 80 40 60C60 80 80 60 80 40C80 20 60 10 40 40Z" fill="#FDF2F8" fillOpacity="0.5" stroke="#FBCFE8" strokeWidth="1" transform="scale(0.5) translate(40, 20)" />
      </motion.g>

      <motion.g animate={animated ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
        <circle cx="75" cy="75" r="30" fill={`url(#honey${idPrefix})`} />
        <path d="M85 55Q95 55 100 75L95 100Q85 105 75 100" fill="#1F2937" fillOpacity="0.9" />
        <path d="M100 65Q110 70 115 80L108 95Q100 100 92 95" fill="#1F2937" fillOpacity="0.9" />
        <circle cx="102" cy="75" r="2" fill="#000" />
      </motion.g>

      <motion.g 
        animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} 
        transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}
        style={{ transformOrigin: '33% 50%' }}
      >
        <circle cx="40" cy="60" r="35" fill={`url(#honey${idPrefix})`} />
        <circle cx="40" cy="60" r="32" fill={`url(#honey${idPrefix})`} fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill={`url(#blush${idPrefix})`} />
        <circle cx="65" cy="70" r="10" fill={`url(#blush${idPrefix})`} />
        <g>
          <circle cx="22" cy="55" r="16" fill={`url(#eye${idPrefix})`} />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <circle cx="58" cy="55" r="16" fill={`url(#eye${idPrefix})`} />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
        </g>
        <path d="M36 75Q38 78 40 75Q42 78 44 75" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <motion.g animate={animated ? { rotate: [-15, 15] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '33% 25%' }}>
          <path d="M30 35Q25 10 15 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M50 35Q55 10 65 15" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }} d="M15 15L17 13L15 11L13 13Z" fill="#FF85A2" />
          <motion.path animate={animated ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} d="M65 15L67 13L65 11L63 13Z" fill="#FF85A2" />
        </motion.g>
      </motion.g>

      <motion.g 
        animate={animated ? { rotateX: [0, -85, 0], scale: [1, 1.1, 1], opacity: [0.9, 0.5, 0.9] } : {}} 
        transition={{ duration: 0.02, repeat: Infinity }}
        style={{ transformOrigin: '42% 42%' }}
      >
        <path d="M45 45C60 0 115 -5 120 40C125 85 85 95 45 45Z" fill="#F0F9FF" fillOpacity="0.3" stroke="#BAE6FD" strokeOpacity="0.4" strokeWidth="0.8" />
      </motion.g>
    </motion.svg>
  );
};

const BrandLogo = ({ size = 'md', light = false }) => (
  <a href="/" className="flex items-center gap-2.5 md:gap-4 group cursor-pointer text-decoration-none">
    <div 
      className="bg-white flex items-center justify-center shadow-xl md:shadow-2xl border-2 border-amber-100 group-hover:scale-105 transition-all duration-500 relative shrink-0 overflow-hidden rounded-2xl md:rounded-[1.75rem]"
      style={{ 
        width: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'), 
        height: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'),
        minWidth: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'), 
        minHeight: size === 'sm' ? '36px' : (size === 'lg' ? '54px' : '46px'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
       <div className="w-full h-full flex items-center justify-center p-1 md:p-1.5" style={{ boxSizing: 'border-box', maxWidth: '100%', maxHeight: '100%' }}>
          <TopBee size="100%" />
       </div>
       <div className="absolute inset-0 bg-amber-400/5 blur-xl rounded-full group-hover:bg-amber-400/10 transition-all pointer-events-none" />
    </div>
    <div className="flex flex-col justify-center text-left">
      <span className={`
        ${size === 'sm' ? 'text-base md:text-lg' : size === 'lg' ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl'} 
        font-black tracking-tight md:tracking-tighter uppercase leading-none ${light ? 'text-white' : 'text-slate-900'}
      `}>
        BEE<span className="text-amber-500">CHAT</span>
      </span>
      <span className={`text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] ${light ? 'text-white/40' : 'text-slate-400'} mt-0.5 md:mt-1`}>The Hive Intelligence</span>
    </div>
  </a>
);

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
        <BrandLogo size="sm" light={true} />
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

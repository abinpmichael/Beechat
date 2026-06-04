import React, { useState, useEffect, useId } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuperAdmin from './pages/SuperAdmin';
import LandingPage from './pages/LandingPage';
import Help from './pages/Help';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ChatWidget from './widget/ChatWidget';
import TicketTracking from './pages/TicketTracking';
import Integrations from './pages/Integrations';
import VideoAdSimulator from './pages/VideoAdSimulator';
import BlogList from './pages/BlogList';
import { API_BASE_URL } from './config';

const queryClient = new QueryClient();

// --- ULTIMATE CUTE BEE (MEGA-KAWAII CHIBI EDITION) ---
const TopBee = ({ size = 40, animated = true, idPrefix: customPrefix = "appBee", className = "" }) => {
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
      width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className}
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

      <motion.g animate={animated ? { rotate: isWiggling ? [-8, 8, -8] : [-2, 2] } : {}} transition={{ duration: isWiggling ? 0.3 : 4, repeat: isWiggling ? 4 : Infinity }}>
        <circle cx="40" cy="60" r="35" fill={`url(#honey${idPrefix})`} />
        <circle cx="40" cy="60" r="32" fill={`url(#honey${idPrefix})`} fillOpacity="0.2" />
        <circle cx="15" cy="70" r="10" fill={`url(#blush${idPrefix})`} />
        <circle cx="65" cy="70" r="10" fill={`url(#blush${idPrefix})`} />
        <g>
          <circle cx="22" cy="55" r="16" fill={`url(#eye${idPrefix})`} />
          <circle cx="16" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M10 55Q12 50 14 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
          <circle cx="58" cy="55" r="16" fill={`url(#eye${idPrefix})`} />
          <circle cx="52" cy="48" r="7" fill="white" fillOpacity="0.95" />
          <circle cx="64" cy="60" r="3" fill="white" fillOpacity="0.6" />
          <path d="M46 55Q48 50 50 55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
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

const SideBee = TopBee;

const LoadingBee = ({ size = 100 }) => (
  <motion.div
    animate={{ x: [0, 50, 75, 50, -25, 0], y: [0, -30, 25, 40, -25, 0], rotate: [0, 45, -45, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className="absolute -top-10 -right-10 md:-top-20 md:-right-20 pointer-events-none z-20 drop-shadow-2xl"
  >
     <SideBee size={size} />
  </motion.div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 p-6">
       <div className="flex flex-col items-center gap-10 md:gap-16">
          <div className="relative">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-48 h-48 md:w-80 md:h-80 border-[10px] md:border-[16px] border-amber-500/10 border-t-amber-500 rounded-[3rem] md:rounded-[6rem] shadow-2xl" 
             />
             <div className="w-24 h-24 md:w-48 md:h-48 bg-white rounded-2xl md:rounded-[3rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-4 md:p-8 shadow-6xl">
                <TopBee size={40} />
                <LoadingBee size={35} />
             </div>
          </div>
       </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const LegalPage = ({ type }) => {
  const [platformSettings, setPlatformSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/settings.php`)
      .then(res => {
        setPlatformSettings(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const content = type === 'privacy' ? platformSettings.privacy_policy : platformSettings.terms_of_service;

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-6 md:px-10 flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-3xl bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/5 p-10 md:p-16 relative z-10">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 border-b border-white/5 pb-6">
          {title}
        </h1>
        <div 
          className="font-medium text-slate-350 text-sm leading-relaxed whitespace-pre-wrap custom-scrollbar" 
          dangerouslySetInnerHTML={{ __html: content || 'Our policies are currently being updated. Please check back soon.' }} 
        />
        <div className="mt-12 pt-6 border-t border-white/5 flex justify-end">
          <a href="/" className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black px-8 py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

function WidgetInjector({ platformSettings }) {
  const location = useLocation();

  useEffect(() => {
    if (!platformSettings) return;

    const isHelpPage = location.pathname === '/help';

    // Load widget on all screen resolutions (widget.js will handle its own responsiveness)
    const shouldLoadWidget = true;

    const apiKeyToUse = isHelpPage 
      ? (platformSettings.platform_contact_widget_api_key || platformSettings.platform_widget_api_key)
      : platformSettings.platform_widget_api_key;

    const existingScript = document.getElementById('bee-chat-widget-script');
    const existingIframe = document.getElementById('bee-chat-widget-iframe');

    if (!shouldLoadWidget) {
      if (existingScript) existingScript.remove();
      if (existingIframe) existingIframe.remove();
      return;
    }

    if (apiKeyToUse && window.self === window.top && location.pathname !== '/widget') {
      if (existingScript) {
        const currentKey = existingScript.getAttribute('data-api-key');
        if (currentKey !== apiKeyToUse) {
          existingScript.remove();
          if (existingIframe) existingIframe.remove();
        } else {
          return;
        }
      }

      const s = document.createElement('script');
      s.src = `${window.location.origin}/widget.js`;
      s.id = 'bee-chat-widget-script';
      s.setAttribute('data-api-key', apiKeyToUse);
      s.async = true;
      document.body.appendChild(s);
    }
  }, [location.pathname, platformSettings]);

  return null;
}

function App() {
  const [googleClientId, setGoogleClientId] = useState('');
  const [landingActive, setLandingActive] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings.php`);
        const d = res.data;
        setGoogleClientId(d.google_client_id);
        setLandingActive(parseInt(d.landing_page_active ?? 1) === 1);
        setPlatformSettings(d);

        if (d.seo_title) document.title = d.seo_title;

        const updateTag = (selector, attr, value, tagType = 'meta') => {
          if (!value) return;
          let el = document.querySelector(`${tagType}[${selector}]`);
          if (!el) {
            el = document.createElement(tagType);
            const [k, v] = selector.split('=');
            el.setAttribute(k, v.replace(/["']/g, ''));
            document.head.appendChild(el);
          }
          el.setAttribute(attr, value);
        };

        updateTag('name="description"', 'content', d.seo_description);
        updateTag('name="keywords"', 'content', d.seo_keywords);
        updateTag('name="author"', 'content', d.seo_author);
        updateTag('name="robots"', 'content', d.seo_robots);

        // Open Graph & Social
        updateTag('property="og:title"', 'content', d.og_title || d.seo_title);
        updateTag('property="og:description"', 'content', d.og_description || d.seo_description);
        updateTag('property="og:image"', 'content', d.og_image);
        updateTag('property="og:type"', 'content', 'website');
        updateTag('property="og:url"', 'content', d.seo_canonical_url || window.location.origin);
        updateTag('property="twitter:card"', 'content', 'summary_large_image');
        updateTag('property="twitter:title"', 'content', d.og_title || d.seo_title);
        updateTag('property="twitter:description"', 'content', d.og_description || d.seo_description);
        updateTag('property="twitter:image"', 'content', d.og_image);
        updateTag('property="twitter:url"', 'content', d.seo_canonical_url || window.location.origin);
        if (d.twitter_handle) updateTag('name="twitter:site"', 'content', d.twitter_handle);

        // Canonical Link
        if (d.seo_canonical_url) {
          let link = document.querySelector('link[rel="canonical"]');
          if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
          const canonicalBase = d.seo_canonical_url.replace(/\/+$/, '');
          link.href = window.location.pathname === '/' ? (canonicalBase + '/') : (canonicalBase + window.location.pathname);
        }

        // Generative Engine Optimization (GEO) & Geotargeting
        updateTag('name="geo.region"', 'content', d.geo_region);
        updateTag('name="geo.placename"', 'content', d.geo_placename);
        updateTag('name="geo.position"', 'content', d.geo_position);
        updateTag('name="ICBM"', 'content', d.geo_position);

        // Dynamic Google Tag Manager injection if not already loaded by SSR
        if (d.gtm_id && d.gtm_id !== 'GTM-XXXXXXX') {
          if (!window.dataLayer) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            const f = document.getElementsByTagName('script')[0];
            const j = document.createElement('script');
            j.async = true;
            j.src = `https://www.googletagmanager.com/gtm.js?id=${d.gtm_id}`;
            if (f && f.parentNode) {
              f.parentNode.insertBefore(j, f);
            } else {
              document.head.appendChild(j);
            }
          }
        }

        // Dynamic Google Analytics (gtag.js) injection if not already loaded by SSR
        if (d.google_analytics_id && d.google_analytics_id !== 'G-XXXXXXXXXX') {
          if (!document.querySelector(`script[src*="gtag/js?id=${d.google_analytics_id}"]`)) {
            window.dataLayer = window.dataLayer || [];
            if (typeof window.gtag !== 'function') {
              window.gtag = function() { window.dataLayer.push(arguments); };
              window.gtag('js', new Date());
            }
            window.gtag('config', d.google_analytics_id);

            const f = document.getElementsByTagName('script')[0];
            const j = document.createElement('script');
            j.async = true;
            j.src = `https://www.googletagmanager.com/gtag/js?id=${d.google_analytics_id}`;
            if (f && f.parentNode) {
              f.parentNode.insertBefore(j, f);
            } else {
              document.head.appendChild(j);
            }
          }
        }

        // JSON-LD Structured Schema (Software & FAQ for Answer Boxes)
        let script = document.querySelector('script[type="application/ld+json"]');
        if (!script) { script = document.createElement('script'); script.type = 'application/ld+json'; document.head.appendChild(script); }
        let faqList = [];
        try { faqList = JSON.parse(d.aeo_faq_json || '[]'); } catch(e){}
        const schemaObj = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              "name": d.platform_name || "Bee Chat",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "description": d.seo_description,
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": d.platform_currency || "USD",
                "lowPrice": "0.00",
                "highPrice": "99.00",
                "offerCount": "4"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "185",
                "bestRating": "5",
                "worstRating": "1"
              }
            },
            {
              "@type": "Organization",
              "name": d.platform_name || "Bee Chat",
              "url": d.seo_canonical_url || window.location.origin,
              "logo": window.location.origin + "/logo.png"
            },
            faqList.length > 0 ? {
              "@type": "FAQPage",
              "mainEntity": faqList.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": { "@type": "Answer", "text": item.a }
              }))
            } : null
          ].filter(Boolean)
        };
        script.textContent = JSON.stringify(schemaObj);
      } catch (err) { } finally { setSettingsLoading(false); }
    };
    fetchSettings();
  }, []);

  if (settingsLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 p-6">
       <div className="flex flex-col items-center gap-8 md:gap-12 max-w-full">
          <div className="relative">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-48 h-48 md:w-64 md:h-64 border-[8px] md:border-[12px] border-amber-500/10 border-t-amber-500 rounded-[2.5rem] md:rounded-[4rem] shadow-3xl" 
             />
             <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl md:rounded-[2.5rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-4 md:p-6 shadow-7xl">
                <TopBee size={45} />
                <LoadingBee size={30} />
             </div>
          </div>
          <div className="text-center space-y-4 md:space-y-6">
             <h3 className="text-white font-black text-3xl md:text-5xl tracking-tighter uppercase leading-none">
               BEE<span className="text-amber-500">CHAT</span>
             </h3>
             <div className="flex items-center justify-center gap-3 md:gap-4">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-3 h-3 md:w-4 md:h-4 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)]" 
                />
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] md:tracking-[0.6em] text-[8px] md:text-xs">Synchronizing Empire Logic</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Router>
            <WidgetInjector platformSettings={platformSettings} />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/ticket/:trackingId" element={<TicketTracking />} />
              <Route path="/widget" element={<div className="h-screen overflow-hidden bg-transparent"><ChatWidget apiKey={new URLSearchParams(window.location.search).get('apiKey')} /></div>} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/video-ad" element={<VideoAdSimulator />} />
              <Route path="/help" element={<Help />} />
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/blog" element={landingActive ? <BlogList /> : <Navigate to="/dashboard" />} />
              <Route path="/blog/:postSlug" element={landingActive ? <LandingPage /> : <Navigate to="/dashboard" />} />
              <Route path="/" element={landingActive ? <LandingPage /> : <Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageCircle, Bot, UserCheck, FileText, Globe, Ticket, Check, ArrowRight, Copy } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Landing page targeting "live chat widget for website".
// Keep this copy in sync with the server-rendered version in client/public/index.php.

const FALLBACK_PLANS = [
  { id: 1, name: 'Free', price: 0, max_websites: 1, ai_enabled: 0, max_chats_per_month: 0 },
  { id: 2, name: 'Starter', price: 19, max_websites: 3, ai_enabled: 1, max_chats_per_month: 100 },
  { id: 3, name: 'Pro', price: 49, max_websites: 10, ai_enabled: 1, max_chats_per_month: 100 },
  { id: 4, name: 'Enterprise', price: 99, max_websites: 9999, ai_enabled: 1, max_chats_per_month: 100 },
];

export const LIVE_CHAT_FAQ = [
  {
    q: 'What is a live chat widget?',
    a: 'A live chat widget is a small chat bubble on your website. Visitors click it to message you, and you reply in real time from a dashboard. BeeChat adds an AI assistant that can answer common questions for you, and you can take over any chat.',
  },
  {
    q: 'Is the BeeChat live chat widget free?',
    a: 'Yes. The Free plan covers one website with live chat and needs no credit card. AI replies start on the Starter plan at $19 a month.',
  },
  {
    q: 'How do I add a live chat widget to my website?',
    a: 'Create a free account, add your website, and paste one script tag into your site’s HTML before the closing body tag. It works on WordPress, Shopify, WooCommerce and any HTML site.',
  },
  {
    q: 'Can the AI answer questions about my business?',
    a: 'Yes, on paid plans. Upload PDF, Word or text files, or paste text, and the AI answers visitors from that content. If it doesn’t know, your team can take over.',
  },
  {
    q: 'What happens when nobody is online?',
    a: 'The AI keeps answering on paid plans, and visitors can leave their details or open a ticket so you can follow up later.',
  },
  {
    q: 'Will a chat widget slow down my site?',
    a: 'The script loads asynchronously, so it doesn’t block your page from rendering, and the chat window runs in its own frame.',
  },
];

const SNIPPET = '<script src="https://www.beechat.online/widget.js" data-api-key="YOUR_API_KEY" async></script>';

const LiveChatWidget = () => {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/superadmin.php?action=get_plans`)
      .then((res) => { if (Array.isArray(res.data) && res.data.length) setPlans(res.data); })
      .catch(() => {});
  }, []);

  const copySnippet = () => {
    try {
      navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* clipboard unavailable */ }
  };

  const features = [
    { icon: MessageCircle, title: 'Real-time live chat', desc: 'See visitors’ messages instantly and reply from one dashboard.' },
    { icon: Bot, title: 'AI that knows your business', desc: 'Upload PDFs, Word files or text. The AI answers common questions from them, 24/7.' },
    { icon: UserCheck, title: 'Human takeover', desc: 'Jump into any conversation when a person should answer.' },
    { icon: FileText, title: 'Lead capture', desc: 'Collect a visitor’s name and email before or during the chat.' },
    { icon: Ticket, title: 'Tickets when you’re away', desc: 'Visitors can open a ticket, and you follow up later.' },
    { icon: Globe, title: 'Multiple websites', desc: 'Run chat on several sites from one account. Plans are priced by number of sites.' },
  ];

  const siteLabel = (n) => (Number(n) >= 999 ? 'Unlimited websites' : `${n} ${Number(n) === 1 ? 'website' : 'websites'}`);
  const aiLabel = (p) => (!Number(p.ai_enabled)
    ? 'Live chat only (no AI)'
    : (Number(p.max_chats_per_month) > 0 ? `${p.max_chats_per_month} AI chats / month` : 'Unlimited AI chats'));

  return (
    <div className="min-h-screen bg-white text-slate-700">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <a href="/" className="text-xl font-black tracking-tight text-slate-900">Bee<span className="text-amber-500">Chat</span></a>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-bold">
            <a href="/integrations" className="hidden sm:inline text-slate-500 hover:text-slate-900">Integrations</a>
            <a href="/blog" className="hidden sm:inline text-slate-500 hover:text-slate-900">Blog</a>
            <a href="/login" className="text-slate-500 hover:text-slate-900">Log in</a>
            <a href="/register" className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-amber-500 transition-colors">Start free</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-12 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4">Live chat widget</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Free live chat widget for your website
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-500 leading-relaxed">
            BeeChat is a live chat widget you add to any website with one line of code. Chat with visitors in real time,
            let an AI answer common questions from your own documents, and take over whenever a person should reply.
            The free plan covers one website.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-8 py-4 rounded-2xl transition-colors">
              Get the free widget <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black px-8 py-4 rounded-2xl transition-colors">
              How it works
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-400">No credit card required. Try it now: the chat bubble in the corner of this page is BeeChat.</p>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-black text-slate-900 text-center">What you get</h2>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <f.icon className="w-7 h-7 text-amber-500" />
                  <h3 className="mt-4 text-lg font-black text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-3xl font-black text-slate-900 text-center">Add live chat to your website in 4 steps</h2>
          <ol className="mt-10 space-y-6">
            {[
              ['Create a free account', 'Sign up and add your website’s domain.'],
              ['Train the AI (optional)', 'Upload PDF, Word or text files, or paste text, so the AI can answer common questions. AI replies are on paid plans.'],
              ['Paste one line of code', 'Add the script tag to your site, just before the closing </body> tag. On WordPress, use a header/footer plugin or your theme’s custom code setting. On Shopify, paste it into theme.liquid.'],
              ['Start chatting', 'Reply to visitors from the BeeChat dashboard, and take over any AI conversation.'],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-white font-black flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-slate-500">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 bg-slate-900 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Your embed code</span>
              <button onClick={copySnippet} className="inline-flex items-center gap-1 text-xs font-black text-amber-400 hover:text-amber-300">
                <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-sm text-slate-200 whitespace-pre-wrap break-all font-mono">{SNIPPET}</pre>
          </div>
        </section>

        <section id="pricing" className="bg-slate-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-black text-slate-900 text-center">Pricing</h2>
            <p className="mt-3 text-center text-slate-500">Priced by number of websites. All prices are per month.</p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((p) => (
                <div key={p.id || p.name} className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col">
                  <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                  <p className="mt-2"><span className="text-3xl font-black text-slate-900">${Number(p.price).toFixed(0)}</span><span className="text-slate-400"> / month</span></p>
                  <ul className="mt-4 space-y-2 text-sm flex-1">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{siteLabel(p.max_websites)}</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />Live chat widget</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{aiLabel(p)}</li>
                  </ul>
                  <a href="/register" className="mt-6 text-center bg-slate-900 hover:bg-amber-500 text-white font-black py-3 rounded-xl transition-colors">
                    {Number(p.price) === 0 ? 'Start free' : `Choose ${p.name}`}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-3xl font-black text-slate-900 text-center">Frequently asked questions</h2>
          <div className="mt-10 space-y-6">
            {LIVE_CHAT_FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="text-lg font-black text-slate-900">{item.q}</h3>
                <p className="mt-2 text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-14 text-center px-4">
          <h2 className="text-3xl font-black text-white">Add live chat to your website today</h2>
          <p className="mt-3 text-slate-400">Free for one website. Set up in a few minutes.</p>
          <a href="/register" className="mt-8 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-8 py-4 rounded-2xl transition-colors">
            Get the free widget <ArrowRight className="w-5 h-5" />
          </a>
        </section>
      </main>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap gap-4 justify-between text-sm text-slate-400">
          <span>© {new Date().getFullYear()} BeeChat</span>
          <nav className="flex flex-wrap gap-4">
            <a href="/" className="hover:text-slate-900">Home</a>
            <a href="/integrations" className="hover:text-slate-900">Integrations</a>
            <a href="/help" className="hover:text-slate-900">Help</a>
            <a href="/blog" className="hover:text-slate-900">Blog</a>
            <a href="/privacy" className="hover:text-slate-900">Privacy</a>
            <a href="/terms" className="hover:text-slate-900">Terms</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LiveChatWidget;

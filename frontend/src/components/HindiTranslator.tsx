'use client';

import { useEffect, useState } from 'react';
import { Languages, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HindiTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    // Read current cookie status
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const currentTrans = getCookie('googtrans');
    if (currentTrans?.includes('/hi')) setActiveLang('hi');
    else setActiveLang('en');

    // Load the official Google Translate script properly on mount
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'hi,en',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_hidden');
      };
    }
  }, []);

  const handleTranslate = (lang: string) => {
    setIsInitializing(true);
    
    // 1. Set the cookie which Google Translate looks for on page load
    // For localhost, we use empty domain or same domain
    const cookieString = `googtrans=/en/${lang}; path=/;`;
    document.cookie = cookieString;
    
    // 2. Also try to find and trigger the live dropdown if it exists
    const select = document.querySelector('#google_translate_hidden select') as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
      
      setTimeout(() => {
        setIsInitializing(false);
        setIsOpen(false);
        if (lang !== activeLang) window.location.reload(); // Hard refresh to ensure hydration matches
      }, 500);
    } else {
       // Just refresh if selector isn't ready
       window.location.reload();
    }
  };

  return (
    <>
      {/* Hidden container for the official engine */}
      <div id="google_translate_hidden" className="fixed -top-96 h-0 opacity-0 pointer-events-none" />

      {/* Floating Button */}
      <div className="fixed bottom-24 right-6 z-[9999]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/30 outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Languages className="h-6 w-6" />}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 mb-4 w-72 overflow-hidden rounded-3xl border border-card-border bg-card-bg p-6 shadow-2xl"
            >
              <div className="mb-6">
                <h3 className="text-sm font-black uppercase tracking-tighter text-primary">Regional Language</h3>
                <p className="text-[10px] font-bold text-foreground/40 italic mt-1">Switch site content language</p>
              </div>

              <div className="space-y-3">
                 <button 
                  onClick={() => handleTranslate('en')}
                  disabled={isInitializing}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all text-sm font-bold ${activeLang === 'en' ? 'border-primary bg-primary/5 text-primary' : 'border-card-border bg-background text-foreground hover:bg-card-border/30'}`}
                 >
                   <div className="flex items-center gap-3">
                     <span className="text-lg">🇺🇸</span>
                     <span>English Mode</span>
                   </div>
                   {activeLang === 'en' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                 </button>

                 <button 
                  onClick={() => handleTranslate('hi')}
                  disabled={isInitializing}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all text-sm font-bold ${activeLang === 'hi' ? 'border-green-500 bg-green-50/50 text-green-700' : 'border-card-border bg-background text-foreground hover:bg-card-border/30'}`}
                 >
                   <div className="flex items-center gap-3">
                     <span className="text-lg">🇮🇳</span>
                     <span>Hindi (हिन्दी)</span>
                   </div>
                   {activeLang === 'hi' && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .goog-te-banner-frame, .skiptranslate, .goog-te-balloon-frame, #goog-gt-tt {
          display: none !important;
        }
        body {
          top: 0 !important;
          position: relative !important;
        }
        .goog-text-highlight {
          background: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
}

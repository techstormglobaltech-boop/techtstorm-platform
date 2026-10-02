"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ConsentChoices = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentContextType = {
  consent: ConsentChoices | null;
  updateConsent: (choices: ConsentChoices) => void;
  openPreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentChoices | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [draftConsent, setDraftConsent] = useState<ConsentChoices>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const stored = localStorage.getItem("techstorm-cookie-consent");
    if (stored) {
      const parsed = JSON.parse(stored);
      setConsent(parsed);
      setDraftConsent(parsed);
    } else {
      // Show banner after a short delay for new visitors
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateConsent = (choices: ConsentChoices) => {
    setConsent(choices);
    setDraftConsent(choices);
    localStorage.setItem("techstorm-cookie-consent", JSON.stringify(choices));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => updateConsent({ essential: true, analytics: true, marketing: true });
  const rejectAll = () => updateConsent({ essential: true, analytics: false, marketing: false });

  const handleOpenPreferences = () => {
    if (consent) setDraftConsent(consent);
    setShowPreferences(true);
  };

  return (
    <CookieConsentContext.Provider value={{ consent, updateConsent, openPreferences: handleOpenPreferences }}>
      {children}
      
      {/* Main Cookie Banner */}
      <AnimatePresence>
        {showBanner && !showPreferences && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none"
          >
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto border border-slate-700">
              <div className="flex-1 text-sm text-slate-300">
                <h3 className="text-lg font-bold text-white mb-1">
                  <i className="fas fa-cookie-bite text-brand-teal mr-2"></i> We Value Your Privacy
                </h3>
                <p>
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies. Read our <a href="/privacy" className="text-brand-teal underline">Privacy Policy</a>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button 
                  onClick={handleOpenPreferences}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Customize
                </button>
                <button 
                  onClick={rejectAll}
                  className="px-5 py-2 text-sm font-medium border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Reject Non-Essential
                </button>
                <button 
                  onClick={acceptAll}
                  className="px-5 py-2 text-sm font-bold bg-brand-teal text-white rounded-lg hover:bg-[#006066] shadow-lg shadow-brand-teal/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Accept All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !showBanner && setShowPreferences(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Cookie Preferences</h2>
                {!showBanner && (
                  <button onClick={() => setShowPreferences(false)} className="text-slate-400 hover:text-slate-600">
                    <i className="fas fa-times text-xl"></i>
                  </button>
                )}
              </div>
              
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Essential */}
                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-10 h-6 bg-brand-teal/50 rounded-full flex items-center px-1 cursor-not-allowed">
                       <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm"></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Strictly Necessary</h4>
                    <p className="text-sm text-slate-500 mt-1">These cookies are essential for the website to function properly (e.g. login sessions, security). They cannot be disabled.</p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <div className="mt-1">
                    <button 
                      onClick={() => setDraftConsent(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${draftConsent.analytics ? 'bg-brand-teal' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${draftConsent.analytics ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Analytics</h4>
                    <p className="text-sm text-slate-500 mt-1">Help us understand how visitors interact with the website by collecting and reporting information anonymously.</p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <div className="mt-1">
                    <button 
                      onClick={() => setDraftConsent(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${draftConsent.marketing ? 'bg-brand-teal' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${draftConsent.marketing ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Marketing</h4>
                    <p className="text-sm text-slate-500 mt-1">Used to track visitors across websites to display relevant, engaging advertisements.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={rejectAll}
                  className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Reject All
                </button>
                <button 
                  onClick={() => updateConsent(draftConsent)}
                  className="px-6 py-2 text-sm font-bold bg-brand-teal text-white rounded-lg hover:bg-[#006066] transition-colors shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CookieConsentContext.Provider>
  );
}

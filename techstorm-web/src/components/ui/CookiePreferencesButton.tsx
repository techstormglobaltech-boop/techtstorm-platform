"use client";

import { useCookieConsent } from "./CookieConsentProvider";

export default function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsent();

  return (
    <button 
      onClick={openPreferences}
      className="hover:text-slate-300 transition-colors bg-transparent border-none p-0 cursor-pointer text-xs"
    >
      Cookie Preferences
    </button>
  );
}

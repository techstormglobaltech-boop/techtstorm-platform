"use client";

import Script from "next/script";
import { useCookieConsent } from "./ui/CookieConsentProvider";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Ensure we only run client-side logic after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 1. Update Consent Mode when the user's preferences change
  useEffect(() => {
    if (measurementId && window.gtag) {
      // @ts-expect-error - gtag defined in script below
      window.gtag('consent', 'update', {
        'analytics_storage': consent?.analytics ? 'granted' : 'denied',
        'ad_storage': consent?.marketing ? 'granted' : 'denied',
        'ad_user_data': consent?.marketing ? 'granted' : 'denied',
        'ad_personalization': consent?.marketing ? 'granted' : 'denied'
      });
    }
  }, [consent, measurementId]);

  // 2. Track Route Changes
  useEffect(() => {
    if (measurementId && window.gtag) {
      const timeoutId = setTimeout(() => {
        const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
        // @ts-expect-error
        window.gtag('config', measurementId, {
          page_path: url,
          page_title: document.title,
        });
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, searchParams, measurementId]);

  if (!measurementId || !mounted) return null;

  return (
    <>
      {/* Default Consent State (Must run before gtag.js loads) */}
      <Script id="ga-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          // Set default consent state to DENIED
          gtag('consent', 'default', {
            'analytics_storage': '${consent?.analytics ? 'granted' : 'denied'}',
            'ad_storage': '${consent?.marketing ? 'granted' : 'denied'}',
            'ad_user_data': '${consent?.marketing ? 'granted' : 'denied'}',
            'ad_personalization': '${consent?.marketing ? 'granted' : 'denied'}',
            'wait_for_update': 500
          });

          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      
      {/* Always load the GA4 Script. It will respect the consent state above. */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  );
}

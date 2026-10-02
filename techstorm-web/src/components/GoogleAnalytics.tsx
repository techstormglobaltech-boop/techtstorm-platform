"use client";

import Script from "next/script";
import { useCookieConsent } from "./ui/CookieConsentProvider";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (consent?.analytics && measurementId) {
      // @ts-expect-error - Google Analytics dataLayer
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]){
        // @ts-expect-error - Google Analytics dataLayer
        window.dataLayer.push(args);
      }
      
      // Initialize if not already initialized
      // @ts-expect-error - custom property
      if (!window.gtagInitialized) {
        gtag('js', new Date());
        // @ts-expect-error - custom property
        window.gtagInitialized = true;
      }

      // Next.js client-side navigation can be so fast that the <title> hasn't updated in the DOM yet.
      // We use a small timeout to let the metadata title update before sending the pageview.
      const timeoutId = setTimeout(() => {
        const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
        gtag('config', measurementId, {
          page_path: url,
          page_title: document.title,
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [consent?.analytics, measurementId, pathname, searchParams]);

  if (!measurementId || !consent?.analytics) return null;

  return (
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
    />
  );
}

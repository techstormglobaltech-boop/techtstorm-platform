"use client";

import Script from "next/script";
import { useCookieConsent } from "./ui/CookieConsentProvider";
import { useEffect } from "react";

export default function GoogleAnalytics() {
  const { consent } = useCookieConsent();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    // If the user has consented to analytics, we push the config to the dataLayer
    // This handles the case where the script is loaded, but we only want to track
    // pageviews after consent is explicitly granted.
    if (consent?.analytics && measurementId) {
      // @ts-expect-error - Google Analytics dataLayer
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]){
        // @ts-expect-error - Google Analytics dataLayer
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', measurementId, {
        page_path: window.location.pathname,
      });
    }
  }, [consent?.analytics, measurementId]);

  // If no measurement ID is provided, don't render anything
  if (!measurementId) return null;

  // If the user hasn't consented to analytics, don't load the script at all
  if (!consent?.analytics) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  );
}

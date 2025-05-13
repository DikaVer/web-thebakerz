"use client";

import Script from "next/script";
import { useEffect } from "react";
import { CookiePreferences, getSessionCookieOrCreate } from "@/lib/cookie";

// Add type declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics({ id, preferences }: { id?: string, preferences: CookiePreferences | null }) {
  const GA_MEASUREMENT_ID = "G-ZJJ1P05SPE";

  const getGoogleAnalyticsId = async () => {
    const idGoogleAnalytics = id || await getSessionCookieOrCreate();
    return idGoogleAnalytics;
}
  
  useEffect(() => {
    if (preferences?.analytics && window.gtag) {
      // Set user ID when available
      if (id) {
        window.gtag("config", GA_MEASUREMENT_ID, {
          user_id: id
        });
      } else {
        getGoogleAnalyticsId().then((id) => {
          window.gtag("config", GA_MEASUREMENT_ID, {
            user_id: id
          });
        });
      }
    }
  }, [id, preferences]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: true,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
} 
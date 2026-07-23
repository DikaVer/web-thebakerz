/**
 * @fileoverview Google Analytics (gtag.js) loader.
 *
 * Exports GoogleAnalytics, a client component that injects the gtag.js
 * script and inline configuration for the site's GA4 measurement id (also
 * exported as GA_MEASUREMENT_ID) using next/script with the afterInteractive
 * strategy, with IP anonymization and automatic page views enabled.
 */
"use client";

import Script from "next/script";

export const GA_MEASUREMENT_ID = "G-ZJJ1P05SPE";

export default function GoogleAnalytics() {

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
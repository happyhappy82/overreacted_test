"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export default function Analytics() {
  useEffect(() => {
    const loadAnalytics = () => {
      // Google Analytics
      const gaScript = document.createElement("script");
      gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-9VQ2JT7ZYK";
      gaScript.async = true;
      document.head.appendChild(gaScript);

      gaScript.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: unknown[]) {
          window.dataLayer.push(args);
        }
        gtag("js", new Date());
        gtag("config", "G-9VQ2JT7ZYK");
      };

      // Google AdSense
      const adsScript = document.createElement("script");
      adsScript.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2923981352664263";
      adsScript.async = true;
      adsScript.crossOrigin = "anonymous";
      document.head.appendChild(adsScript);
    };

    // requestIdleCallback 또는 setTimeout으로 지연 로드
    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(
        loadAnalytics,
        { timeout: 3000 }
      );
    } else {
      // fallback: 1초 뒤 로드
      setTimeout(loadAnalytics, 1000);
    }
  }, []);

  return null;
}

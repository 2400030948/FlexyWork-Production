'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslator() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,mr,hi,te',
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      }
    };
  }, []);

  return (
    <>
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" className="hidden" style={{ display: 'none' }} />
      
      {/* Clean style overrides to hide Google Translate default top banner and tooltip overlays */}
      <style jsx global>{`
        body {
          top: 0 !important;
          position: static !important;
        }
        .goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        .skiptranslate {
          display: none !important;
        }
        .goog-te-gadget {
          display: none !important;
        }
        #goog-gt-tt, .goog-te-balloon-frame {
          display: none !important;
        }
        .goog-text-highlight {
          background: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Official Google Translate Element Script */}
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}

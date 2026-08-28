'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read existing language cookie if set
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Update googtrans cookie for domain
    const cookieValue = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname};`;

    // Trigger translate element change if available
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const selected = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  if (!mounted) return null;

  return (
    <div className="relative inline-block text-left notranslate">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-stone-50 transition-all shadow-xs"
        aria-label="Change language"
      >
        <Globe size={14} className="text-brand-600" />
        <span className="text-sm">{selected.flag}</span>
        <span className="font-bold text-xs">{selected.nativeName}</span>
        <ChevronDown size={12} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-surface-border bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted border-b border-surface-border mb-1">
              Select Language
            </div>
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex w-full items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-stone-400">({lang.name})</span>
                  </div>
                  {isSelected && <Check size={14} className="text-brand-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

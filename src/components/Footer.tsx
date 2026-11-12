import React from 'react';
import { Mail, Globe, Info, ArrowUp } from 'lucide-react';
import { LegalDocType } from './LegalModal';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenLegal: (type: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'accueil', label: t.nav.accueil },
    { id: 'simulateur', label: t.nav.simulateur },
    { id: 'a-propos', label: t.nav.aPropos },
    { id: 'fonctionnalites', label: t.nav.fonctionnalites },
    { id: 'solutions', label: t.nav.solutions },
    { id: 'tarifs', label: t.nav.tarifs },
    { id: 'academy', label: t.nav.academy },
    { id: 'blogue', label: t.nav.blogue },
    { id: 'partenariats', label: t.nav.partenariats },
    { id: 'faq', label: t.nav.faq },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-blue-100 dark:border-blue-950 bg-white dark:bg-[#071328] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/logo_icon.webp"
                alt="Logo STARTBILL"
                className="h-12 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight leading-none">
                  <span className="text-blue-950 dark:text-white">START</span>
                  <span className="text-blue-600 dark:text-blue-400">BILL</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-blue-300 font-medium mt-1">
                  {t.common.tagline}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-blue-100/80 max-w-md leading-relaxed">
              {t.footer.presentation}
            </p>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-blue-300">
              <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 font-medium text-slate-700 dark:text-blue-200">
                Contact : <a href="mailto:contact.startbill@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">contact.startbill@gmail.com</a> — Site : <a href="https://StartBill.ca" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">StartBill.ca</a>
              </div>
            </div>
          </div>

          {/* Navigation Links Mirror */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white mb-3">
              {t.nav.pageTitle}
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-blue-200">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal and Social Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white mb-3">
              {t.footer.terms} & {t.footer.privacy}
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-blue-200 mb-6">
              <li>
                <button
                  onClick={() => onOpenLegal('confidentialite')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                >
                  {t.footer.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('conditions')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                >
                  {t.footer.terms}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('cookies')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                >
                  {t.footer.cookies}
                </button>
              </li>
            </ul>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white mb-2">
              {t.common.followUs}
            </h4>
            <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-blue-200">
              <a
                href="https://www.facebook.com/share/1KM999L26f/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-white transition-colors"
              >
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">f</span>
                <span>Facebook StartBillapp</span>
              </a>
              <a
                href="https://instagram.com/startbill.app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
              >
                <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">📸</span>
                <span>Instagram @startbill.app</span>
              </a>
              <a
                href="https://www.tiktok.com/@startbill_.app?_r=1&_t=ZS-9BIOJUwAm4D"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-white transition-colors"
              >
                <span className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-bold">🎵</span>
                <span>TikTok @startbillapp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Editorial Compliance Notice */}
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs text-slate-600 dark:text-blue-200 leading-relaxed mb-8 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-950 dark:text-white block mb-0.5">
              {t.footer.editorialNote}
            </span>
            {t.footer.editorialText}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-blue-100 dark:border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-blue-300">
          <div>
            {t.common.copyright}
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white font-medium transition-colors"
          >
            <span>{t.footer.backToTop}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Mail, Globe, Info, ArrowUp } from 'lucide-react';
import { FOOTER_CONTENT, SITE_METADATA } from '../data/content';
import { LegalDocType } from './LegalModal';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenLegal: (type: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                  Ton assistant financier
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-blue-100/80 max-w-md leading-relaxed">
              {FOOTER_CONTENT.presentation}
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
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-blue-200">
              {FOOTER_CONTENT.sectionsNav.map((link) => (
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
              Mentions et confidentialité
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-blue-200 mb-6">
              <li>
                <button
                  onClick={() => onOpenLegal('confidentialite')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                >
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('conditions')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                >
                  Conditions d’utilisation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('cookies')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                >
                  Gestion des témoins de connexion
                </button>
              </li>
            </ul>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white mb-2">
              Suivez-nous
            </h4>
            <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-blue-200">
              <a
                href="https://facebook.com/StartBillapp"
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
                href="https://tiktok.com/@startbillapp"
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
              Transparence & Note éditoriale préalable à la mise en ligne :
            </span>
            {FOOTER_CONTENT.noteEditoriale}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-blue-100 dark:border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-blue-300">
          <div>
            © 2026 {SITE_METADATA.brand}. Tous droits réservés. Version de travail pour intégration ({SITE_METADATA.dateVersion}).
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white font-medium transition-colors"
          >
            <span>Retour en haut</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

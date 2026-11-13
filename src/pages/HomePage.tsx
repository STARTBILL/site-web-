import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Calculator,
  FileText,
  CreditCard,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface HomePageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  // Animated rotating phrases state
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);

  // Rotate Hero animated phrases smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPhraseIndex((prev) => (prev + 1) % t.hero.phrases.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [t.hero.phrases.length]);

  const pillarIcons = [
    <FileText key="file" className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    <CreditCard key="card" className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    <Globe key="globe" className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  ];

  return (
    <div className="space-y-0">
      {/* ========================================================================= */}
      {/* 1. HAUT DE PAGE (HERO + VIDÉO INTACTE) */}
      {/* ========================================================================= */}
      <section
        id="accueil"
        className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-[#0a1a38]/60 dark:via-[#071328] dark:to-[#071328]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Early Preview Identifier */}
            <div className="inline-flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-full">
                <span>STARTBILL</span>
                <span aria-hidden="true">·</span>
                <span>{t.common.earlyPreviewBadge}</span>
              </div>
            </div>

            {/* Main Title H1 - Strictement sur 2 lignes comme annoté */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-blue-950 dark:text-white leading-[1.18] max-w-4xl mx-auto">
              <span className="block">{t.hero.titleLine1 || "Nous simplifions la facturation"}</span>
              <span className="block mt-1 sm:mt-2">{t.hero.titleLine2 || "pour les entrepreneurs et les PME"}</span>
            </h1>

            {/* Phrases animées avec espace aéré au-dessus et en-dessous */}
            <div className="py-4 sm:py-6">
              <div className="inline-flex flex-col items-center justify-center min-h-[64px]">
                <div
                  key={heroPhraseIndex}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 text-lg sm:text-2xl font-bold tracking-tight shadow-xs transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                  <span>{t.hero.phrases[heroPhraseIndex]}</span>
                </div>

                {/* Navigation dots */}
                <div className="flex items-center gap-1.5 mt-3">
                  {t.hero.phrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroPhraseIndex(idx)}
                      aria-label={`Voir idée ${idx + 1}: ${phrase}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        heroPhraseIndex === idx
                          ? 'w-6 bg-blue-600'
                          : 'w-2 bg-blue-200 dark:bg-blue-800 hover:bg-blue-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sous-titre */}
            <p className="text-base sm:text-xl text-slate-700 dark:text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
              {t.hero.subTitle}
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-blue-300 max-w-xl mx-auto">
              {t.hero.targetAudience}
            </p>

            {/* Actions : Bouton principal, bouton simulateur, bouton academy */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={onOpenWaitlist}
                  className="px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap active:scale-[0.98]"
                >
                  {t.hero.ctaPrimary}
                </button>

                <button
                  onClick={() => onNavigate('simulateur')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 bg-white dark:bg-[#0c1e3d] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors whitespace-nowrap shadow-xs"
                >
                  <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t.hero.ctaSimulator}</span>
                </button>

                <button
                  onClick={() => onNavigate('academy')}
                  className="px-4 py-3.5 text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:underline transition-colors whitespace-nowrap"
                >
                  {t.hero.ctaSecondary} →
                </button>
              </div>
            </div>
          </div>

          {/* Vidéo du haut de page : grand format, bien centrée, coins arrondis 24px, ombre douce */}
          <div className="mt-12 sm:mt-14 max-w-5xl mx-auto w-full relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-sky-300/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50 dark:opacity-30 pointer-events-none"
            />

            <div
              className="relative w-full overflow-hidden border border-blue-100/80 dark:border-blue-900/80 bg-[#0B1F3A] transition-transform duration-300 hover:scale-[1.005]"
              style={{
                borderRadius: '24px',
                boxShadow: '0 30px 60px -15px rgba(11, 31, 58, 0.2)',
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/assets/images/hero-fallback.jpg"
                className="w-full h-auto max-w-full block"
                style={{
                  borderRadius: '24px',
                  objectFit: 'cover',
                  aspectRatio: '16 / 9',
                }}
              >
                <source src="/assets/videos/startbill-hero.mp4" type="video/mp4" />
                <track
                  kind="subtitles"
                  src="/assets/videos/subtitles-fr.vtt"
                  srcLang="fr"
                  label="Français"
                  default={lang === 'fr'}
                />
                {t.hero.videoFallback}
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BRÈVE PRÉSENTATION DE L'APPLICATION */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20 bg-white dark:bg-[#071328]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.homeOverview.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white">
              {t.homeOverview.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/85 leading-relaxed">
              {t.homeOverview.subtitle}
            </p>
          </div>

          {/* 3 Piliers essentiels avec lien direct vers chaque page dédiée */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.homeOverview.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-blue-50/40 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 flex flex-col justify-between space-y-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-blue-950 border border-blue-100 dark:border-blue-800 flex items-center justify-center shadow-2xs">
                    {pillarIcons[idx]}
                  </div>
                  <h3 className="text-lg font-bold text-blue-950 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate(pillar.pageId)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start"
                >
                  <span>{pillar.linkLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Accès rapide aux autres pages dédiées */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-blue-300 text-center">
              {t.homeOverview.exploreTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.homeOverview.exploreLinks.map((item) => (
                <button
                  key={item.pageId}
                  onClick={() => onNavigate(item.pageId)}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-600 text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-blue-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-blue-200 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Invitation concise avant-première */}
          <div className="p-8 sm:p-10 rounded-3xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold">
                {t.homeOverview.ctaBannerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                {t.homeOverview.ctaBannerDesc}
              </p>
            </div>
            <button
              onClick={onOpenWaitlist}
              className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0 shadow-sm active:scale-[0.98]"
            >
              {t.homeOverview.ctaBannerBtn}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

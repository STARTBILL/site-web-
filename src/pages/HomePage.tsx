import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Calculator,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Users,
  Compass,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
} from 'lucide-react';
import {
  ACCUEIL_CONTENT,
  A_PROPOS_CONTENT,
  PRICING_CONTENT,
  FAQ_CONTENT,
  SOLUTIONS_CONTENT,
  ACADEMY_CONTENT,
} from '../data/content';
import { InteractiveFeatureDemo } from '../components/InteractiveFeatureDemo';

interface HomePageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Rotate Hero animated phrases smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPhraseIndex((prev) => (prev + 1) % ACCUEIL_CONTENT.banniere.phrases.length);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-0">
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-[#0a1a38]/60 dark:via-[#071328] dark:to-[#071328]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Brand Pill */}
            <div className="inline-flex items-center gap-2.5 justify-center">
              <img
                src="/assets/aistudio/logo_icon.webp"
                alt="Logo STARTBILL"
                className="h-11 w-auto object-contain shrink-0 drop-shadow-xs"
              />
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-full">
                <span>STARTBILL</span>
                <span aria-hidden="true">·</span>
                <span>Ton assistant financier</span>
              </div>
            </div>

            {/* Main Title H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-blue-950 dark:text-white leading-[1.14] text-balance">
              {ACCUEIL_CONTENT.banniere.title}
            </h1>

            {/* Animated Cycling Phrases - One idea per screen */}
            <div className="py-2">
              <div className="inline-flex flex-col items-center justify-center min-h-[58px]">
                <div
                  key={heroPhraseIndex}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-blue-600/10 dark:bg-blue-500/15 border border-blue-300/60 dark:border-blue-600/40 text-blue-800 dark:text-blue-200 text-lg sm:text-2xl font-bold tracking-tight transition-all"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                  <span>{ACCUEIL_CONTENT.banniere.phrases[heroPhraseIndex]}</span>
                </div>

                {/* Phrase navigation dots */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  {ACCUEIL_CONTENT.banniere.phrases.map((phrase, idx) => (
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

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-700 dark:text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
              {ACCUEIL_CONTENT.banniere.sousTitre}
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-blue-300 max-w-xl mx-auto">
              {ACCUEIL_CONTENT.banniere.cible}
            </p>

            {/* CTA Buttons & Note */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={onOpenWaitlist}
                  className="px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap active:scale-[0.98]"
                >
                  {ACCUEIL_CONTENT.banniere.actions.listeAttente}
                </button>

                <button
                  onClick={() => onNavigate('simulateur')}
                  className="px-6 py-3.5 text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 bg-white dark:bg-[#0c1e3d] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors whitespace-nowrap shadow-xs flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Tester le simulateur</span>
                </button>

                <button
                  onClick={() => onNavigate('academy')}
                  className="px-6 py-3.5 text-sm sm:text-base font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  {ACCUEIL_CONTENT.banniere.actions.decouvrirAcademy} →
                </button>
              </div>

              {/* Free Trial Reassurance */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{ACCUEIL_CONTENT.banniere.actions.essaiNote}</span>
              </div>
            </div>
          </div>

          {/* Centered Large Format Video Showcase */}
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
                Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LIVE SIMULATOR TEASER */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24 border-b border-blue-100 dark:border-blue-950 bg-blue-50/30 dark:bg-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 px-3 py-1 rounded-full mb-3">
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Démonstration instantanée</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white">
              Simulateur de facturation en direct
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm sm:text-base mt-2">
              Testez immédiatement la création d'une facture aux devises et taxes du Canada, d'Afrique ou d'Haïti.
            </p>
          </div>

          <InteractiveFeatureDemo />

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('simulateur')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <span>Accéder à la page dédiée du simulateur</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LES 3 VALEURS */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20 border-b border-blue-100 dark:border-blue-950 bg-white dark:bg-[#071328]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Nos principes fondateurs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 dark:text-white mt-1">
                Construit autour de 3 valeurs essentielles
              </h2>
            </div>
            <button
              onClick={() => onNavigate('a-propos')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 self-start md:self-auto"
            >
              <span>En savoir plus sur notre mission</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {A_PROPOS_CONTENT.valeurs.map((val, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl bg-blue-50/40 dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-xs"
              >
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                  0{i + 1}
                </span>
                <h3 className="font-bold text-lg text-blue-950 dark:text-white mt-1.5 mb-2">
                  {val.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION APERÇU DES SOLUTIONS & RÉGIONS */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24 border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-blue-50/20 to-white dark:from-[#081836] dark:to-[#071328]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Pour tous les profils
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 dark:text-white mt-1">
              Des solutions pensées pour votre quotidien
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm sm:text-base mt-2">
              Que vous soyez travailleur autonome, commerçant ou dirigeant de PME, STARTBILL s’adapte à votre modèle d'affaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {SOLUTIONS_CONTENT.segments.map((seg) => (
              <div
                key={seg.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-blue-950 dark:text-white mb-2">
                    {seg.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 mb-4 leading-relaxed">
                    {seg.description}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('solutions')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Découvrir la solution adaptée</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Couverture multirégionale adaptée</h3>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Canada (CAD & Interac) · Afrique francophone (FCFA & Mobile Money) · Haïti (HTG & MonCash/Natcash)
              </p>
            </div>
            <button
              onClick={() => onNavigate('tarifs')}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-950 text-xs sm:text-sm font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Consulter les tarifs par région →
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQ APERÇU (LES 5 QUESTIONS) */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24 border-b border-blue-100 dark:border-blue-950 bg-white dark:bg-[#071328]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Questions fréquentes
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
              Foire aux questions
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm mt-2">
              Les interrogations clés sur le lancement et le fonctionnement de STARTBILL.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {FAQ_CONTENT.slice(0, 3).map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-blue-100 dark:border-blue-900/60 rounded-xl bg-white dark:bg-[#0c1e3d] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-blue-950 dark:text-white hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-blue-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-blue-100 border-t border-blue-100 dark:border-blue-900/40 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('faq')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Voir les 5 questions officielles complètes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto">
            Rejoignez dès maintenant les entrepreneurs inscrits à la liste d'attente pour participer aux phases d'essais pilotes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenWaitlist}
              className="px-8 py-3.5 rounded-xl bg-white text-blue-950 font-bold text-sm sm:text-base hover:bg-blue-50 transition-all shadow-md active:scale-[0.98]"
            >
              Rejoindre la liste d'attente
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3.5 rounded-xl border border-blue-200/50 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base transition-colors"
            >
              Poser une question à notre équipe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

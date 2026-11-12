import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Calculator,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Users,
  Compass,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
  Search,
  Send,
  Target,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { BLOGUE_CONTENT } from '../data/content';
import { InteractiveFeatureDemo } from '../components/InteractiveFeatureDemo';

interface HomePageProps {
  onNavigate: (pageId: string) => void;
  onOpenWaitlist: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenWaitlist }) => {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  // Animated rotating phrases state
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);

  // Pricing state
  const [pricingRegion, setPricingRegion] = useState<'canada' | 'afrique' | 'haiti'>('canada');
  const [isAnnualPricing, setIsAnnualPricing] = useState(false);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    organization: '',
    subject: lang === 'fr' ? 'Information générale' : 'General inquiry',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Rotate Hero animated phrases smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPhraseIndex((prev) => (prev + 1) % t.hero.phrases.length);
    }, 3400);
    return () => clearInterval(timer);
  }, [t.hero.phrases.length]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.email.includes('@')) {
      setContactError(lang === 'fr' ? 'Veuillez renseigner une adresse courriel valide.' : 'Please provide a valid email address.');
      return;
    }
    if (!contactForm.name.trim()) {
      setContactError(lang === 'fr' ? 'Veuillez indiquer votre nom.' : 'Please enter your name.');
      return;
    }
    if (!contactForm.message.trim()) {
      setContactError(lang === 'fr' ? 'Veuillez rédiger votre message.' : 'Please write your message.');
      return;
    }

    try {
      const messages = JSON.parse(localStorage.getItem('startbill_contacts') || '[]');
      messages.push({
        ...contactForm,
        date: new Date().toISOString(),
      });
      localStorage.setItem('startbill_contacts', JSON.stringify(messages));
    } catch {
      // Storage fallback
    }

    setContactError(null);
    setContactSubmitted(true);
  };

  // Filtered FAQ
  const filteredFaqs = t.faq.items.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const currentRegionPricing = t.pricing.regions[pricingRegion];

  return (
    <div className="space-y-0">
      {/* ========================================================================= */}
      {/* 1. HAUT DE PAGE (HERO) */}
      {/* ========================================================================= */}
      <section
        id="accueil"
        className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-[#0a1a38]/60 dark:via-[#071328] dark:to-[#071328]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Brand Logo & Early Preview Identifier */}
            <div className="inline-flex items-center gap-2.5 justify-center">
              <img
                src="/assets/aistudio/logo_icon.webp"
                alt="Logo STARTBILL"
                className="h-11 w-auto object-contain shrink-0 drop-shadow-xs"
              />
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

            {/* Phrases animées avec espace aéré au-dessus et en-dessous (flèches espace de l'annotation) */}
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
                  onClick={() => {
                    const sim = document.getElementById('simulateur');
                    if (sim) {
                      sim.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('simulateur');
                    }
                  }}
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
      {/* 2. SIMULATEUR DE FACTURE (REMONTÉ JUSTE SOUS LE TITRE / HERO) */}
      {/* ========================================================================= */}
      <section
        id="simulateur"
        className="py-16 lg:py-24 border-b border-blue-100 dark:border-blue-950 bg-blue-50/30 dark:bg-blue-950/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 px-3 py-1 rounded-full mb-3">
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t.simulator.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white">
              {t.simulator.title}
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm sm:text-base mt-3 leading-relaxed">
              {t.simulator.desc}
            </p>
          </div>

          <InteractiveFeatureDemo />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRODUIT & FONCTIONNALITÉS DE LA PLATEFORME */}
      {/* ========================================================================= */}
      <section
        id="fonctionnalites"
        className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950 bg-white dark:bg-[#071328]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.features.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
              {t.features.title}
            </h2>
          </div>

          {/* Note de statut de conception */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs sm:text-sm leading-relaxed mb-12 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Note :</span>
              {t.features.note}
            </div>
          </div>

          {/* Grille des 8 fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {t.features.items.map((feat) => (
              <div
                key={feat.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-blue-950 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed mb-3">
                    {feat.resume}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {lang === 'fr' ? 'Objectif :' : 'Objective:'} {feat.objectif}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-blue-100 dark:border-blue-900/60 flex flex-wrap gap-1.5">
                  {feat.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] text-slate-500 dark:text-blue-300">
                      {i > 0 && '· '}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* À plus long terme notice */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-blue-950 dark:text-white">
                {t.features.longTermTitle}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
              {t.features.longTermDesc}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. QUI SOMMES-NOUS / MISSION / VISION & 3 VALEURS (DESCENDU SOUS LE PRODUIT) */}
      {/* ========================================================================= */}
      <section
        id="a-propos"
        className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-white to-blue-50/30 dark:from-[#071328] dark:to-[#091834]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.nav.aPropos}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
              {t.about.title}
            </h2>
            <p className="text-slate-600 dark:text-blue-100/80 text-base sm:text-lg mt-4 leading-relaxed">
              {t.about.content}
            </p>
          </div>

          {/* Mission & Vision split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {lang === 'fr' ? 'Notre cap' : 'Our Target'}
              </span>
              <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-1 mb-3">
                {t.about.missionTitle}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                {t.about.missionContent}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {lang === 'fr' ? 'Notre perspective' : 'Our Perspective'}
              </span>
              <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-1 mb-3">
                {t.about.visionTitle}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                {t.about.visionContent}
              </p>
            </div>
          </div>

          {/* Valeurs — Version courte (3 au lieu de 5) */}
          <div className="mb-16">
            <div className="max-w-2xl mb-8">
              <h3 className="text-2xl font-bold text-blue-950 dark:text-white">
                {t.values.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-300 mt-1">
                {t.values.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.values.items.map((val, i) => (
                <div
                  key={i}
                  className="p-7 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-xs"
                >
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                    0{i + 1}
                  </span>
                  <h4 className="font-bold text-lg text-blue-950 dark:text-white mt-1.5 mb-2">
                    {val.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 dark:text-blue-300 italic text-center mt-6">
              {t.values.note}
            </p>
          </div>

          {/* Ambition */}
          <div className="p-8 rounded-2xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              {lang === 'fr' ? 'Développement futur' : 'Future Roadmap'}
            </span>
            <h3 className="text-2xl font-bold mt-1 mb-3">
              {t.about.ambitionTitle}
            </h3>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-3xl">
              {t.about.ambitionContent}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. NOS SOLUTIONS (POUR QUI ?) */}
      {/* ========================================================================= */}
      <section id="solutions" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.solutions.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
              {t.solutions.title}
            </h2>
            <p className="text-slate-600 dark:text-blue-100/80 text-base sm:text-lg mt-3 leading-relaxed">
              {t.solutions.desc}
            </p>
          </div>

          {/* 3 Main Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {t.solutions.segments.map((seg) => (
              <div
                key={seg.id}
                className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-blue-950 dark:text-white mb-3">
                    {seg.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed mb-6">
                    {seg.description}
                  </p>
                  <ul className="space-y-2.5">
                    {seg.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-blue-100">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-blue-100 dark:border-blue-900/60">
                  <button
                    onClick={onOpenWaitlist}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {lang === 'fr' ? 'Manifester mon intérêt pour ce profil →' : 'Express interest for this profile →'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Approche internationale */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {lang === 'fr' ? 'Adaptation aux contextes réels' : 'Real-world Context Adaptation'}
                </span>
                <h3 className="text-2xl font-bold text-blue-950 dark:text-white">
                  {t.solutions.internationalTitle}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                  {t.solutions.internationalDesc}
                </p>

                <div className="space-y-3 pt-2">
                  {t.solutions.zones.map((zone, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-blue-950 dark:text-white">{zone.nom} : </strong>
                        <span className="text-slate-600 dark:text-blue-200">{zone.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-xl overflow-hidden border border-blue-100 dark:border-blue-900 aspect-4/3">
                  <img
                    src="/assets/images/global_hubs.webp"
                    alt="Hubs économiques et écosystèmes entrepreneuriaux internationaux"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TARIFS (CANADA, AFRIQUE FRANCOPHONE, HAÏTI & -20% ANNUEL) */}
      {/* ========================================================================= */}
      <section id="tarifs" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950 bg-blue-50/20 dark:bg-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {lang === 'fr' ? 'Tarification transparente' : 'Transparent Pricing'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
              {t.pricing.title}
            </h2>
            <p className="text-slate-600 dark:text-blue-200 text-sm sm:text-base mt-2">
              {t.pricing.subtitle}
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-900 dark:text-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t.common.pilotBadge}</span>
            </div>
          </div>

          {/* Region Switcher & Annual Discount Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <div className="inline-flex p-1 rounded-xl bg-blue-100/60 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
              <button
                onClick={() => setPricingRegion('canada')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingRegion === 'canada'
                    ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-blue-200 hover:text-blue-950 dark:hover:text-white'
                }`}
              >
                🇨🇦 Canada ($ CAD)
              </button>
              <button
                onClick={() => setPricingRegion('afrique')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingRegion === 'afrique'
                    ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-blue-200 hover:text-blue-950 dark:hover:text-white'
                }`}
              >
                🌍 Afrique francophone (FCFA)
              </button>
              <button
                onClick={() => setPricingRegion('haiti')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingRegion === 'haiti'
                    ? 'bg-white dark:bg-blue-600 text-blue-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-blue-200 hover:text-blue-950 dark:hover:text-white'
                }`}
              >
                🇭🇹 Haïti (HTG)
              </button>
            </div>

            <div className="inline-flex items-center gap-2 p-1 px-3 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-900 shadow-2xs">
              <button
                onClick={() => setIsAnnualPricing(false)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                  !isAnnualPricing
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                    : 'text-slate-500 dark:text-blue-300'
                }`}
              >
                {t.pricing.monthly}
              </button>
              <button
                onClick={() => setIsAnnualPricing(true)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  isAnnualPricing
                    ? 'text-white bg-blue-600'
                    : 'text-slate-500 dark:text-blue-300'
                }`}
              >
                <span>{t.pricing.annual}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-blue-950 font-bold">
                  {t.pricing.discountBadge}
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {currentRegionPricing.plans.map((plan, idx) => {
              const isPopular = plan.popular;
              const price = isAnnualPricing ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={idx}
                  className={`relative p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                    isPopular
                      ? 'bg-white dark:bg-[#0c1e3d] border-2 border-blue-600 shadow-xl scale-[1.02] z-10'
                      : 'bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                      {t.pricing.mostPopular}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                        {plan.name}
                      </h3>
                      <span className="text-xs font-medium text-slate-500 dark:text-blue-300">
                        {currentRegionPricing.name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-blue-200 mb-6">
                      {plan.desc}
                    </p>

                    <div className="mb-6 pb-6 border-b border-blue-100 dark:border-blue-900/60">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight">
                          {price}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-blue-300">
                          {plan.period}
                        </span>
                      </div>
                      {isAnnualPricing && plan.priceMonthly !== '0 $' && plan.priceMonthly !== '0 FCFA' && plan.priceMonthly !== '0 HTG' && (
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-1">
                          {t.pricing.annualDiscountNote}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-8">
                      <span className="text-xs font-semibold text-blue-950 dark:text-white uppercase tracking-wider block">
                        {t.pricing.includedFeatures}
                      </span>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-blue-100">
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={onOpenWaitlist}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-950 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {t.nav.joinWaitlist}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STARTBILL ACADEMY */}
      {/* ========================================================================= */}
      <section id="academy" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950 bg-blue-50/40 dark:bg-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {lang === 'fr' ? 'Sensibilisation et apprentissage' : 'Learning & Empowerment'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white">
                {t.academy.title}
              </h2>
              <p className="text-base sm:text-lg text-slate-700 dark:text-blue-100 leading-relaxed">
                {t.academy.presentation}
              </p>
              <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                {t.academy.ceQueVousYTrouverez}
              </p>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                <strong className="text-blue-950 dark:text-white block mb-1">
                  {lang === 'fr' ? 'Notre approche :' : 'Our approach:'}
                </strong>
                {t.academy.notreApproche}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900 shadow-lg aspect-4/3">
                <img
                  src="/assets/images/academy_study.webp"
                  alt="Entrepreneur se formant aux bases de la gestion financière"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4 Interactive Educational Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {t.academy.modules.map((mod, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">Module 0{i + 1}</span>
                  <h3 className="text-base font-bold text-blue-950 dark:text-white mt-1 mb-2">
                    {mod.titre}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed mb-4">
                    {mod.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-blue-100 dark:border-blue-900/60">
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase block mb-1">
                    {lang === 'fr' ? 'Notions clés :' : 'Key concepts:'}
                  </span>
                  <div className="space-y-1">
                    {mod.notions.map((n, idx) => (
                      <div key={idx} className="text-xs text-slate-700 dark:text-blue-100 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-600" />
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60">
            <h4 className="text-base font-bold text-blue-950 dark:text-white mb-2">
              {lang === 'fr' ? 'Participez aux futures publications' : 'Participate in Upcoming Publications'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 mb-4">
              {t.academy.invitation}
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {lang === 'fr' ? 'Poser une question à l’équipe pédagogique' : 'Ask our educational team a question'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. BLOGUE ET RESSOURCES */}
      {/* ========================================================================= */}
      <section id="blogue" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {lang === 'fr' ? 'Ressources & Réflexions' : 'Resources & Insights'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                {lang === 'fr' ? 'Le blogue STARTBILL' : 'The STARTBILL Blog'}
              </h2>
              <p className="text-slate-600 dark:text-blue-100/80 text-sm sm:text-base mt-2">
                {lang === 'fr'
                  ? 'Retrouvez des éclairages concrets sur la facturation, la trésorerie et la vie des affaires.'
                  : 'Actionable perspectives on invoicing, cash flow, and business finance.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('blogue')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline self-start md:self-auto"
            >
              <span>{lang === 'fr' ? 'Consulter tous les articles' : 'View all articles'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOGUE_CONTENT.articles.slice(0, 3).map((art) => (
              <article
                key={art.id}
                onClick={() => onNavigate('blogue')}
                className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300 mb-2.5">
                    <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">
                      {art.category.replace('-', ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-blue-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed mt-2.5">
                    {art.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-blue-100 dark:border-blue-900/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-blue-300">{art.date}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                    {t.common.readArticle}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. PARTENARIATS (VERSION RACCOURCIE ET PERCUTANTE) */}
      {/* ========================================================================= */}
      <section
        id="partenariats"
        className="py-16 lg:py-24 border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-white to-blue-50/20 dark:from-[#071328] dark:to-[#091a38]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-xl">
            <div className="max-w-3xl space-y-4 mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {lang === 'fr' ? 'Coopérations & Écosystème' : 'Ecosystem & Cooperation'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {t.partnerships.title}
              </h2>
              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed">
                {t.partnerships.introduction}
              </p>
              <p className="text-sm text-blue-200/80 leading-relaxed">
                {t.partnerships.courtTexte}
              </p>
            </div>

            <div className="pt-6 border-t border-blue-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t.partnerships.invitation.title}
                </h3>
                <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
                  {t.partnerships.invitation.text}
                </p>
              </div>
              <button
                onClick={() => onNavigate('partenariats')}
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-blue-950 bg-white hover:bg-blue-50 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-sm active:scale-[0.98]"
              >
                {t.partnerships.invitation.action} →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOIRE AUX QUESTIONS (LES 5 QUESTIONS EXACTES DU PROMPT) */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t.faq.title}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
              {t.faq.subtitle}
            </h2>
            <p className="text-slate-600 dark:text-blue-100/80 text-sm sm:text-base mt-2 max-w-xl mx-auto">
              {t.faq.desc}
            </p>

            {/* Barre de recherche FAQ */}
            <div className="relative max-w-md mx-auto mt-6">
              <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder={t.faq.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
              />
            </div>
          </div>

          {/* Liste complète des 5 questions */}
          <div className="space-y-3.5">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-blue-100 dark:border-blue-900/60 rounded-xl bg-white dark:bg-[#0c1e3d] overflow-hidden transition-colors shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-blue-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold shrink-0">
                        Q{idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. CONTACT */}
      {/* ========================================================================= */}
      <section id="contact" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Informations & coordonnées */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {lang === 'fr' ? 'Contactez notre équipe' : 'Contact Our Team'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                  {t.contact.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                {t.contact.texteAccueil}
              </p>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white">
                  {lang === 'fr' ? 'Coordonnées officielles' : 'Official Coordinates'}
                </h3>
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 font-medium text-xs sm:text-sm text-slate-700 dark:text-blue-200">
                  Contact : <a href="mailto:contact.startbill@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">contact.startbill@gmail.com</a> — Site : <a href="https://StartBill.ca" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">StartBill.ca</a>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white block mb-2">
                    {t.common.followUs}
                  </span>
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
            </div>

            {/* Formulaire de contact fonctionnel */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-sm">
                {!contactSubmitted ? (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {contactError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs">
                        {contactError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                          {t.contact.nameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Jean Tremblay"
                          className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                          {t.contact.emailLabel}
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          placeholder="jean@entreprise.com"
                          className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                          {t.contact.orgLabel}
                        </label>
                        <input
                          type="text"
                          value={contactForm.organization}
                          onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                          placeholder={lang === 'fr' ? 'Nom de votre structure' : 'Company name'}
                          className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                          {t.contact.subjectLabel}
                        </label>
                        <select
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                        >
                          {t.contact.motifs.map((motif, i) => (
                            <option key={i} value={motif}>
                              {motif}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                        {t.contact.messageLabel}
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder={
                          lang === 'fr'
                            ? 'Expliquez-nous brièvement votre besoin afin que nous puissions orienter votre demande...'
                            : 'Briefly explain your need so we can guide your request...'
                        }
                        className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t.contact.submitBtn}</span>
                    </button>
                  </form>
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                    <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                      {t.contact.sentTitle}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-blue-100 max-w-md mx-auto leading-relaxed">
                      {t.contact.sentText}
                    </p>
                    <button
                      onClick={() => {
                        setContactSubmitted(false);
                        setContactForm({
                          name: '',
                          email: '',
                          organization: '',
                          subject: lang === 'fr' ? 'Information générale' : 'General inquiry',
                          message: '',
                        });
                      }}
                      className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {t.contact.sendAnother}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

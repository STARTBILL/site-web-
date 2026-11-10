/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Receipt,
  TrendingUp,
  CreditCard,
  Building2,
  Compass,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Handshake,
  Check,
  Search,
  MapPin,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

import {
  SITE_METADATA,
  ACCUEIL_CONTENT,
  A_PROPOS_CONTENT,
  FONCTIONNALITES_CONTENT,
  SOLUTIONS_CONTENT,
  ACADEMY_CONTENT,
  BLOGUE_CONTENT,
  PARTENARIATS_CONTENT,
  FAQ_CONTENT,
  CONTACT_CONTENT,
  Article,
} from './data/content';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WaitlistModal } from './components/WaitlistModal';
import { ArticleModal } from './components/ArticleModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { InteractiveFeatureDemo } from './components/InteractiveFeatureDemo';

export default function App() {
  const [activeSection, setActiveSection] = useState('accueil');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLegal, setSelectedLegal] = useState<LegalDocType | null>(null);

  // Blog filter state
  const [selectedBlogCategory, setSelectedBlogCategory] = useState('all');

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');

  // Contact Form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    organization: '',
    region: 'Canada',
    subject: 'Information générale',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Initialize theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Pre-fill contact form from partnership section
  const handlePartnerInquiry = () => {
    setContactForm((prev) => ({
      ...prev,
      subject: 'Partenariat',
      message: 'Bonjour, notre organisation souhaite échanger avec STARTBILL sur des opportunités de collaboration.',
    }));
    handleNavigate('contact');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.email.includes('@')) {
      setContactError('Veuillez renseigner une adresse courriel valide.');
      return;
    }
    if (!contactForm.name.trim()) {
      setContactError('Veuillez indiquer votre nom.');
      return;
    }
    if (!contactForm.message.trim()) {
      setContactError('Veuillez décrire brièvement votre besoin.');
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

  // Filtered articles
  const filteredArticles =
    selectedBlogCategory === 'all'
      ? BLOGUE_CONTENT.articles
      : BLOGUE_CONTENT.articles.filter((a) => a.category === selectedBlogCategory);

  // Filtered FAQ
  const filteredFaqs = FAQ_CONTENT.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#071328] text-slate-900 dark:text-blue-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 3-Zone Navigation Header */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* ========================================================================= */}
        {/* SECTION 1: ACCUEIL */}
        {/* ========================================================================= */}
        <section
          id="accueil"
          className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden border-b border-blue-100 dark:border-blue-950 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-[#0a1a38]/60 dark:via-[#071328] dark:to-[#071328]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Centered Hero Header */}
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-3 justify-center">
                <img
                  src="/assets/aistudio/logo_icon.webp"
                  alt="Logo STARTBILL"
                  className="h-10 w-auto object-contain shrink-0 drop-shadow-xs"
                />
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-full">
                  <span>Ton assistant financier</span>
                  <span aria-hidden="true">·</span>
                  <span>Version de travail {SITE_METADATA.dateVersion}</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-blue-950 dark:text-white leading-[1.12] text-balance">
                {ACCUEIL_CONTENT.banniere.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/80 leading-relaxed max-w-2xl mx-auto">
                {ACCUEIL_CONTENT.banniere.description}
              </p>

              <div className="max-w-2xl mx-auto p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs text-sm text-slate-700 dark:text-blue-100">
                <span className="font-semibold text-blue-950 dark:text-white block mb-1">
                  Écosystème ciblé :
                </span>
                {ACCUEIL_CONTENT.banniere.sousTitre}
              </div>

              {/* Primary CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsWaitlistOpen(true)}
                  className="px-7 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap active:scale-[0.98]"
                >
                  {ACCUEIL_CONTENT.banniere.actions.listeAttente}
                </button>

                <button
                  onClick={() => handleNavigate('fonctionnalites')}
                  className="px-6 py-3.5 text-sm font-semibold text-blue-900 dark:text-blue-100 bg-white dark:bg-[#0c1e3d] hover:bg-blue-50 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors whitespace-nowrap shadow-xs"
                >
                  {ACCUEIL_CONTENT.banniere.actions.decouvrir}
                </button>

                <button
                  onClick={() => handleNavigate('contact')}
                  className="px-6 py-3.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline whitespace-nowrap"
                >
                  {ACCUEIL_CONTENT.banniere.actions.contacter} →
                </button>
              </div>
            </div>

            {/* Large Format Centered Video Showcase */}
            <div className="mt-12 sm:mt-16 max-w-5xl mx-auto w-full relative">
              {/* Subtle ambient glow behind the video */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-sky-300/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50 dark:opacity-30 pointer-events-none"
              />

              <div
                className="relative w-full overflow-hidden border border-blue-100/80 dark:border-blue-900/80 bg-[#0B1F3A] transition-transform duration-300 hover:scale-[1.005]"
                style={{
                  borderRadius: '24px',
                  boxShadow: '0 30px 60px -15px rgba(11, 31, 58, 0.25)',
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

            {/* Pourquoi STARTBILL & Trois Engagements */}
            <div className="mt-20 pt-16 border-t border-blue-100 dark:border-blue-950">
              <div className="max-w-3xl mb-12">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Notre démarche
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-950 dark:text-white mt-1">
                  {ACCUEIL_CONTENT.pourquoi.title}
                </h2>
                <p className="text-slate-600 dark:text-blue-100/80 text-sm sm:text-base mt-3 leading-relaxed">
                  {ACCUEIL_CONTENT.pourquoi.text}
                </p>
              </div>

              {/* 3 Engagements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ACCUEIL_CONTENT.engagements.map((eng, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-medium">
                      0{idx + 1}. Engagement
                    </span>
                    <h3 className="text-lg font-bold text-blue-950 dark:text-white mt-1 mb-2">
                      {eng.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed">
                      {eng.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Transition to Academy */}
              <div className="mt-12 p-6 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-blue-950 dark:text-white">
                    {ACCUEIL_CONTENT.derniereSection.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 mt-1">
                    {ACCUEIL_CONTENT.derniereSection.text}
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('academy')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap self-start sm:self-auto transition-colors shadow-xs"
                >
                  Accéder à STARTBILL ACADEMY
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: À PROPOS */}
        {/* ========================================================================= */}
        <section id="a-propos" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                À propos
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                {A_PROPOS_CONTENT.quiSommesNous.title}
              </h2>
              <p className="text-slate-600 dark:text-blue-100/80 text-base sm:text-lg mt-4 leading-relaxed">
                {A_PROPOS_CONTENT.quiSommesNous.content}
              </p>
            </div>

            {/* Mission & Vision split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Notre cap
                </span>
                <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-1 mb-3">
                  {A_PROPOS_CONTENT.mission.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                  {A_PROPOS_CONTENT.mission.content}
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Notre perspective
                </span>
                <h3 className="text-xl font-bold text-blue-950 dark:text-white mt-1 mb-3">
                  {A_PROPOS_CONTENT.vision.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                  {A_PROPOS_CONTENT.vision.content}
                </p>
              </div>
            </div>

            {/* Nos Valeurs */}
            <div className="mb-16">
              <h3 className="text-xl font-bold text-blue-950 dark:text-white mb-6">
                Nos valeurs fondamentales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {A_PROPOS_CONTENT.valeurs.map((val, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-2xs"
                  >
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">0{i + 1}</span>
                    <h4 className="font-bold text-sm text-blue-950 dark:text-white mt-1 mb-1.5">
                      {val.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-blue-200 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notre Ambition */}
            <div className="p-8 rounded-2xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Développement futur
              </span>
              <h3 className="text-2xl font-bold mt-1 mb-3">
                {A_PROPOS_CONTENT.ambition.title}
              </h3>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-3xl">
                {A_PROPOS_CONTENT.ambition.content}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: FONCTIONNALITÉS */}
        {/* ========================================================================= */}
        <section id="fonctionnalites" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Fonctionnalités
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                Les capacités de la plateforme
              </h2>
            </div>

            {/* Official Disclaimer Banner as specified in document p.2 */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs sm:text-sm leading-relaxed mb-12 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Note de statut de conception :</span>
                {FONCTIONNALITES_CONTENT.note}
              </div>
            </div>

            {/* Interactive Feature Demo */}
            <div className="mb-16">
              <InteractiveFeatureDemo />
            </div>

            {/* Grid of 8 Functional Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {FONCTIONNALITES_CONTENT.items.map((feat) => (
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
                      Objectif : {feat.objectif}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-blue-100 dark:border-blue-900/60 flex flex-wrap gap-1.5">
                    {feat.tags.map((t, i) => (
                      <span key={i} className="text-[11px] text-slate-500 dark:text-blue-300">
                        {i > 0 && '· '}
                        {t}
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
                  {FONCTIONNALITES_CONTENT.longTerme.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                {FONCTIONNALITES_CONTENT.longTerme.text}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: NOS SOLUTIONS (POUR QUI ?) */}
        {/* ========================================================================= */}
        <section id="solutions" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {SOLUTIONS_CONTENT.subtitle}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                {SOLUTIONS_CONTENT.title}
              </h2>
              <p className="text-slate-600 dark:text-blue-100/80 text-base sm:text-lg mt-3 leading-relaxed">
                {SOLUTIONS_CONTENT.description}
              </p>
            </div>

            {/* 3 Main Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {SOLUTIONS_CONTENT.segments.map((seg) => (
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
                      onClick={() => setIsWaitlistOpen(true)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Manifester mon intérêt pour ce profil →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Une approche internationale */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Adaptation aux contextes réels
                  </span>
                  <h3 className="text-2xl font-bold text-blue-950 dark:text-white">
                    {SOLUTIONS_CONTENT.approcheInternationale.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                    {SOLUTIONS_CONTENT.approcheInternationale.content}
                  </p>

                  <div className="space-y-3 pt-2">
                    {SOLUTIONS_CONTENT.approcheInternationale.zones.map((zone, i) => (
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
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: STARTBILL ACADEMY */}
        {/* ========================================================================= */}
        <section id="academy" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Sensibilisation et apprentissage
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white">
                  {ACADEMY_CONTENT.title}
                </h2>
                <p className="text-base sm:text-lg text-slate-700 dark:text-blue-100 leading-relaxed">
                  {ACADEMY_CONTENT.presentation}
                </p>
                <p className="text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                  {ACADEMY_CONTENT.ceQueVousYTrouverez}
                </p>

                <div className="p-4 rounded-xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 text-xs sm:text-sm text-slate-600 dark:text-blue-200 leading-relaxed">
                  <strong className="text-blue-950 dark:text-white block mb-1">Notre approche :</strong>
                  {ACADEMY_CONTENT.notreApproche}
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
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
              </div>
            </div>

            {/* 4 Interactive Educational Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {ACADEMY_CONTENT.modules.map((mod, i) => (
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
                      Notions clés :
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

            {/* Invitation block */}
            <div className="text-center max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60">
              <h4 className="text-base font-bold text-blue-950 dark:text-white mb-2">
                Participez aux futures publications
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-200 mb-4">
                {ACADEMY_CONTENT.invitation}
              </p>
              <button
                onClick={() => handleNavigate('contact')}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                Poser une question à l’équipe pédagogique
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: BLOGUE ET RESSOURCES */}
        {/* ========================================================================= */}
        <section id="blogue" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Ressources & Réflexions
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                Le blogue STARTBILL
              </h2>
              <p className="text-slate-600 dark:text-blue-100/80 text-sm sm:text-base mt-3 leading-relaxed">
                {BLOGUE_CONTENT.introduction}
              </p>
            </div>

            {/* Category Filter Controls */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
              {BLOGUE_CONTENT.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedBlogCategory(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedBlogCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    {/* Unboxed clean metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300 mb-2.5">
                      <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">
                        {art.category.replace('-', ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{art.readTime} de lecture</span>
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
                      Lire l'article complet →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: PARTENARIATS */}
        {/* ========================================================================= */}
        <section id="partenariats" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Coopérations & Écosystème
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                {PARTENARIATS_CONTENT.title}
              </h2>
              <p className="text-slate-600 dark:text-blue-100/80 text-base sm:text-lg mt-3 leading-relaxed">
                {PARTENARIATS_CONTENT.introduction}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Avec qui collaborer ? */}
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                    {PARTENARIATS_CONTENT.avecQuiCollaborer.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {PARTENARIATS_CONTENT.avecQuiCollaborer.publics.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-blue-100">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pourquoi nous contacter ? */}
              <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                    {PARTENARIATS_CONTENT.pourquoiNousContacter.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {PARTENARIATS_CONTENT.pourquoiNousContacter.raisons.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-blue-100">
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Invitation block with direct action to contact */}
            <div className="p-8 rounded-2xl bg-blue-950 text-white dark:bg-[#081730] border border-blue-900 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <h4 className="text-xl font-bold mb-2">
                  {PARTENARIATS_CONTENT.invitation.title}
                </h4>
                <p className="text-sm text-blue-100/90 leading-relaxed">
                  {PARTENARIATS_CONTENT.invitation.text}
                </p>
              </div>
              <button
                onClick={handlePartnerInquiry}
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-blue-950 bg-white hover:bg-blue-50 rounded-xl transition-colors whitespace-nowrap self-start md:self-auto shrink-0 shadow-sm active:scale-[0.98]"
              >
                {PARTENARIATS_CONTENT.invitation.action}
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: FAQ (QUESTIONS FRÉQUENTES) */}
        {/* ========================================================================= */}
        <section id="faq" className="py-20 lg:py-28 border-b border-blue-100 dark:border-blue-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Questions fréquentes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                Foire aux questions
              </h2>
              <p className="text-slate-600 dark:text-blue-100/80 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                Réponses officielles aux interrogations courantes sur le projet STARTBILL et sa feuille de route.
              </p>

              {/* Search Bar for FAQ */}
              <div className="relative max-w-md mx-auto mt-6">
                <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Rechercher une question..."
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                />
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-blue-100 dark:border-blue-900/60 rounded-xl bg-white dark:bg-[#0c1e3d] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-blue-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span>{faq.q}</span>
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
        {/* SECTION 9: CONTACT */}
        {/* ========================================================================= */}
        <section id="contact" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Contact Information & Context */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Contactez notre équipe
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white mt-1">
                    {CONTACT_CONTENT.title}
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/80 leading-relaxed">
                  {CONTACT_CONTENT.texteAccueil}
                </p>

                <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white">
                    Coordonnées officielles
                  </h3>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-blue-300 block">Courriel de contact</span>
                    <a
                      href={`mailto:${CONTACT_CONTENT.coordonnees.courriel}`}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {CONTACT_CONTENT.coordonnees.courriel}
                    </a>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 dark:text-blue-300 block">Site internet</span>
                    <span className="text-sm font-semibold text-blue-950 dark:text-white">
                      {CONTACT_CONTENT.coordonnees.site}
                    </span>
                  </div>
                </div>
              </div>

              {/* Functional Contact Form */}
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
                            Votre nom complet *
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
                            Courriel professionnel *
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
                            Organisation ou entreprise (facultatif)
                          </label>
                          <input
                            type="text"
                            value={contactForm.organization}
                            onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                            placeholder="Nom de votre structure"
                            className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                            Motif de contact *
                          </label>
                          <select
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                          >
                            {CONTACT_CONTENT.motifs.map((motif, i) => (
                              <option key={i} value={motif}>
                                {motif}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                          Votre message *
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Expliquez-nous brièvement votre besoin afin que nous puissions orienter votre demande..."
                          className="w-full px-3.5 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                        <span>Transmettre mon message</span>
                      </button>
                    </form>
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                      <h3 className="text-xl font-bold text-blue-950 dark:text-white">
                        Message bien transmis
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-blue-100 max-w-md mx-auto leading-relaxed">
                        {CONTACT_CONTENT.confirmationMessage}
                      </p>
                      <button
                        onClick={() => {
                          setContactSubmitted(false);
                          setContactForm({
                            name: '',
                            email: '',
                            organization: '',
                            region: 'Canada',
                            subject: 'Information générale',
                            message: '',
                          });
                        }}
                        className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Envoyer un nouveau message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenLegal={(type) => setSelectedLegal(type)} />

      {/* Operational Waitlist Modal */}
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

      {/* Blog Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onOpenAcademy={() => handleNavigate('academy')}
      />

      {/* Legal Documents Modal */}
      <LegalModal type={selectedLegal} onClose={() => setSelectedLegal(null)} />
    </div>
  );
}

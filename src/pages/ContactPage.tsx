import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface ContactPageProps {
  onNavigate: (pageId: string) => void;
  initialSubject?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, initialSubject }) => {
  const { lang } = useLanguage();
  const contact = TRANSLATIONS[lang].contact;
  const common = TRANSLATIONS[lang].common;
  const nav = TRANSLATIONS[lang].nav;

  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    region: 'Canada',
    subject: initialSubject || contact.motifs[0],
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.email.includes('@')) {
      setError(
        lang === 'fr'
          ? 'Veuillez renseigner une adresse courriel valide.'
          : 'Please enter a valid email address.'
      );
      return;
    }
    if (!form.name.trim()) {
      setError(lang === 'fr' ? 'Veuillez indiquer votre nom.' : 'Please enter your name.');
      return;
    }
    if (!form.message.trim()) {
      setError(
        lang === 'fr' ? 'Veuillez rédiger votre message.' : 'Please enter your message.'
      );
      return;
    }

    try {
      const messages = JSON.parse(localStorage.getItem('startbill_contacts') || '[]');
      messages.push({
        ...form,
        date: new Date().toISOString(),
      });
      localStorage.setItem('startbill_contacts', JSON.stringify(messages));
    } catch {
      // Storage fallback
    }

    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('accueil')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{common.backToHome}</span>
          </button>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-blue-300">
            <span>STARTBILL</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-950 dark:text-white">{nav.contact}</span>
          </div>
        </div>

        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {lang === 'fr' ? 'Échange & Information' : 'Inquiries & Information'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {contact.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {contact.texteAccueil}
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Coordinates & Socials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs space-y-6">
              <h2 className="text-lg font-bold text-blue-950 dark:text-white">
                {lang === 'fr' ? 'Coordonnées officielles' : 'Official Contact Info'}
              </h2>

              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/80 font-medium text-xs sm:text-sm text-slate-700 dark:text-blue-200">
                Contact :{' '}
                <a
                  href={`mailto:${contact.coordonnees.courriel}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {contact.coordonnees.courriel}
                </a>{' '}
                — {lang === 'fr' ? 'Site :' : 'Site :'}{' '}
                <a
                  href="https://StartBill.ca"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  {contact.coordonnees.site}
                </a>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-950 dark:text-white block">
                  {common.followUs}
                </span>
                <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-blue-200">
                  <a
                    href="https://www.facebook.com/StartBillapp"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      f
                    </span>
                    <span>Facebook StartBillapp</span>
                  </a>
                  <a
                    href="https://instagram.com/startbill.app"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                      📸
                    </span>
                    <span>Instagram @startbill.app</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@startbill_.app?_r=1&_t=ZS-9BIOJUwAm4D"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold">
                      🎵
                    </span>
                    <span>TikTok @startbillapp</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs text-slate-600 dark:text-blue-200 leading-relaxed">
              <span className="font-bold text-blue-950 dark:text-white block mb-1">
                {lang === 'fr' ? 'Délai indicatif de réponse :' : 'Indicative Response Time:'}
              </span>
              {lang === 'fr'
                ? 'Nous traitons chaque demande avec attention sous 24 à 48 heures ouvrables.'
                : 'We carefully review each inquiry within 24 to 48 business hours.'}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-sm">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                        {contact.nameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={lang === 'fr' ? 'Jean Tremblay' : 'John Doe'}
                        className="w-full px-3.5 py-2.5 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                        {contact.emailLabel}
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jean@entreprise.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                        {contact.orgLabel}
                      </label>
                      <input
                        type="text"
                        value={form.organization}
                        onChange={(e) => setForm({ ...form, organization: e.target.value })}
                        placeholder={lang === 'fr' ? 'Nom de votre structure' : 'Company or Studio name'}
                        className="w-full px-3.5 py-2.5 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                        {contact.subjectLabel}
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                      >
                        {contact.motifs.map((motif, i) => (
                          <option key={i} value={motif}>
                            {motif}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                      {contact.messageLabel}
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={
                        lang === 'fr'
                          ? 'Expliquez-nous brièvement votre besoin afin que nous puissions orienter votre demande...'
                          : 'Briefly describe your question or proposal...'
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{contact.submitBtn}</span>
                  </button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                  <h3 className="text-2xl font-bold text-blue-950 dark:text-white">
                    {contact.sentTitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-blue-100 max-w-md mx-auto leading-relaxed">
                    {contact.sentText}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: '',
                        email: '',
                        organization: '',
                        region: 'Canada',
                        subject: contact.motifs[0],
                        message: '',
                      });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    {contact.sendAnother}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

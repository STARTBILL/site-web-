import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, MapPin, User, Briefcase } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang].waitlistModal;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profile: 'autonome',
    region: 'canada',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError(t.errorEmail);
      return;
    }
    if (!formData.fullName.trim()) {
      setError(t.errorName);
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('startbill_waitlist') || '[]');
      existing.push({
        ...formData,
        date: new Date().toISOString(),
      });
      localStorage.setItem('startbill_waitlist', JSON.stringify(existing));
    } catch {
      // Fallback
    }

    setError(null);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      profile: 'autonome',
      region: 'canada',
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all">
        <button
          onClick={onClose}
          aria-label={t.closeBtn}
          className="absolute top-5 right-5 text-slate-400 hover:text-blue-950 dark:hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/assets/aistudio/logo_icon.webp"
                  alt="Logo STARTBILL"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                  {t.badge}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-blue-950 dark:text-white mt-1">
                {t.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-blue-100/80 mt-2">
                {t.subtitle}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t.namePlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                    {t.profileLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.profile}
                      onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                    >
                      <option value="autonome">{t.profiles.autonome}</option>
                      <option value="commercant">{t.profiles.commercant}</option>
                      <option value="pme">{t.profiles.pme}</option>
                      <option value="projet">{t.profiles.projet}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                    {t.regionLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                    >
                      <option value="canada">{t.regions.canada}</option>
                      <option value="senegal">{t.regions.senegal}</option>
                      <option value="ci">{t.regions.ci}</option>
                      <option value="cameroun">{t.regions.cameroun}</option>
                      <option value="benin">{t.regions.benin}</option>
                      <option value="afriqueAutre">{t.regions.afriqueAutre}</option>
                      <option value="haiti">{t.regions.haiti}</option>
                      <option value="autre">{t.regions.autre}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs active:scale-[0.98]"
                >
                  {t.submitBtn}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300 pt-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{t.privacyNotice}</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-950 dark:text-white mb-2">
              {t.successTitle}
            </h3>
            <p className="text-sm text-slate-600 dark:text-blue-200 max-w-sm mx-auto mb-6">
              {t.successMessage} ({formData.email})
            </p>
            <button
              onClick={handleReset}
              className="py-2 px-6 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              {t.closeBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

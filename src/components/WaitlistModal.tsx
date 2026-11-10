import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, MapPin, User, Briefcase } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profile: 'Travailleur autonome',
    region: 'Canada',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Veuillez renseigner une adresse courriel valide.');
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Veuillez indiquer votre nom ou le nom de votre entreprise.');
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
      profile: 'Travailleur autonome',
      region: 'Canada',
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
          aria-label="Fermer"
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
                  Accès prioritaire
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-blue-950 dark:text-white mt-1">
                Rejoindre la liste d’attente
              </h3>
              <p className="text-sm text-slate-600 dark:text-blue-100/80 mt-2">
                Soyez parmi les premiers informés des avancées techniques de STARTBILL et des ouvertures d’essais pilotes au Canada, en Afrique francophone et en Haïti.
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
                  Nom ou dénomination commerciale
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
                    placeholder="Ex: Sophie Tremblay / Studio Alpha"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                  Adresse courriel professionnelle
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
                    placeholder="nom@entreprise.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/30 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                    Profil d'activité
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
                      <option value="Travailleur autonome">Travailleur autonome</option>
                      <option value="Commerçant / Microentreprise">Commerçant / Microentreprise</option>
                      <option value="Petite et moyenne entreprise (PME)">PME</option>
                      <option value="Porteur de projet">Porteur de projet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-blue-200 mb-1">
                    Région d'activité
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
                      <option value="Canada">Canada (Québec & autres provinces)</option>
                      <option value="Afrique francophone - Sénégal">Sénégal</option>
                      <option value="Afrique francophone - Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Afrique francophone - Cameroun">Cameroun</option>
                      <option value="Afrique francophone - Bénin">Bénin</option>
                      <option value="Afrique francophone - Autre pays">Autre pays d'Afrique francophone</option>
                      <option value="Haïti">Haïti</option>
                      <option value="Autre région">Autre région</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs active:scale-[0.98]"
                >
                  Confirmer mon inscription à la liste d’attente
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300 pt-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Vos données sont strictement confidentielles et ne seront jamais partagées.</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-950 dark:text-white mb-2">
              Merci pour votre intérêt !
            </h3>
            <p className="text-sm text-slate-600 dark:text-blue-200 max-w-sm mx-auto mb-6">
              Votre inscription pour <span className="font-semibold text-blue-950 dark:text-white">{formData.email}</span> a bien été enregistrée. Notre équipe vous tiendra informé des étapes de lancement et des publications exclusives de la STARTBILL ACADEMY.
            </p>
            <button
              onClick={handleReset}
              className="py-2 px-6 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

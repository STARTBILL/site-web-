import React, { useState } from 'react';
import { X, Clock, Calendar, AlertTriangle, BookOpen, Check } from 'lucide-react';
import { Article } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onOpenAcademy?: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onOpenAcademy,
}) => {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 dark:border-blue-900/60 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{article.date}</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{article.readTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title={lang === 'fr' ? 'Copier le lien' : 'Copy link'}
              className="px-2 py-1 text-xs text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600">{lang === 'fr' ? 'Copié' : 'Copied'}</span>
                </>
              ) : (
                <span>{lang === 'fr' ? 'Lien' : 'Link'}</span>
              )}
            </button>
            <button
              onClick={onClose}
              title={lang === 'fr' ? 'Fermer' : 'Close'}
              className="p-1.5 text-slate-400 hover:text-blue-950 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-950 dark:text-white">
            {article.title}
          </h2>

          <p className="text-base font-medium text-slate-700 dark:text-blue-100 border-l-2 border-blue-600 pl-4 py-1">
            {article.summary}
          </p>

          {article.disclaimer && (
            <div className="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="font-semibold block mb-0.5">
                  {lang === 'fr' ? 'Avertissement légal :' : 'Legal Notice:'}
                </span>
                {article.disclaimer}
              </div>
            </div>
          )}

          <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-6 border-t border-blue-100 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                {lang === 'fr'
                  ? 'Contenu rédigé pour STARTBILL ACADEMY et le blogue officiel'
                  : 'Official content prepared for STARTBILL ACADEMY and blog'}
              </span>
            </div>
            {onOpenAcademy && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAcademy();
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {lang === 'fr' ? 'Explorer tous les guides Academy →' : 'Explore all Academy guides →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

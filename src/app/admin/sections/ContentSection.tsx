import React, { useState } from 'react';
import { Save, Plus } from 'lucide-react';
import type { CmsContentView } from '../types';

interface ContentSectionProps {
  cms: CmsContentView;
  onSaveCms: (payload: Partial<CmsContentView>) => Promise<void>;
  onCreatePost: (payload: {
    title: string;
    category: string;
    status: 'published' | 'scheduled' | 'draft';
    scheduledFor?: string;
    excerpt: string;
  }) => Promise<void>;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  cms,
  onSaveCms,
  onCreatePost,
}) => {
  const [draft, setDraft] = useState<CmsContentView>(cms);
  const [saving, setSaving] = useState(false);

  const [postTitle, setPostTitle] = useState('');
  const [postCat, setPostCat] = useState('Annonce produit');
  const [postStatus, setPostStatus] = useState<'published' | 'scheduled' | 'draft'>('published');
  const [postDate, setPostDate] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');

  return (
    <div className="space-y-6">
      {/* Page d'accueil, vidéo, marquee et pages légales */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await onSaveCms(draft);
          } finally {
            setSaving(false);
          }
        }}
        className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Accueil, Vidéo, Bandeau défilant & Pages légales (LPRPDE)
          </h2>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Enregistrement...' : 'Publier les modifications'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Titre H1 — Ligne 1
            </label>
            <input
              type="text"
              value={draft.heroTitleLine1}
              onChange={(e) => setDraft({ ...draft, heroTitleLine1: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Titre H1 — Ligne 2
            </label>
            <input
              type="text"
              value={draft.heroTitleLine2}
              onChange={(e) => setDraft({ ...draft, heroTitleLine2: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Sous-titre Hero
            </label>
            <input
              type="text"
              value={draft.heroSubtitle}
              onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              URL de la vidéo de présentation
            </label>
            <input
              type="text"
              value={draft.videoUrl}
              onChange={(e) => setDraft({ ...draft, videoUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
            Texte du bandeau défilant (Marquee)
          </label>
          <textarea
            rows={2}
            value={draft.marqueeText}
            onChange={(e) => setDraft({ ...draft, marqueeText: e.target.value })}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-blue-900/40">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              CGU
            </label>
            <textarea
              rows={3}
              value={draft.legalPages.cgu}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  legalPages: { ...draft.legalPages, cgu: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Politique de confidentialité
            </label>
            <textarea
              rows={3}
              value={draft.legalPages.privacy}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  legalPages: { ...draft.legalPages, privacy: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-blue-200 mb-1">
              Notice LPRPDE Canada
            </label>
            <textarea
              rows={3}
              value={draft.legalPages.lPRPDE}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  legalPages: { ...draft.legalPages, lPRPDE: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </form>

      {/* Blog / Annonces */}
      <div className="p-6 rounded-xl bg-white dark:bg-[#0c1e3d] border border-slate-200 dark:border-blue-900/60 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Blog & Annonces (créer, publier, planifier)
        </h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!postTitle.trim()) return;
            await onCreatePost({
              title: postTitle,
              category: postCat,
              status: postStatus,
              scheduledFor: postStatus === 'scheduled' ? postDate : undefined,
              excerpt: postExcerpt,
            });
            setPostTitle('');
            setPostExcerpt('');
            setPostDate('');
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <input
            type="text"
            required
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Titre de l'annonce ou article"
            className="md:col-span-2 px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />
          <select
            value={postStatus}
            onChange={(e) =>
              setPostStatus(e.target.value as 'published' | 'scheduled' | 'draft')
            }
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="published">Publier immédiatement</option>
            <option value="scheduled">Planifier</option>
            <option value="draft">Brouillon</option>
          </select>
          <input
            type="date"
            disabled={postStatus !== 'scheduled'}
            value={postDate}
            onChange={(e) => setPostDate(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white disabled:opacity-40"
          />
          <input
            type="text"
            value={postCat}
            onChange={(e) => setPostCat(e.target.value)}
            placeholder="Catégorie"
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={postExcerpt}
            onChange={(e) => setPostExcerpt(e.target.value)}
            placeholder="Résumé court"
            className="md:col-span-2 px-3 py-2 text-xs bg-slate-50 dark:bg-blue-950/40 border border-slate-200 dark:border-blue-800 rounded-lg text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </form>

        <div className="divide-y divide-slate-100 dark:divide-blue-900/40">
          {cms.announcements.map((post) => (
            <div key={post.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{post.title}</p>
                <p className="text-slate-500 dark:text-blue-300 mt-0.5">{post.excerpt}</p>
              </div>
              <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                {post.status}
                {post.scheduledFor ? ` (${post.scheduledFor})` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

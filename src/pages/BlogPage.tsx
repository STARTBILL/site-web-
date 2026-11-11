import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../data/translations';
import { BLOGUE_CONTENT, Article } from '../data/content';

interface BlogPageProps {
  onNavigate: (pageId: string) => void;
  onSelectArticle: (article: Article) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, onSelectArticle }) => {
  const { lang } = useLanguage();
  const common = TRANSLATIONS[lang].common;
  const nav = TRANSLATIONS[lang].nav;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: lang === 'fr' ? 'Tous les articles' : 'All Articles' },
    { id: 'facturation', name: lang === 'fr' ? 'Facturation' : 'Invoicing' },
    { id: 'gestion', name: lang === 'fr' ? 'Gestion financière' : 'Financial Management' },
    { id: 'international', name: lang === 'fr' ? 'Régions & Devises' : 'Regions & Currencies' },
    { id: 'produit', name: lang === 'fr' ? 'Actualités produit' : 'Product News' },
  ];

  const filteredArticles = BLOGUE_CONTENT.articles.filter((art) => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            <span className="text-blue-950 dark:text-white">{nav.blogue}</span>
          </div>
        </div>

        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {lang === 'fr' ? 'Ressources & Guides pratiques' : 'Practical Guides & Resources'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-950 dark:text-white">
            {lang === 'fr' ? 'Le blogue STARTBILL' : 'The STARTBILL Blog'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/90 leading-relaxed">
            {lang === 'fr'
              ? BLOGUE_CONTENT.introduction
              : 'Insights, educational deep-dives, and practical advice to guide entrepreneurs through invoices, receivables, and regional taxation.'}
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-blue-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher un article ou un mot-clé...' : 'Search articles or keywords...'}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0c1e3d] border border-blue-200 dark:border-blue-900 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-blue-950 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="p-7 rounded-3xl bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900/60 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300 mb-3">
                  <span className="capitalize text-blue-600 dark:text-blue-400 font-semibold">
                    {art.category.replace('-', ' ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{art.readTime}</span>
                </div>

                <h2 className="text-lg font-bold text-blue-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {art.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-blue-100/80 leading-relaxed mt-3">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-blue-100 dark:border-blue-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-blue-300">{art.date}</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                  {common.readArticle}
                </span>
              </div>
            </article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="py-16 text-center text-slate-500 dark:text-blue-300 text-sm">
            {lang === 'fr'
              ? 'Aucun article ne correspond à votre recherche.'
              : 'No articles match your search criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};

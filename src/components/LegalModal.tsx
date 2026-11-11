import React from 'react';
import { X, Shield, FileText, Cookie } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type LegalDocType = 'confidentialite' | 'conditions' | 'cookies';

interface LegalModalProps {
  type: LegalDocType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const { lang } = useLanguage();

  if (!type) return null;

  const contentMap = {
    confidentialite: {
      title: lang === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy',
      icon: <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      text:
        lang === 'fr'
          ? [
              'STARTBILL accorde une importance primordiale à la protection des renseignements personnels de ses utilisateurs et partenaires.',
              'Les renseignements collectés via nos formulaires (notamment liste d’attente et contact) sont limités aux données strictement nécessaires pour répondre à vos demandes, vous informer de nos avancées et valider l’intérêt de nos fonctionnalités selon les juridictions.',
              'Aucune donnée n’est cédée ou vendue à des tiers. Les serveurs et outils de traitement répondent aux meilleures normes de sécurité en vigueur au Canada et dans les pays partenaires.',
              'Conformément aux lois applicables sur la protection des données personnelles (dont la Loi 25 au Québec et la LPRPDE au Canada), vous disposez d’un droit d’accès, de rectification et de suppression de vos données en contactant notre équipe à contact.startbill@gmail.com.',
            ]
          : [
              'STARTBILL places the utmost importance on safeguarding the personal information of our users and partners.',
              'Information collected through our forms (specifically waitlist and contact forms) is limited to what is strictly necessary to answer your inquiries, provide progress updates, and assess regional demand.',
              'No data is sold or leased to third parties. Data processing tools adhere to high security standards in Canada and partner territories.',
              'Under applicable privacy regulations (including Quebec Law 25 and PIPEDA in Canada), you may exercise your rights to access, rectify, or delete personal data by contacting contact.startbill@gmail.com.',
            ],
    },
    conditions: {
      title: lang === 'fr' ? 'Conditions d’utilisation' : 'Terms of Service',
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      text:
        lang === 'fr'
          ? [
              'Bienvenue sur STARTBILL.ca. Le présent site vitrine est édité par la startup technologique canadienne STARTBILL.',
              'Nature du site : Le présent site vitrine a une vocation purement informative et préparatoire. Les descriptions de fonctionnalités correspondent aux capacités en cours de conception et de validation, et ne constituent en aucun cas une offre contractuelle de service immédiat ni une promesse de disponibilité sans réserve.',
              'Absence de conseil professionnel : Les contenus publiés sur STARTBILL, y compris au sein de STARTBILL ACADEMY et du Blogue, ont un caractère informatif et éducatif. Ils ne remplacent en aucun cas les conseils personnalisés d’un comptable professionnel agréé, d’un fiscaliste ou d’un juriste qualifié dans votre juridiction.',
              'Propriété intellectuelle : L’ensemble des éléments visuels, marques, textes et concepts présentés sur ce site sont la propriété exclusive de STARTBILL ou font l’objet d’une licence d’exploitation.',
            ]
          : [
              'Welcome to STARTBILL.ca. This showcase website is published by the Canadian fintech startup STARTBILL.',
              'Informational Purpose: This showcase website is purely informative and preparatory. Feature descriptions depict capabilities undergoing development and validation, and do not constitute an immediate contractual offering or unqualified service warranty.',
              'No Professional Advice: All materials published on STARTBILL, including STARTBILL ACADEMY and the Blog, are strictly educational. They do not substitute for personalized guidance from a certified CPA accountant, tax advisor, or legal counsel.',
              'Intellectual Property: All brand assets, trademarks, designs, and content presented on this site are the exclusive property of STARTBILL or used under license.',
            ],
    },
    cookies: {
      title: lang === 'fr' ? 'Gestion des témoins de connexion (Cookies)' : 'Cookie Preferences',
      icon: <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      text:
        lang === 'fr'
          ? [
              'STARTBILL privilégie une navigation respectueuse de votre vie privée sans traceurs intrusifs.',
              'Témoins strictement nécessaires : Ce site utilise uniquement des mécanismes locaux légers (tels que la sauvegarde de vos préférences de langue et la validation de vos formulaires) nécessaires au bon fonctionnement de l’interface.',
              'Témoins analytiques : Des statistiques anonymisées et agrégées peuvent être utilisées pour mesurer la fréquentation générale du site dans le respect des dispositions légales.',
              'Vous avez la liberté de configurer votre navigateur pour bloquer ou supprimer ces témoins à tout moment sans altérer l’accès aux contenus essentiels du site.',
            ]
          : [
              'STARTBILL prioritizes privacy-first browsing without intrusive trackers.',
              'Strictly Necessary Cookies: This website utilizes lightweight local mechanisms (such as language preference storage and form handling) essential for smooth interface operation.',
              'Aggregated Analytics: Anonymized metrics may be measured to assess overall website traffic in full compliance with applicable regulations.',
              'You can configure your browser to block or delete cookies at any time without impacting access to core website content.',
            ],
    },
  };

  const current = contentMap[type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-[#0c1e3d] border border-blue-100 dark:border-blue-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 dark:border-blue-900/60 shrink-0">
          <div className="flex items-center gap-2">
            {current.icon}
            <h3 className="text-lg font-bold text-blue-950 dark:text-white">
              {current.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
            className="p-1.5 text-slate-400 hover:text-blue-950 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-blue-100 leading-relaxed">
          {current.text.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
          <div className="pt-4 border-t border-blue-100 dark:border-blue-900/60 text-xs text-slate-500 dark:text-blue-300">
            {lang === 'fr'
              ? 'Document de référence · STARTBILL.ca · Pour toute question, écrivez à contact.startbill@gmail.com.'
              : 'Reference Document · STARTBILL.ca · For any questions, contact contact.startbill@gmail.com.'}
          </div>
        </div>

        <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-950/60 border-t border-blue-100 dark:border-blue-900/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            {lang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

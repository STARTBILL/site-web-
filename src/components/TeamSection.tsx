import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { TeamMemberCard, type TeamMember } from './TeamMemberCard';

interface TeamSectionProps {
  members?: TeamMember[];
}

export const FOUNDERS_TEAM: TeamMember[] = [
  {
    id: 'ferline-zogni',
    name: 'Ferline ZOGNI',
    role: 'Founder & Chief Executive Officer (CEO)',
    photo: '/assets/aistudio/6041847451997638631_1cf8f937.jpg',
    photoAlt: 'Ferline ZOGNI, Founder & Chief Executive Officer (CEO) de StartBill',
    bio: "Passionnée par l'entrepreneuriat et la finance, Ferline pilote la vision stratégique de StartBill pour offrir une solution simple et accessible aux PME canadiennes.",
    socials: {
      linkedin: 'https://www.linkedin.com/in/ferline-gouefack-zogni',
      twitter: 'https://x.com/startbill_app',
      email: 'contact.startbill@gmail.com',
    },
  },
  {
    id: 'franquetz-nongni',
    name: 'Franquetz Nongni',
    role: 'Lead Software Developer',
    photo: '/assets/aistudio/6041847451997638630_34bf0dae.jpg',
    photoAlt: 'Franquetz Nongni, Lead Software Developer de StartBill',
    bio: "Architecte du code et expert en technologies web, Franquetz veille à ce que StartBill soit rapide, sécurisé et intuitif pour tous les utilisateurs.",
    socials: {
      linkedin: 'https://www.linkedin.com/company/startbill',
      github: 'https://github.com/startbill',
      email: 'contact.startbill@gmail.com',
    },
  },
  {
    id: 'merveille-grace-mbida',
    name: 'Merveille Grace Mbida',
    role: 'Partnership Research Coordinator',
    photo: '/assets/aistudio/6044099251811323758_cd967e5e.jpg',
    photoAlt: 'Merveille Grace Mbida, Partnership Research Coordinator de StartBill',
    bio: "Spécialiste des alliances stratégiques et de la recherche de partenariats, Merveille développe les collaborations clés qui accélèrent la portée et l'impact de StartBill.",
    socials: {
      linkedin: 'https://www.linkedin.com/company/startbill',
      email: 'contact.startbill@gmail.com',
    },
  },
];

const FOUNDERS_TEAM_EN: TeamMember[] = [
  {
    ...FOUNDERS_TEAM[0],
    photoAlt: 'Ferline ZOGNI, Founder & Chief Executive Officer (CEO) at StartBill',
    bio: 'Passionate about entrepreneurship and finance, Ferline leads the strategic vision of StartBill to deliver a simple and accessible financial platform for Canadian SMEs.',
  },
  {
    ...FOUNDERS_TEAM[1],
    photoAlt: 'Franquetz Nongni, Lead Software Developer at StartBill',
    bio: 'Software architect and web technologies specialist, Franquetz ensures StartBill remains fast, secure, and intuitive for every business owner.',
  },
  {
    ...FOUNDERS_TEAM[2],
    photoAlt: 'Merveille Grace Mbida, Partnership Research Coordinator at StartBill',
    bio: "Strategic alliances and partnership research specialist, Merveille builds key collaborations that expand StartBill's reach and impact across target markets.",
  },
];

export const TeamSection: React.FC<TeamSectionProps> = ({ members }) => {
  const { lang } = useLanguage();
  const teamMembers = members || (lang === 'en' ? FOUNDERS_TEAM_EN : FOUNDERS_TEAM);

  const kicker =
    lang === 'en'
      ? 'StartBill Canada Leadership'
      : 'Direction & Ingénierie StartBill';

  const heading =
    lang === 'en'
      ? 'The Team Behind StartBill'
      : "L'équipe derrière StartBill";

  const subtitle =
    lang === 'en'
      ? 'Experts dedicated to simplifying financial management for entrepreneurs.'
      : 'Des experts passionnés par la simplification financière des entrepreneurs.';

  return (
    <section
      aria-labelledby="startbill-team-heading"
      className="relative overflow-hidden bg-slate-50 dark:bg-[#091a36] border border-slate-200/70 dark:border-blue-900/50 rounded-3xl py-16 md:py-24 px-6 sm:px-10 lg:px-14"
    >
      {/* Filigrane corporate "StartBill" en arrière-plan flouté */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center overflow-hidden"
      >
        <span className="font-display font-extrabold tracking-tighter text-[4.75rem] sm:text-[8.5rem] lg:text-[11.5rem] leading-none text-blue-950/[0.04] dark:text-blue-200/[0.045] blur-[2px] whitespace-nowrap">
          StartBill
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* En-tête de section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {kicker}
          </p>
          <h2
            id="startbill-team-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-950 dark:text-white text-balance"
          >
            {heading}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-blue-100/85 leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Grille responsive : 1 colonne mobile, 2 tablette, 3 colonnes desktop */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            teamMembers.length >= 3 ? 'lg:grid-cols-3 max-w-6xl' : 'max-w-4xl'
          } gap-8 lg:gap-8 mx-auto items-stretch`}
        >
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Github, Mail } from 'lucide-react';

export interface TeamMemberSocials {
  linkedin?: string;
  twitter?: string;
  github?: string;
  email?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  photoAlt?: string;
  bio: string;
  socials?: TeamMemberSocials;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index?: number;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, index = 0 }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(member.name);
  const altText = member.photoAlt || `${member.name}, ${member.role} de StartBill`;

  const hasSocials = Boolean(
    member.socials &&
      (member.socials.linkedin ||
        member.socials.twitter ||
        member.socials.github ||
        member.socials.email)
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white dark:bg-[#0c1e3d] border border-slate-200/80 dark:border-blue-900/60 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Photo carrée avec ombre et mise à l'échelle au survol */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 dark:from-[#081730] dark:via-[#0d244a] dark:to-[#071328] mb-6">
        {!imageFailed && member.photo ? (
          <img
            src={member.photo}
            alt={altText}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            role="img"
            aria-label={altText}
            className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0A2540] via-[#0F3562] to-[#0056D2] text-white relative overflow-hidden transition-transform duration-300 ease-out group-hover:scale-105"
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.28) 0%, transparent 55%)',
              }}
              aria-hidden="true"
            />
            <div className="relative w-24 h-24 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-xs flex items-center justify-center shadow-inner mb-3">
              <span className="font-display text-3xl font-extrabold tracking-tight text-white">
                {initials}
              </span>
            </div>
            <span className="relative text-xs font-medium text-blue-100/90 tracking-wide">
              StartBill Canada
            </span>
          </div>
        )}
      </div>

      {/* Identité & rôle */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          {member.name}
        </h3>
        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base mt-1">
          {member.role}
        </p>

        {/* Séparateur discret */}
        <div
          className="my-4 h-px w-full bg-slate-200 dark:bg-blue-900/60"
          aria-hidden="true"
        />

        {/* Courte biographie */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-blue-100/85 leading-relaxed flex-1">
          {member.bio}
        </p>

        {/* Liens sociaux optionnels */}
        {hasSocials && (
          <div className="pt-5 mt-5 border-t border-slate-100 dark:border-blue-900/40 flex items-center gap-2.5">
            {member.socials?.linkedin && (
              <a
                href={member.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Profil LinkedIn de ${member.name}`}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-blue-800/70 text-slate-600 dark:text-blue-200 hover:text-blue-600 dark:hover:text-white hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-blue-950/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}

            {member.socials?.twitter && (
              <a
                href={member.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Profil X (Twitter) de ${member.name}`}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-blue-800/70 text-slate-600 dark:text-blue-200 hover:text-blue-600 dark:hover:text-white hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-blue-950/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}

            {member.socials?.github && (
              <a
                href={member.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Profil GitHub de ${member.name}`}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-blue-800/70 text-slate-600 dark:text-blue-200 hover:text-blue-600 dark:hover:text-white hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-blue-950/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            {member.socials?.email && (
              <a
                href={`mailto:${member.socials.email}`}
                aria-label={`Contacter ${member.name} par courriel`}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-blue-800/70 text-slate-600 dark:text-blue-200 hover:text-blue-600 dark:hover:text-white hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-blue-950/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
};

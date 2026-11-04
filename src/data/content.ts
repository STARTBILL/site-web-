/**
 * Content data faithfully transcribed and structured from:
 * "STARTBILL — CONTENU RÉDACTIONNEL DU SITE WEB ET DU BLOGUE"
 * Version de travail pour intégration sur STARTBILL.ca | Novembre 2026
 */

export interface Article {
  id: string;
  category: string;
  title: string;
  readTime: string;
  date: string;
  summary: string;
  content: string[];
  disclaimer?: string;
}

export const SITE_METADATA = {
  brand: "STARTBILL",
  tagline: "La gestion financière, aussi simple que l’envoi d’un message.",
  domain: "STARTBILL.ca",
  contactEmail: "contact.startbill@gmail.com",
  dateVersion: "Novembre 2026",
};

export const ACCUEIL_CONTENT = {
  banniere: {
    title: "STARTBILL — La gestion financière, aussi simple que l’envoi d’un message.",
    description:
      "Simplifiez votre quotidien d’entrepreneur. STARTBILL développe une plateforme numérique destinée à faciliter la facturation, le suivi des dépenses et des paiements et la compréhension de l’activité financière des petites entreprises.",
    sousTitre:
      "Pensé pour les travailleurs autonomes, commerçants, microentreprises et PME au Canada, en Afrique francophone et en Haïti.",
    actions: {
      decouvrir: "Découvrir STARTBILL",
      contacter: "Nous contacter",
      listeAttente: "Rejoindre la liste d’attente",
    },
  },
  pourquoi: {
    title: "Pourquoi STARTBILL ?",
    text: "Entre les factures, les clients, les dépenses et les paiements, gérer une activité peut rapidement devenir complexe. Notre ambition est de réunir les informations essentielles dans un environnement plus clair, plus accessible et mieux adapté au quotidien des entrepreneurs.",
  },
  engagements: [
    {
      title: "Simplicité",
      desc: "Des démarches compréhensibles, débarrassées du jargon superflu pour se concentrer sur l'essentiel.",
    },
    {
      title: "Visibilité",
      desc: "Une meilleure lecture des opérations de l’entreprise pour prendre des décisions éclairées au bon moment.",
    },
    {
      title: "Accessibilité",
      desc: "Une approche attentive aux réalités de différents marchés, de leurs devises et de leurs pratiques commerciales.",
    },
  ],
  derniereSection: {
    title: "Vous développez votre activité ?",
    text: "Découvrez notre vision, les solutions en préparation et les ressources éducatives de STARTBILL ACADEMY.",
  },
};

export const A_PROPOS_CONTENT = {
  quiSommesNous: {
    title: "Qui sommes-nous ?",
    content:
      "STARTBILL est une startup technologique canadienne qui développe des solutions numériques de gestion financière pour les travailleurs autonomes, commerçants, microentreprises et petites et moyennes entreprises. Notre projet part d’un constat : de nombreux entrepreneurs consacrent un temps important à organiser leurs documents, suivre leurs encaissements et comprendre leurs chiffres.",
  },
  mission: {
    title: "Notre mission",
    content:
      "Rendre la gestion financière quotidienne plus simple, plus compréhensible et plus accessible aux entrepreneurs, grâce à des outils numériques pensés pour leurs besoins concrets.",
  },
  vision: {
    title: "Notre vision",
    content:
      "Contribuer à un environnement où les entrepreneurs, quelle que soit la taille de leur activité, disposent d’une meilleure visibilité sur leurs opérations et peuvent consacrer davantage d’attention à leur développement.",
  },
  valeurs: [
    {
      name: "Simplicité",
      desc: "Éviter la complexité inutile.",
    },
    {
      name: "Fiabilité",
      desc: "Privilégier des informations exactes et traçables.",
    },
    {
      name: "Inclusion",
      desc: "Tenir compte des réalités économiques et linguistiques des marchés desservis.",
    },
    {
      name: "Apprentissage",
      desc: "Rendre les notions financières plus accessibles.",
    },
    {
      name: "Amélioration continue",
      desc: "Faire évoluer le produit à partir des besoins réels.",
    },
  ],
  ambition: {
    title: "Notre ambition",
    content:
      "Développer progressivement un écosystème combinant outils de gestion, ressources pédagogiques et collaborations avec des acteurs de l’accompagnement entrepreneurial. Les capacités proposées évolueront selon les validations techniques et réglementaires.",
  },
};

export const FONCTIONNALITES_CONTENT = {
  note: "Présentation des éléments comme des capacités en cours de développement. Les textes décrivent la vision et le périmètre envisagé, non une disponibilité garantie.",
  items: [
    {
      id: "facturation",
      title: "Facturation",
      resume:
        "Préparer des factures structurées avec les informations de l’entreprise, du client, des produits ou services, des montants et des conditions de paiement.",
      objectif: "Faciliter la préparation et l’organisation des documents commerciaux.",
      tags: ["Devis", "Factures", "Conditions de paiement"],
    },
    {
      id: "clients",
      title: "Gestion des clients",
      resume:
        "Regrouper les coordonnées et les informations utiles sur les clients afin de faciliter la création des documents et le suivi des relations commerciales.",
      objectif: "Centraliser l'historique de vos relations commerciales en un seul lieu sécurisé.",
      tags: ["Fiches contacts", "Coordonnées", "Historique d'émissions"],
    },
    {
      id: "catalogue",
      title: "Produits et services",
      resume:
        "Organiser un catalogue des prestations ou articles proposés, avec leur description et leurs prix, pour simplifier la saisie des factures.",
      objectif: "Accélérer la création de factures grâce à des grilles tarifaires pré-enregistrées.",
      tags: ["Catalogue", "Prestations", "Tarifs unitaires"],
    },
    {
      id: "depenses",
      title: "Suivi des dépenses",
      resume:
        "Consigner les dépenses de l’activité et les classer pour mieux comprendre les sorties d’argent et conserver une vue structurée des charges.",
      objectif: "Classer les sorties d'argent pour éviter les surprises en fin de mois.",
      tags: ["Catégorisation", "Reçus", "Suivi des charges"],
    },
    {
      id: "paiements",
      title: "Suivi des paiements",
      resume:
        "Distinguer les factures émises des montants effectivement encaissés et suivre les soldes restant à recevoir. Les modalités de paiement peuvent varier selon les marchés et les intégrations réellement disponibles.",
      objectif: "Identifier instantanément les factures payées, en attente ou échues.",
      tags: ["Encaissements", "Soldes dus", "Relances simplifiées"],
    },
    {
      id: "tresorerie",
      title: "Trésorerie et visibilité financière",
      resume:
        "Mettre en perspective les encaissements et les dépenses pour aider l’entrepreneur à mieux comprendre les mouvements financiers de son activité.",
      objectif:
        "Les indicateurs ne remplacent pas une comptabilité professionnelle, mais offrent une clarté quotidienne.",
      tags: ["Entrées/Sorties", "Solde de trésorerie", "Perspective"],
    },
    {
      id: "tableaux",
      title: "Tableaux de bord et rapports",
      resume:
        "Présenter des synthèses visuelles des factures, paiements, dépenses et autres données disponibles afin de faciliter le suivi de l’activité.",
      objectif: "Visualiser la santé globale de votre activité d'un simple coup d'œil.",
      tags: ["Graphiques de synthèse", "Rapports d'activité", "Métriques clés"],
    },
    {
      id: "regional",
      title: "Adaptation régionale",
      resume:
        "STARTBILL vise des usages au Canada, en Afrique francophone et en Haïti. Les devises, règles fiscales, obligations documentaires et moyens de paiement diffèrent selon les pays et doivent être traités selon chaque juridiction.",
      objectif: "Respecter les spécificités de chaque juridiction (taxes locales, devises CAD, XOF, HTG, etc.).",
      tags: ["Multi-devises", "Règles fiscales locales", "Documents adaptés"],
    },
  ],
  longTerme: {
    title: "À plus long terme",
    text: "Certaines pistes, comme l’assistance intelligente, l’automatisation avancée ou d’autres intégrations, sont envisagées pour de futures étapes. Elles ne doivent pas être annoncées comme disponibles aujourd’hui.",
  },
};

export const SOLUTIONS_CONTENT = {
  title: "Nos solutions",
  subtitle: "Pour qui ?",
  description:
    "Des outils adaptés aux contextes et aux besoins spécifiques des créateurs d'entreprise, travailleurs indépendants et dirigeants de PME.",
  segments: [
    {
      id: "autonomes",
      title: "Travailleurs autonomes",
      description:
        "Pour celles et ceux qui exercent seuls et veulent structurer leurs prestations, leurs factures et le suivi de leurs paiements.",
      points: [
        "Création rapide de factures soignées",
        "Suivi des encaissements sans perte de temps",
        "Rapprochement simple des dépenses professionnelles",
      ],
    },
    {
      id: "commercants",
      title: "Commerçants et microentreprises",
      description:
        "Pour les petites activités qui souhaitent mieux organiser leurs clients, ventes, dépenses et informations financières.",
      points: [
        "Gestion simplifiée du catalogue de produits et services",
        "Vue claire sur les clients réguliers et les créances",
        "Clarté sur les marges et sorties de caisse régulières",
      ],
    },
    {
      id: "pme",
      title: "Petites et moyennes entreprises",
      description:
        "Pour les équipes qui recherchent davantage de cohérence dans le suivi des opérations courantes et la consultation des indicateurs essentiels.",
      points: [
        "Centralisation des données financières d'équipe",
        "Synthèse visuelle de l'état de facturation et de trésorerie",
        "Préparation facilitée pour la transmission au comptable",
      ],
    },
  ],
  approcheInternationale: {
    title: "Une approche internationale",
    content:
      "Le projet s’adresse à plusieurs environnements entrepreneuriaux, sans supposer que les exigences administratives ou fiscales sont identiques d’un territoire à l’autre.",
    zones: [
      {
        nom: "Canada",
        detail: "Taxes fédérales (TPS) et provinciales (TVQ, TVH), devises CAD, règles documentaires canadiennes.",
      },
      {
        nom: "Afrique francophone",
        detail: "Marchés UEMOA & CEMAC, devises XOF / XAF, pratiques de facturation et écosystèmes locaux.",
      },
      {
        nom: "Haïti",
        detail: "Devise HTG / USD, contextes d'échanges commerciaux et particularités des entrepreneurs locaux.",
      },
    ],
  },
};

export const ACADEMY_CONTENT = {
  title: "STARTBILL ACADEMY",
  presentation:
    "STARTBILL ACADEMY est l’espace de sensibilisation et d’apprentissage associé au projet STARTBILL. Sa vocation est d’expliquer, avec des exemples simples, les notions utiles à la gestion quotidienne d’une entreprise.",
  ceQueVousYTrouverez:
    "Des contenus sur les bases de la facturation, le suivi des clients, les dépenses, les paiements, la trésorerie, la lecture des indicateurs et les bonnes habitudes d’organisation.",
  notreApproche:
    "Des explications accessibles, des cas pratiques, des questions de communauté et des ressources adaptées aux réalités des entrepreneurs. Les informations pédagogiques ne remplacent pas un avis fiscal, juridique ou comptable propre à chaque pays.",
  invitation:
    "Explorez nos conseils, découvrez les prochaines publications et partagez les questions que vous rencontrez dans la gestion de votre activité.",
  modules: [
    {
      titre: "Bases de la facturation",
      description: "Identifier les mentions indispensables, comprendre la différence entre facture d'acompte, facture finale et reçu.",
      notions: ["Mentions obligatoires", "Calculs hors taxes et taxes", "Conditions de règlement"],
    },
    {
      titre: "Suivi des clients & créances",
      description: "Méthodes pour maintenir un carnet de clients rigoureux et assurer un suivi bienveillant mais ferme des règlements.",
      notions: ["Organisation de la base clients", "Délais de paiement", "Prévention des impayés"],
    },
    {
      titre: "Gestion des dépenses et charges",
      description: "Apprendre à classifier ses coûts fixes et variables pour mieux apprécier la rentabilité réelle de son temps et de ses produits.",
      notions: ["Charges d'exploitation", "Archivage des justificatifs", "Contrôle des flux sortants"],
    },
    {
      titre: "Trésorerie vs Chiffre d'affaires",
      description: "Distinguer le chiffre d'affaires facturé de l'argent réellement disponible sur le compte bancaire de l'entreprise.",
      notions: ["Décalages de trésorerie", "Besoin en fonds de roulement", "Anticipation des échéances"],
    },
  ],
};

export const BLOGUE_CONTENT: {
  introduction: string;
  categories: { id: string; name: string }[];
  articles: Article[];
} = {
  introduction:
    "Bienvenue sur le blogue STARTBILL. Vous y trouverez des explications, des exemples et des réflexions pour mieux comprendre la gestion financière d’une petite entreprise et suivre l’évolution du projet.",
  categories: [
    { id: "all", name: "Tous les articles" },
    { id: "facturation", name: "Facturation" },
    { id: "clients-paiements", name: "Clients et paiements" },
    { id: "depenses-tresorerie", name: "Dépenses et trésorerie" },
    { id: "entrepreneuriat-region", name: "Entrepreneuriat par région" },
    { id: "actualites", name: "Actualités STARTBILL" },
  ],
  articles: [
    // Catégorie : Facturation
    {
      id: "art-1",
      category: "facturation",
      title: "Qu’est-ce qu’une facture ?",
      readTime: "4 min",
      date: "Novembre 2026",
      summary:
        "Comprendre le rôle juridique, commercial et comptable d'une facture pour un entrepreneur individuel ou une entreprise.",
      content: [
        "Une facture est bien plus qu'une simple demande de paiement. C'est un document commercial, juridique et comptable officiel qui atteste de la vente d'un bien ou de la réalisation d'une prestation de service.",
        "Sur le plan juridique, la facture prouve l'existence de la créance et fixe la date d'exigibilité du paiement. Sur le plan fiscal, elle justifie les déclarations de chiffre d'affaires et, le cas échéant, la perception ou déduction des taxes de vente (comme la TPS/TVQ au Canada ou la TVA selon les pays).",
        "Pour un entrepreneur débutant, émettre une facture propre et conforme dès la première transaction renforce immédiatement la crédibilité professionnelle et évite les litiges.",
      ],
    },
    {
      id: "art-2",
      category: "facturation",
      title: "Devis, facture et reçu : quelles différences ?",
      readTime: "5 min",
      date: "Novembre 2026",
      summary:
        "Distinguer ces trois pièces maîtresses du cycle commercial pour éviter les confusions avec vos clients.",
      content: [
        "Dans la vie quotidienne d'une petite entreprise, ces trois termes sont parfois employés de façon interchangeable, ce qui est une source d'erreurs fréquentes.",
        "Le devis (ou estimation) est une proposition contractuelle préalable. Il détaille la nature de la prestation et son prix avant engagement des travaux. Une fois signé par le client avec la mention d'accord, il vaut contrat.",
        "La facture est émise une fois la prestation accomplie ou selon les jalons convenus. Elle constate l'obligation juridique du client de payer.",
        "Le reçu (ou quittance) atteste que le paiement a bel et bien été encaissé. Il protège le client en prouvant qu'il s'est libéré de sa dette.",
      ],
    },
    {
      id: "art-3",
      category: "facturation",
      title: "Les informations à vérifier avant d’envoyer une facture",
      readTime: "4 min",
      date: "Novembre 2026",
      summary:
        "La liste de contrôle indispensable pour vous assurer qu'aucune omission ne retardera le règlement de votre facture.",
      content: [
        "Une facture incomplète ou erronée est le premier motif invoqué pour retarder un paiement. Avant tout envoi, prenez deux minutes pour valider ces éléments fondamentaux :",
        "1. L'identification complète de votre entreprise (nom légal, coordonnées, numéros fiscaux ou d'enregistrement si applicables).",
        "2. Les coordonnées précises de votre client et le nom de la personne responsable de la validation.",
        "3. La date d'émission et le numéro de facture unique respectant une séquence chronologique ininterrompue.",
        "4. Le détail limpide des prestations ou produits fournis (quantités, prix unitaires, devises).",
        "5. Les modalités précises de règlement (date limite, coordonnées de virement ou modes de paiement acceptés).",
      ],
    },

    // Catégorie : Clients et paiements
    {
      id: "art-4",
      category: "clients-paiements",
      title: "Comment organiser sa liste de clients ?",
      readTime: "4 min",
      date: "Novembre 2026",
      summary:
        "Méthodes concrètes pour structurer son carnet d'adresses professionnel et faciliter les futures émissions de documents.",
      content: [
        "Au fur et à mesure que l'activité grandit, conserver les coordonnées de ses clients sur des bouts de papier, dans des fils de messages ou des tableurs éparpillés devient un facteur de risque.",
        "Centraliser les fiches clients avec nom, téléphone, courriel de facturation, adresse et historique des échanges permet de gagner un temps précieux lors de chaque facturation.",
        "De plus, cela offre une vision claire sur les clients récurrents et ceux qui nécessitent une attention particulière pour le suivi de leurs dossiers.",
      ],
    },
    {
      id: "art-5",
      category: "clients-paiements",
      title: "Pourquoi distinguer facture envoyée et facture payée ?",
      readTime: "3 min",
      date: "Novembre 2026",
      summary:
        "Comprendre le décalage temporel fondamental entre la promesse commerciale et l'encaissement effectif.",
      content: [
        "Un entrepreneur ne peut pas piloter sa trésorerie en se basant sur le total des factures qu'il a émises. Une facture envoyée n'est qu'une créance.",
        "Tant que les fonds n'ont pas atterri sur votre compte bancaire, vous ne pouvez pas les réutiliser pour payer vos fournisseurs, votre loyer ou vos charges.",
        "Distinguer clairement le statut 'Envoyée' du statut 'Payée' est la première règle d'hygiène financière pour éviter l'illusion d'une trésorerie abondante.",
      ],
    },
    {
      id: "art-6",
      category: "clients-paiements",
      title: "Comment suivre un paiement partiel ?",
      readTime: "4 min",
      date: "Novembre 2026",
      summary:
        "Gérer les acomptes et règlements échelonnés sans perdre le fil des soldes restant dus.",
      content: [
        "Dans de nombreux secteurs comme le bâtiment, le conseil ou le commerce de gros, les paiements s'effectuent par tranches : acompte au lancement, versement intermédiaire et solde à livraison.",
        "Il est primordial d'imputer rigoureusement chaque encaissement à la facture concernée et de faire apparaître explicitement sur le document le montant initial, la somme reçue et le solde résiduel.",
        "Cette rigueur rassure votre client et prévient tout malentendu lors de l'appel du solde final.",
      ],
    },

    // Catégorie : Dépenses et trésorerie
    {
      id: "art-7",
      category: "depenses-tresorerie",
      title: "Pourquoi suivre ses dépenses chaque semaine ?",
      readTime: "4 min",
      date: "Novembre 2026",
      summary:
        "Prendre le pouls de ses sorties d'argent à un rythme hebdomadaire plutôt qu'au moment du bilan annuel.",
      content: [
        "Attendre la fin de l'exercice fiscal pour examiner ses reçus est la garantie de découvertes désagréables. Les petites dépenses cumulées (abonnements, déplacements, fournitures) représentent souvent une part importante du budget.",
        "Consacrer 15 minutes chaque fin de semaine à consigner ses sorties d'argent permet de détecter immédiatement les dérives de coûts et d'ajuster ses prix ou ses achats en conséquence.",
      ],
    },
    {
      id: "art-8",
      category: "depenses-tresorerie",
      title: "Comprendre la différence entre chiffre d’affaires et trésorerie",
      readTime: "5 min",
      date: "Novembre 2026",
      summary:
        "Pourquoi une entreprise très rentable sur le papier peut faire faillite par manque d'argent liquide disponible.",
      content: [
        "C'est l'un des paradoxes les plus fréquents en entrepreneuriat : le chiffre d'affaires mesure le volume d'activité facturé, tandis que la trésorerie est le solde net d'argent immédiatement mobilisable.",
        "Si vous facturez pour 20 000 $ ce mois-ci mais que vos clients vous paient à 60 jours, votre chiffre d'affaires est flatteur, mais votre trésorerie immédiate est à zéro. Si vos charges tombent entre-temps, vous êtes en rupture de liquidité.",
        "Surveiller sa trésorerie quotidienne est la garantie de pérennité d'une petite structure.",
      ],
    },
    {
      id: "art-9",
      category: "depenses-tresorerie",
      title: "Cinq indicateurs à surveiller dans une petite activité",
      readTime: "5 min",
      date: "Novembre 2026",
      summary:
        "Les indicateurs clés de performance essentiels, compréhensibles et actionnables au quotidien.",
      content: [
        "Pour garder le cap sans se noyer dans des tableaux complexes, voici 5 repères indispensables :",
        "1. Le solde disponible en banque (la réalité instantanée).",
        "2. Les factures en attente de règlement et leur ancienneté.",
        "3. Les dépenses incompressibles prévues pour les 30 prochains jours.",
        "4. Le panier moyen par client ou prestation.",
        "5. La tendance mensuelle des encaissements par rapport aux mois précédents.",
      ],
    },

    // Catégorie : Entrepreneuriat par région
    {
      id: "art-10",
      category: "entrepreneuriat-region",
      title: "Les points à vérifier avant de facturer au Québec",
      readTime: "5 min",
      date: "Novembre 2026",
      summary:
        "Seuil des petits fournisseurs, numéros de TPS/TVQ et exigences de facturation provinciales.",
      disclaimer: "Faire valider les contenus juridiques et fiscaux avant publication auprès d'un professionnel ou des autorités concernées.",
      content: [
        "Au Québec et au Canada, plusieurs dispositions fiscales s'appliquent aux travailleurs autonomes et PME.",
        "Notamment, la règle du 'petit fournisseur' dispense généralement d'inscription aux fichiers de la TPS et de la TVQ tant que le total des fournitures taxables ne dépasse pas 30 000 $ CAD au cours d'un trimestre civil donné ou sur l'ensemble des quatre trimestres civils précédents.",
        "Dès que ce seuil est franchi ou en cas d'inscription volontaire, vos factures doivent impérativement mentionner vos numéros d'inscription officiels et détailler distinctement la TPS (5 %) et la TVQ (9,975 %).",
        "Consultez toujours Revenu Québec et l'Agence du revenu du Canada pour vos démarches spécifiques.",
      ],
    },
    {
      id: "art-11",
      category: "entrepreneuriat-region",
      title: "Pourquoi les règles de facturation varient selon les pays africains ?",
      readTime: "5 min",
      date: "Novembre 2026",
      summary:
        "Mieux appréhender les singularités réglementaires, de l'espace OHADA aux exigences nationales de facturation normalisée.",
      disclaimer: "Faire valider les contenus juridiques et fiscaux avant publication auprès d'un professionnel ou des autorités concernées.",
      content: [
        "L'Afrique francophone est un espace riche d'opportunités, mais les systèmes fiscaux et douaniers diffèrent d'une nation à l'autre.",
        "Même si le droit commercial OHADA harmonise de nombreux aspects juridiques, les obligations de facturation (comme les stickers de factures normalisées au Bénin, en Côte d'Ivoire ou au Sénégal, ou les régimes du réel simplifié vs forfaitaire) sont strictement nationales.",
        "STARTBILL s'attache à comprendre ces réalités pour proposer des outils qui respectent les spécificités documentaires de chaque écosystème.",
      ],
    },
    {
      id: "art-12",
      category: "entrepreneuriat-region",
      title: "Les bonnes questions à poser à un professionnel en Haïti",
      readTime: "4 min",
      date: "Novembre 2026",
      summary:
        "Les interrogations clés à adresser à votre comptable ou conseiller lors de la formalisation d'une activité en Haïti.",
      disclaimer: "Faire valider les contenus juridiques et fiscaux avant publication auprès d'un professionnel ou des autorités concernées.",
      content: [
        "Créer et opérer une activité en Haïti implique de maîtriser la gestion multidevise usuelle (Gourde haïtienne HTG et Dollar US), les déclarations auprès de la DGI (Direction Générale des Impôts) et les obligations de patente commerciale.",
        "Parmi les questions à éclaircir dès le démarrage :",
        "- Quel statut est le plus adapté à la taille de mon exploitation ?",
        "- Quelles sont les modalités de retenue à la source applicables à mes prestations ?",
        "- Comment documenter légalement les paiements reçus par transfert ou en espèces ?",
      ],
    },

    // Catégorie : Actualités STARTBILL
    {
      id: "art-13",
      category: "actualites",
      title: "Avancées du projet et roadmap de développement",
      readTime: "3 min",
      date: "Novembre 2026",
      summary:
        "Point d'étape sur les chantiers en cours : architecture de la plateforme, maquettes fonctionnelles et validation des premiers retours utilisateurs.",
      content: [
        "L'équipe de STARTBILL poursuit activement la conception de son socle technologique.",
        "Notre priorité actuelle est centrée sur la clarté de l'interface de facturation et la robustesse de la modélisation des devises multiples.",
        "Nous tenons à remercier les premiers entrepreneurs qui partagent leurs réalités quotidiennes lors de nos entretiens d'écoute. Le produit s'enrichit de chacun de ces retours concrets.",
      ],
    },
    {
      id: "art-14",
      category: "actualites",
      title: "Ouverture des inscriptions à la liste d’attente officielle",
      readTime: "3 min",
      date: "Novembre 2026",
      summary:
        "Les entrepreneurs du Canada, d'Afrique francophone et d'Haïti peuvent désormais manifester leur intérêt pour participer aux phases d'essais pilotes.",
      content: [
        "Dans l'attente du déploiement public et des validations requises, nous mettons en place notre liste d'attente officielle.",
        "Rejoindre cette liste vous permettra d'être informés en priorité des étapes franchies, de recevoir les premières ressources de la STARTBILL ACADEMY et de participer éventuellement à des ateliers de co-conception.",
      ],
    },
  ],
};

export const PARTENARIATS_CONTENT = {
  title: "Partenariats",
  introduction:
    "STARTBILL souhaite échanger avec des organisations qui accompagnent les entrepreneurs et partagent l’ambition de rendre les outils de gestion plus accessibles.",
  avecQuiCollaborer: {
    title: "Avec qui collaborer ?",
    publics: [
      "Associations entrepreneuriales",
      "Incubateurs et accélérateurs",
      "Chambres de commerce et d'industrie",
      "Cabinets comptables et d'expertise financière",
      "Organisations non gouvernementales (ONG)",
      "Établissements de formation professionnelle et universitaire",
      "Institutions financières et acteurs de la microfinance",
    ],
  },
  pourquoiNousContacter: {
    title: "Pourquoi nous contacter ?",
    raisons: [
      "Explorer des activités de sensibilisation et d'éducation financière",
      "Échanges d’expertise technique, fiscale et d'usage terrain",
      "Programmes d’accompagnement de porteurs de projets",
      "Retours d’expérience qualitatifs sur les besoins réels des entrepreneurs",
      "Autres collaborations adaptées à définir d'un commun accord",
    ],
  },
  invitation: {
    title: "Discuter d’une collaboration",
    text: "Votre organisation souhaite discuter d’une collaboration ? Présentez-nous votre mission, votre région d’activité et les pistes de coopération qui vous intéressent. Toute collaboration éventuelle fera l’objet d’échanges et, si nécessaire, d’une entente distincte.",
    action: "Proposer un partenariat",
  },
};

export const FAQ_CONTENT = [
  {
    q: "Qu’est-ce que STARTBILL ?",
    a: "Une startup technologique canadienne qui développe une plateforme de gestion financière pour les entrepreneurs et petites entreprises.",
  },
  {
    q: "À qui s’adresse STARTBILL ?",
    a: "Aux travailleurs autonomes, commerçants, microentreprises et PME.",
  },
  {
    q: "Dans quels marchés STARTBILL souhaite-t-il être présent ?",
    a: "Au Canada, dans plusieurs pays d’Afrique francophone et en Haïti, avec une approche adaptée à chaque contexte.",
  },
  {
    q: "Puis-je utiliser la plateforme dès aujourd’hui ?",
    a: "La disponibilité publique n’est pas confirmée dans ce document. Consultez les annonces officielles de STARTBILL pour connaître les étapes de lancement.",
  },
  {
    q: "Quels seront les principaux usages ?",
    a: "La facturation, l’organisation des clients, le suivi des dépenses et des paiements et la consultation d’indicateurs financiers font partie des domaines prévus.",
  },
  {
    q: "STARTBILL remplace-t-il un comptable ?",
    a: "Non. La plateforme vise à faciliter l’organisation et la visibilité financière. Les obligations fiscales et comptables doivent être vérifiées auprès des professionnels compétents.",
  },
  {
    q: "Les paiements en ligne seront-ils possibles partout ?",
    a: "Aucune disponibilité universelle n’est annoncée. Les intégrations éventuelles dépendront des marchés, des partenaires et des exigences réglementaires.",
  },
  {
    q: "Comment suivre les actualités ?",
    a: "Consultez le blogue, STARTBILL ACADEMY et les canaux officiels de STARTBILL.",
  },
];

export const CONTACT_CONTENT = {
  title: "Contact",
  texteAccueil:
    "Une question sur STARTBILL, une proposition de partenariat ou une demande d’information ? Notre équipe est à votre écoute. Expliquez-nous brièvement votre besoin afin que nous puissions orienter votre demande.",
  coordonnees: {
    courriel: "contact.startbill@gmail.com",
    site: "STARTBILL.ca",
  },
  motifs: [
    "Information générale",
    "Partenariat",
    "Presse et médias",
    "Question relative à STARTBILL ACADEMY",
    "Autre demande",
  ],
  confirmationMessage:
    "Merci pour votre message. Votre demande a bien été transmise si le formulaire est connecté et que l’envoi a été confirmé. Notre équipe reviendra vers vous dans la mesure du possible.",
};

export const FOOTER_CONTENT = {
  presentation:
    "STARTBILL — Startup technologique canadienne développant des solutions numériques pour simplifier la gestion financière des entrepreneurs.",
  noteEditoriale:
    "Note éditoriale : Ne pas afficher de prix, d’avis clients, de chiffres d’utilisation, de dates de lancement, de certifications ou de promesses de fonctionnalités sans confirmation interne. Les textes de présentation des fonctionnalités décrivent la vision et le périmètre envisagé, non une disponibilité garantie. Les contenus locaux doivent être revus avant toute affirmation réglementaire.",
  sectionsNav: [
    { id: "accueil", label: "Accueil" },
    { id: "a-propos", label: "À propos" },
    { id: "fonctionnalites", label: "Fonctionnalités" },
    { id: "solutions", label: "Nos solutions" },
    { id: "academy", label: "Academy" },
    { id: "blogue", label: "Blogue" },
    { id: "partenariats", label: "Partenariats" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ],
};

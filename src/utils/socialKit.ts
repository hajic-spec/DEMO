import { COMPANY_INFO, GENERATED_IMAGES } from '../data/seedData';

export type SocialChannelId =
  | 'facebook'
  | 'instagram'
  | 'google'
  | 'annuaires'
  | 'whatsapp';

export interface SocialPostPreset {
  id: SocialChannelId;
  channel: string;
  timing: string;
  formatHint: string;
  title: string;
  content: string;
}

export type MiniatureFormat = 'landscape' | 'square' | 'story';

export interface MiniatureThemePreset {
  id: string;
  label: string;
  kicker: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  imageUrl: string;
}

export interface FlyerThemePreset {
  id: string;
  label: string;
  kicker: string;
  headline: string;
  subheadline: string;
  bullets: string[];
  imageUrl: string;
  footerBanner: string;
}

export interface LaunchStep {
  id: string;
  phase: string;
  timing: string;
  title: string;
  detail: string;
}

export const SITE_URL_STORAGE_KEY = 'rp_site_url_v1';
export const LAUNCH_CHECKLIST_STORAGE_KEY = 'rp_launch_checklist_v1';

export function normalizeSiteUrl(raw: string, fallbackOrigin = 'https://relief-paysage.fr'): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallbackOrigin;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
}

export function buildSocialPresets(rawSiteUrl: string): SocialPostPreset[] {
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const appUrl = `${siteUrl}/app`;

  return [
    {
      id: 'facebook',
      channel: 'Facebook & Groupes Locaux 06',
      timing: 'Jour J · Annonce officielle',
      formatHint: 'Image recommandée : Miniature 1200×630 ou Flyer PNG',
      title: 'Lancement officiel du site Relief Paysage à Grasse',
      content: `🌿 NOUVEAU À GRASSE & PAYS DE GRASSE — Découvrez le site officiel de Relief Paysage !

Dirigée par Jason Claude à Grasse (06130), l’entreprise vous accompagne toute l’année pour valoriser et sécuriser vos extérieurs :
• Création & aménagement paysager méditerranéen
• Entretien complet de parcs, restanques et jardins
• Taille d’oliviers & accompagnement au ramassage des olives
• Élagage, travaux forestiers et mise en conformité OLD (06)
• Arrosage automatique économe & conseils phytosanitaires raisonnés

👉 Demandez votre visite technique ou votre étude gratuite en 1 minute :
${siteUrl}

📞 Contact direct Jason Claude : ${COMPANY_INFO.phoneDisplay}
📍 Grasse · Cabris · Peymeinade · Valbonne · Mougins · Mouans-Sartoux`,
    },
    {
      id: 'instagram',
      channel: 'Instagram (Post & Story)',
      timing: 'J+1 · Mise en image terrain',
      formatHint: 'Image recommandée : Miniature Carrée 1080×1080 ou Story 1080×1920',
      title: 'Présentation savoir-faire & patrimoine oléicole',
      content: `Façonner et préserver le paysage méditerranéen avec exigence. 🌳✨

Relief Paysage lance son nouvel espace en ligne ! Du soin des oliviers centenaires à la gestion forestière OLD dans les Alpes-Maritimes, retrouvez l’ensemble de nos prestations et demandez votre devis directement en ligne.

🔗 Lien du site (aussi en bio) : ${siteUrl}
📞 ${COMPANY_INFO.phoneDisplay} — Jason Claude (EI, Grasse 06130)

#ReliefPaysage #Grasse #PaysDeGrasse #Paysagiste06 #AlpesMaritimes #Olivier #TailleOlivier #DebroussaillementOLD #JardinMediterraneen #Cabris #Valbonne #Mougins`,
    },
    {
      id: 'google',
      channel: 'Google Fiche Établissement (Maps)',
      timing: 'Jour J · Référencement local prioritaire',
      formatHint: 'Image recommandée : Miniature 1200×630 · Bouton : "En savoir plus"',
      title: 'Post Actualité Google — Nouveau site & Prise de rendez-vous',
      content: `Relief Paysage à Grasse (06130) met en ligne son nouveau site officiel pour faciliter vos demandes de visite technique et de devis dans les Alpes-Maritimes.

Interventions sur mesure : création paysagère, entretien de parcs et jardins, taille d’oliviers et récolte d’olives, élagage et travaux forestiers (OLD 06), arrosage automatique et soin raisonné des végétaux.

Consultez nos 6 pôles d’expertise et contactez directement Jason Claude au ${COMPANY_INFO.phoneDisplay} ou via ${siteUrl}.`,
    },
    {
      id: 'annuaires',
      channel: 'AlloVoisins · Nextdoor · Leboncoin Pro',
      timing: 'J+2 · Captation demandes locales',
      formatHint: 'Image recommandée : Flyer A5 PNG à joindre à l’annonce',
      title: 'Annonce professionnelle complète avec SIRET vérifié',
      content: `RELIEF PAYSAGE — Paysagiste, Oléiculture & Travaux Forestiers | Grasse & Environs (06)

Professionnel déclaré (Jason Claude — Entreprise Individuelle · SIREN ${COMPANY_INFO.siren} · R.C.S. Grasse), j’interviens pour particuliers, villas et domaines :
✓ Taille d’oliviers (fructification, éclaircie, sujets centenaires) & récolte
✓ Débroussaillement réglementaire OLD 06, élagage et broyage
✓ Entretien régulier ou ponctuel de parcs et jardins
✓ Installation et réglage d’arrosage automatique (goutte-à-goutte & enterré)
✓ Création de massifs secs & conseils sanitaires biologiques

Visite technique & devis transparent sans surprise.
🌐 Voir nos réalisations et demander un devis : ${siteUrl}
📞 ${COMPANY_INFO.phoneDisplay} | ✉️ ${COMPANY_INFO.email}`,
    },
    {
      id: 'whatsapp',
      channel: 'WhatsApp Statut & Clients existants',
      timing: 'J+3 · Activation bouche-à-oreille',
      formatHint: 'Image recommandée : Flyer ou Miniature Carrée 1080×1080',
      title: 'Message court clients & partenaires',
      content: `Bonjour, c’est Jason Claude (Relief Paysage à Grasse) 🌿
Je viens de mettre en ligne mon nouveau site officiel pour présenter mes prestations (entretien, taille d’oliviers, OLD 06, arrosage automatique) :
👉 ${siteUrl}

Et pour suivre vos demandes ou rappels saisonniers directement sur mobile :
📱 ${appUrl}

N’hésitez pas à le partager autour de vous dans le Pays de Grasse si vous connaissez des propriétaires qui recherchent un paysagiste sérieux ! À bientôt sur le terrain — ${COMPANY_INFO.phoneDisplay}`,
    },
  ];
}

export const MINIATURE_THEMES: MiniatureThemePreset[] = [
  {
    id: 'launch',
    label: 'Lancement officiel du site',
    kicker: 'NOUVEAU SITE EN LIGNE · GRASSE (06)',
    headline: 'Relief Paysage est en ligne',
    subtitle: 'Création, entretien de parcs, taille d’oliviers, arrosage & travaux OLD',
    ctaText: 'Visite & Devis gratuit',
    imageUrl: GENERATED_IMAGES.olivierHero,
  },
  {
    id: 'olivier',
    label: 'Taille d’Oliviers & Récolte',
    kicker: 'PATRIMOINE OLÉICOLE · PAYS DE GRASSE',
    headline: 'Taille d’oliviers & récolte d’olives',
    subtitle: 'Éclaircie, fructification, sujets centenaires & accompagnement cueillette',
    ctaText: 'Réserver votre créneau',
    imageUrl: GENERATED_IMAGES.olivierHero,
  },
  {
    id: 'old',
    label: 'Élagage & Conformité OLD 06',
    kicker: 'PRÉVENTION INCENDIE · ALPES-MARITIMES',
    headline: 'Mise aux normes OLD & Élagage',
    subtitle: 'Débroussaillement 50 m, remontée de couronne, broyage et sécurité abords',
    ctaText: 'Vérifier mon terrain',
    imageUrl: GENERATED_IMAGES.paysageGrasse,
  },
  {
    id: 'jardin',
    label: 'Arrosage & Soin du Vivant',
    kicker: 'JARDINS MÉDITERRANÉENS · GRASSE',
    headline: 'Arrosage économe & Entretien doux',
    subtitle: 'Réseaux goutte-à-goutte, massifs fleuris et respect de la biodiversité',
    ctaText: 'Étudier votre jardin',
    imageUrl: GENERATED_IMAGES.hibiscusJardin,
  },
];

export const FLYER_THEMES: FlyerThemePreset[] = [
  {
    id: 'flyer-general',
    label: 'Flyer Lancement Complet (6 pôles)',
    kicker: 'ENTREPRISE PAYSAGÈRE À GRASSE (06130)',
    headline: 'Sublimez et sécurisez vos extérieurs toute l’année',
    subheadline: 'Devis gratuit sur visite · Interlocuteur unique · Pays de Grasse & 06',
    bullets: [
      'Création paysagère, massifs méditerranéens & restanques',
      'Entretien soigné de parcs, villas et jardins',
      'Taille raisonnée d’oliviers & accompagnement récolte d’olives',
      'Élagage, travaux forestiers & conformité OLD 06',
      'Arrosage automatique économe & soin phytosanitaire raisonné',
    ],
    imageUrl: GENERATED_IMAGES.olivierHero,
    footerBanner: 'Secteur : Grasse · Cabris · Peymeinade · Valbonne · Mougins · Châteauneuf',
  },
  {
    id: 'flyer-olivier-old',
    label: 'Flyer Spécial Oliviers & Débroussaillement OLD',
    kicker: 'SAISON OLÉICOLE & PRÉVENTION INCENDIE 06',
    headline: 'Taille d’Oliviers, Récolte & Conformité OLD',
    subheadline: 'Protégez votre propriété avant les contrôles et valorisez vos arbres',
    bullets: [
      'Taille d’éclaircie et équilibrage des oliviers adultes & centenaires',
      'Accompagnement ramassage des olives & broyage des branches',
      'Débroussaillement réglementaire des 50 m autour des habitations',
      'Mise à distance des houppiers & dégagement des accès secours',
      'Respect de la biodiversité locale et évacuation en filière pro',
    ],
    imageUrl: GENERATED_IMAGES.paysageGrasse,
    footerBanner: 'Intervention rapide dans tout le Pays de Grasse — Devis transparent',
  },
];

export const LAUNCH_STEPS: LaunchStep[] = [
  {
    id: 'step-1',
    phase: 'Phase 1 · Fondation (Jour J)',
    timing: '15 min',
    title: 'Vérifier le lien final et l’enregistrer ci-dessus',
    detail: 'Validez l’ouverture de la vitrine, de /admin (PIN 06130) et de /app sur téléphone.',
  },
  {
    id: 'step-2',
    phase: 'Phase 1 · Fondation (Jour J)',
    timing: '10 min',
    title: 'Ajouter le lien sur la Fiche Google Établissement',
    detail: 'Renseignez l’URL du site dans Google Maps + publiez le pré-post "Google Fiche Établissement".',
  },
  {
    id: 'step-3',
    phase: 'Phase 1 · Fondation (Jour J)',
    timing: '10 min',
    title: 'Mettre à jour AlloVoisins, Leboncoin Pro & PagesJaunes',
    detail: 'Collez l’annonce annuaires avec votre SIREN et le lien direct vers le formulaire.',
  },
  {
    id: 'step-4',
    phase: 'Phase 2 · Annonce Réseaux (J+1 à J+3)',
    timing: '10 min',
    title: 'Publier le post Facebook de lancement + Miniature 1200×630',
    detail: 'Téléchargez la miniature "Lancement officiel" et épinglez la publication en haut de la page.',
  },
  {
    id: 'step-5',
    phase: 'Phase 2 · Annonce Réseaux (J+1 à J+3)',
    timing: '15 min',
    title: 'Partager le Flyer PNG dans 3 à 5 groupes locaux du 06',
    detail: 'Groupes d’entraide et de voisinage de Grasse, Cabris, Peymeinade, Valbonne et Mougins.',
  },
  {
    id: 'step-6',
    phase: 'Phase 2 · Annonce Réseaux (J+1 à J+3)',
    timing: '10 min',
    title: 'Publier sur Instagram (Carré 1080×1080 + Story lien)',
    detail: 'Mettez le lien du site dans la bio Instagram et partagez la Story avec lien cliquable.',
  },
  {
    id: 'step-7',
    phase: 'Phase 3 · Activation Directe (J+4 à J+7)',
    timing: '15 min',
    title: 'Envoyer le message WhatsApp aux 15 derniers clients',
    detail: 'Utilisez le pré-post WhatsApp pour générer des recommandations et avis Google.',
  },
  {
    id: 'step-8',
    phase: 'Phase 3 · Activation Directe (J+4 à J+7)',
    timing: 'Terrain',
    title: 'Imprimer 50 flyers A5 pour boîtes aux lettres & dépôts locaux',
    detail: 'Ciblez les zones résidentielles en restanques et secteurs boisés soumis aux OLD 06.',
  },
  {
    id: 'step-9',
    phase: 'Phase 4 · Rythme Mensuel',
    timing: '1× / semaine',
    title: 'Poster 1 chantier Avant/Après ou conseil saisonnier',
    detail: 'Alternez taille d’oliviers (printemps), arrosage (été), récolte (automne) et OLD (hiver).',
  },
  {
    id: 'step-10',
    phase: 'Phase 4 · Rythme Mensuel',
    timing: 'Continu',
    title: 'Transformer chaque demande reçue en pré-devis /admin',
    detail: 'Répondez en moins de 2h via WhatsApp avec pré-devis chiffré pour maximiser la signature.',
  },
];

export function loadSavedSiteUrl(defaultOrigin: string): string {
  if (typeof window === 'undefined') return normalizeSiteUrl(defaultOrigin);
  try {
    const stored = window.localStorage.getItem(SITE_URL_STORAGE_KEY);
    return stored ? normalizeSiteUrl(stored, defaultOrigin) : normalizeSiteUrl(defaultOrigin);
  } catch {
    return normalizeSiteUrl(defaultOrigin);
  }
}

export function saveSiteUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SITE_URL_STORAGE_KEY, url);
  } catch {
    // Ignore quota errors
  }
}

export function loadLaunchChecklist(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LAUNCH_CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function saveLaunchChecklist(state: Record<string, boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAUNCH_CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

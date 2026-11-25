import React, { useState } from 'react';
import { Phone, Mail, MapPin, ArrowRight, Check, Copy, X } from 'lucide-react';
import { COMPANY_INFO, GENERATED_IMAGES, SERVICE_POLES } from '../data/seedData';
import { validateLeadInput } from '../utils/business';
import { appendLeadToStore } from '../utils/storage';
import { ReliefCrestSvg } from './ReliefLogo';
import { ResilientImage } from './ResilientImage';
import { SiteHeader } from './SiteHeader';
import { StudioOfferSection } from './StudioOfferSection';

interface PublicShowcaseProps {
  onOpenAdmin: () => void;
  onOpenApp: () => void;
}

type ServiceCategoryFilter = 'all' | 'creation' | 'entretien' | 'arbres';

export const PublicShowcase: React.FC<PublicShowcaseProps> = ({ onOpenAdmin, onOpenApp }) => {
  const [activeFilter, setActiveFilter] = useState<ServiceCategoryFilter>('all');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [serviceSelect, setServiceSelect] = useState<string>(SERVICE_POLES[0].selectValue);
  const [clientMessage, setClientMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<'legal' | 'privacy' | null>(null);

  const filteredPoles =
    activeFilter === 'all'
      ? SERVICE_POLES
      : SERVICE_POLES.filter((p) => p.category === activeFilter);

  const handleSelectPole = (selectValue: string) => {
    setServiceSelect(selectValue);
  };

  const buildMailBody = () => ({
    subject: `[Demande d'étude] ${serviceSelect} — ${clientCity || 'Grasse / 06'}`,
    body: `Bonjour Monsieur Claude (Relief Paysage),\n\nJe souhaite solliciter une étude / un devis :\n- Prestation : ${serviceSelect}\n- Commune : ${clientCity}\n- Nom : ${clientName}\n- Téléphone : ${clientPhone}\n\nPrécisions sur le terrain :\n${clientMessage}\n\nCordialement,\n${clientName}`,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const err = validateLeadInput({
      name: clientName,
      phone: clientPhone,
      city: clientCity,
      details: clientMessage,
    });
    if (err) {
      setFormError(err);
      return;
    }

    const savedLead = appendLeadToStore({
      name: clientName.trim(),
      phone: clientPhone.trim(),
      city: clientCity.trim(),
      service: serviceSelect,
      details: clientMessage.trim(),
      source: 'Site vitrine',
    });

    const { subject, body } = buildMailBody();
    const mailtoUrl = `mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.click();

    setFormSuccess(
      `Demande ${savedLead.id} enregistrée et préparée pour ${COMPANY_INFO.email}. Vous pouvez également la consulter immédiatement dans l’espace gérant /admin.`
    );
    setClientName('');
    setClientPhone('');
    setClientCity('');
    setClientMessage('');
  };

  const handleCopySummary = async () => {
    setFormError(null);
    const err = validateLeadInput({
      name: clientName,
      phone: clientPhone,
      city: clientCity,
      details: clientMessage,
    });
    if (err) {
      setFormError(err);
      return;
    }
    const { subject, body } = buildMailBody();
    const fullText = `À : ${COMPANY_INFO.email}\nObjet : ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setFormSuccess(
        `Récapitulatif copié dans le presse-papier. Collez-le dans un SMS au ${COMPANY_INFO.phoneDisplay} ou un courriel.`
      );
    } catch {
      setFormSuccess(
        `Copie automatique indisponible. Contact direct : ${COMPANY_INFO.email} ou ${COMPANY_INFO.phoneDisplay}.`
      );
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#FAF8F3] text-[#1A211D]">
      <SiteHeader />

      <main>
        {/* ==================== HERO ==================== */}
        <section className="relative min-h-[90vh] flex items-center bg-[#091B12] text-white pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ResilientImage
              src={GENERATED_IMAGES.olivierHero}
              alt="Olivier centenaire sur restanque en pierre sèche dans le Pays de Grasse"
              className="w-full h-full object-cover opacity-55"
              fallbackLabel="Patrimoine oléicole"
            />
          </div>
          <div
            className="absolute inset-0 z-10 bg-gradient-to-r from-[#091B12]/92 via-[#0E281B]/72 to-[#0E281B]/25"
            aria-hidden="true"
          />

          <div className="relative z-20 max-w-[1240px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CFA75B] mb-4">
                Domaine &amp; jardin de prestige · Grasse (06)
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.08] mb-6 text-balance">
                Façonner et préserver le{' '}
                <em className="italic text-[#CFA75B] font-medium">paysage méditerranéen</em> avec
                exigence.
              </h1>
              <p className="text-base md:text-lg text-[#FAF8F3]/85 max-w-[58ch] leading-relaxed mb-8">
                De l’aménagement paysager à la taille raisonnée des oliviers, de l’arrosage
                automatique aux travaux forestiers et obligations de débroussaillement, Relief
                Paysage accompagne les propriétés et domaines du Pays de Grasse et des
                Alpes-Maritimes.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded bg-[#B5893A] text-white font-semibold text-sm hover:bg-[#9C7228] transition-colors whitespace-nowrap"
                >
                  Planifier une visite sur site
                </a>
                <a
                  href={COMPANY_INFO.phoneHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded border border-white/40 bg-white/5 text-white font-semibold text-sm hover:bg-white hover:text-[#0E281B] transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  <span>{COMPANY_INFO.phoneDisplay}</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#EBD9B3]/25">
                <div>
                  <strong className="block font-serif text-xl text-[#EBD9B3]">
                    Création &amp; Entretien
                  </strong>
                  <span className="text-xs text-[#FAF8F3]/75">Parcs, restanques &amp; jardins</span>
                </div>
                <div>
                  <strong className="block font-serif text-xl text-[#EBD9B3]">
                    Patrimoine oléicole
                  </strong>
                  <span className="text-xs text-[#FAF8F3]/75">Taille d’oliviers &amp; récolte</span>
                </div>
                <div>
                  <strong className="block font-serif text-xl text-[#EBD9B3]">
                    Élagage &amp; Forêt
                  </strong>
                  <span className="text-xs text-[#FAF8F3]/75">Travaux forestiers &amp; OLD 06</span>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="bg-[#FAF8F3] text-[#1A211D] rounded-xl p-8 md:p-10 border border-[#CFA75B]/60 shadow-2xl text-center">
                <ReliefCrestSvg className="w-60 max-w-full mx-auto mb-4" />
                <div className="w-24 h-px bg-[#B5893A] mx-auto my-4" />
                <p className="font-serif italic text-xl text-[#0E281B] mb-2">
                  Domaine et jardin de prestige
                </p>
                <p className="text-xs text-[#647068] leading-relaxed">
                  <strong className="text-[#1A211D]">{COMPANY_INFO.legalName}</strong>
                  <br />
                  {COMPANY_INFO.address}
                  <br />
                  {COMPANY_INFO.rcs}
                </p>
              </div>
            </aside>
          </div>
        </section>

        {/* ==================== APPROCHE / PHILOSOPHIE ==================== */}
        <section id="philosophie" className="py-20 md:py-28">
          <div className="max-w-[1240px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden min-h-[420px] border border-[#E5DEC9]">
              <ResilientImage
                src={GENERATED_IMAGES.paysageGrasse}
                alt="Collines et restanques méditerranéennes au coucher du soleil autour de Grasse"
                className="w-full h-full object-cover"
                fallbackLabel="Arrière-pays Grassois"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#091B12]/90 via-[#091B12]/25 to-transparent flex flex-col justify-end p-6 text-white"
              >
                <strong className="font-serif text-xl text-[#EBD9B3] mb-1">
                  Ancrage Grassois
                </strong>
                <span className="text-xs text-[#FAF8F3]/85 leading-relaxed">
                  Connaissance des restanques en pierre sèche, des essences locales et des reliefs
                  de l’arrière-pays azuréen.
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C7228] mb-3">
                Notre approche du métier
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#0E281B] leading-tight mb-5 text-balance">
                Un jardin d’exception vit au rythme de son relief et de ses saisons.
              </h2>
              <p className="text-[#3E4A43] leading-relaxed mb-4">
                Dans les Alpes-Maritimes, chaque terrain possède ses contraintes propres :
                restanques en pierre sèche, pentes arborées, exposition au vent et sécheresse
                estivale. Relief Paysage conçoit et entretient vos espaces extérieurs en respectant
                la structure naturelle du site et la pérennité du patrimoine végétal.
              </p>
              <p className="text-[#3E4A43] leading-relaxed mb-8">
                Dirigée par <strong className="text-[#0E281B]">Jason Claude</strong> à Grasse,
                l’entreprise privilégie la précision du geste technique — de la taille
                architecturale de l’olivier au réglage d’un réseau d’irrigation — tout en
                préservant l’équilibre écologique et la biodiversité du jardin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Interlocuteur unique',
                    desc: 'Suivi direct sur site, du premier relevé technique jusqu’aux finitions du chantier.',
                  },
                  {
                    title: 'Soin du vivant',
                    desc: 'Respect de la micro-faune auxiliaire, gestion raisonnée des couverts et des tailles.',
                  },
                  {
                    title: 'Sobriété hydrique',
                    desc: 'Choix botaniques adaptés et pilotage précis de l’arrosage automatique.',
                  },
                  {
                    title: 'Rigueur réglementaire',
                    desc: 'Accompagnement aux travaux forestiers et obligations de débroussaillement (OLD).',
                  },
                ].map((pillar) => (
                  <div
                    key={pillar.title}
                    className="p-5 bg-white border border-[#E5DEC9] rounded-lg"
                  >
                    <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-1.5">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#647068] leading-relaxed">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 6 POLES D'EXPERTISE ==================== */}
        <section
          id="expertises"
          className="bg-[#F3EFE5] border-y border-[#E5DEC9] py-20 md:py-28"
        >
          <div className="max-w-[1240px] mx-auto px-5 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C7228] mb-3">
                  Savoir-faire complet
                </p>
                <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#0E281B] leading-tight max-w-[18ch]">
                  Six pôles d’expertise au service de vos extérieurs
                </h2>
              </div>
              <p className="text-[#3E4A43] max-w-[44ch]">
                Interventions ponctuelles ou contrats d’entretien annuels sur mesure pour villas,
                domaines privés, vergers d’agrément et terrains boisés.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filtrer les expertises"
              className="inline-flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E5DEC9] rounded-lg mb-10"
            >
              {(
                [
                  { id: 'all', label: 'Toutes les prestations' },
                  { id: 'creation', label: 'Création & Eau' },
                  { id: 'entretien', label: 'Entretien & Soins' },
                  { id: 'arbres', label: 'Oliviers, Élagage & Forêt' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeFilter === tab.id
                      ? 'bg-[#0E281B] text-white'
                      : 'text-[#3E4A43] hover:text-[#0E281B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPoles.map((pole) => (
                <article
                  key={pole.id}
                  className="bg-white border border-[#E5DEC9] rounded-xl p-7 flex flex-col justify-between hover:border-[#B5893A] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#647068] mb-3">
                      <span className="font-mono font-semibold text-[#9C7228]">{pole.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase tracking-[0.12em] font-semibold text-[#163B29]">
                        {pole.categoryLabel}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-semibold text-[#0E281B] mb-3">
                      {pole.title}
                    </h3>
                    <p className="text-sm text-[#3E4A43] leading-relaxed mb-5">{pole.summary}</p>

                    <ul className="space-y-2 pt-4 border-t border-[#E5DEC9] mb-6">
                      {pole.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="text-sm text-[#3E4A43] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#B5893A] before:font-bold"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#contact"
                    onClick={() => handleSelectPole(pole.selectValue)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E281B] hover:text-[#9C7228] transition-colors mt-auto"
                  >
                    <span>{pole.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FOCUS TERRITOIRE (OLIVIERS & OLD) ==================== */}
        <section id="territoire" className="bg-[#0E281B] text-[#FAF8F3] py-20 md:py-28">
          <div className="max-w-[1240px] mx-auto px-5 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CFA75B] mb-3">
              Spécificités du Pays de Grasse
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-white leading-tight max-w-[24ch] mb-12">
              Deux engagements majeurs pour les propriétés des Alpes-Maritimes
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/[0.04] border border-[#CFA75B]/30 rounded-xl p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
                    Le cycle complet de l’Olivier
                  </h3>
                  <p className="text-sm md:text-base text-[#FAF8F3]/85 leading-relaxed mb-4">
                    Arbre emblématique des collines grassoises, l’olivier exige une taille attentive
                    en fin d’hiver ou au printemps pour laisser pénétrer la lumière au cœur de la
                    couronne, limiter les maladies et équilibrer la mise à fruits.
                  </p>
                  <p className="text-sm md:text-base text-[#FAF8F3]/85 leading-relaxed mb-6">
                    À l’automne, Relief Paysage vous accompagne également pour les travaux autour du
                    verger et l’organisation du ramassage des olives, afin de préserver la santé des
                    arbres tout en valorisant vos récoltes familiales.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#091B12]/70 border border-[#CFA75B]/30 text-xs md:text-sm text-[#EBD9B3]">
                  Bon à savoir : une taille trop sévère déséquilibre l’arbre pour plusieurs années.
                  Nous privilégions une taille progressive et respectueuse de la silhouette.
                </div>
              </div>

              <div className="bg-white/[0.04] border border-[#CFA75B]/30 rounded-xl p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
                    Travaux forestiers &amp; Débroussaillement (OLD)
                  </h3>
                  <p className="text-sm md:text-base text-[#FAF8F3]/85 leading-relaxed mb-4">
                    Dans les Alpes-Maritimes, les terrains situés en zone boisée ou à moins de 200
                    mètres des massifs forestiers, landes, garrigues ou maquis sont soumis aux{' '}
                    <strong className="text-white">
                      Obligations Légales de Débroussaillement (OLD)
                    </strong>
                    .
                  </p>
                  <p className="text-sm md:text-base text-[#FAF8F3]/85 leading-relaxed mb-6">
                    Nous réalisons le débroussaillage sélectif, la mise à distance des houppiers,
                    l’élagage des branches basses et la gestion des résidus végétaux pour protéger
                    votre habitation et faciliter l’accès des secours.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#091B12]/70 border border-[#CFA75B]/30 text-xs md:text-sm text-[#EBD9B3]">
                  Cadre réglementaire : interventions adaptées aux arrêtés préfectoraux en vigueur
                  dans le département 06 et aux règles communales de Grasse et environs.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== GALERIE TERRAIN ==================== */}
        <section id="galerie" className="py-20 md:py-28">
          <div className="max-w-[1240px] mx-auto px-5 md:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C7228] mb-3">
                  Regards sur le terrain
                </p>
                <h2 className="font-serif text-3xl md:text-5xl font-semibold text-[#0E281B] leading-tight">
                  Patrimoine végétal &amp; respect du vivant
                </h2>
              </div>
              <p className="text-[#3E4A43] max-w-[44ch]">
                Aperçu de nos inspirations sur le territoire grassois : arbres remarquables,
                floraisons estivales, reliefs et faune des jardins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <figure className="md:col-span-7 relative rounded-xl overflow-hidden min-h-[340px] md:min-h-[380px] border border-[#E5DEC9]">
                <ResilientImage
                  src={GENERATED_IMAGES.olivierHero}
                  alt="Olivier centenaire sur terrain méditerranéen"
                  className="w-full h-full object-cover absolute inset-0"
                  fallbackLabel="Sujets d’oliviers patrimoniaux"
                />
                <figcaption className="relative z-10 h-full min-h-[340px] md:min-h-[380px] bg-gradient-to-t from-[#091B12]/90 via-[#091B12]/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Arboriculture &amp; Taille
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-white mb-1">
                    Sujets d’oliviers patrimoniaux
                  </h3>
                  <p className="text-sm text-[#FAF8F3]/85">
                    Mise en valeur du tronc, aération de la couronne et maintien de l’équilibre
                    naturel.
                  </p>
                </figcaption>
              </figure>

              <figure className="md:col-span-5 relative rounded-xl overflow-hidden min-h-[340px] md:min-h-[380px] border border-[#E5DEC9]">
                <ResilientImage
                  src={GENERATED_IMAGES.hibiscusJardin}
                  alt="Fleur d'hibiscus magenta en pleine floraison"
                  className="w-full h-full object-cover absolute inset-0"
                  fallbackLabel="Floraisons méditerranéennes"
                />
                <figcaption className="relative z-10 h-full min-h-[340px] md:min-h-[380px] bg-gradient-to-t from-[#091B12]/90 via-[#091B12]/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Jardin d’agrément
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-white mb-1">
                    Floraisons méditerranéennes
                  </h3>
                  <p className="text-sm text-[#FAF8F3]/85">
                    Apport hydrique maîtrisé et soins doux pour des massifs lumineux tout l’été.
                  </p>
                </figcaption>
              </figure>

              <figure className="md:col-span-6 relative rounded-xl overflow-hidden min-h-[320px] border border-[#E5DEC9]">
                <ResilientImage
                  src={GENERATED_IMAGES.herissonBiodiversite}
                  alt="Jeune hérisson protégé dans l'herbe d'un jardin"
                  className="w-full h-full object-cover absolute inset-0"
                  fallbackLabel="Préservation de la faune auxiliaire"
                />
                <figcaption className="relative z-10 h-full min-h-[320px] bg-gradient-to-t from-[#091B12]/90 via-[#091B12]/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Écologie du jardin
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-white mb-1">
                    Préservation de la faune auxiliaire
                  </h3>
                  <p className="text-sm text-[#FAF8F3]/85">
                    Vigilance lors des tontes et débroussaillages : le hérisson est un précieux allié
                    du jardin.
                  </p>
                </figcaption>
              </figure>

              <figure className="md:col-span-6 relative rounded-xl overflow-hidden min-h-[320px] border border-[#E5DEC9]">
                <ResilientImage
                  src={GENERATED_IMAGES.paysageGrasse}
                  alt="Coucher de soleil sur les massifs forestiers du Pays de Grasse"
                  className="w-full h-full object-cover absolute inset-0"
                  fallbackLabel="Arrière-pays & travaux forestiers"
                />
                <figcaption className="relative z-10 h-full min-h-[320px] bg-gradient-to-t from-[#091B12]/90 via-[#091B12]/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Territoire 06
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-white mb-1">
                    Arrière-pays &amp; travaux forestiers
                  </h3>
                  <p className="text-sm text-[#FAF8F3]/85">
                    Interventions adaptées aux pentes, vallons et zones boisées autour de Grasse.
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ==================== METHODE ==================== */}
        <section className="pb-20 md:pb-24">
          <div className="max-w-[1240px] mx-auto px-5 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9C7228] mb-3">
              Déroulement d’un projet
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#0E281B] mb-10">
              Une méthode claire, sans surprise
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Visite & Diagnostic',
                  desc: 'Déplacement sur votre propriété pour observer le relief, les accès, l’état des arbres et vos attentes.',
                },
                {
                  step: '2',
                  title: 'Proposition détaillée',
                  desc: 'Devis écrit et transparent précisant la nature des travaux, la gestion des déchets verts et le calendrier.',
                },
                {
                  step: '3',
                  title: 'Exécution soignée',
                  desc: 'Intervention méthodique dans le respect des végétaux, des sols et de la tranquillité du voisinage.',
                },
                {
                  step: '4',
                  title: 'Suivi & Pérennité',
                  desc: 'Conseils d’entretien, réglage saisonnier de l’arrosage et accompagnement récurrent selon vos besoins.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white border border-[#E5DEC9] rounded-xl p-6"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0E281B] text-[#EBD9B3] font-serif font-bold text-lg inline-flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#3E4A43] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== CONTACT ==================== */}
        <section
          id="contact"
          className="bg-[#F3EFE5] border-t border-[#E5DEC9] py-20 md:py-24"
        >
          <div className="max-w-[1240px] mx-auto px-5 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 bg-[#0E281B] text-[#FAF8F3] rounded-xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CFA75B] mb-3">
                Contact direct
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-4">
                Parlons de votre domaine ou de votre jardin
              </h2>
              <p className="text-sm text-[#FAF8F3]/80 leading-relaxed mb-8">
                Pour une visite technique, un devis d’élagage, une taille d’oliviers ou un contrat
                d’entretien, contactez directement Jason Claude.
              </p>

              <ul className="space-y-5 text-sm">
                <li className="pb-4 border-b border-white/15">
                  <span className="block text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Téléphone
                  </span>
                  <a
                    href={COMPANY_INFO.phoneHref}
                    className="text-lg font-semibold text-white hover:text-[#EBD9B3] inline-flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#CFA75B]" />
                    <span>{COMPANY_INFO.phoneDisplay}</span>
                  </a>
                </li>
                <li className="pb-4 border-b border-white/15">
                  <span className="block text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Courriel
                  </span>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-base font-medium text-white hover:text-[#EBD9B3] inline-flex items-center gap-2 break-all"
                  >
                    <Mail className="w-4 h-4 text-[#CFA75B] shrink-0" />
                    <span>{COMPANY_INFO.email}</span>
                  </a>
                </li>
                <li className="pb-4 border-b border-white/15">
                  <span className="block text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1">
                    Siège social
                  </span>
                  <span className="text-base font-medium text-white inline-flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#CFA75B] shrink-0 mt-1" />
                    <span>{COMPANY_INFO.address}</span>
                  </span>
                </li>
                <li>
                  <span className="block text-xs uppercase tracking-[0.14em] text-[#CFA75B] mb-1.5">
                    Secteur d’intervention
                  </span>
                  <p className="text-sm text-[#EBD9B3] leading-relaxed">
                    Grasse · Peymeinade · Cabris · Châteauneuf-Grasse · Mouans-Sartoux · Valbonne ·
                    Mougins
                  </p>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-7 md:p-10">
              <h3 className="font-serif text-3xl font-semibold text-[#0E281B] mb-2">
                Demander une étude ou un devis
              </h3>
              <p className="text-sm text-[#647068] mb-6">
                Préparez votre demande en quelques secondes : elle est enregistrée pour suivi et
                préparée pour votre messagerie.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="clientName"
                      className="block text-xs font-semibold text-[#0E281B] mb-1.5"
                    >
                      Nom / Prénom *
                    </label>
                    <input
                      id="clientName"
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-3.5 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="clientPhone"
                      className="block text-xs font-semibold text-[#0E281B] mb-1.5"
                    >
                      Téléphone *
                    </label>
                    <input
                      id="clientPhone"
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="06 .. .. .. .."
                      className="w-full px-3.5 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="clientCity"
                      className="block text-xs font-semibold text-[#0E281B] mb-1.5"
                    >
                      Commune du terrain *
                    </label>
                    <input
                      id="clientCity"
                      type="text"
                      required
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="Ex. Grasse, Cabris, Valbonne…"
                      className="w-full px-3.5 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="serviceSelect"
                      className="block text-xs font-semibold text-[#0E281B] mb-1.5"
                    >
                      Prestation principale
                    </label>
                    <select
                      id="serviceSelect"
                      value={serviceSelect}
                      onChange={(e) => setServiceSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
                    >
                      {SERVICE_POLES.map((p) => (
                        <option key={p.id} value={p.selectValue}>
                          {p.selectValue}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="clientMessage"
                    className="block text-xs font-semibold text-[#0E281B] mb-1.5"
                  >
                    Précisions sur le terrain et vos besoins *
                  </label>
                  <textarea
                    id="clientMessage"
                    rows={4}
                    required
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    placeholder="Surface approximative, nombre d'oliviers ou d'arbres, accès, urgence ou période souhaitée…"
                    className="w-full px-3.5 py-2.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm focus:outline-none focus:border-[#B5893A] focus:bg-white"
                  />
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded bg-[#FDECEC] border border-[#F4C7C7] text-xs font-medium text-[#9B2C2C]"
                  >
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div
                    role="status"
                    className="p-3.5 rounded bg-[#E7F5ED] border border-[#BCE3CB] text-xs font-medium text-[#1E6B43] flex items-start gap-2"
                  >
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-3 rounded bg-[#B5893A] text-white text-sm font-semibold hover:bg-[#9C7228] transition-colors"
                  >
                    Envoyer la demande
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded border border-[#0E281B] text-[#0E281B] text-sm font-semibold hover:bg-[#0E281B] hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copier le récapitulatif</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ==================== PROPOSITION 6 FORMULES + /ADMIN + /APP ==================== */}
        <StudioOfferSection onOpenAdmin={onOpenAdmin} onOpenApp={onOpenApp} />
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#091B12] text-[#FAF8F3]/75 py-14 text-sm">
        <div className="max-w-[1240px] mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
            <div>
              <p className="font-serif text-2xl font-bold text-white mb-2">
                RELIEF <span className="text-[#CFA75B]">PAYSAGE</span>
              </p>
              <p className="text-xs leading-relaxed text-[#FAF8F3]/70">
                {COMPANY_INFO.legalName}
                <br />
                SIREN : {COMPANY_INFO.siren} · SIRET : {COMPANY_INFO.siret}
                <br />
                {COMPANY_INFO.rcs} · Code APE : {COMPANY_INFO.ape}
              </p>
            </div>

            <div>
              <h4 className="font-sans text-xs uppercase tracking-[0.15em] text-[#CFA75B] font-semibold mb-3">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#philosophie" className="hover:text-[#EBD9B3]">
                    Approche &amp; Identité
                  </a>
                </li>
                <li>
                  <a href="#expertises" className="hover:text-[#EBD9B3]">
                    Nos 6 expertises
                  </a>
                </li>
                <li>
                  <a href="#territoire" className="hover:text-[#EBD9B3]">
                    Oliviers &amp; Débroussaillement OLD
                  </a>
                </li>
                <li>
                  <a href="#galerie" className="hover:text-[#EBD9B3]">
                    Galerie terrain
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[#EBD9B3]">
                    Demander un devis
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans text-xs uppercase tracking-[0.15em] text-[#CFA75B] font-semibold mb-3">
                Informations légales
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setModalOpen('legal')}
                    className="hover:text-[#EBD9B3] underline-offset-4 hover:underline"
                  >
                    Mentions légales
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalOpen('privacy')}
                    className="hover:text-[#EBD9B3] underline-offset-4 hover:underline"
                  >
                    Politique de confidentialité
                  </button>
                </li>
                <li>
                  <a href={COMPANY_INFO.phoneHref} className="hover:text-[#EBD9B3]">
                    {COMPANY_INFO.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-[#EBD9B3]">
                    {COMPANY_INFO.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#FAF8F3]/55">
            <span>
              &copy; {new Date().getFullYear()} Relief Paysage — Grasse (06130). Tous droits réservés.
            </span>
            <span>Paysagiste, oléiculture et travaux forestiers dans les Alpes-Maritimes.</span>
          </div>
        </div>
      </footer>

      {/* ==================== MODALES LEGALES ==================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#091B12]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setModalOpen(null)}
        >
          <div
            className="bg-white text-[#1A211D] rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 id="modal-title" className="font-serif text-3xl font-semibold text-[#0E281B]">
                {modalOpen === 'legal' ? 'Mentions légales' : 'Politique de confidentialité'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(null)}
                aria-label="Fermer la fenêtre"
                className="w-9 h-9 rounded-full bg-[#F3EFE5] border border-[#E5DEC9] inline-flex items-center justify-center text-[#0E281B] hover:bg-[#E5DEC9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalOpen === 'legal' ? (
              <div className="space-y-4 text-sm text-[#3E4A43] leading-relaxed">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-1">
                    1. Éditeur du site
                  </h3>
                  <p>
                    <strong>{COMPANY_INFO.brandName}</strong> — Nom commercial de l’entreprise
                    individuelle <strong>{COMPANY_INFO.ownerName}</strong>.<br />
                    Siège social : {COMPANY_INFO.address}.<br />
                    Téléphone : {COMPANY_INFO.phoneDisplay} — Courriel : {COMPANY_INFO.email}
                    <br />
                    SIREN : {COMPANY_INFO.siren} — SIRET : {COMPANY_INFO.siret} —{' '}
                    {COMPANY_INFO.rcs}.<br />
                    Code APE : {COMPANY_INFO.ape} ({COMPANY_INFO.apeLabel}).
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-1">
                    2. Prestations réglementées
                  </h3>
                  <p>
                    Les interventions liées au débroussaillement obligatoire (OLD) et à la
                    protection biologique des végétaux sont exécutées conformément à la
                    réglementation française et aux arrêtés préfectoraux des Alpes-Maritimes (06).
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0E281B] mb-1">
                    3. Propriété intellectuelle
                  </h3>
                  <p>
                    L’ensemble des contenus, visuels et éléments graphiques de ce site est réservé à
                    Relief Paysage. Toute reproduction non autorisée est interdite.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-[#3E4A43] leading-relaxed">
                <p>
                  Ce site vitrine ne dépose aucun cookie publicitaire ni traceur analytique tiers.
                </p>
                <p>
                  Les informations saisies dans le formulaire d’étude servent uniquement à préparer
                  votre demande auprès de <strong>{COMPANY_INFO.email}</strong> (et dans le cadre
                  de la démonstration locale de l’espace gérant).
                </p>
                <p>
                  Conformément au RGPD, vous pouvez demander la suppression ou la rectification de
                  vos coordonnées en écrivant à{' '}
                  <a href={`mailto:${COMPANY_INFO.email}`} className="underline text-[#0E281B]">
                    {COMPANY_INFO.email}
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

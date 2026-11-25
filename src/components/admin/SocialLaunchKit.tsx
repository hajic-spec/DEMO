import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  LayoutList,
  Link2,
  Megaphone,
  Printer,
  Share2,
  X,
} from 'lucide-react';
import { COMPANY_INFO, GENERATED_IMAGES } from '../../data/seedData';
import {
  buildSocialPresets,
  FLYER_THEMES,
  LAUNCH_STEPS,
  loadLaunchChecklist,
  loadSavedSiteUrl,
  MINIATURE_THEMES,
  normalizeSiteUrl,
  saveLaunchChecklist,
  saveSiteUrl,
  type MiniatureFormat,
} from '../../utils/socialKit';

type KitSubTab = 'plan' | 'miniatures' | 'flyers' | 'posts';

const FORMAT_DIMENSIONS: Record<
  MiniatureFormat,
  { width: number; height: number; label: string; ratioClass: string }
> = {
  landscape: {
    width: 1200,
    height: 630,
    label: '1200×630 (Facebook / Google)',
    ratioClass: 'aspect-[1200/630]',
  },
  square: {
    width: 1080,
    height: 1080,
    label: '1080×1080 (Instagram / LinkedIn)',
    ratioClass: 'aspect-square max-w-[460px]',
  },
  story: {
    width: 1080,
    height: 1920,
    label: '1080×1920 (Story / Statut WA)',
    ratioClass: 'aspect-[9/16] max-w-[300px]',
  },
};

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export const SocialLaunchKit: React.FC = () => {
  const defaultOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://relief-paysage.fr';

  const [siteUrlInput, setSiteUrlInput] = useState<string>(() =>
    loadSavedSiteUrl(defaultOrigin)
  );
  const normalizedSiteUrl = useMemo(
    () => normalizeSiteUrl(siteUrlInput, defaultOrigin),
    [siteUrlInput, defaultOrigin]
  );

  const [subTab, setSubTab] = useState<KitSubTab>('plan');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    loadLaunchChecklist()
  );

  // Miniature generator state
  const [miniThemeId, setMiniThemeId] = useState<string>(MINIATURE_THEMES[0].id);
  const [miniFormat, setMiniFormat] = useState<MiniatureFormat>('landscape');
  const [miniHeadline, setMiniHeadline] = useState<string>(MINIATURE_THEMES[0].headline);
  const [miniSubtitle, setMiniSubtitle] = useState<string>(MINIATURE_THEMES[0].subtitle);
  const [miniKicker, setMiniKicker] = useState<string>(MINIATURE_THEMES[0].kicker);
  const [miniCta, setMiniCta] = useState<string>(MINIATURE_THEMES[0].ctaText);
  const [miniImage, setMiniImage] = useState<string>(MINIATURE_THEMES[0].imageUrl);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flyer generator state
  const [flyerThemeId, setFlyerThemeId] = useState<string>(FLYER_THEMES[0].id);
  const [flyerModalOpen, setFlyerModalOpen] = useState<boolean>(false);
  const flyerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeFlyer = useMemo(
    () => FLYER_THEMES.find((f) => f.id === flyerThemeId) || FLYER_THEMES[0],
    [flyerThemeId]
  );

  const socialPresets = useMemo(
    () => buildSocialPresets(normalizedSiteUrl),
    [normalizedSiteUrl]
  );

  useEffect(() => {
    saveSiteUrl(normalizedSiteUrl);
  }, [normalizedSiteUrl]);

  useEffect(() => {
    saveLaunchChecklist(checklist);
  }, [checklist]);

  const handleApplyMiniTheme = (themeId: string) => {
    const found = MINIATURE_THEMES.find((t) => t.id === themeId);
    if (!found) return;
    setMiniThemeId(found.id);
    setMiniKicker(found.kicker);
    setMiniHeadline(found.headline);
    setMiniSubtitle(found.subtitle);
    setMiniCta(found.ctaText);
    setMiniImage(found.imageUrl);
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback ignored gracefully
    }
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2200);
  };

  const completedStepsCount = useMemo(
    () => LAUNCH_STEPS.filter((s) => checklist[s.id]).length,
    [checklist]
  );
  const completionPercent = Math.round((completedStepsCount / LAUNCH_STEPS.length) * 100);

  // Render Miniature Canvas whenever preview changes
  useEffect(() => {
    if (subTab !== 'miniatures') return;
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const dims = FORMAT_DIMENSIONS[miniFormat];
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    void (async () => {
      const img = await loadCanvasImage(miniImage);
      if (cancelled) return;

      // Background forest green
      ctx.fillStyle = '#091B12';
      ctx.fillRect(0, 0, dims.width, dims.height);

      // Cover image
      if (img) {
        const scale = Math.max(dims.width / img.width, dims.height / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = (dims.width - drawW) / 2;
        const offsetY = (dims.height - drawH) / 2;
        ctx.globalAlpha = 0.56;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        ctx.globalAlpha = 1;
      }

      // Rich botanical gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 0, dims.height);
      grad.addColorStop(0, 'rgba(9, 27, 18, 0.86)');
      grad.addColorStop(0.5, 'rgba(14, 40, 27, 0.65)');
      grad.addColorStop(1, 'rgba(9, 27, 18, 0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dims.width, dims.height);

      // Double gold frame
      const pad = miniFormat === 'landscape' ? 34 : 44;
      ctx.strokeStyle = 'rgba(207, 167, 91, 0.72)';
      ctx.lineWidth = 3;
      ctx.strokeRect(pad, pad, dims.width - pad * 2, dims.height - pad * 2);

      const innerX = pad + 44;
      const contentWidth = dims.width - innerX * 2;
      const isStory = miniFormat === 'story';

      // Brand header
      ctx.fillStyle = '#CFA75B';
      ctx.font = `700 ${isStory ? 28 : 22}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('RELIEF PAYSAGE · GRASSE (06)', innerX, pad + (isStory ? 95 : 68));

      // Kicker
      ctx.fillStyle = '#EBD9B3';
      ctx.font = `600 ${isStory ? 24 : 18}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(miniKicker.toUpperCase(), innerX, pad + (isStory ? 240 : 145));

      // Headline
      ctx.fillStyle = '#FFFFFF';
      const headFontSize = miniFormat === 'landscape' ? 62 : isStory ? 84 : 68;
      ctx.font = `700 ${headFontSize}px "Cormorant Garamond", Georgia, serif`;
      const headLines = wrapCanvasText(ctx, miniHeadline, contentWidth);
      let cursorY = pad + (isStory ? 340 : 220);
      for (const line of headLines.slice(0, 3)) {
        ctx.fillText(line, innerX, cursorY);
        cursorY += headFontSize * 1.08;
      }

      // Subtitle
      cursorY += 18;
      ctx.fillStyle = 'rgba(250, 248, 243, 0.9)';
      const subFontSize = isStory ? 34 : 26;
      ctx.font = `400 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
      const subLines = wrapCanvasText(ctx, miniSubtitle, contentWidth);
      for (const line of subLines.slice(0, 3)) {
        ctx.fillText(line, innerX, cursorY);
        cursorY += subFontSize * 1.38;
      }

      // CTA gold block
      const footerY = dims.height - pad - (isStory ? 190 : 115);
      ctx.fillStyle = '#B5893A';
      const btnW = Math.min(contentWidth, isStory ? 520 : 380);
      const btnH = isStory ? 76 : 58;
      ctx.fillRect(innerX, footerY - btnH, btnW, btnH);

      ctx.fillStyle = '#091B12';
      ctx.font = `700 ${isStory ? 28 : 22}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(miniCta, innerX + 26, footerY - btnH / 2 + 8);

      // Footer phone + live URL
      ctx.fillStyle = '#EBD9B3';
      ctx.font = `600 ${isStory ? 28 : 21}px "JetBrains Mono", monospace`;
      ctx.fillText(
        `${COMPANY_INFO.phoneDisplay} · ${normalizedSiteUrl.replace(/^https?:\/\//i, '')}`,
        innerX,
        dims.height - pad - (isStory ? 75 : 42)
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [
    subTab,
    miniFormat,
    miniKicker,
    miniHeadline,
    miniSubtitle,
    miniCta,
    miniImage,
    normalizedSiteUrl,
  ]);

  const handleDownloadMiniature = () => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `relief-paysage-miniature-${miniThemeId}-${miniFormat}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Render & Download Flyer PNG (1080x1520 A5/A4 ratio)
  const handleDownloadFlyerPng = async () => {
    const canvas = flyerCanvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const H = 1520;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ivory paper base
    ctx.fillStyle = '#FAF8F3';
    ctx.fillRect(0, 0, W, H);

    // Top forest green header band
    ctx.fillStyle = '#091B12';
    ctx.fillRect(0, 0, W, 560);

    const img = await loadCanvasImage(activeFlyer.imageUrl);
    if (img) {
      const scale = Math.max(W / img.width, 560 / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, 560);
      ctx.clip();
      ctx.globalAlpha = 0.42;
      ctx.drawImage(img, (W - drawW) / 2, (560 - drawH) / 2, drawW, drawH);
      ctx.restore();
    }

    // Gold top accent line
    ctx.fillStyle = '#CFA75B';
    ctx.fillRect(0, 554, W, 8);

    // Brand header
    ctx.fillStyle = '#CFA75B';
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(activeFlyer.kicker, 72, 96);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 66px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('RELIEF PAYSAGE', 72, 174);

    ctx.fillStyle = '#EBD9B3';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Jason Claude — Paysagiste, Oléiculture & Travaux Forestiers', 72, 220);

    // Main headline on header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 54px "Cormorant Garamond", Georgia, serif';
    const headlineLines = wrapCanvasText(ctx, activeFlyer.headline, W - 144);
    let y = 320;
    for (const line of headlineLines.slice(0, 3)) {
      ctx.fillText(line, 72, y);
      y += 62;
    }

    ctx.fillStyle = '#EBD9B3';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(activeFlyer.subheadline, 72, 505);

    // Body bullets
    ctx.fillStyle = '#0E281B';
    ctx.font = '700 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Nos engagements & prestations sur site', 72, 645);

    let bulletY = 710;
    for (const b of activeFlyer.bullets) {
      ctx.fillStyle = '#F3EFE5';
      ctx.fillRect(72, bulletY - 38, W - 144, 68);
      ctx.fillStyle = '#B5893A';
      ctx.fillRect(72, bulletY - 38, 8, 68);
      ctx.fillStyle = '#1A211D';
      ctx.font = '600 25px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(b, 102, bulletY + 4);
      bulletY += 90;
    }

    // Contact & Live Link CTA Box
    const ctaTop = 1190;
    ctx.fillStyle = '#0E281B';
    ctx.fillRect(72, ctaTop, W - 144, 210);
    ctx.strokeStyle = '#CFA75B';
    ctx.lineWidth = 3;
    ctx.strokeRect(72, ctaTop, W - 144, 210);

    ctx.fillStyle = '#CFA75B';
    ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VISITE TECHNIQUE & DEVIS GRATUIT', 106, ctaTop + 48);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 46px "JetBrains Mono", monospace';
    ctx.fillText(COMPANY_INFO.phoneDisplay, 106, ctaTop + 106);

    ctx.fillStyle = '#EBD9B3';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `Site & Devis en ligne : ${normalizedSiteUrl.replace(/^https?:\/\//i, '')}`,
      106,
      ctaTop + 155
    );

    ctx.fillStyle = '#FAF8F3';
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${COMPANY_INFO.email} · ${COMPANY_INFO.address}`,
      106,
      ctaTop + 188
    );

    // Legal footer
    ctx.fillStyle = '#647068';
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${activeFlyer.footerBanner} · SIREN ${COMPANY_INFO.siren}`,
      72,
      1468
    );

    const link = document.createElement('a');
    link.download = `relief-paysage-${activeFlyer.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* ==================== LIEN OFFICIEL & ACCÈS RAPIDES ==================== */}
      <section className="bg-[#0E281B] text-[#FAF8F3] rounded-xl p-6 border border-[#CFA75B]/35">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#CFA75B] mb-1.5">
              <Link2 className="w-4 h-4" />
              <span>Lien officiel du site (injecté dans tous vos posts &amp; flyers)</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
              Kit de lancement &amp; Réseaux Sociaux
            </h2>
            <p className="text-xs md:text-sm text-[#FAF8F3]/80 mb-3">
              Collez ici votre URL finale Vercel (ou domaine personnalisé) : tous vos pré-posts,
              miniatures PNG et flyers se mettent automatiquement à jour.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                aria-label="Lien officiel du site Relief Paysage"
                value={siteUrlInput}
                onChange={(e) => setSiteUrlInput(e.target.value)}
                placeholder="https://relief-paysage.vercel.app"
                className="flex-1 min-h-[44px] px-3.5 rounded-lg bg-[#091B12] border border-[#CFA75B]/50 text-white font-mono text-sm focus:outline-none focus:border-[#EBD9B3]"
              />
              <button
                type="button"
                onClick={() => handleCopyText('main-url', normalizedSiteUrl)}
                className="min-h-[44px] px-4 rounded-lg bg-[#CFA75B] text-[#091B12] text-xs font-bold hover:bg-[#EBD9B3] inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {copiedId === 'main-url' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lien copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier le lien</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyText('app-url', `${normalizedSiteUrl}/app`)}
              className="min-h-[44px] px-3.5 rounded-lg border border-white/25 bg-white/10 text-xs font-semibold text-[#FAF8F3] hover:bg-white/20 inline-flex items-center justify-center gap-1.5"
            >
              {copiedId === 'app-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'app-url' ? 'Lien /app copié' : 'Copier lien /app'}</span>
            </button>
            <a
              href={normalizedSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-3.5 rounded-lg border border-white/25 bg-white/10 text-xs font-semibold text-[#EBD9B3] hover:bg-white/20 inline-flex items-center justify-center gap-1.5"
            >
              <span>Tester le lien</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ==================== SOUS-ONGLETS DU KIT ==================== */}
      <div
        role="tablist"
        aria-label="Sections Kit Lancement"
        className="flex flex-wrap gap-2 bg-white border border-[#E5DEC9] rounded-xl p-2"
      >
        {(
          [
            {
              id: 'plan',
              label: `Plan de lancement (${completedStepsCount}/${LAUNCH_STEPS.length})`,
              icon: LayoutList,
            },
            { id: 'miniatures', label: 'Miniatures HD (.png)', icon: ImageIcon },
            { id: 'flyers', label: 'Flyers à poster & imprimer', icon: Printer },
            { id: 'posts', label: 'Pré-posts prêts à copier', icon: Share2 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSubTab(tab.id)}
              className={`min-h-[42px] px-4 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                active
                  ? 'bg-[#0E281B] text-[#EBD9B3]'
                  : 'text-[#3E4A43] hover:bg-[#FAF8F3] hover:text-[#0E281B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== 1. STRUCTURE DE LANCEMENT (4 PHASES) ==================== */}
      {subTab === 'plan' && (
        <section className="bg-white border border-[#E5DEC9] rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
                Feuille de route de lancement (4 phases)
              </h3>
              <p className="text-xs text-[#647068]">
                Cochez chaque action au fur et à mesure pour transformer le site en demandes
                locales sur Grasse et le 06.
              </p>
            </div>
            <div className="min-w-[180px]">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#0E281B] mb-1">
                <span>Progression</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-2.5 rounded bg-[#F3EFE5] overflow-hidden">
                <div
                  className="h-full bg-[#B5893A] transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LAUNCH_STEPS.map((step) => {
              const done = Boolean(checklist[step.id]);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() =>
                    setChecklist((prev) => ({ ...prev, [step.id]: !prev[step.id] }))
                  }
                  className={`text-left rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                    done
                      ? 'bg-[#E7F5ED] border-[#BCE3CB]'
                      : 'bg-[#FAF8F3] border-[#E5DEC9] hover:border-[#B5893A]'
                  }`}
                >
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      done ? 'text-[#1E6B43]' : 'text-[#9C7228]'
                    }`}
                  />
                  <div>
                    <div className="text-[11px] font-mono font-semibold text-[#9C7228]">
                      {step.phase} · {step.timing}
                    </div>
                    <div
                      className={`text-sm font-semibold text-[#0E281B] mt-0.5 ${
                        done ? 'line-through opacity-75' : ''
                      }`}
                    >
                      {step.title}
                    </div>
                    <p className="text-xs text-[#3E4A43] mt-1 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== 2. GENERATEUR DE MINIATURES HD ==================== */}
      {subTab === 'miniatures' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
                Créateur de miniature sociale
              </h3>
              <p className="text-xs text-[#647068]">
                Générez et téléchargez un visuel prêt à poster pour Facebook, Instagram ou Google.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E281B] mb-1.5">
                Thème pré-conçu
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MINIATURE_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleApplyMiniTheme(t.id)}
                    className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-colors ${
                      miniThemeId === t.id
                        ? 'bg-[#0E281B] text-[#EBD9B3] border-[#0E281B]'
                        : 'bg-[#FAF8F3] text-[#3E4A43] border-[#E5DEC9] hover:border-[#B5893A]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E281B] mb-1.5">
                Format réseau social
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(['landscape', 'square', 'story'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setMiniFormat(fmt)}
                    className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold transition-colors ${
                      miniFormat === fmt
                        ? 'bg-[#F3EFE5] border-[#B5893A] text-[#0E281B]'
                        : 'bg-white border-[#E5DEC9] text-[#647068]'
                    }`}
                  >
                    {FORMAT_DIMENSIONS[fmt].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E281B] mb-1">
                Photo de fond terrain
              </label>
              <select
                value={miniImage}
                onChange={(e) => setMiniImage(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-xs font-medium"
              >
                <option value={GENERATED_IMAGES.olivierHero}>Olivier centenaire &amp; restanque</option>
                <option value={GENERATED_IMAGES.paysageGrasse}>Massifs &amp; collines de Grasse</option>
                <option value={GENERATED_IMAGES.hibiscusJardin}>Floraison hibiscus jardin</option>
                <option value={GENERATED_IMAGES.herissonBiodiversite}>Faune &amp; soin du vivant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E281B] mb-1">
                Titre principal
              </label>
              <input
                type="text"
                value={miniHeadline}
                onChange={(e) => setMiniHeadline(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E281B] mb-1">
                Sous-titre prestations
              </label>
              <input
                type="text"
                value={miniSubtitle}
                onChange={(e) => setMiniSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0E281B] mb-1">
                Bouton d’appel visuel
              </label>
              <input
                type="text"
                value={miniCta}
                onChange={(e) => setMiniCta(e.target.value)}
                className="w-full px-3 py-2 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadMiniature}
              className="w-full min-h-[46px] rounded-lg bg-[#B5893A] text-white text-sm font-semibold hover:bg-[#9C7228] inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger la miniature (.png)</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9C7228]">
                Aperçu en direct · {FORMAT_DIMENSIONS[miniFormat].label}
              </span>
            </div>
            <div className="bg-[#F3EFE5] rounded-xl p-4 flex items-center justify-center">
              <canvas
                ref={miniCanvasRef}
                className={`w-full rounded-lg shadow-lg border border-[#CFA75B]/40 ${FORMAT_DIMENSIONS[miniFormat].ratioClass}`}
              />
            </div>
          </div>
        </section>
      )}

      {/* ==================== 3. FLYERS A POSTER & IMPRIMER ==================== */}
      {subTab === 'flyers' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#0E281B]">
                Flyers prêts à poster ou imprimer
              </h3>
              <p className="text-xs text-[#647068]">
                Exportez votre flyer en image HD pour le poster sur Facebook, Nextdoor ou
                Leboncoin, ou imprimez-le en A4/A5 pour les boîtes aux lettres.
              </p>
            </div>

            <div className="space-y-2">
              {FLYER_THEMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlyerThemeId(f.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors ${
                    flyerThemeId === f.id
                      ? 'bg-[#0E281B] text-white border-[#0E281B]'
                      : 'bg-[#FAF8F3] text-[#0E281B] border-[#E5DEC9] hover:border-[#B5893A]'
                  }`}
                >
                  <div
                    className={`text-[11px] font-mono uppercase ${
                      flyerThemeId === f.id ? 'text-[#CFA75B]' : 'text-[#9C7228]'
                    }`}
                  >
                    {f.kicker}
                  </div>
                  <div className="text-sm font-semibold mt-0.5">{f.label}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadFlyerPng}
                className="w-full min-h-[46px] rounded-lg bg-[#B5893A] text-white text-sm font-semibold hover:bg-[#9C7228] inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Flyer PNG (pour poster)</span>
              </button>
              <button
                type="button"
                onClick={() => setFlyerModalOpen(true)}
                className="w-full min-h-[44px] rounded-lg border border-[#0E281B] bg-white text-[#0E281B] text-sm font-semibold hover:bg-[#0E281B] hover:text-white inline-flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Aperçu &amp; Imprimer PDF (A4 / A5)</span>
              </button>
            </div>

            <canvas ref={flyerCanvasRef} className="hidden" aria-hidden="true" />
          </div>

          {/* Live Flyer visual preview */}
          <div className="lg:col-span-7 bg-[#F3EFE5] border border-[#E5DEC9] rounded-xl p-5 md:p-8 flex justify-center">
            <article className="bg-[#FAF8F3] border border-[#CFA75B] rounded-xl overflow-hidden max-w-md w-full shadow-xl">
              <div className="relative bg-[#091B12] text-white p-6 border-b-4 border-[#CFA75B]">
                <img
                  src={activeFlyer.imageUrl}
                  alt={activeFlyer.headline}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="relative z-10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#CFA75B] mb-1">
                    {activeFlyer.kicker}
                  </p>
                  <div className="font-serif text-3xl font-bold text-white leading-none">
                    RELIEF <span className="text-[#CFA75B]">PAYSAGE</span>
                  </div>
                  <p className="text-xs text-[#EBD9B3] mt-1 mb-4">
                    {COMPANY_INFO.legalName}
                  </p>
                  <h4 className="font-serif text-2xl font-semibold leading-tight text-white">
                    {activeFlyer.headline}
                  </h4>
                  <p className="text-xs text-[#EBD9B3]/90 mt-1.5">
                    {activeFlyer.subheadline}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <ul className="space-y-2">
                  {activeFlyer.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-xs text-[#1A211D] font-medium bg-[#F3EFE5] px-3 py-2 rounded border border-[#E5DEC9]"
                    >
                      <span className="text-[#9C7228] font-bold mr-1.5">•</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="bg-[#0E281B] text-white rounded-lg p-4 border border-[#CFA75B]/50">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#CFA75B]">
                    Visite technique &amp; devis gratuit
                  </p>
                  <p className="font-mono text-2xl font-bold text-white mt-0.5">
                    {COMPANY_INFO.phoneDisplay}
                  </p>
                  <p className="text-xs text-[#EBD9B3] mt-1 break-all">
                    Site web : <strong>{normalizedSiteUrl}</strong>
                  </p>
                  <p className="text-[11px] text-white/75 mt-1">
                    {COMPANY_INFO.email} · {COMPANY_INFO.address}
                  </p>
                </div>

                <p className="text-[10px] text-[#647068] text-center">
                  {activeFlyer.footerBanner} · SIREN {COMPANY_INFO.siren}
                </p>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ==================== 4. PRE-POSTS PRETS A COPIER-COLLER ==================== */}
      {subTab === 'posts' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {socialPresets.map((post) => {
            const isCopied = copiedId === post.id;
            return (
              <article
                key={post.id}
                className="bg-white border border-[#E5DEC9] rounded-xl p-5 md:p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs font-mono font-semibold text-[#9C7228]">
                        {post.channel} · {post.timing}
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#0E281B] mt-0.5">
                        {post.title}
                      </h3>
                    </div>
                    <Megaphone className="w-5 h-5 text-[#B5893A] shrink-0" />
                  </div>
                  <p className="text-xs text-[#647068] mb-3">{post.formatHint}</p>

                  <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm text-[#1A211D] bg-[#FAF8F3] border border-[#E5DEC9] rounded-lg p-4 leading-relaxed">
                    {post.content}
                  </pre>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(post.id, post.content)}
                  className={`w-full min-h-[44px] rounded-lg text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                    isCopied
                      ? 'bg-[#1E6B43] text-white'
                      : 'bg-[#0E281B] text-[#EBD9B3] hover:bg-[#9C7228] hover:text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Pré-post copié dans le presse-papier</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier ce pré-post prêt à publier</span>
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </section>
      )}

      {/* ==================== MODALE IMPRESSION FLYER A4/A5 ==================== */}
      {flyerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#091B12]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
            <div className="no-print flex items-center justify-between px-6 py-4 bg-[#FAF8F3] border-b border-[#E5DEC9]">
              <h3 className="font-serif text-xl font-semibold text-[#0E281B]">
                Aperçu Flyer Imprimable
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#0E281B] text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlyerModalOpen(false)}
                  aria-label="Fermer l’aperçu flyer"
                  className="p-2 rounded bg-white border border-[#E5DEC9] text-[#0E281B]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="print-sheet" className="p-6 bg-white text-[#1A211D]">
              <div className="border-2 border-[#0E281B] rounded-lg overflow-hidden">
                <div className="bg-[#091B12] text-white p-6 border-b-4 border-[#CFA75B]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#CFA75B]">
                    {activeFlyer.kicker}
                  </p>
                  <h2 className="font-serif text-4xl font-bold text-white mt-1">
                    RELIEF <span className="text-[#CFA75B]">PAYSAGE</span>
                  </h2>
                  <p className="text-xs text-[#EBD9B3] mt-1">{COMPANY_INFO.legalName}</p>
                  <h3 className="font-serif text-2xl font-semibold text-white mt-4">
                    {activeFlyer.headline}
                  </h3>
                  <p className="text-xs text-[#EBD9B3]/90 mt-1">{activeFlyer.subheadline}</p>
                </div>

                <div className="p-6 space-y-4">
                  <ul className="space-y-2">
                    {activeFlyer.bullets.map((b) => (
                      <li
                        key={b}
                        className="text-sm text-[#1A211D] font-medium bg-[#F3EFE5] px-3.5 py-2.5 rounded"
                      >
                        • {b}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-[#0E281B] text-white rounded-lg p-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#CFA75B] font-semibold">
                      Étude &amp; Devis gratuit sur visite
                    </p>
                    <p className="font-mono text-3xl font-bold text-white mt-1">
                      {COMPANY_INFO.phoneDisplay}
                    </p>
                    <p className="text-sm text-[#EBD9B3] mt-1.5">
                      Site officiel : <strong>{normalizedSiteUrl}</strong>
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {COMPANY_INFO.email} · {COMPANY_INFO.address}
                    </p>
                  </div>

                  <p className="text-xs text-[#647068] text-center pt-1">
                    {activeFlyer.footerBanner} · SIREN {COMPANY_INFO.siren} · {COMPANY_INFO.rcs}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

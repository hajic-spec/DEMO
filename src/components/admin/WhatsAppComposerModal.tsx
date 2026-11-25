import React, { useState } from 'react';
import { Copy, Check, ExternalLink, X } from 'lucide-react';
import {
  buildWhatsAppTemplate,
  formatWhatsAppUrl,
  type WhatsAppTemplateType,
} from '../../utils/business';

interface WhatsAppComposerModalProps {
  clientName: string;
  clientPhone: string;
  city?: string;
  service?: string;
  quoteNumber?: string;
  totalTTC?: number;
  initialTemplate?: WhatsAppTemplateType;
  onClose: () => void;
}

const TEMPLATE_LABELS: { id: WhatsAppTemplateType; label: string }[] = [
  { id: 'reception', label: 'Accusé réception' },
  { id: 'visite', label: 'Confirmation visite' },
  { id: 'devis', label: 'Envoi devis prêt' },
  { id: 'chantier', label: 'Passage chantier' },
  { id: 'facture', label: 'Fin chantier / facture' },
];

export const WhatsAppComposerModal: React.FC<WhatsAppComposerModalProps> = ({
  clientName,
  clientPhone,
  city,
  service,
  quoteNumber,
  totalTTC,
  initialTemplate = 'reception',
  onClose,
}) => {
  const [templateType, setTemplateType] = useState<WhatsAppTemplateType>(initialTemplate);
  const [message, setMessage] = useState(() =>
    buildWhatsAppTemplate(initialTemplate, {
      clientName,
      city,
      service,
      quoteNumber,
      totalTTC,
    })
  );
  const [copied, setCopied] = useState(false);

  const handleTemplateSwitch = (nextType: WhatsAppTemplateType) => {
    setTemplateType(nextType);
    setMessage(
      buildWhatsAppTemplate(nextType, {
        clientName,
        city,
        service,
        quoteNumber,
        totalTTC,
      })
    );
  };

  const waUrl = formatWhatsAppUrl(clientPhone, message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard restriction
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#091B12]/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Communication WhatsApp client"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl border border-[#E5DEC9] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0E281B] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#CFA75B]">
              Communication simplifiée WhatsApp
            </p>
            <h3 className="font-serif text-xl font-semibold text-white">
              {clientName} · {clientPhone}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer WhatsApp"
            className="w-9 h-9 rounded-full bg-white/10 inline-flex items-center justify-center text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className="block text-xs font-semibold text-[#0E281B] mb-2">
              Modèle pré-rempli selon l’étape :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_LABELS.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateSwitch(tpl.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                    templateType === tpl.id
                      ? 'bg-[#0E281B] text-[#EBD9B3] border-[#0E281B]'
                      : 'bg-[#FAF8F3] text-[#3E4A43] border-[#E5DEC9] hover:border-[#B5893A]'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="wa-message-box"
              className="block text-xs font-semibold text-[#0E281B] mb-1.5"
            >
              Message personnalisable :
            </label>
            <textarea
              id="wa-message-box"
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 rounded border border-[#E5DEC9] bg-[#FAF8F3] text-sm text-[#1A211D] focus:outline-none focus:border-[#B5893A] focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[#E5DEC9] bg-white text-xs font-semibold text-[#0E281B] hover:border-[#0E281B]"
            >
              {copied ? <Check className="w-4 h-4 text-[#1E6B43]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Message copié' : 'Copier le message'}</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#1E7D4B] text-white text-xs font-semibold hover:bg-[#16623A]"
            >
              <span>Ouvrir dans WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

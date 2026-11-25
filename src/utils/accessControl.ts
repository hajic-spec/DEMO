export type ProtectedArea = 'admin' | 'app';

const SESSION_PREFIX = 'rp_session_unlock_';

export function isPaidLicenseActive(paidFlag?: string): boolean {
  const raw =
    paidFlag !== undefined
      ? paidFlag
      : (import.meta as unknown as { env?: Record<string, string | undefined> }).env
          ?.VITE_PAID_LICENSE;
  return String(raw || '').trim().toLowerCase() === 'true';
}

export function isPwaInstallAllowed(paidFlag?: string, pwaFlag?: string): boolean {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const resolvedPaid = paidFlag !== undefined ? paidFlag : env?.VITE_PAID_LICENSE;
  const resolvedPwa = pwaFlag !== undefined ? pwaFlag : env?.VITE_ENABLE_PAID_PWA;
  return (
    String(resolvedPaid || '').trim().toLowerCase() === 'true' &&
    String(resolvedPwa || '').trim().toLowerCase() === 'true'
  );
}

export function getConfiguredPasscode(area: ProtectedArea): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  if (!env) return '';
  if (isPaidLicenseActive(env.VITE_PAID_LICENSE) && area === 'admin' && env.VITE_ADMIN_PIN) {
    return env.VITE_ADMIN_PIN.trim();
  }
  return (env.VITE_AGENCY_DEMO_KEY || '').trim();
}

export function verifyAccessPasscode(input: string, configuredPasscode: string): boolean {
  const cleanInput = input.trim();
  const cleanExpected = configuredPasscode.trim();
  if (!cleanExpected || !cleanInput) return false;
  if (cleanInput.length !== cleanExpected.length) return false;

  let diff = 0;
  for (let i = 0; i < cleanExpected.length; i += 1) {
    diff |= cleanInput.charCodeAt(i) ^ cleanExpected.charCodeAt(i);
  }
  return diff === 0;
}

export function hasSessionUnlock(area: ProtectedArea): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(`${SESSION_PREFIX}${area}`) === '1';
  } catch {
    return false;
  }
}

export function grantSessionUnlock(area: ProtectedArea): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${SESSION_PREFIX}${area}`, '1');
  } catch {
    // Ignore storage restriction
  }
}

export const ADMIN_PREVIEW_TABS = new Set(['dashboard', 'leads', 'quotes']);
export const APP_PREVIEW_TABS = new Set(['tournee', 'releve']);

export function isModuleUnlockedInPreview(
  area: ProtectedArea,
  tabId: string,
  isFullUnlocked: boolean
): boolean {
  if (isFullUnlocked) return true;
  if (area === 'admin') return ADMIN_PREVIEW_TABS.has(tabId);
  return APP_PREVIEW_TABS.has(tabId);
}

export function clearSessionUnlock(area: ProtectedArea): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${SESSION_PREFIX}${area}`);
  } catch {
    // Ignore storage restriction
  }
}

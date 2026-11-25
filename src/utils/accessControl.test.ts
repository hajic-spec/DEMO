import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPaidLicenseActive,
  isPwaInstallAllowed,
  verifyAccessPasscode,
} from './accessControl.ts';

test('isPaidLicenseActive returns false by default and true only when explicitly true', () => {
  assert.equal(isPaidLicenseActive(undefined), false);
  assert.equal(isPaidLicenseActive(''), false);
  assert.equal(isPaidLicenseActive('false'), false);
  assert.equal(isPaidLicenseActive('06130'), false);
  assert.equal(isPaidLicenseActive('true'), true);
  assert.equal(isPaidLicenseActive(' TRUE '), true);
});

test('isPwaInstallAllowed blocks PWA download/install unless both paid and PWA flags are true', () => {
  assert.equal(isPwaInstallAllowed(undefined, undefined), false);
  assert.equal(isPwaInstallAllowed('false', 'true'), false);
  assert.equal(isPwaInstallAllowed('true', 'false'), false);
  assert.equal(isPwaInstallAllowed('true', undefined), false);
  assert.equal(isPwaInstallAllowed('true', 'true'), true);
});

test('verifyAccessPasscode never accepts empty codes or legacy 06130 when unconfigured', () => {
  assert.equal(verifyAccessPasscode('', ''), false);
  assert.equal(verifyAccessPasscode('06130', ''), false);
  assert.equal(verifyAccessPasscode('06130', 'MonCodePrive99'), false);
  assert.equal(verifyAccessPasscode('MonCodePrive98', 'MonCodePrive99'), false);
  assert.equal(verifyAccessPasscode(' MonCodePrive99 ', 'MonCodePrive99'), true);
});

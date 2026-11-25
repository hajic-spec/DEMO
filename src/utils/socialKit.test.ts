import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSocialPresets,
  FLYER_THEMES,
  LAUNCH_STEPS,
  MINIATURE_THEMES,
  normalizeSiteUrl,
} from './socialKit.ts';

test('normalizeSiteUrl cleans trailing slashes and adds https when missing', () => {
  assert.equal(normalizeSiteUrl('relief-paysage.vercel.app/'), 'https://relief-paysage.vercel.app');
  assert.equal(
    normalizeSiteUrl(' https://demo-123.vercel.app/// '),
    'https://demo-123.vercel.app'
  );
  assert.equal(normalizeSiteUrl('', 'https://fallback.fr/'), 'https://fallback.fr/');
});

test('buildSocialPresets injects live site URL and /app link across all 5 channels', () => {
  const presets = buildSocialPresets('https://relief-grasse.vercel.app/');
  assert.equal(presets.length, 5);

  for (const post of presets) {
    assert.ok(
      post.content.includes('https://relief-grasse.vercel.app'),
      `Missing site URL in ${post.id}`
    );
    assert.ok(post.content.includes('06 19 86 10 45'), `Missing phone in ${post.id}`);
  }

  const wa = presets.find((p) => p.id === 'whatsapp');
  assert.ok(wa && wa.content.includes('https://relief-grasse.vercel.app/app'));
});

test('launch kit exposes 10 structured launch steps, 4 miniature presets, and 2 flyer presets', () => {
  assert.equal(LAUNCH_STEPS.length, 10);
  assert.equal(MINIATURE_THEMES.length, 4);
  assert.equal(FLYER_THEMES.length, 2);
});

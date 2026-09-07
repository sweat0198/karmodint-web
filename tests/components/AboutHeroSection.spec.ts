// @vitest-environment jsdom

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AboutHeroSection from '../../app/components/about/HeroSection.vue';

describe('AboutHeroSection', () => {
  it('presents the business campus as a responsive concept visualisation', () => {
    const wrapper = mount(AboutHeroSection);
    const image = wrapper.get('img');
    const webpSource = wrapper.get('picture source[type="image/webp"]');

    expect(image.attributes('src')).toBe('/images/about/about-business-campus-hero-v2.png');
    expect(image.attributes('srcset')).toBeUndefined();
    expect(webpSource.attributes('srcset')).toBe('/images/about/about-business-campus-hero-v2.webp 1280w');
    expect(webpSource.attributes('sizes')).toBe('(min-width: 1024px) 50vw, 100vw');
    expect(image.attributes('alt')).toBe('Concept visualisation of an active modular business and education campus');
    expect(image.attributes('loading')).toBe('eager');
    expect(image.attributes('fetchpriority')).toBe('high');
    expect(image.attributes('decoding')).toBe('async');
    expect(image.classes()).toEqual(expect.arrayContaining(['h-full', 'w-full', 'object-cover']));
    expect(image.classes()).not.toContain('group-hover:scale-105');
    expect(wrapper.find('figcaption').exists()).toBe(false);
  });

  it('references hero assets that exist in public', () => {
    for (const filename of [
      'about-business-campus-hero-v2.png',
      'about-business-campus-hero-v2.webp',
    ]) {
      expect(existsSync(resolve(process.cwd(), 'public/images/about', filename))).toBe(true);
    }
  });
});
